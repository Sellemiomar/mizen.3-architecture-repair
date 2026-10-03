/**
 * Mizen Knowledge Audit Tool
 * Audits canonical financing catalogue against evidence rules, provenance standards, and validity criteria.
 */

import { getAuthoritativeCatalogueProducts, getAuthoritativeCatalogueProviders } from '../src/knowledge/authoritativeCatalogueProjection';
const CANONICAL_PRODUCTS = getAuthoritativeCatalogueProducts();
const CANONICAL_PROVIDERS = getAuthoritativeCatalogueProviders();
import { validateKnowledgeCatalogue } from '../src/knowledge/knowledgeValidator';
import { KnowledgeRuleStatus } from '../src/types/knowledge';

console.log('================================================================');
console.log('                 MIZEN KNOWLEDGE AUDIT');
console.log('================================================================\n');

const totalPrograms = CANONICAL_PRODUCTS.length;
console.log(`Programs: ${totalPrograms}`);

// Count by rule status
const statusCounts: Record<KnowledgeRuleStatus, number> = {
  VERIFIED_CURRENT: 0,
  VERIFIED_HISTORICAL: 0,
  PARTIALLY_VERIFIED: 0,
  OUTDATED: 0,
  UNVERIFIED: 0,
  UNKNOWN: 0
};

for (const prod of CANONICAL_PRODUCTS) {
  const status = prod.ruleStatus || 'UNKNOWN';
  statusCounts[status] = (statusCounts[status] || 0) + 1;
}

console.log(`VERIFIED_CURRENT: ${statusCounts.VERIFIED_CURRENT}`);
console.log(`VERIFIED_HISTORICAL: ${statusCounts.VERIFIED_HISTORICAL}`);
console.log(`PARTIALLY_VERIFIED: ${statusCounts.PARTIALLY_VERIFIED}`);
console.log(`OUTDATED: ${statusCounts.OUTDATED}`);
console.log(`UNVERIFIED: ${statusCounts.UNVERIFIED}`);
console.log(`UNKNOWN: ${statusCounts.UNKNOWN}\n`);

// Run validator
const validation = validateKnowledgeCatalogue(CANONICAL_PRODUCTS, CANONICAL_PROVIDERS);

console.log('CRITICAL ERRORS:');
if (validation.errors.length === 0) {
  console.log('  None. All canonical programs conform to strict evidence rules.\n');
} else {
  for (const err of validation.errors) {
    console.error(`  [${err.code}] ${err.programId} -> ${err.field}: ${err.message}`);
  }
  console.log('');
}

console.log('WARNINGS:');
if (validation.warnings.length === 0) {
  console.log('  None.\n');
} else {
  for (const warn of validation.warnings) {
    console.warn(`  [${warn.code}] ${warn.programId} -> ${warn.field}: ${warn.message}`);
  }
  console.log('');
}

// Programs blocked or restricted from active matching
console.log('Programs with operational status ACTIVE_NOT_CONFIRMED:');
const unconfirmedOps = CANONICAL_PRODUCTS.filter(p => p.operationalStatus === 'ACTIVE_NOT_CONFIRMED');
for (const p of unconfirmedOps) {
  console.log(`  - ${p.id} (${p.name.fr}): Rules verified from cited source; direct application acceptance unconfirmed.`);
}
console.log('');

// Programs with unresolved financial rules
console.log('Programs with unresolved financial rules:');
const unresolvedRules = CANONICAL_PRODUCTS.filter(p => 
  p.financialTerms.verification.some(v => v.status === 'PARTIALLY_VERIFIED' || v.status === 'UNKNOWN')
);
for (const p of unresolvedRules) {
  const fields = p.financialTerms.verification
    .filter(v => v.status === 'PARTIALLY_VERIFIED' || v.status === 'UNKNOWN')
    .map(v => `${v.field} (${v.unknownReason || 'UNRESOLVED'})`);
  console.log(`  - ${p.id}: ${fields.join(', ')}`);
}
console.log('');

// Stale source dates check
console.log('Programs with source check dates:');
for (const p of CANONICAL_PRODUCTS) {
  console.log(`  - ${p.id}: last checked at ${p.lastReviewedAt || p.lastCheckedAt || 'UNKNOWN'}`);
}
console.log('');

console.log('================================================================');
if (validation.valid) {
  console.log('🎉 AUDIT PASSED: Zero production-blocking knowledge errors.');
  process.exit(0);
} else {
  console.error(`❌ AUDIT FAILED: ${validation.errorCount} critical errors found.`);
  process.exit(1);
}
