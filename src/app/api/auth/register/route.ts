import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword } from '@/lib/auth-utils';
import { applyRateLimit } from '@/lib/rate-limit';
import { setSessionCookie } from '@/lib/session';
import {
  BodyTooLargeError,
  normalizeEmail,
  parseJsonBody,
  registerSchema,
  toPublicUser,
} from '@/lib/validation';

export async function POST(request: NextRequest) {
  const limited = applyRateLimit(request, 'auth-register', 5, 60 * 60 * 1000);
  if (!limited.ok) {
    return NextResponse.json(
      { error: 'Too many registration attempts. Try again later.' },
      { status: 429, headers: { 'Retry-After': String(limited.retryAfter) } }
    );
  }

  try {
    const body = await parseJsonBody(request);
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message ?? 'Invalid input';
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const { name, password, phone } = parsed.data;
    const email = normalizeEmail(parsed.data.email);

    const existing = await db.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
    }

    const hashedPassword = await hashPassword(password);
    const user = await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone: phone || null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        avatar: true,
        createdAt: true,
      },
    });

    const response = NextResponse.json({ user: toPublicUser(user) });
    setSessionCookie(response, user.id);
    return response;
  } catch (error) {
    if (error instanceof BodyTooLargeError) {
      return NextResponse.json({ error: 'Request body too large' }, { status: 413 });
    }
    console.error('Register error');
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
  }
}
