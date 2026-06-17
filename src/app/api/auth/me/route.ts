import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth-utils';
import { db } from '@/lib/db';
import {
  BodyTooLargeError,
  parseJsonBody,
  profileUpdateSchema,
  toPublicUser,
} from '@/lib/validation';

export async function GET(request: NextRequest) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return NextResponse.json(toPublicUser(user));
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await parseJsonBody(request);
    const parsed = profileUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid profile data' }, { status: 400 });
    }

    const updated = await db.user.update({
      where: { id: user.id },
      data: {
        name: parsed.data.name,
        ...(parsed.data.phone !== undefined ? { phone: parsed.data.phone || null } : {}),
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

    return NextResponse.json(toPublicUser(updated));
  } catch (error) {
    if (error instanceof BodyTooLargeError) {
      return NextResponse.json({ error: 'Request body too large' }, { status: 413 });
    }
    console.error('Profile update error');
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }
}
