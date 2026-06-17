/**
 * Cross-platform post-build step for Next.js standalone output.
 * Replaces Unix `cp -r` in package.json (ARQ-020).
 */
import { cpSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const standaloneDir = join(root, '.next', 'standalone');

if (!existsSync(standaloneDir)) {
  console.error('Error: .next/standalone not found. Ensure next.config.ts has output: "standalone".');
  process.exit(1);
}

cpSync(join(root, '.next', 'static'), join(standaloneDir, '.next', 'static'), { recursive: true });
cpSync(join(root, 'public'), join(standaloneDir, 'public'), { recursive: true });

console.log('Standalone assets copied (.next/static + public).');
