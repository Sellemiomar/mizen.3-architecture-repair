import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(process.cwd(), 'src');
const forbiddenDirectImport = /(?:from\s+['"]\.\/canonicalCatalogue['"]|from\s+['"][^'"]*\/canonicalCatalogue['"]|from\s+['"][^'"]*\/data\/financingData['"])/;

function walk(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const p = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(p) : /\.(ts|tsx)$/.test(entry.name) ? [p] : [];
  });
}

const violations = walk(root)
  .filter(file => !file.endsWith('authoritativeCatalogueProjection.ts') && !file.endsWith('authoritativeProjection.ts'))
  .filter(file => forbiddenDirectImport.test(fs.readFileSync(file, 'utf8')))
  .map(file => path.relative(process.cwd(), file));

if (violations.length) {
  console.error('❌ Legacy canonicalCatalogue imported directly by runtime code:', violations);
  process.exit(1);
}

console.log('✅ No runtime module imports legacy canonicalCatalogue or financingData directly outside sanctioned projection layers.');
