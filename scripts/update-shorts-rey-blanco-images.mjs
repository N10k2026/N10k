// Update the DB for Shorts BREEZE:
//   1. ADD new ProductColor "Azul Rey" with hex #0047AB (vibrant royal blue — distinct from Azul Oscuro #1A2744)
//   2. ADD 4 ProductImage rows for Azul Rey (sortOrder 1, 2, 3, 4)
//   3. ADD 1 ProductImage row for Blanco detalle (sortOrder=4) — the 3 Blanco views already exist (sortOrder 1,2,3)
import { db } from '/home/z/my-project/src/lib/db.ts';

const AZUL_REY_HEX = '#0047AB';

async function main() {
  const product = await db.product.findFirst({
    where: { slug: 'shorts-breeze' },
    include: { images: { orderBy: { sortOrder: 'asc' } }, colors: true },
  });

  if (!product) {
    console.log('Shorts BREEZE not found in DB — API will serve from static catalog (already updated).');
    return;
  }

  console.log(`Product: ${product.name} (id=${product.id})`);
  console.log(`Current colors (${product.colors.length}):`);
  for (const c of product.colors) {
    console.log(`  ${c.name} -> ${c.hex}`);
  }

  // 1. Add the new "Azul Rey" ProductColor (if it doesn't already exist)
  const existingRey = product.colors.find((c) => c.name === 'Azul Rey');
  if (existingRey) {
    console.log(`\nAzul Rey color already exists (id=${existingRey.id}, hex=${existingRey.hex}) — skipping creation.`);
    if (existingRey.hex !== AZUL_REY_HEX) {
      await db.productColor.update({ where: { id: existingRey.id }, data: { hex: AZUL_REY_HEX } });
      console.log(`  Updated hex to ${AZUL_REY_HEX}`);
    }
  } else {
    const created = await db.productColor.create({
      data: { productId: product.id, name: 'Azul Rey', hex: AZUL_REY_HEX },
    });
    console.log(`\nCreated Azul Rey color: id=${created.id}, hex=${AZUL_REY_HEX}`);
  }

  // 2. Add 4 ProductImage rows for Azul Rey (skip if URL already exists for this product)
  const azulReyImages = [
    { url: '/products/shorts-breeze/azul-rey-1.webp', sortOrder: 1 },
    { url: '/products/shorts-breeze/azul-rey-2.webp', sortOrder: 2 },
    { url: '/products/shorts-breeze/azul-rey-3.webp', sortOrder: 3 },
    { url: '/products/shorts-breeze/azul-rey-detalle.webp', sortOrder: 4 },
  ];
  for (const img of azulReyImages) {
    const existing = await db.productImage.findFirst({
      where: { productId: product.id, url: img.url },
    });
    if (existing) {
      console.log(`Azul Rey image already exists: ${img.url} (id=${existing.id}) — skipping.`);
    } else {
      const created = await db.productImage.create({
        data: { productId: product.id, colorName: 'Azul Rey', url: img.url, sortOrder: img.sortOrder },
      });
      console.log(`Created Azul Rey image: ${img.url} (id=${created.id}, sortOrder=${img.sortOrder})`);
    }
  }

  // 3. Add Blanco detalle image (sortOrder=4) if it doesn't exist
  const blancoDetalleUrl = '/products/shorts-breeze/blanco-detalle.webp';
  const existingBlancoDetalle = await db.productImage.findFirst({
    where: { productId: product.id, url: blancoDetalleUrl },
  });
  if (existingBlancoDetalle) {
    console.log(`\nBlanco detalle image already exists: ${blancoDetalleUrl} (id=${existingBlancoDetalle.id}) — skipping.`);
  } else {
    const created = await db.productImage.create({
      data: { productId: product.id, colorName: 'Blanco', url: blancoDetalleUrl, sortOrder: 4 },
    });
    console.log(`\nCreated Blanco detalle image: ${blancoDetalleUrl} (id=${created.id}, sortOrder=4)`);
  }

  // Verify final state
  const refreshedProduct = await db.product.findFirst({
    where: { slug: 'shorts-breeze' },
    include: {
      images: { where: { colorName: { in: ['Azul Rey', 'Blanco'] } }, orderBy: [{ colorName: 'asc' }, { sortOrder: 'asc' }] },
      colors: true,
    },
  });
  console.log('\n--- Final DB state ---');
  console.log('All colors:');
  for (const c of refreshedProduct.colors) {
    console.log(`  ${c.name} -> ${c.hex}`);
  }
  console.log('\nAzul Rey + Blanco image rows:');
  for (const img of refreshedProduct.images) {
    console.log(`  [${img.colorName}] sortOrder=${img.sortOrder} url=${img.url}`);
  }
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => db.$disconnect());
