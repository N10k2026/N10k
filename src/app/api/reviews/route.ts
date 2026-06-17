import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { db } from '@/lib/db';
import { applyRateLimit } from '@/lib/rate-limit';
import {
  BodyTooLargeError,
  normalizeReviewerKey,
  parseJsonBody,
  reviewSchema,
  sanitizeText,
} from '@/lib/validation';
import {
  buildPaginationMeta,
  parsePagination,
  REVIEW_LIST_DEFAULT,
  REVIEW_LIST_MAX,
} from '@/lib/pagination';

const reviewSelect = {
  id: true,
  productId: true,
  userName: true,
  rating: true,
  comment: true,
  createdAt: true,
} satisfies Prisma.ReviewSelect;

async function recalculateProductRating(
  tx: Prisma.TransactionClient,
  productId: string,
): Promise<number> {
  const aggregate = await tx.review.aggregate({
    where: { productId },
    _avg: { rating: true },
    _count: { rating: true },
  });

  const avg = aggregate._count.rating > 0 ? aggregate._avg.rating ?? 0 : 0;
  const rounded = Math.round(avg * 10) / 10;

  await tx.product.update({
    where: { id: productId },
    data: { rating: rounded },
  });

  return rounded;
}

export async function GET(request: NextRequest) {
  try {
    const productId = request.nextUrl.searchParams.get('productId');
    const paginated = request.nextUrl.searchParams.get('paginated') === 'true';

    if (!productId || productId.length > 64) {
      return NextResponse.json(
        { error: 'El parámetro productId es requerido' },
        { status: 400 },
      );
    }

    const pagination = parsePagination(request.nextUrl.searchParams, {
      defaultLimit: REVIEW_LIST_DEFAULT,
      maxLimit: REVIEW_LIST_MAX,
    });

    const where = { productId };

    const [total, reviews] = await db.$transaction([
      db.review.count({ where }),
      db.review.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: paginated ? pagination.skip : 0,
        take: paginated ? pagination.take : REVIEW_LIST_MAX,
        select: reviewSelect,
      }),
    ]);

    if (paginated) {
      return NextResponse.json({
        items: reviews,
        meta: buildPaginationMeta(total, pagination.page, pagination.limit),
      });
    }

    return NextResponse.json(reviews);
  } catch (error) {
    console.error('Error fetching reviews');
    return NextResponse.json(
      { error: 'Error al obtener las reseñas' },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  const limited = applyRateLimit(request, 'reviews-post', 5, 15 * 60 * 1000);
  if (!limited.ok) {
    return NextResponse.json(
      { error: 'Demasiados intentos. Intenta más tarde.' },
      { status: 429, headers: { 'Retry-After': String(limited.retryAfter) } },
    );
  }

  try {
    const body = await parseJsonBody(request);
    const parsed = reviewSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Datos de reseña inválidos' },
        { status: 400 },
      );
    }

    const { productId, rating } = parsed.data;
    const userName = sanitizeText(parsed.data.userName);
    const comment = sanitizeText(parsed.data.comment);
    const reviewerKey = normalizeReviewerKey(userName);

    if (!reviewerKey) {
      return NextResponse.json({ error: 'Nombre de usuario inválido' }, { status: 400 });
    }

    const product = await db.product.findUnique({
      where: { id: productId },
      select: { id: true },
    });

    if (!product) {
      return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 });
    }

    const existing = await db.review.findUnique({
      where: {
        productId_reviewerKey: { productId, reviewerKey },
      },
      select: { id: true },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Ya existe una reseña de este usuario para este producto' },
        { status: 409 },
      );
    }

    const review = await db.$transaction(async (tx) => {
      const created = await tx.review.create({
        data: {
          productId,
          userName,
          reviewerKey,
          rating,
          comment,
        },
        select: reviewSelect,
      });

      await recalculateProductRating(tx, productId);
      return created;
    });

    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    if (error instanceof BodyTooLargeError) {
      return NextResponse.json({ error: 'Cuerpo de solicitud demasiado grande' }, { status: 413 });
    }
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      return NextResponse.json(
        { error: 'Ya existe una reseña de este usuario para este producto' },
        { status: 409 },
      );
    }
    console.error('Error creating review');
    return NextResponse.json({ error: 'Error al crear la reseña' }, { status: 500 });
  }
}
