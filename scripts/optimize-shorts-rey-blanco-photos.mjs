// Optimize the 8 new Shorts BREEZE photos: 4 Azul Rey (NEW color) + 4 Blanco (overwrite + 1 new detalle).
// JPG -> WebP, max 1200px wide, quality 82.
// Mapping based on VLM analysis:
//   Short Azul Rey New (01).jpg -> azul-rey-1.webp      (full front view, NEW)
//   Short Azul Rey New (02).jpg -> azul-rey-2.webp      (full front view, NEW)
//   Short Azul Rey New (03).jpg -> azul-rey-3.webp      (full back view, NEW)
//   Short Azul Rey New (04).jpg -> azul-rey-detalle.webp (waistband close-up, NEW)
//   Short Blanco New (01).jpg   -> blanco-1.webp        (full front view, overwrite)
//   Short Blanco New (02).jpg   -> blanco-2.webp        (full side view, overwrite)
//   Short Blanco New (03).jpg   -> blanco-3.webp        (full back view, overwrite)
//   Short Blanco New (04).jpg   -> blanco-detalle.webp  (waistband close-up, NEW)
import sharp from 'sharp';
import { readdir, stat, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';

const UPLOAD = '/home/z/my-project/upload';
const OUT = '/home/z/my-project/public/products/shorts-breeze';

const mapping = [
  { src: 'Short Azul Rey New (01).jpg', out: 'azul-rey-1.webp' },
  { src: 'Short Azul Rey New (02).jpg', out: 'azul-rey-2.webp' },
  { src: 'Short Azul Rey New (03).jpg', out: 'azul-rey-3.webp' },
  { src: 'Short Azul Rey New (04).jpg', out: 'azul-rey-detalle.webp' },
  { src: 'Short Blanco New (01).jpg',   out: 'blanco-1.webp' },
  { src: 'Short Blanco New (02).jpg',   out: 'blanco-2.webp' },
  { src: 'Short Blanco New (03).jpg',   out: 'blanco-3.webp' },
  { src: 'Short Blanco New (04).jpg',   out: 'blanco-detalle.webp' },
];

if (!existsSync(OUT)) {
  await mkdir(OUT, { recursive: true });
}

console.log('Optimizing 8 new Shorts BREEZE photos (4 Azul Rey NEW + 4 Blanco) -> WebP, max 1200px, q82...\n');

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
