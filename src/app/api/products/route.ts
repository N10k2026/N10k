import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { db } from '@/lib/db';
import { transformProduct } from '@/lib/product-utils';
import {
  isDatabaseUnavailableError,
  isStaticCatalogFallbackEnabled,
  staticProductsAsRuntime,
} from '@/lib/catalog-fallback';
import { buildPaginationMeta, parsePagination, PRODUCT_LIST_MAX } from '@/lib/pagination';

const productListSelect = {
  id: true,
  name: true,
  slug: true,
  category: true,
  price: true,
  originalPrice: true,
  image: true,
  description: true,
  video: true,
  isNew: true,
  isBestSeller: true,
  rating: true,
  images: {
    orderBy: { sortOrder: 'asc' as const },
    select: { url: true, colorName: true, sortOrder: true },
  },
  colors: { select: { name: true, hex: true } },
  sizes: { select: { label: true, outOfStock: true } },
} satisfies Prisma.ProductSelect;

function filterStaticProducts(request: NextRequest) {
  let products = staticProductsAsRuntime();
  const category = request.nextUrl.searchParams.get('category');
  const isNew = request.nextUrl.searchParams.get('new');
  if (category && category !== 'Todos') {
    products = products.filter((p) => p.category === category);
  }
  if (isNew === 'true') {
    products = products.filter((p) => p.isNew);
  }
  return products;
}

function paginateArray<T>(items: T[], skip: number, take: number) {
  return items.slice(skip, skip + take);
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const category = searchParams.get('category');
  const isNew = searchParams.get('new');
  const paginated = searchParams.get('paginated') === 'true';
  const pagination = parsePagination(searchParams, {
    defaultLimit: PRODUCT_LIST_MAX,
    maxLimit: PRODUCT_LIST_MAX,
  });

  const where: Prisma.ProductWhereInput = {};
  if (category && category !== 'Todos') where.category = category;
  if (isNew === 'true') where.isNew = true;

  try {
    const [total, products] = await db.$transaction([
      db.product.count({ where }),
      db.product.findMany({
        where,
        select: productListSelect,
        orderBy: { sortOrder: 'asc' },
        skip: paginated ? pagination.skip : undefined,
        take: paginated ? pagination.take : PRODUCT_LIST_MAX,
      }),
    ]);

    const payload = products.map(transformProduct);
    const headers = { 'X-Catalog-Source': 'database' };

    if (paginated) {
      return NextResponse.json(
        {
          items: payload,
          meta: buildPaginationMeta(total, pagination.page, pagination.limit),
        },
        { headers },
      );
    }

    return NextResponse.json(payload, { headers });
  } catch (error) {
    console.error('Error fetching products from database:', error);

    const canFallback =
      isStaticCatalogFallbackEnabled() && isDatabaseUnavailableError(error);

    if (!canFallback) {
      return NextResponse.json(
        { error: 'Catálogo no disponible temporalmente' },
        { status: 503 },
      );
    }

    console.warn('Serving static catalog fallback (database unavailable)');
    const allStatic = filterStaticProducts(request);
    const headers = { 'X-Catalog-Source': 'static' };

    if (paginated) {
      const items = paginateArray(allStatic, pagination.skip, pagination.take);
      return NextResponse.json(
        {
          items,
          meta: buildPaginationMeta(allStatic.length, pagination.page, pagination.limit),
        },
        { headers },
      );
    }

    return NextResponse.json(allStatic, { headers });
  }
}
