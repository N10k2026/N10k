import { db } from '../src/lib/db';
async function main() {
  const products = await db.product.findMany({ include: { sizes: true } });
  for (const p of products) {
    const oos = p.sizes.filter(s => s.outOfStock);
    console.log(`${p.name}: ${p.sizes.length} sizes, ${oos.length} outOfStock`);
    p.sizes.forEach(s => console.log(`  ${s.label} | outOfStock=${s.outOfStock}`));
  }
}
main().catch(console.error).finally(() => db.$disconnect());
