// Optimize the 7 new blue Shorts BREEZE photos: JPG -> WebP, max 1200px wide, quality 82.
// Mapping based on VLM analysis of each upload:
//   Short Azul New (01).jpg     -> azul-oscuro-1.webp      (full front view, overwrite)
//   Short Azul New (02).jpg     -> azul-oscuro-2.webp      (full front view, overwrite)
//   Short Azul New (03).jpg     -> azul-oscuro-detalle.webp (waistband close-up, overwrite)
//   Short Azul Claro New (01).jpg -> azul-claro-1.webp     (full front view, overwrite)
//   Short Azul Claro New (02).jpg -> azul-claro-2.webp     (full front view, overwrite)
//   Short Azul Claro New (03).jpg -> azul-claro-3.webp     (full back view, NEW)
//   Short Azul Claro New (04).jpg -> azul-claro-detalle.webp (waistband close-up, NEW)
import sharp from 'sharp';
import { readdir, stat, mkdir, unlink } from 'node:fs/promises';
import { existsSync } from 'node:fs';

const UPLOAD = '/home/z/my-project/upload';
const OUT = '/home/z/my-project/public/products/shorts-breeze';

const mapping = [
  { src: 'Short Azul New (01).jpg',       out: 'azul-oscuro-1.webp' },
  { src: 'Short Azul New (02).jpg',       out: 'azul-oscuro-2.webp' },
  { src: 'Short Azul New (03).jpg',       out: 'azul-oscuro-detalle.webp' },
  { src: 'Short Azul Claro New (01).jpg', out: 'azul-claro-1.webp' },
  { src: 'Short Azul Claro New (02).jpg', out: 'azul-claro-2.webp' },
  { src: 'Short Azul Claro New (03).jpg', out: 'azul-claro-3.webp' },
  { src: 'Short Azul Claro New (04).jpg', out: 'azul-claro-detalle.webp' },
];

if (!existsSync(OUT)) {
  await mkdir(OUT, { recursive: true });
}

console.log('Optimizing 7 new blue Shorts BREEZE photos (JPG -> WebP, max 1200px, q82)...\n');

let totalOriginal = 0;
let totalOptimized = 0;

for (const { src, out } of mapping) {
  const inPath = `${UPLOAD}/${src}`;
  const outPath = `${OUT}/${out}`;

  if (!existsSync(inPath)) {
    console.error(`MISSING: ${inPath}`);
    continue;
  }

  const beforeStat = await stat(inPath);
  const beforeKB = Math.round(beforeStat.size / 1024);
  totalOriginal += beforeStat.size;

  await sharp(inPath)
    .resize({ width: 1200, withoutEnlargement: true })
    .webp({ quality: 82, effort: 4 })
    .toFile(outPath);

  const afterStat = await stat(outPath);
  const afterKB = Math.round(afterStat.size / 1024);
  totalOptimized += afterStat.size;

  const reduction = Math.round((1 - afterStat.size / beforeStat.size) * 100);
  console.log(`  ${src}`);
  console.log(`    -> ${out}  ${beforeKB}KB -> ${afterKB}KB  (-${reduction}%)`);
}

console.log('\n--- Totals ---');
console.log(`Original:   ${(totalOriginal / 1024 / 1024).toFixed(2)} MB`);
console.log(`Optimized:  ${(totalOptimized / 1024 / 1024).toFixed(2)} MB`);
console.log(`Reduction:  ${Math.round((1 - totalOptimized / totalOriginal) * 100)}%`);

// Remove azul-oscuro-3.webp — no longer referenced (user only sent 2 full views + 1 detalle for dark blue)
const staleFile = `${OUT}/azul-oscuro-3.webp`;
if (existsSync(staleFile)) {
  await unlink(staleFile);
  console.log(`\nRemoved stale file: azul-oscuro-3.webp (no longer referenced)`);
}

// List final directory contents
console.log('\n--- Final shorts-breeze directory ---');
const files = await readdir(OUT);
for (const f of files.sort()) {
  const s = await stat(`${OUT}/${f}`);
  console.log(`  ${f}  ${Math.round(s.size / 1024)}KB`);
}
