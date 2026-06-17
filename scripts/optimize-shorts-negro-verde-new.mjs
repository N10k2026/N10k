// Optimize the 8 new Shorts BREEZE photos for Negro & Verde colors:
// JPG/PNG -> WebP, max 1200px wide, quality 82.
// Replaces the existing negro-1/2/3 and verde-1/2/3, and adds a 4th "detalle" shot for each.
import sharp from 'sharp';
import { stat, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';

const UPLOAD = '/home/z/my-project/upload';
const OUT = '/home/z/my-project/public/products/shorts-breeze';

// Mapping: uploaded filename -> webp output filename (matching the site's convention)
// 01 = frontal, 02 = frontal alt, 03 = posterior, 04 = detalle (waistband/label)
const mapping = [
  { src: 'Short Negro New (01).jpg', out: 'negro-1.webp' },
  { src: 'Short Negro New (02).jpg', out: 'negro-2.webp' },
  { src: 'Short Negro New (03).jpg', out: 'negro-3.webp' },
  { src: 'Short Negro New (04).png', out: 'negro-detalle.webp' },
  { src: 'Short Verde New (01).jpg', out: 'verde-1.webp' },
  { src: 'Short Verde New (02).jpg', out: 'verde-2.webp' },
  // Note: filename uses lowercase "verde" for (03) — handle both cases
  { src: 'Short Verde New (03).jpg', out: 'verde-3.webp', alt: 'Short verde New (03).jpg' },
  { src: 'Short Verde New (04).jpg', out: 'verde-detalle.webp' },
];

if (!existsSync(OUT)) {
  await mkdir(OUT, { recursive: true });
}

console.log('Optimizing 8 new Shorts BREEZE Negro & Verde photos (JPG/PNG -> WebP, max 1200px, q82)...\n');

let totalOriginal = 0;
let totalOptimized = 0;

for (const { src, out, alt } of mapping) {
  const inPath = `${UPLOAD}/${src}`;
  const altPath = alt ? `${UPLOAD}/${alt}` : null;
  const actualInPath = existsSync(inPath) ? inPath : (altPath && existsSync(altPath) ? altPath : null);

  if (!actualInPath) {
    console.error(`MISSING: ${inPath}${alt ? ` (and ${altPath})` : ''}`);
    continue;
  }

  const outPath = `${OUT}/${out}`;

  const beforeStat = await stat(actualInPath);
  const beforeKB = Math.round(beforeStat.size / 1024);
  totalOriginal += beforeStat.size;

  await sharp(actualInPath)
    .resize({ width: 1200, withoutEnlargement: true })
    .webp({ quality: 82, effort: 4 })
    .toFile(outPath);

  const afterStat = await stat(outPath);
  const afterKB = Math.round(afterStat.size / 1024);
  totalOptimized += afterStat.size;

  const reduction = Math.round((1 - afterStat.size / beforeStat.size) * 100);
  console.log(`  ${actualInPath.replace(UPLOAD + '/', '')}`);
  console.log(`    -> ${out}  ${beforeKB}KB -> ${afterKB}KB  (-${reduction}%)`);
}

console.log('\n--- Totals ---');
console.log(`Original:   ${(totalOriginal / 1024 / 1024).toFixed(2)} MB`);
console.log(`Optimized:  ${(totalOptimized / 1024 / 1024).toFixed(2)} MB`);
console.log(`Reduction:  ${Math.round((1 - totalOptimized / totalOriginal) * 100)}%`);

console.log('\n--- Updated Negro & Verde files in shorts-breeze directory ---');
const { readdir } = await import('node:fs/promises');
const files = await readdir(OUT);
for (const f of files.filter(f => f.startsWith('negro') || f.startsWith('verde')).sort()) {
  const s = await stat(`${OUT}/${f}`);
  console.log(`  ${f}  ${Math.round(s.size / 1024)}KB`);
}
