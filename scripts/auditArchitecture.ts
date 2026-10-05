import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(process.cwd(), 'src');
const forbiddenDirectCanonicalImport = /(?:from\s+['"]\.\/canonicalCatalogue['"]|from\s+['"][^'"]*\/canonicalCatalogue['"])/;
const forbiddenLegacyProgramImport = /import\s*\{[^}]*\bFINANCING_PROGRAMS\b[^}]*\}\s*from\s*['"][^'"]*\/data\/financingData['"]/s;
const forbiddenLegacyCanonicalProductsImport = /import\s*\{[^}]*\bCANONICAL_PRODUCTS\b[^}]*\}\s*from\s*['"][^'"]*\/canonicalCatalogue['"]/s;

function walk(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const p = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(p) : /\.(ts|tsx)$/.test(entry.name) ? [p] : [];
  });
}

const violations = walk(root)
  .filter(file => !file.endsWith('authoritativeCatalogueProjection.ts') && !file.endsWith('authoritativeProjection.ts'))
  .filter(file => {
    const content = fs.readFileSync(file, 'utf8');
    return forbiddenDirectCanonicalImport.test(content) || 
           forbiddenLegacyProgramImport.test(content) ||
           forbiddenLegacyCanonicalProductsImport.test(content);
  })
  .map(file => path.relative(process.cwd(), file));

if (violations.length) {
  console.error('❌ Architectural Violation: Legacy data or unprojected catalogue imported directly by runtime code:', violations);
  process.exit(1);
}

// Ensure financingStackEngine only consumes authoritative knowledge
const stackEngineFile = path.join(root, 'engine', 'financingStackEngine.ts');
if (fs.existsSync(stackEngineFile)) {
  const stackContent = fs.readFileSync(stackEngineFile, 'utf8');
  if (stackContent.includes('/data/financingData') || stackContent.includes('/canonicalCatalogue')) {
    console.error('❌ Architectural Violation: financingStackEngine directly imports legacy data instead of authoritative projection');
    process.exit(1);
  }
}

console.log('✅ Architecture Invariant Verified: Zero direct runtime imports of legacy financing data outside sanctioned projection layers.');

