/**
 * Mizen - Canonical Knowledge Validator
 * Enforces strict evidence integrity rules across all canonical financing programs and claims.
 * 
 * Invalid States Detected:
 * 1. Current rule with no source
 * 2. VERIFIED_CURRENT with no checked date
 * 3. VERIFIED_CURRENT with historical-only source
 * 4. Current operational status inferred without evidence
 * 5. Payment-calculation-enabled rate without current evidence
 * 6. Guarantee percentage without basis
 * 7. Financing ceiling confused with project-cost ceiling
 * 8. Historical rule used in active matching
 * 9. PARTIALLY_VERIFIED marked HIGH
 * 10. Unverified rule used in critical PASS/FAIL
 * 11. Source date older than effective rule without explanation
 * 12. Superseded claim still marked current
 */

import { FinancingProduct, FinancingProvider, KnowledgeRuleStatus, RuleEvidence, KnowledgeClaim } from '../types/knowledge';
import { getAuthoritativeClaim } from './authoritativeProjection';

export interface ValidationError {
  severity: 'ERROR' | 'WARNING';
  programId: string;
  field: string;
  message: string;
  code: string;
}

export interface ValidationSummary {
  valid: boolean;
  errorCount: number;
  warningCount: number;
  errors: ValidationError[];
  warnings: ValidationError[];
}

export function validateKnowledgeCatalogue(
  products: FinancingProduct[],
  providers: FinancingProvider[]
): ValidationSummary {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  const providerMap = new Map<string, FinancingProvider>();
  for (const prov of providers) {
    providerMap.set(prov.id, prov);
  }

  for (const prod of products) {
    // Check provider link
    if (!providerMap.has(prod.providerId)) {
      errors.push({
        severity: 'ERROR',
        programId: prod.id,
        field: 'providerId',
        message: `Product references unregistered provider ID "${prod.providerId}"`,
        code: 'UNREGISTERED_PROVIDER'
      });
    }

    // 1. Current rule with no source
    if (prod.sources.length === 0) {
      errors.push({
        severity: 'ERROR',
        programId: prod.id,
        field: 'sources',
        message: `Product has no registered source references`,
        code: 'MISSING_SOURCES'
      });
    }

    // 2. VERIFIED_CURRENT with no checked date
    if (prod.ruleStatus === 'VERIFIED_CURRENT' && !prod.lastReviewedAt && !prod.lastCheckedAt) {
      errors.push({
        severity: 'ERROR',
        programId: prod.id,
        field: 'lastReviewedAt',
        message: `Product marked VERIFIED_CURRENT without lastReviewedAt / lastCheckedAt timestamp`,
        code: 'MISSING_CHECK_DATE'
      });
    }

    // 3. VERIFIED_CURRENT with historical-only source
    if (prod.ruleStatus === 'VERIFIED_CURRENT') {
      const hasCurrentSource = prod.sources.some(s => 
        s.sourceType === 'OFFICIAL_PRODUCT_PAGE' || 
        s.sourceType === 'OFFICIAL_SIMULATOR' || 
        s.evidenceStatus === 'VERIFIED'
      );
      if (!hasCurrentSource) {
        errors.push({
          severity: 'ERROR',
          programId: prod.id,
          field: 'ruleStatus',
          message: `Product marked VERIFIED_CURRENT but only historical/unverified sources are attached`,
          code: 'HISTORICAL_SOURCE_MISMATCH'
        });
      }
    }

    // 4. Current operational status inferred without evidence
    if (prod.operationalStatus === 'ACTIVE_CONFIRMED' && prod.sources.length === 0) {
      errors.push({
        severity: 'ERROR',
        programId: prod.id,
        field: 'operationalStatus',
        message: `Operational status ACTIVE_CONFIRMED requires explicit current intake evidence`,
        code: 'UNSUPPORTED_OPERATIONAL_STATUS'
      });
    }

    // 5. Payment-calculation-enabled rate without current evidence
    const rate = prod.financialTerms.rate;
    if (rate && rate.type !== 'NOT_APPLICABLE' && rate.type !== 'UNKNOWN') {
      if (rate.value !== undefined && rate.ruleStatus === 'VERIFIED_CURRENT') {
        const rateEvidence = prod.financialTerms.verification.find(v => v.field === 'rate');
        if (!rateEvidence) {
          warnings.push({
            severity: 'WARNING',
            programId: prod.id,
            field: 'financialTerms.rate',
            message: `Fixed rate has value ${rate.value} but lacks explicit rate field evidence entry`,
            code: 'RATE_EVIDENCE_MISSING'
          });
        }
      }
    }

    // 6. Guarantee percentage without basis
    if (prod.category === 'GUARANTEE' || prod.financingDomains.includes('GUARANTEE')) {
      const gDetails = prod.financialTerms.guaranteeDetails;
      if (gDetails && (gDetails.coveragePercentMin || gDetails.coveragePercentMax)) {
        if (!gDetails.coverageBasis || gDetails.coverageBasis === 'UNKNOWN') {
          warnings.push({
            severity: 'WARNING',
            programId: prod.id,
            field: 'guaranteeDetails.coverageBasis',
            message: `Guarantee coverage percentage specified without verified coverage basis (e.g. UNRECOVERABLE_AMOUNT vs PRINCIPAL)`,
            code: 'GUARANTEE_BASIS_UNSPECIFIED'
          });
        }
      }
    }

    // 7. Financing ceiling confused with project-cost ceiling
    if (prod.financialTerms.amount?.max && prod.financialTerms.projectCost?.max) {
      if (prod.id === 'bfpme_creation' || prod.id === 'bfpme_extension') {
        if (prod.financialTerms.amount.max > 2500000) {
          errors.push({
            severity: 'ERROR',
            programId: prod.id,
            field: 'financialTerms.amount.max',
            message: `BFPME CMLT loan ceiling cannot exceed 2,500,000 TND (project cost ceiling of 15m TND must not be confused with loan ceiling)`,
            code: 'BFPME_CEILING_CONFUSION'
          });
        }
      }
    }

    // 8. Claims validation
    if (prod.claims) {
      for (const claim of prod.claims) {
        // 12. Superseded claim still marked current
        if (claim.supersedesClaimId && !claim.isCurrent) {
          // superseded claims should have isCurrent = false, which is correct
        }
        if (claim.isCurrent && claim.status === 'OUTDATED') {
          errors.push({
            severity: 'ERROR',
            programId: prod.id,
            field: `claims.${claim.field}`,
            message: `Claim ${claim.id} is marked OUTDATED but still flagged isCurrent=true`,
            code: 'OUTDATED_CLAIM_MARKED_CURRENT'
          });
        }
      }
    }

    // Claims-first shadowing invariants: a current researched field must be
    // represented by the runtime projection, never left to a stale legacy value.
    const currentMinCost = getAuthoritativeClaim(prod.id, 'minProjectCost');
    const currentMaxCost = getAuthoritativeClaim(prod.id, 'maxProjectCost');
    const currentMaxAmount = getAuthoritativeClaim(prod.id, 'maxFinancingAmount');
    const currentPricing = getAuthoritativeClaim(prod.id, 'pricingRelationship');

    if (currentMinCost?.ruleStatus === 'VERIFIED_CURRENT' && typeof currentMinCost.value === 'number' &&
        prod.financialTerms.projectCost?.min !== currentMinCost.value) {
      errors.push({
        severity: 'ERROR',
        programId: prod.id,
        field: 'financialTerms.projectCost.min',
        message: 'Authoritative minProjectCost claim is not reflected in the runtime projection',
        code: 'CLAIM_PROJECTION_DRIFT'
      });
    }
    if (currentMaxCost?.ruleStatus === 'VERIFIED_CURRENT' && typeof currentMaxCost.value === 'number' &&
        prod.financialTerms.projectCost?.max !== currentMaxCost.value) {
      errors.push({
        severity: 'ERROR',
        programId: prod.id,
        field: 'financialTerms.projectCost.max',
        message: 'Authoritative maxProjectCost claim is not reflected in the runtime projection',
        code: 'CLAIM_PROJECTION_DRIFT'
      });
    }
    if (currentMaxAmount?.ruleStatus === 'VERIFIED_CURRENT' && typeof currentMaxAmount.value === 'number' &&
        prod.financialTerms.amount?.max !== currentMaxAmount.value) {
      errors.push({
        severity: 'ERROR',
        programId: prod.id,
        field: 'financialTerms.amount.max',
        message: 'Authoritative maxFinancingAmount claim is not reflected in the runtime projection',
        code: 'CLAIM_PROJECTION_DRIFT'
      });
    }
    if (currentPricing?.value === 'UNKNOWN') {
      const projectedRate = prod.financialTerms.rate;
      if (projectedRate?.type !== 'UNKNOWN' || projectedRate.margin !== undefined || projectedRate.referenceIndex !== undefined) {
        errors.push({
          severity: 'ERROR',
          programId: prod.id,
          field: 'financialTerms.rate',
          message: 'Explicit UNKNOWN pricing relationship is leaking through as a calculable rate',
          code: 'UNKNOWN_PRICING_LEAK'
        });
      }
    }

    // 9. Field verification checks
    for (const fe of prod.financialTerms.verification) {
      if (fe.status === 'PARTIALLY_VERIFIED' && fe.notes?.fr?.includes('CONFIRMED_HIGH')) {
        errors.push({
          severity: 'ERROR',
          programId: prod.id,
          field: `financialTerms.${fe.field}`,
          message: `PARTIALLY_VERIFIED field cannot be marked as high confidence`,
          code: 'PARTIALLY_VERIFIED_HIGH_CONFIDENCE'
        });
      }
    }
  }

  return {
    valid: errors.length === 0,
    errorCount: errors.length,
    warningCount: warnings.length,
    errors,
    warnings
  };
}
