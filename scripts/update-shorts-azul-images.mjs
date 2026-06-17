// Update the DB ProductImage rows for Shorts BREEZE blue colors:
//   - DELETE the azul-oscuro-3.webp row (user only sent 2 full views for dark blue)
//   - INSERT azul-claro-3.webp row (new back view, sortOrder=3)
//   - INSERT azul-claro-detalle.webp row (new waistband close-up, sortOrder=4)
// No hex changes — #1A2744 (Azul Oscuro) and #5B9BD5 (Azul Claro) are already correct.
import { db } from '/home/z/my-project/src/lib/db.ts';

async function main() {
  const product = await db.product.findFirst({
    where: { slug: 'shorts-breeze' },
    include: { images: { orderBy: { sortOrder: 'asc' } } },
  });

  if (!product) {
    console.log('Shorts BREEZE not found in DB — API will serve from static catalog (already updated).');
    return;
  }

  console.log(`Product: ${product.name} (id=${product.id})`);

  // 1. Delete the stale azul-oscuro-3.webp ProductImage row
  const deleted = await db.productImage.deleteMany({
    where: {
      productId: product.id,
      colorName: 'Azul Oscuro',
      url: '/products/shorts-breeze/azul-oscuro-3.webp',
    },
  });
  console.log(`Deleted azul-oscuro-3.webp row: ${deleted.count} row(s) removed`);

  // 2. Insert azul-claro-3.webp (back view, sortOrder=3)
  const created3 = await db.productImage.create({
    data: {
      productId: product.id,
      colorName: 'Azul Claro',
      url: '/products/shorts-breeze/azul-claro-3.webp',
      sortOrder: 3,
    },
  });
  console.log(`Created azul-claro-3.webp row: id=${created3.id}`);

  // 3. Insert azul-claro-detalle.webp (waistband close-up, sortOrder=4)
  const created4 = await db.productImage.create({
    data: {
      productId: product.id,
      colorName: 'Azul Claro',
      url: '/products/shorts-breeze/azul-claro-detalle.webp',
      sortOrder: 4,
    },
  });
  console.log(`Created azul-claro-detalle.webp row: id=${created4.id}`);

  // Verify the final state
  const refreshed = await db.productImage.findMany({
    where: { productId: product.id, colorName: { in: ['Azul Oscuro', 'Azul Claro'] } },
    orderBy: [{ colorName: 'asc' }, { sortOrder: 'asc' }],
  });
  console.log('\nFinal blue image rows:');
  for (const img of refreshed) {
    console.log(`  [${img.colorName}] sortOrder=${img.sortOrder} url=${img.url}`);
  }
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => db.$disconnect());
