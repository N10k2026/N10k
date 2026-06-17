import bcrypt from 'bcryptjs';
import { NextRequest } from 'next/server';
import { db } from './db';
import { getUserIdFromRequest } from './session';

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

const userSelect = {
  id: true,
  name: true,
  email: true,
  phone: true,
  avatar: true,
  createdAt: true,
} as const;

export async function getUserFromRequest(request: NextRequest | Request) {
  const userId = getUserIdFromRequest(request);
  if (!userId) return null;

  return db.user.findUnique({
    where: { id: userId },
    select: userSelect,
  });
}
