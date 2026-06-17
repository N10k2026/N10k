import { versionMediaUrl, versionMediaUrls, versionColorImages } from './media-version';

/** Product-like shape for stock helpers (store Product or API payload). */
type ProductStockShape = {
  sizes: string[];
  outOfStock?: string[];
};

export function isProductSizeOutOfStock(
  product: ProductStockShape,
  size: string,
): boolean {
  return (product.outOfStock ?? []).includes(size);
}

/** First in-stock size, or null if every size is marked outOfStock. */
export function getFirstAvailableSize(product: ProductStockShape): string | null {
  return product.sizes.find((size) => !isProductSizeOutOfStock(product, size)) ?? null;
}

/** Safe parse for localStorage JSON arrays (BUG-022). */
export function parseStoredStringArray(raw: string | null): string[] {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is string => typeof item === 'string');
  } catch {
    return [];
  }
}

/** Safe parse for localStorage JSON object arrays with productId + size (BUG-022). */
export function parseStoredNotificationEntries(
  raw: string | null,
): { productId: string; size: string; email?: string; timestamp?: number }[] {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item): item is { productId: string; size: string; email?: string; timestamp?: number } =>
        typeof item === 'object' &&
        item !== null &&
        typeof (item as { productId?: unknown }).productId === 'string' &&
        typeof (item as { size?: unknown }).size === 'string',
    );
  } catch {
    return [];
  }
}

/** Shareable product URL with ?product= slug or id (BUG-008). */
export function getProductShareUrl(product: { id: string; slug?: string }): string {
  if (typeof window === 'undefined') return '';
  const key = encodeURIComponent(product.slug || product.id);
  return `${window.location.origin}/?product=${key}`;
}

type DbProductWithRelations = {
  id: string;
  name: string;
  slug: string;
  category: string;
  price: number;
  originalPrice: number | null;
  image: string;
  description: string;
  video: string | null;
  isNew: boolean;
  isBestSeller: boolean;
  rating: number | null;
  images: { url: string; colorName: string | null; sortOrder: number }[];
  colors: { name: string; hex: string }[];
  sizes: { label: string; outOfStock: boolean }[];
};

export function transformProduct(dbProduct: DbProductWithRelations) {
  const images = dbProduct.images || [];
  const colors = dbProduct.colors || [];
  const sizes = dbProduct.sizes || [];

  // Group images by color (apply cache-busting version to each URL)
  const colorImages: Record<string, string[]> = {};
  for (const img of images) {
    if (img.colorName) {
      if (!colorImages[img.colorName]) colorImages[img.colorName] = [];
      colorImages[img.colorName].push(versionMediaUrl(img.url) as string);
    }
  }

  // All images (non-color-specific first, then color-specific), versioned
  const allImages = [
    ...images.filter((i) => !i.colorName).map((i) => versionMediaUrl(i.url) as string),
    ...images.filter((i) => i.colorName).map((i) => versionMediaUrl(i.url) as string),
  ];

  return {
    id: dbProduct.id,
    name: dbProduct.name,
    slug: dbProduct.slug,
    category: dbProduct.category,
    price: dbProduct.price,
    originalPrice: dbProduct.originalPrice ?? undefined,
    image: versionMediaUrl(dbProduct.image) as string,
    images: allImages.length > 0 ? allImages : [versionMediaUrl(dbProduct.image) as string],
    colorImages: Object.keys(colorImages).length > 0 ? colorImages : undefined,
    sizes: sizes.map((s) => s.label),
    outOfStock: sizes.filter((s) => s.outOfStock).map((s) => s.label),
    colors: colors.map((c) => ({ name: c.name, hex: c.hex })),
    description: dbProduct.description,
    isNew: dbProduct.isNew,
    isBestSeller: dbProduct.isBestSeller,
    video: versionMediaUrl(dbProduct.video ?? undefined),
    rating: dbProduct.rating ?? undefined,
  };
}

