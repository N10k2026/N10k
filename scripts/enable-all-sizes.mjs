// Mark ALL product sizes as available (outOfStock = false) across the entire catalog.
//
// ⚠️  DEV / OPS ONLY — never run in production (BUG-031).
// Requires explicit opt-in: ALLOW_ENABLE_ALL_SIZES=true node scripts/enable-all-sizes.mjs
import { db } from '../src/lib/db';

if (process.env.NODE_ENV === 'production') {
  console.error('Refusing to run enable-all-sizes in NODE_ENV=production.');
  process.exit(1);
}

if (process.env.ALLOW_ENABLE_ALL_SIZES !== 'true') {
  console.error(
    'Refusing to run without ALLOW_ENABLE_ALL_SIZES=true.\n' +
      'This script resets real stock data. Use only in local/dev recovery.',
  );
  process.exit(1);
}

async function main() {
  const result = await db.productSize.updateMany({
    where: { outOfStock: true },
    data: { outOfStock: false },
  });
  console.log(`Updated ${result.count} size(s) to outOfStock=false`);

  // Verify
  const products = await db.product.findMany({ include: { sizes: true } });
  let totalOos = 0;
  for (const p of products) {
    const oos = p.sizes.filter(s => s.outOfStock);
    totalOos += oos.length;
    console.log(`  ${p.name}: ${p.sizes.length} sizes, ${oos.length} outOfStock`);
  }
  console.log(`\nTotal outOfStock sizes remaining: ${totalOos}`);
}

main().catch(console.error).finally(() => db.$disconnect());
