import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(process.cwd(), 'src');

// Regex patterns to detect forbidden direct imports of unprojected legacy financing catalogues or legacy data
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

// Sanctioned bridge modules permitted to translate baseline canonical definitions into authoritative models
const SANCTIONED_PROJECTION_BRIDGES = [
  'authoritativeCatalogueProjection.ts',
  'authoritativeProjection.ts'
];

// 1. Check all production source files
// Legacy fixture itself is excluded from checking itself, and the 2 sanctioned bridges are excluded from canonical catalogue check.
const allSourceFiles = walk(root);

const productionViolations: string[] = [];

for (const file of allSourceFiles) {
  const relPath = path.relative(process.cwd(), file);
  const fileName = path.basename(file);
  const content = fs.readFileSync(file, 'utf8');

  // The legacy fixture itself cannot import itself, but we skip its internal declarations
  if (fileName === 'financingData.ts') {
    continue;
  }

  // A. ABSOLUTE INVARIANT: NO production file may import from `financingData.ts`
  if (forbiddenDirectFinancingDataImport.test(content) || forbiddenLegacyProgramImport.test(content)) {
    productionViolations.push(`${relPath} (imports deprecated financingData)`);
    continue;
  }

  // B. ABSOLUTE INVARIANT: Only sanctioned bridges may import from `canonicalCatalogue`
  if (!SANCTIONED_PROJECTION_BRIDGES.includes(fileName)) {
    if (forbiddenDirectCanonicalImport.test(content) || forbiddenLegacyCanonicalProductsImport.test(content)) {
      productionViolations.push(`${relPath} (imports unprojected canonicalCatalogue directly)`);
      continue;
    }
  }
}

if (productionViolations.length > 0) {
  console.error('❌ Architectural Violation: Production code imports legacy financing data or unprojected catalogue directly:');
  for (const v of productionViolations) {
    console.error(`  - ${v}`);
  }
  process.exit(1);
}

// 2. Strict invariant: Engine modules (matching, calculations, stack, journey)
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

// 3. Strict invariant: Knowledge registry must consume authoritative projections
const registryFile = path.join(root, 'knowledge', 'knowledgeRegistry.ts');
if (fs.existsSync(registryFile)) {
  const regContent = fs.readFileSync(registryFile, 'utf8');
  if (forbiddenLegacyProgramImport.test(regContent) || 
      forbiddenLegacyCanonicalProductsImport.test(regContent) || 
      forbiddenDirectCanonicalImport.test(regContent) || 
      forbiddenDirectFinancingDataImport.test(regContent)) {
    console.error('❌ Architectural Violation: knowledgeRegistry.ts imports unprojected legacy data');
    process.exit(1);
  }
}

// 4. Strict invariant: Components (UI layer) must NEVER import canonicalCatalogue or financingData
const componentsDir = path.join(root, 'components');
if (fs.existsSync(componentsDir)) {
  const componentViolations = walk(componentsDir).filter(file => {
    const content = fs.readFileSync(file, 'utf8');
    return forbiddenDirectCanonicalImport.test(content) || 
           forbiddenDirectFinancingDataImport.test(content) || 
           forbiddenLegacyProgramImport.test(content) || 
           forbiddenLegacyCanonicalProductsImport.test(content);
  }).map(file => path.relative(process.cwd(), file));

  if (componentViolations.length > 0) {
    console.error('❌ Architectural Violation: UI components directly import legacy financing data or canonicalCatalogue:', componentViolations);
    process.exit(1);
  }
}

console.log('✅ Architecture Invariant Verified: Zero direct runtime imports of legacy financing data or unprojected catalogue in production code.');
console.log('✅ Sanctioned Path Enforced: Claims -> Authoritative Projections -> Knowledge Registry & Matching Engine -> Financing Stack -> UI.');
