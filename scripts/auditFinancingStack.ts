import fs from 'node:fs';
import path from 'node:path';

const stackFiles = [
  'src/engine/financingStackEngine.ts',
  'src/engine/financingReadiness.ts',
  'src/knowledge/stackCompatibility.ts'
];

let failed = false;
for (const relative of stackFiles) {
  const file = path.resolve(relative);
  const content = fs.readFileSync(file, 'utf8');
  if (/data\/financingData|canonicalCatalogue/.test(content)) {
    console.error(`FAIL: ${relative} directly imports legacy financing facts`);
    failed = true;
  }
}

const compatibility = fs.readFileSync(path.resolve('src/knowledge/stackCompatibility.ts'), 'utf8');
if (!compatibility.includes('CLAIMS_REPOSITORY.getCompatibility')) {
  console.error('FAIL: stack compatibility is not backed by the authoritative compatibility registry');
  failed = true;
}

const engine = fs.readFileSync(path.resolve('src/engine/financingStackEngine.ts'), 'utf8');
if (!engine.includes("component.role === 'GUARANTEE'") || !engine.includes('supportCoverage')) {
  console.error('FAIL: stack engine does not keep guarantee support separate from cash funding');
  failed = true;
}

if (failed) process.exit(1);
console.log('PASS: financing stack uses claims-first compatibility and separates guarantee support from cash funding');
