/**
 * Static product data for Vercel deployment.
 * SQLite doesn't work on Vercel's serverless environment,
 * so we embed the product catalog directly.
 */

/**
 * Media cache-busting version.
 * Bump this number whenever product photos on disk are replaced so browsers
 * fetch the new files instead of serving stale cached copies. The version is
 * appended as `?v=<n>` to every product image/video URL by the API layer
 * (see src/app/api/products/route.ts and src/lib/product-utils.ts).
 */
export const MEDIA_VERSION = 20260619;

export type StaticColor = { name: string; hex: string };
export type StaticProduct = {
  id: string;
  name: string;
  slug: string;
  category: string;
  price: number;
  originalPrice?: number;
  image: string;
  images: string[];
  colorImages?: Record<string, string[]>;
  colors: StaticColor[];
  sizes: string[];
  /** Sizes out of stock when DB is unavailable (parity with ProductSize.outOfStock). */
  outOfStock?: string[];
  description: string;
  isNew: boolean;
  isBestSeller: boolean;
  video?: string;
  /** Optional average rating for static fallback (defaults to 0). */
  rating?: number;
};

export const staticProducts: StaticProduct[] = [
  {
    id: 'shorts-breeze',
    name: 'Shorts BREEZE',
    slug: 'shorts-breeze',
    category: 'Shorts',
    price: 40,
    image: '/products/shorts-breeze/aguamarina-1.webp',
    images: [
      '/products/shorts-breeze/collage-1.webp',
      '/products/shorts-breeze/collage-2.webp',
      '/products/shorts-breeze/aguamarina-1.webp',
      '/products/shorts-breeze/aguamarina-2.webp',
      '/products/shorts-breeze/aguamarina-3.webp',
      '/products/shorts-breeze/aguamarina-detalle-1.webp',
      '/products/shorts-breeze/blanco-1.webp',
      '/products/shorts-breeze/blanco-2.webp',
      '/products/shorts-breeze/blanco-3.webp',
      '/products/shorts-breeze/blanco-detalle.webp',
      '/products/shorts-breeze/azul-rey-1.webp',
      '/products/shorts-breeze/azul-rey-2.webp',
      '/products/shorts-breeze/azul-rey-3.webp',
      '/products/shorts-breeze/azul-rey-detalle.webp',
      '/products/shorts-breeze/verde-1.webp',
      '/products/shorts-breeze/verde-2.webp',
      '/products/shorts-breeze/verde-3.webp',
      '/products/shorts-breeze/verde-detalle.webp',
      '/products/shorts-breeze/negro-1.webp',
      '/products/shorts-breeze/negro-2.webp',
      '/products/shorts-breeze/negro-3.webp',
      '/products/shorts-breeze/negro-detalle.webp',
      '/products/shorts-breeze/amarillo-1.webp',
      '/products/shorts-breeze/amarillo-2.webp',
      '/products/shorts-breeze/amarillo-3.webp',
      '/products/shorts-breeze/amarillo-detalle.webp',
      '/products/shorts-breeze/azul-oscuro-1.webp',
      '/products/shorts-breeze/azul-oscuro-2.webp',
      '/products/shorts-breeze/azul-oscuro-detalle.webp',
      '/products/shorts-breeze/azul-claro-1.webp',
      '/products/shorts-breeze/azul-claro-2.webp',
      '/products/shorts-breeze/azul-claro-3.webp',
      '/products/shorts-breeze/azul-claro-detalle.webp',
    ],
    colorImages: {
      'Aguamarina': [
        '/products/shorts-breeze/aguamarina-1.webp',
        '/products/shorts-breeze/aguamarina-2.webp',
        '/products/shorts-breeze/aguamarina-3.webp',
        '/products/shorts-breeze/aguamarina-detalle-1.webp',
      ],
      'Blanco': [
        '/products/shorts-breeze/blanco-1.webp',
        '/products/shorts-breeze/blanco-2.webp',
        '/products/shorts-breeze/blanco-3.webp',
        '/products/shorts-breeze/blanco-detalle.webp',
      ],
      'Azul Rey': [
        '/products/shorts-breeze/azul-rey-1.webp',
        '/products/shorts-breeze/azul-rey-2.webp',
        '/products/shorts-breeze/azul-rey-3.webp',
        '/products/shorts-breeze/azul-rey-detalle.webp',
      ],
      'Verde': [
        '/products/shorts-breeze/verde-1.webp',
        '/products/shorts-breeze/verde-2.webp',
        '/products/shorts-breeze/verde-3.webp',
        '/products/shorts-breeze/verde-detalle.webp',
      ],
      'Negro': [
        '/products/shorts-breeze/negro-1.webp',
        '/products/shorts-breeze/negro-2.webp',
        '/products/shorts-breeze/negro-3.webp',
        '/products/shorts-breeze/negro-detalle.webp',
      ],
      'Amarillo': [
        '/products/shorts-breeze/amarillo-1.webp',
        '/products/shorts-breeze/amarillo-2.webp',
        '/products/shorts-breeze/amarillo-3.webp',
        '/products/shorts-breeze/amarillo-detalle.webp',
      ],
      'Azul Oscuro': [
        '/products/shorts-breeze/azul-oscuro-1.webp',
        '/products/shorts-breeze/azul-oscuro-2.webp',
        '/products/shorts-breeze/azul-oscuro-detalle.webp',
      ],
      'Azul Claro': [
        '/products/shorts-breeze/azul-claro-1.webp',
        '/products/shorts-breeze/azul-claro-2.webp',
        '/products/shorts-breeze/azul-claro-3.webp',
        '/products/shorts-breeze/azul-claro-detalle.webp',
      ],
    },
    colors: [
      { name: 'Aguamarina', hex: '#5FD0C4' },
      { name: 'Blanco', hex: '#FFFFFF' },
      { name: 'Verde', hex: '#2D5A27' },
      { name: 'Negro', hex: '#0A0A0A' },
      { name: 'Amarillo', hex: '#D4F000' },
      { name: 'Azul Oscuro', hex: '#1A2744' },
      { name: 'Azul Claro', hex: '#5B9BD5' },
      { name: 'Azul Rey', hex: '#0047AB' },
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    description: 'Shorts deportivos para caballero con logo N10K "LIVE LIMITLESS". Tela suave y ligera con cintura elástica y cordón ajustable. Disponible en 8 colores — frescura y actitud sin límites.',
    isNew: true,
    isBestSeller: true,
    video: '/videos/shorts-breeze.mp4',
  },
  {
    id: 'hoodie-bold',
    name: 'Hoodie BOLD',
    slug: 'hoodie-bold',
    category: 'Hoodies',
    price: 50,
    image: '/products/hoodie-vinotinto.webp',
    images: [
      '/products/hoodie-vinotinto.webp',
      '/products/hoodie-vinotinto-2.webp',
      '/products/hoodie-negro.webp',
      '/products/hoodie-negro-2.webp',
      '/products/hoodie-marron.webp',
      '/products/hoodie-marron-2.webp',
      '/products/hoodie-blanco.webp',
      '/products/hoodie-blanco-2.webp',
    ],
    colorImages: {
      'Vinotinto': [
        '/products/hoodie-vinotinto.webp',
        '/products/hoodie-vinotinto-2.webp',
      ],
      'Negro': [
        '/products/hoodie-negro.webp',
        '/products/hoodie-negro-2.webp',
      ],
      'Marrón': [
        '/products/hoodie-marron.webp',
        '/products/hoodie-marron-2.webp',
      ],
      'Blanco': [
        '/products/hoodie-blanco.webp',
        '/products/hoodie-blanco-2.webp',
      ],
    },
    colors: [
      { name: 'Vinotinto', hex: '#722F37' },
      { name: 'Negro', hex: '#0A0A0A' },
      { name: 'Marrón', hex: '#5C3A21' },
      { name: 'Blanco', hex: '#FFFFFF' },
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    description: 'Hoodie oversize para caballero que no pide permiso. Algodón premium 80/20 con forro polar, logo N10K bordado y actitud que se siente. 4 colores, cero miedo.',
    isNew: true,
    isBestSeller: true,
    video: '/videos/hoodie-bold.mp4',
  },
  {
    id: 'sweater-after-dark',
    name: 'Sweater AFTER DARK',
    slug: 'sweater-after-dark',
    category: 'Suéters',
    price: 40,
    image: '/products/sueter-negro.webp',
    images: [
      '/products/sueter-negro.webp',
      '/products/sueter-negro-2.webp',
      '/products/sueter-rosa.webp',
      '/products/sueter-rosa-03.webp',
      '/products/sueter-blanco.webp',
      '/products/sueter-blanco-2.webp',
    ],
    colorImages: {
      'Negro': [
        '/products/sueter-negro.webp',
        '/products/sueter-negro-2.webp',
      ],
      'Rosa': [
        '/products/sueter-rosa.webp',
        '/products/sueter-rosa-03.webp',
      ],
      'Blanco': [
        '/products/sueter-blanco.webp',
        '/products/sueter-blanco-2.webp',
      ],
    },
    colors: [
      { name: 'Negro', hex: '#0A0A0A' },
      { name: 'Rosa', hex: '#E8A0B4' },
      { name: 'Blanco', hex: '#FFFFFF' },
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    description: 'Suéter cuello redondo para caballero, corte relajado y presencia que no pasa desapercibida. Algodón suave con logo N10K bordado. Hecho para los que brillan de noche.',
    isNew: true,
    isBestSeller: true,
  },
  {
    id: 'sweater-pearl',
    name: 'Sweater PEARL | Exclusive Drop',
    slug: 'sweater-pearl-exclusive-drop',
    category: 'Suéters',
    price: 40,
    image: '/products/sueter-perla.webp',
    images: [
      '/products/sueter-perla.webp',
      '/products/sueter-perla-2.webp',
    ],
    colorImages: {
      'Perla': [
        '/products/sueter-perla.webp',
        '/products/sueter-perla-2.webp',
      ],
    },
    colors: [
      { name: 'Perla', hex: '#D4C5A9' },
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    description: 'Edición limitada para caballero. Un tono perla que rompe el molde, algodón premium y logo N10K bordado. Para los que saben que lo exclusivo no se repite.',
    isNew: true,
    isBestSeller: false,
  },
  {
    id: 'tee-limitless',
    name: 'Tee LIMITLESS',
    slug: 'tee-limitless',
    category: 'Franelas',
    price: 35,
    image: '/products/tee-negro.webp',
    images: [
      '/products/tee-negro.webp',
      '/products/tee-blanco.webp',
    ],
    colorImages: {
      'Negro': ['/products/tee-negro.webp'],
      'Blanco': ['/products/tee-blanco.webp'],
    },
    colors: [
      { name: 'Negro', hex: '#0A0A0A' },
      { name: 'Blanco', hex: '#FFFFFF' },
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    description: 'Franela oversize para caballero con estampado N10K. Algodón peinado 100% para los que usan las calles como pasarela. Sin límites, sin reglas.',
    isNew: false,
    isBestSeller: true,
  },
  {
    id: 'tank-fearless',
    name: 'Tank FEARLESS',
    slug: 'tank-fearless',
    category: 'Franelas',
    price: 25,
    image: '/products/tank-negro.webp',
    images: [
      '/products/tank-negro.webp',
      '/products/tank-rojo.webp',
    ],
    colorImages: {
      'Negro': ['/products/tank-negro.webp'],
      'Rojo': ['/products/tank-rojo.webp'],
    },
    colors: [
      { name: 'Negro', hex: '#0A0A0A' },
      { name: 'Rojo', hex: '#E31E24' },
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    description: 'Franelilla para caballero con actitud. Tela suave y stretch, sin disculpas. Muestra lo que quieres, esconde lo que te da la gana.',
    isNew: false,
    isBestSeller: false,
  },
];
