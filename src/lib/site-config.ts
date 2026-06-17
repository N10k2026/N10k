/** Public site URL for metadata, canonical, OG and JSON-LD. Override via env in production. */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ?? 'https://nutrition10k.com';

export const SITE_NAME = 'N10K | Ropa de Caballero';
export const SITE_SHORT_NAME = 'N10K';
export const SITE_DESCRIPTION =
  'N10K - Ropa masculina urbana y deportiva. Descubre nuestra colección de streetwear para caballero con estilo audaz y sin límites.';
export const SITE_OG_DESCRIPTION =
  'Ropa masculina urbana y deportiva. Colección streetwear para caballero.';
export const SITE_LOCALE = 'es_MX';
export const SITE_OG_IMAGE = '/brand/logo-01-n10kcaballero.webp';
