// Update Shorts BREEZE colors in the database to match the new neon yellow and
// brighter aquamarine. Also verify the image URLs are unchanged (filenames kept
// the same, so only the files on disk + the hex values change).
import { db } from '/home/z/my-project/src/lib/db.ts';

async function main() {
  // Find the Shorts BREEZE product (by slug, matching static-products.ts)
  const product = await db.product.findFirst({
    where: { slug: 'shorts-breeze' },
    include: { colors: true },
  });

  if (!product) {
    console.log('Shorts BREEZE not found in DB — the API will serve from static catalog (already updated).');
    return;
  }

  console.log(`Found product: ${product.name} (id=${product.id})`);
  console.log('Current colors:');
  for (const c of product.colors) {
    console.log(`  ${c.name} -> ${c.hex}`);
  }

  // Update the two colors whose hex changed
  const updates = [
    { name: 'Aguamarina', oldHex: '#84C5C1', newHex: '#5FD0C4' },
    { name: 'Amarillo', oldHex: '#E8C840', newHex: '#D4F000' },
  ];

  for (const { name, newHex } of updates) {
    const updated = await db.productColor.updateMany({
      where: { productId: product.id, name },
      data: { hex: newHex },
    });
    console.log(`Updated ${name}: ${updated.count} row(s) -> ${newHex}`);
  }

  // Verify
  const refreshed = await db.productColor.findMany({ where: { productId: product.id } });
  console.log('\nRefreshed colors:');
  for (const c of refreshed) {
    console.log(`  ${c.name} -> ${c.hex}`);
  }
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => db.$disconnect());
