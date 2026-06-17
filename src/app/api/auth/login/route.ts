import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyPassword } from '@/lib/auth-utils';
import { applyRateLimit } from '@/lib/rate-limit';
import { setSessionCookie } from '@/lib/session';
import {
  BodyTooLargeError,
  loginSchema,
  normalizeEmail,
  parseJsonBody,
  toPublicUser,
} from '@/lib/validation';

export async function POST(request: NextRequest) {
  const limited = applyRateLimit(request, 'auth-login', 10, 15 * 60 * 1000);
  if (!limited.ok) {
    return NextResponse.json(
      { error: 'Too many attempts. Try again later.' },
      { status: 429, headers: { 'Retry-After': String(limited.retryAfter) } }
    );
  }

  try {
    const body = await parseJsonBody(request);
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const email = normalizeEmail(parsed.data.email);
    const { password } = parsed.data;

    const user = await db.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        avatar: true,
        createdAt: true,
        password: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const valid = await verifyPassword(password, user.password);
    if (!valid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const response = NextResponse.json({ user: toPublicUser(user) });
    setSessionCookie(response, user.id);
    return response;
  } catch (error) {
    if (error instanceof BodyTooLargeError) {
      return NextResponse.json({ error: 'Request body too large' }, { status: 413 });
    }
    console.error('Login error');
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}
