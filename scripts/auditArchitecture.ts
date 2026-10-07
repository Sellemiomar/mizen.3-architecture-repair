import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(process.cwd(), 'src');

// Regex patterns to detect forbidden direct imports of unprojected legacy financing catalogues
const forbiddenDirectCanonicalImport = /(?:from\s+['"]\.\/canonicalCatalogue['"]|from\s+['"][^'"]*\/canonicalCatalogue['"])/;
const forbiddenLegacyProgramImport = /import\s*\{[^}]*\bFINANCING_PROGRAMS\b[^}]*\}\s*from\s*['"][^'"]*\/data\/financingData['"]/s;
const forbiddenLegacyCanonicalProductsImport = /import\s*\{[^}]*\bCANONICAL_PRODUCTS\b[^}]*\}\s*from\s*['"][^'"]*\/canonicalCatalogue['"]/s;
const forbiddenDirectFinancingDataImport = /from\s*['"][^'"]*\/data\/financingData['"]/;

function walk(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const p = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(p) : /\.(ts|tsx)$/.test(entry.name) ? [p] : [];
  });
}

// 1. Check all production source files (excluding only the two sanctioned bridge modules)
const productionViolations = walk(root)
  .filter(file => !file.endsWith('authoritativeCatalogueProjection.ts'))
  .filter(file => {
    const content = fs.readFileSync(file, 'utf8');
    return forbiddenDirectCanonicalImport.test(content) || 
           forbiddenLegacyProgramImport.test(content) ||
           forbiddenLegacyCanonicalProductsImport.test(content) ||
           forbiddenDirectFinancingDataImport.test(content);
  })
  .map(file => path.relative(process.cwd(), file));

if (productionViolations.length > 0) {
  console.error('❌ Architectural Violation: Legacy data or unprojected catalogue imported directly by production code:', productionViolations);
  process.exit(1);
}

// 2. Strict check: engine modules (matching, calculations, stack, journey) must NEVER import financingData.ts
const engineDir = path.join(root, 'engine');
if (fs.existsSync(engineDir)) {
  const engineViolations = walk(engineDir).filter(file => {
    const content = fs.readFileSync(file, 'utf8');
    return forbiddenDirectFinancingDataImport.test(content) || forbiddenDirectCanonicalImport.test(content);
  }).map(file => path.relative(process.cwd(), file));

  if (engineViolations.length > 0) {
    console.error('❌ Architectural Violation: Engine modules directly import legacy financingData or canonicalCatalogue:', engineViolations);
    process.exit(1);
  }
}

// 3. Strict check: Knowledge registry & validator must consume authoritative projections
const registryFile = path.join(root, 'knowledge', 'knowledgeRegistry.ts');
if (fs.existsSync(registryFile)) {
  const regContent = fs.readFileSync(registryFile, 'utf8');
  if (forbiddenLegacyProgramImport.test(regContent) || forbiddenLegacyCanonicalProductsImport.test(regContent)) {
    console.error('❌ Architectural Violation: knowledgeRegistry.ts imports unprojected legacy data');
    process.exit(1);
  }
}

console.log('✅ Architecture Invariant Verified: Zero direct runtime imports of legacy financing data outside sanctioned projection layers.');
