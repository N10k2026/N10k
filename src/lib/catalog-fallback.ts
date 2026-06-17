import { staticProducts } from '@/lib/static-products';
import { versionMediaUrl, versionMediaUrls, versionColorImages } from '@/lib/media-version';

/** Whether static catalog fallback is allowed when the DB is unavailable. */
export function isStaticCatalogFallbackEnabled(): boolean {
  if (process.env.ALLOW_STATIC_CATALOG_FALLBACK === 'true') return true;
  if (process.env.ALLOW_STATIC_CATALOG_FALLBACK === 'false') return false;
  if (process.env.NODE_ENV !== 'production') return true;
  // SQLite file URLs cannot work on serverless hosts (e.g. Vercel).
  const url = process.env.DATABASE_URL?.trim() ?? '';
  if (!url || url.startsWith('file:')) return true;
  return false;
}

/** Prisma / SQLite connection errors where a static fallback is reasonable. */
export function isDatabaseUnavailableError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  const code = (error as { code?: string }).code;
  if (code && ['P1000', 'P1001', 'P1002', 'P1003', 'P1008', 'P1010', 'P1017', 'P2024'].includes(code)) {
    return true;
  }
  const message = String((error as { message?: string }).message ?? error);
  return (
    message.includes('Unable to open the database file') ||
    message.includes('SQLITE_CANTOPEN') ||
    message.includes('SQLITE_BUSY') ||
    message.includes('Environment variable not found: DATABASE_URL') ||
    message.includes('Error querying the database')
  );
}

/** Normalize static products to the runtime Product shape used by the store. */
export function staticProductsAsRuntime() {
  return staticProducts.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    category: p.category,
    price: p.price,
    originalPrice: p.originalPrice,
    image: versionMediaUrl(p.image) as string,
    images: versionMediaUrls(p.images) as string[],
    colorImages: versionColorImages(p.colorImages),
    sizes: p.sizes,
    outOfStock: p.outOfStock ?? [],
    colors: p.colors,
    description: p.description,
    isNew: p.isNew,
    isBestSeller: p.isBestSeller,
    video: versionMediaUrl(p.video),
    rating: p.rating ?? 0,
  }));
}
