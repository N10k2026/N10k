import { z } from 'zod';

export const reviewSchema = z.object({
  productId: z.string().trim().min(1).max(64),
  userName: z.string().trim().min(1).max(80),
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().trim().min(1).max(2000),
});

export const newsletterSchema = z.object({
  email: z.string().trim().email().max(254),
});

export class BodyTooLargeError extends Error {
  constructor() {
    super('Request body too large');
    this.name = 'BodyTooLargeError';
  }
}

export async function parseJsonBody(request: Request, maxBytes = 16_384): Promise<unknown> {
  const contentLength = request.headers.get('content-length');
  if (contentLength && parseInt(contentLength, 10) > maxBytes) {
    throw new BodyTooLargeError();
  }

  const text = await request.text();
  if (text.length > maxBytes) {
    throw new BodyTooLargeError();
  }

  if (!text.trim()) return {};
  return JSON.parse(text) as unknown;
}

/** Strip HTML/script vectors from user-generated text before persistence. */
export function sanitizeText(input: string): string {
  return input
    .replace(/[<>&"'`]/g, (char) => {
      const map: Record<string, string> = {
        '<': '&lt;',
        '>': '&gt;',
        '&': '&amp;',
        '"': '&quot;',
        "'": '&#39;',
        '`': '&#96;',
      };
      return map[char] ?? char;
    })
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '');
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function normalizeReviewerKey(userName: string): string {
  return userName.trim().toLowerCase();
}