import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { db } from '@/lib/db';
import { applyRateLimit } from '@/lib/rate-limit';
import {
  BodyTooLargeError,
  normalizeEmail,
  newsletterSchema,
  parseJsonBody,
} from '@/lib/validation';

export async function POST(request: NextRequest) {
  const limited = applyRateLimit(request, 'newsletter-post', 5, 60 * 60 * 1000);
  if (!limited.ok) {
    return NextResponse.json(
      { error: 'Too many subscription attempts. Try again later.' },
      { status: 429, headers: { 'Retry-After': String(limited.retryAfter) } }
    );
  }

  try {
    const body = await parseJsonBody(request);
    const parsed = newsletterSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    const email = normalizeEmail(parsed.data.email);

    const existing = await db.newsletterSubscriber.findUnique({
      where: { email },
    });

    if (existing) {
      return NextResponse.json({ message: 'Already subscribed' }, { status: 200 });
    }

    try {
      await db.newsletterSubscriber.create({ data: { email } });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        return NextResponse.json({ message: 'Already subscribed' }, { status: 200 });
      }
      throw error;
    }

    return NextResponse.json({ message: 'Subscribed successfully' }, { status: 201 });
  } catch (error) {
    if (error instanceof BodyTooLargeError) {
      return NextResponse.json({ error: 'Request body too large' }, { status: 413 });
    }
    console.error('Newsletter subscription error');
    return NextResponse.json({ error: 'Subscription failed' }, { status: 500 });
  }
}
