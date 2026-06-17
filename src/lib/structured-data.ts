import { staticProducts } from '@/lib/static-products';
import {
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_OG_IMAGE,
  SITE_SHORT_NAME,
  SITE_URL,
} from '@/lib/site-config';

export function getOrganizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_SHORT_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}${SITE_OG_IMAGE}`,
    description: SITE_DESCRIPTION,
    email: 'info@nutrition10k.com',
  };
}

export function getWebSiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    inLanguage: 'es-MX',
    publisher: {
      '@type': 'Organization',
      name: SITE_SHORT_NAME,
    },
  };
}

export function getItemListJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Catálogo N10K',
    numberOfItems: staticProducts.length,
    itemListElement: staticProducts.map((product, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'Product',
        name: product.name,
        description: product.description,
        sku: product.id,
        url: `${SITE_URL}/?product=${product.slug}`,
        image: `${SITE_URL}${product.image}`,
        brand: {
          '@type': 'Brand',
          name: SITE_SHORT_NAME,
        },
        offers: {
          '@type': 'Offer',
          priceCurrency: 'USD',
          price: product.price.toFixed(2),
          availability: 'https://schema.org/InStock',
          url: `${SITE_URL}/?product=${product.slug}`,
        },
      },
    })),
  };
}

export function getBreadcrumbJsonLd(items: { name: string; url?: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      ...(item.url ? { item: item.url } : {}),
    })),
  };
}
