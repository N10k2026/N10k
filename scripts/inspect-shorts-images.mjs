// Inspect the current DB state of Shorts BREEZE ProductImage rows.
import { db } from '/home/z/my-project/src/lib/db.ts';

async function main() {
  const product = await db.product.findFirst({
    where: { slug: 'shorts-breeze' },
    include: { images: { orderBy: { sortOrder: 'asc' } }, colors: true },
  });

  if (!product) {
    console.log('Shorts BREEZE not found in DB.');
    return;
  }

  console.log(`Product: ${product.name} (id=${product.id})`);
  console.log(`Main image: ${product.image}`);
  console.log(`\nProductImage rows (${product.images.length}):`);
  for (const img of product.images) {
    console.log(`  [sortOrder=${img.sortOrder}] colorName="${img.colorName}" url=${img.url}`);
  }

  console.log(`\nProductColor rows (${product.colors.length}):`);
  for (const c of product.colors) {
    console.log(`  ${c.name} -> ${c.hex}`);
  }
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => db.$disconnect());
