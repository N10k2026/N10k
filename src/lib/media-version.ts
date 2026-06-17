/**
 * Appends a cache-busting query param (`?v=<MEDIA_VERSION>`) to product media
 * URLs so browsers refetch photos when they are replaced on disk.
 *
 * Only appends to URLs that point at our own static assets (start with `/`).
 * External URLs (http/https/data:) are returned unchanged. URLs that already
 * carry a query string are skipped to avoid double-appending.
 */
import { MEDIA_VERSION } from './static-products';

export function versionMediaUrl(url: string | undefined | null): string | undefined {
  if (!url) return undefined;
  // Only version local absolute paths (our static assets in /public).
  if (!url.startsWith('/')) return url;
  // Don't double-append if there's already a query string.
  if (url.includes('?')) return url;
  return `${url}?v=${MEDIA_VERSION}`;
}

/** Version every URL in an array (returns a new array). */
export function versionMediaUrls(urls: string[] | undefined): string[] | undefined {
  if (!urls) return urls;
  return urls.map(versionMediaUrl).filter((u): u is string => Boolean(u));
}

/** Version every value in a colorImages record (returns a new record). */
export function versionColorImages(
  colorImages: Record<string, string[]> | undefined
): Record<string, string[]> | undefined {
  if (!colorImages) return colorImages;
  const out: Record<string, string[]> = {};
  for (const [key, urls] of Object.entries(colorImages)) {
    out[key] = urls.map(versionMediaUrl).filter((u): u is string => Boolean(u));
  }
  return out;
}
