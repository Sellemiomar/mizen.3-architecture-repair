/**
 * Mizen Knowledge Architecture & Batch 2 Evidence Regression Tests
 * Formally validates non-negotiable principles, corrected test cases (TC-001 to TC-019),
 * evidence confidence ceilings, and calculation safety guards.
 */

import { evaluateProgramCompatibility, runMatchingEngine } from '../src/engine/matchingEngine';
import { calculateFinancingCost } from '../src/engine/financialCalculations';
import { getAuthoritativeCatalogueProducts, getAuthoritativeCatalogueProviders } from '../src/knowledge/authoritativeCatalogueProjection';
const CANONICAL_PRODUCTS = getAuthoritativeCatalogueProducts();
const CANONICAL_PROVIDERS = getAuthoritativeCatalogueProviders();
import { 
  getCanonicalProgram, 
  isFieldVerifiedCurrent, 
  getProgramOperationalStatus,
  getRuleEvidence 
} from '../src/knowledge/knowledgeRegistry';
import { validateKnowledgeCatalogue } from '../src/knowledge/knowledgeValidator';
import { ResearchImportPipeline } from '../src/knowledge/researchImport';
import { ApplicantProfile, FinancingProgram, Provider } from '../src/types/financing';
import { FINANCING_PROGRAMS, PROVIDERS } from '../src/data/financingData';

export function runKnowledgeIntegrityTests(): { passed: number; failed: number; total: number } {
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName}`);
      failed++;
    }
  }

  console.log('\n--- SECTION 1: BFPME Specific Rule & Ceiling Assertions (Batch 2) ---');

  const bfpme = FINANCING_PROGRAMS.find(p => p.id === 'bfpme_creation')!;
  const bfpmeProvider = PROVIDERS.find(p => p.id === 'bfpme')!;
  const canonicalBfpme = getCanonicalProgram('bfpme_creation')!;

  // TC-001: 300,000 TND project; 120,000 TND CMLT -> amount conditions pass, operational status ACTIVE_NOT_CONFIRMED
  const resTC001 = evaluateProgramCompatibility({
    journey: 'business_creation' as any,
    purpose: 'creation',
    totalProjectCost: 300000,
    financingRequested: 120000,
    legalStructure: 'sarl',
    sector: 'industry'
  }, bfpme, bfpmeProvider);
  assert(
    resTC001.financialEvaluation.amountStatus === 'PASS' && resTC001.status === 'REQUIRES_CONFIRMATION',
    'TC-001: 300k project / 120k CMLT passes financial conditions and requires operational confirmation'
  );

  // TC-002: 1,000,000 TND project; 700,000 TND CMLT (70% > 65% ceiling) -> INCOMPATIBLE
  const resTC002 = evaluateProgramCompatibility({
    journey: 'business_creation' as any,
    purpose: 'creation',
    totalProjectCost: 1000000,
    financingRequested: 700000,
    legalStructure: 'sarl',
    sector: 'industry'
  }, bfpme, bfpmeProvider);
  assert(
    resTC002.financialEvaluation.amountStatus === 'FAIL' && resTC002.status === 'NOT_MATCHED',
    'TC-002: 700k CMLT on 1m project (70%) fails on 65% CMLT investment ceiling'
  );

  // TC-003: 4,000,000 TND project; 2,600,000 TND CMLT (exceeds 2.5m ceiling) -> INCOMPATIBLE
  const resTC003 = evaluateProgramCompatibility({
    journey: 'business_creation' as any,
    purpose: 'creation',
    totalProjectCost: 4000000,
    financingRequested: 2600000,
    legalStructure: 'sarl',
    sector: 'industry'
  }, bfpme, bfpmeProvider);
  assert(
    resTC003.financialEvaluation.amountStatus === 'FAIL' && resTC003.status === 'NOT_MATCHED',
    'TC-003: 2.6m CMLT fails on 2.5m CMLT loan ceiling'
  );

  // TC-005: 2,600,000 TND project; 1,050,000 TND CMLT -> passes CMLT 65% (40.38%) and 2.5m ceiling
  const resTC005 = evaluateProgramCompatibility({
    journey: 'business_creation' as any,
    purpose: 'creation',
    totalProjectCost: 2600000,
    financingRequested: 1050000,
    legalStructure: 'sarl',
    sector: 'industry'
  }, bfpme, bfpmeProvider);
  assert(
    resTC005.financialEvaluation.amountStatus === 'PASS',
    'TC-005: 1.05m CMLT on 2.6m project passes both 65% ratio and 2.5m loan ceiling'
  );

  // TC-013: Accommodation hotel -> excluded
  const resTC013 = evaluateProgramCompatibility({
    journey: 'business_creation' as any,
    purpose: 'creation',
    totalProjectCost: 3000000,
    financingRequested: 1500000,
    legalStructure: 'sarl',
    sector: 'hotels_accommodation' as any
  }, bfpme, bfpmeProvider);
  assert(
    resTC013.status === 'NOT_MATCHED' && resTC013.ruleEvaluations.some(r => r.ruleId === 'sectorExclusionHotel' && r.status === 'FAIL'),
    'TC-013: Classical accommodation hotel is formally excluded from BFPME'
  );

  // TC-015: Residential developer -> excluded
  const resTC015 = evaluateProgramCompatibility({
    journey: 'business_creation' as any,
    purpose: 'creation',
    totalProjectCost: 5000000,
    financingRequested: 2000000,
    legalStructure: 'sarl',
    sector: 'real_estate_development' as any
  }, bfpme, bfpmeProvider);
  assert(
    resTC015.status === 'NOT_MATCHED' && resTC015.ruleEvaluations.some(r => r.ruleId === 'sectorExclusionRealEstate' && r.status === 'FAIL'),
    'TC-015: Residential real estate developer is formally excluded from BFPME'
  );

  // TC-016: 149,999 TND project -> below min project cost 150,000 TND -> FAIL
  const resTC016 = evaluateProgramCompatibility({
    journey: 'business_creation' as any,
    purpose: 'creation',
    totalProjectCost: 149999,
    financingRequested: 80000,
    legalStructure: 'sarl',
    sector: 'industry'
  }, bfpme, bfpmeProvider);
  assert(
    resTC016.financialEvaluation.amountStatus === 'FAIL' && resTC016.status === 'NOT_MATCHED',
    'TC-016: 149,999 TND project cost fails minimum 150,000 TND project cost requirement'
  );

  // TC-017: 150,000 TND project -> passes threshold boundary
  const resTC017 = evaluateProgramCompatibility({
    journey: 'business_creation' as any,
    purpose: 'creation',
    totalProjectCost: 150000,
    financingRequested: 90000,
    legalStructure: 'sarl',
    sector: 'industry'
  }, bfpme, bfpmeProvider);
  assert(
    resTC017.financialEvaluation.amountStatus === 'PASS',
    'TC-017: 150,000 TND project cost passes minimum project boundary'
  );

  // TC-018: 15,000,000 TND project -> passes maximum boundary (with 2.5m CMLT)
  const resTC018 = evaluateProgramCompatibility({
    journey: 'business_creation' as any,
    purpose: 'creation',
    totalProjectCost: 15000000,
    financingRequested: 2500000,
    legalStructure: 'sarl',
    sector: 'industry'
  }, bfpme, bfpmeProvider);
  assert(
    resTC018.financialEvaluation.amountStatus === 'PASS',
    'TC-018: 15,000,000 TND project cost passes maximum boundary'
  );

  // TC-019: 15,000,001 TND project -> exceeds maximum project cost
  const resTC019 = evaluateProgramCompatibility({
    journey: 'business_creation' as any,
    purpose: 'creation',
    totalProjectCost: 15000001,
    financingRequested: 2500000,
    legalStructure: 'sarl',
    sector: 'industry'
  }, bfpme, bfpmeProvider);
  assert(
    resTC019.financialEvaluation.amountStatus === 'FAIL' && resTC019.status === 'NOT_MATCHED',
    'TC-019: 15,000,001 TND project cost fails maximum 15m TND ceiling'
  );

  console.log('\n--- SECTION 2: SOTUGAR Guarantee Modeling & Invariants ---');

  const sotugarProd = CANONICAL_PRODUCTS.find(p => p.id === 'sotugar_guarantee')!;
  assert(sotugarProd.category === 'GUARANTEE', 'SOTUGAR is classified under category GUARANTEE');
  assert(sotugarProd.financialTerms.rate?.type === 'NOT_APPLICABLE', 'SOTUGAR has rateType NOT_APPLICABLE');
  assert(
    sotugarProd.financialTerms.guaranteeDetails?.coverageBasis === 'UNRECOVERABLE_AMOUNT',
    'SOTUGAR FGPME 75/90 coverage basis is verified as UNRECOVERABLE_AMOUNT'
  );
  assert(
    sotugarProd.financialTerms.guaranteeDetails?.governorates?.length === 14,
    'SOTUGAR FGPME 75/90 geographic scope covers exactly 14 interior governorates'
  );

  const sotugarCost = calculateFinancingCost(100000, FINANCING_PROGRAMS.find(p => p.id === 'sotugar_guarantee')!);
  assert(!sotugarCost.canCalculateReliably, 'SOTUGAR cost calculation canCalculateReliably must be false');
  assert(sotugarCost.monthlyPayment === undefined, 'SOTUGAR must NEVER output monthly payment installments');
  assert(sotugarCost.financingStructure === 'GUARANTEE', 'SOTUGAR financingStructure must be GUARANTEE');

  console.log('\n--- SECTION 3: Evidence Confidence Ceilings & Principle Verification ---');

  // Non-negotiable 4: PARTIALLY_VERIFIED must NEVER produce HIGH evidence confidence
  const partVerRes = evaluateProgramCompatibility({
    journey: 'business_creation' as any,
    purpose: 'creation'
  }, bfpme, bfpmeProvider);
  assert(
    partVerRes.evidenceEvaluation.confidenceScore !== 'HIGH',
    'PARTIALLY_VERIFIED program (BFPME) NEVER receives HIGH evidence confidence'
  );
  assert(
    partVerRes.evidenceEvaluation.confidenceScore === 'MEDIUM',
    'PARTIALLY_VERIFIED program receives maximum MEDIUM confidence'
  );

  // Non-negotiable 5: Historical evidence must produce LOW confidence
  const histSotugarRes = evaluateProgramCompatibility({
    journey: 'business_creation' as any,
    purpose: 'creation'
  }, FINANCING_PROGRAMS.find(p => p.id === 'sotugar_guarantee')!, PROVIDERS.find(p => p.id === 'sotugar')!);
  assert(
    histSotugarRes.evidenceEvaluation.confidenceScore === 'LOW',
    'VERIFIED_HISTORICAL program receives LOW confidence for active matching'
  );

  console.log('\n--- SECTION 4: Financial Calculations Strict Verification Rules ---');

  // Unverified variable rate cannot simulate payment
  const varCost = calculateFinancingCost(200000, bfpme);
  assert(!varCost.canCalculateReliably, 'Variable TMM with unverified margin returns canCalculateReliably=false');
  assert(varCost.monthlyPayment === undefined, 'Variable TMM returns monthlyPayment=undefined (no speculative quotes)');

  // Subsidized verified rate can simulate reliably
  const btsProg = FINANCING_PROGRAMS.find(p => p.id === 'bts_diplomes')!;
  const btsCost = calculateFinancingCost(50000, btsProg);
  assert(btsCost.canCalculateReliably, 'BTS subsidized fixed rate returns canCalculateReliably=true');
  assert(typeof btsCost.monthlyPayment === 'number' && btsCost.monthlyPayment > 0, 'BTS returns exact calculated monthly payment');

  console.log('\n--- SECTION 5: Knowledge Validator & Research Import Pipeline ---');

  const validation = validateKnowledgeCatalogue(CANONICAL_PRODUCTS, CANONICAL_PROVIDERS);
  assert(validation.valid, 'validateKnowledgeCatalogue passes with 0 critical errors');

  const pipeline = new ResearchImportPipeline();
  const importResult = pipeline.processResearchBatch([
    {
      programId: 'bfpme_creation',
      field: 'cmltLoanCeiling',
      value: 2500000,
      status: 'VERIFIED_CURRENT',
      source: {
        url: 'https://www.bfpme.com.tn/fr/nos-produits/credit-dinvestissement',
        title: 'BFPME CMLT Guide',
        publisher: 'BFPME',
        sourceType: 'DIRECT_PRIMARY_CURRENT',
        checkedAt: '2026-10-03'
      }
    }
  ]);
  assert(importResult.success, 'Research import pipeline processes structured batch');
  assert(importResult.importedClaims.length === 1, 'Research import creates verified canonical claim');

  return {
    passed,
    failed,
    total: passed + failed
  };
}
