// Optimize the 8 new Shorts BREEZE photos: JPG -> WebP, max 1200px wide, quality 82.
// Maps the uploaded filenames to the webp filenames used by static-products.ts.
import sharp from 'sharp';
import { readdir, stat, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';

const UPLOAD = '/home/z/my-project/upload';
const OUT = '/home/z/my-project/public/products/shorts-breeze';

// Mapping: uploaded filename -> webp output filename (matching the site's convention)
const mapping = [
  { src: 'Short Amarillo Neon New (01).jpg', out: 'amarillo-1.webp' },
  { src: 'Short Amarillo Neon New (02).jpg', out: 'amarillo-2.webp' },
  { src: 'Short Amarillo Neon New (03).jpg', out: 'amarillo-3.webp' },
  { src: 'Short Amarillo Neon New (04).jpg', out: 'amarillo-detalle.webp' },
  { src: 'Short Aquamarina New  (01).jpg', out: 'aguamarina-1.webp' },
  { src: 'Short Aquamarina New  (02).jpg', out: 'aguamarina-2.webp' },
  { src: 'Short Aquamarina New  (03).jpg', out: 'aguamarina-3.webp' },
  { src: 'Short Aquamarina New  (04).jpg', out: 'aguamarina-detalle-1.webp' },
];

if (!existsSync(OUT)) {
  await mkdir(OUT, { recursive: true });
}

console.log('Optimizing 8 new Shorts BREEZE photos (JPG -> WebP, max 1200px, q82)...\n');

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

// List final directory contents
console.log('\n--- Final shorts-breeze directory ---');
const files = await readdir(OUT);
for (const f of files.sort()) {
  const s = await stat(`${OUT}/${f}`);
  console.log(`  ${f}  ${Math.round(s.size / 1024)}KB`);
}
