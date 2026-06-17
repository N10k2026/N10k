// Add the new "detalle" images for Shorts BREEZE Negro & Verde colors to the database.
// These were missing from the original DB seed — only 3 images per color existed.
// This script adds the 4th "detalle" (waistband/label close-up) image for each.
import { db } from '../src/lib/db';

async function main() {
  const product = await db.product.findFirst({
    where: { slug: 'shorts-breeze' },
    include: { images: true },
  });

  if (!product) {
    console.error('Shorts BREEZE product not found in DB');
    process.exit(1);
  }

  console.log(`Found product: ${product.name} (${product.id})`);
  console.log(`Existing images: ${product.images.length}`);

  // Show current Negro & Verde images
  const negroImgs = product.images.filter(i => i.colorName === 'Negro').sort((a, b) => a.sortOrder - b.sortOrder);
  const verdeImgs = product.images.filter(i => i.colorName === 'Verde').sort((a, b) => a.sortOrder - b.sortOrder);
  console.log(`\nCurrent Negro images (${negroImgs.length}):`);
  negroImgs.forEach(i => console.log(`  [${i.sortOrder}] ${i.url}`));
  console.log(`\nCurrent Verde images (${verdeImgs.length}):`);
  verdeImgs.forEach(i => console.log(`  [${i.sortOrder}] ${i.url}`));

  // Add the new detalle images if they don't already exist
  const newImages = [
    { url: '/products/shorts-breeze/negro-detalle.webp', colorName: 'Negro', sortOrder: negroImgs.length },
    { url: '/products/shorts-breeze/verde-detalle.webp', colorName: 'Verde', sortOrder: verdeImgs.length },
  ];

  for (const img of newImages) {
    const existing = product.images.find(i => i.url === img.url && i.colorName === img.colorName);
    if (existing) {
      console.log(`\nSKIP (already exists): ${img.colorName} -> ${img.url}`);
      continue;
    }
    const created = await db.productImage.create({
      data: { ...img, productId: product.id },
    });
    console.log(`\nCREATED: ${img.colorName} -> ${img.url} (id=${created.id}, sortOrder=${img.sortOrder})`);
  }

  // Verify final state
  const updated = await db.product.findFirst({
    where: { slug: 'shorts-breeze' },
    include: { images: true },
  });
  const finalNegro = updated.images.filter(i => i.colorName === 'Negro').sort((a, b) => a.sortOrder - b.sortOrder);
  const finalVerde = updated.images.filter(i => i.colorName === 'Verde').sort((a, b) => a.sortOrder - b.sortOrder);
  console.log(`\n--- Final state ---`);
  console.log(`Negro images (${finalNegro.length}):`);
  finalNegro.forEach(i => console.log(`  [${i.sortOrder}] ${i.url}`));
  console.log(`Verde images (${finalVerde.length}):`);
  finalVerde.forEach(i => console.log(`  [${i.sortOrder}] ${i.url}`));
}

main()
  .catch((err) => {
    console.error('Error:', err);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
