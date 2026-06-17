import { PrismaClient } from '@prisma/client';
import { staticProducts } from '../src/lib/static-products';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding catalog from static-products (IDs/slugs aligned)...');

  for (let index = 0; index < staticProducts.length; index++) {
    const p = staticProducts[index];

    const product = await prisma.product.upsert({
      where: { slug: p.slug },
      create: {
        id: p.id,
        name: p.name,
        slug: p.slug,
        category: p.category,
        price: p.price,
        originalPrice: p.originalPrice ?? null,
        image: p.image,
        description: p.description,
        video: p.video ?? null,
        isNew: p.isNew,
        isBestSeller: p.isBestSeller,
        rating: p.rating ?? 0,
        sortOrder: index,
      },
      update: {
        name: p.name,
        category: p.category,
        price: p.price,
        originalPrice: p.originalPrice ?? null,
        image: p.image,
        description: p.description,
        video: p.video ?? null,
        isNew: p.isNew,
        isBestSeller: p.isBestSeller,
        sortOrder: index,
      },
    });

    await prisma.productColor.deleteMany({ where: { productId: product.id } });
    await prisma.productSize.deleteMany({ where: { productId: product.id } });
    await prisma.productImage.deleteMany({ where: { productId: product.id } });

    if (p.colors.length > 0) {
      await prisma.productColor.createMany({
        data: p.colors.map((color) => ({
          productId: product.id,
          name: color.name,
          hex: color.hex,
        })),
      });
    }

    const outOfStock = new Set(p.outOfStock ?? []);
    if (p.sizes.length > 0) {
      await prisma.productSize.createMany({
        data: p.sizes.map((label) => ({
          productId: product.id,
          label,
          outOfStock: outOfStock.has(label),
        })),
      });
    }

    const imageRows: {
      productId: string;
      url: string;
      colorName: string | null;
      sortOrder: number;
    }[] = [];

    let sortOrder = 0;
    for (const url of p.images) {
      let colorName: string | null = null;
      if (p.colorImages) {
        for (const [name, urls] of Object.entries(p.colorImages)) {
          if (urls.includes(url)) {
            colorName = name;
            break;
          }
        }
      }
      imageRows.push({ productId: product.id, url, colorName, sortOrder: sortOrder++ });
    }

    if (imageRows.length > 0) {
      await prisma.productImage.createMany({ data: imageRows });
    }

    console.log(`  ✓ ${product.slug}`);
  }

  console.log(`Seeded ${staticProducts.length} products.`);
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
