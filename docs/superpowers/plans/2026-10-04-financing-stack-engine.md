# Financing Stack Engine Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an evidence-aware financing-stack engine that composes only explicitly compatible funding instruments and keeps guarantees, uncertainty, provenance, and funding gaps mathematically honest.

**Architecture:** Keep single-product matching separate from stacking. The stack engine consumes authoritative projected program facts and explicit compatibility metadata, generates only defensible combinations, calculates cash coverage independently from guarantee/support coverage, and propagates the weakest critical evidence into the overall result.

**Tech Stack:** TypeScript, existing Mizen domain models, existing Jest/npm test infrastructure, existing knowledge claims/projection layer.

**Spec:** `docs/superpowers/specs/2026-10-04-financing-stack-engine.md`

## Global Constraints

- Do not invent missing values.
- Do not turn UNKNOWN into zero, PASS, or compatibility.
- Do not convert historical rules into current availability.
- Do not infer compatibility from product category, provider, or arithmetic.
- Guarantees do not count as cash financing unless an authoritative claim explicitly establishes cash funding.
- Fund capitalization must never be treated as entrepreneur financing amount.
- No fabricated repayment calculations or loan approval predictions.
- The authoritative claims/projection layer remains the source of financing facts.

## Review Focus

- Guarantee counted as financing — test that guarantee coverage remains separate from cash coverage.
- Unknown compatibility — test that an UNKNOWN pair cannot produce a VERIFIED stack.
- Historical compatibility — test that historical-only evidence remains conditional/currently unconfirmed.
- Unknown capacity — test that an instrument without verified capacity cannot fill a numeric funding gap.
- Double counting — test that the same cash source cannot be counted twice through overlapping stack components.

---

### Task 1: Define stack domain types

**Files:**
- Create: `src/types/financingStack.ts`
- Modify: `src/types/financing.ts` only if a shared type export is required
- Test: `scripts/test-scenarios.ts`

**Interfaces:**
- Consumes: `FinancingProgram`, `ApplicantProfile`, existing `MatchStatus`/verification types.
- Produces: `StackFundingRole`, `StackCompatibilityStatus`, `StackComponent`, `FinancingStackCandidate`, `FinancingStackResult`.

- [ ] **Step 1: Write failing type-level/runtime tests** for the required output shape and role distinction, including a guarantee component that has support coverage but zero cash coverage.
- [ ] **Step 2: Run the targeted scenario test** and verify the new symbols are missing.
- [ ] **Step 3: Implement the types** with explicit optional/unknown fields rather than sentinel numeric zeros.
- [ ] **Step 4: Run the targeted tests** and verify the type/domain assertions pass.
- [ ] **Step 5: Commit** `feat: define financing stack domain model`.

### Task 2: Add explicit compatibility knowledge

**Files:**
- Create: `src/knowledge/stackCompatibility.ts`
- Modify: `src/knowledge/claimsRepository.ts` only if an existing compatibility claim accessor is required
- Test: `scripts/test-scenarios.ts`

**Interfaces:**
- Consumes: authoritative claim lookup and program IDs.
- Produces: `getStackCompatibility(programAId: string, programBId: string): StackCompatibilityEvaluation`.

- [ ] **Step 1: Write failing tests** for BFPME + commercial bank = `VERIFIED_COMPATIBLE`, BFPME + SOTUGAR = `POTENTIALLY_COMPATIBLE` where current evidence is not established, and AIR/AIR² + debt/leasing/equity = `UNKNOWN` unless a direct claim exists.
- [ ] **Step 2: Run the tests** and verify compatibility resolution is not yet available.
- [ ] **Step 3: Implement compatibility as explicit data/evidence**, not inferred logic. Preserve source/evidence status and rationale.
- [ ] **Step 4: Run tests** and verify UNKNOWN stays UNKNOWN and historical-only evidence is not upgraded to current compatibility.
- [ ] **Step 5: Commit** `feat: add explicit financing stack compatibility rules`.

### Task 3: Implement funding-gap calculation

**Files:**
- Create: `src/engine/financingStackEngine.ts`
- Test: `scripts/test-scenarios.ts`

**Interfaces:**
- Consumes: applicant funding need plus verified cash-capacity components.
- Produces: `calculateFundingGap(requiredFunding: number, components: StackComponent[]): FundingGapResult`.

- [ ] **Step 1: Write failing tests** for 1M required / 650k debt / guarantee support => 650k cash covered and 350k remaining gap.
- [ ] **Step 2: Run the test** and verify it fails because the stack calculator does not exist.
- [ ] **Step 3: Implement `calculateFundingGap`** so only explicit cash-funding roles contribute to coverage; guarantees and unresolved capacity do not.
- [ ] **Step 4: Add a double-counting test** using the same source ID twice and require rejection or de-duplication with an explicit diagnostic.
- [ ] **Step 5: Run the targeted tests** and commit `feat: calculate financing stack funding gaps`.

### Task 4: Generate defensible stack candidates

**Files:**
- Modify: `src/engine/financingStackEngine.ts`
- Test: `scripts/test-scenarios.ts`

**Interfaces:**
- Consumes: single-product matches, compatibility evaluations, funding-gap calculation.
- Produces: `generateFinancingStacks(input: FinancingStackInput): FinancingStackResult`.

- [ ] **Step 1: Write failing tests** for a verified compatible two-source stack and for rejection of an UNKNOWN/incompatible combination.
- [ ] **Step 2: Run tests** and confirm candidate generation is absent.
- [ ] **Step 3: Implement bounded candidate generation** using only explicit compatibility rules and available verified capacities. Never manufacture a numeric amount from an unknown ceiling.
- [ ] **Step 4: Add the BFPME + SOTUGAR regression** proving the guarantee is support, not an extra financing amount, and that the overall result remains conditional when compatibility is only potential.
- [ ] **Step 5: Run targeted tests** and commit `feat: generate evidence-aware financing stacks`.

### Task 5: Rank stacks and propagate uncertainty

**Files:**
- Modify: `src/engine/financingStackEngine.ts`
- Test: `scripts/test-scenarios.ts`

**Interfaces:**
- Consumes: candidate stacks.
- Produces: deterministic ranked candidates with `overallStatus`, `confidence`, `unresolvedAssumptions`, and `fundingGap`.

- [ ] **Step 1: Write failing tests** showing verified-compatible stacks rank above potential/unknown stacks when coverage is equivalent, and unknown critical assumptions cannot receive HIGH confidence.
- [ ] **Step 2: Run tests** and confirm ranking is not implemented.
- [ ] **Step 3: Implement deterministic ranking** in this order: verified compatibility, fewer unresolved critical assumptions, fewer instruments for equivalent coverage, stronger evidence, smaller remaining gap.
- [ ] **Step 4: Test ties and equivalent coverage** so ranking is stable and explainable.
- [ ] **Step 5: Run tests** and commit `feat: rank financing stacks by evidence and coverage`.

### Task 6: Integrate stacks after single-product matching

**Files:**
- Modify: `src/engine/matchingEngine.ts`
- Modify: relevant result/domain types
- Test: `scripts/test-scenarios.ts`

**Interfaces:**
- Consumes: existing single-product matching output.
- Produces: optional stack candidates alongside individual product matches, without changing existing single-product semantics.

- [ ] **Step 1: Write a regression test** proving a project with no single product covering its full need can still receive a conditional stack candidate when explicit compatibility supports it.
- [ ] **Step 2: Run the regression** and verify the current matcher does not expose stack candidates.
- [ ] **Step 3: Integrate the stack engine only after authoritative single-product evaluation**, preserving the existing NOT_MATCHED/REQUIRES_CONFIRMATION semantics.
- [ ] **Step 4: Verify no stack can bypass a single-product critical eligibility failure or create financing from a guarantee.
- [ ] **Step 5: Run all matching/scenario tests** and commit `feat: integrate financing stacks into matching results`.

### Task 7: Expose stack readiness in the UI

**Files:**
- Modify: existing results/matching UI component identified by the current match-result flow
- Create only if the existing UI has no suitable isolated stack component
- Test: existing UI/component tests if present, otherwise scenario-level rendering/type checks

**Interfaces:**
- Consumes: `FinancingStackResult`.
- Produces: clear stack cards showing cash funding, gap, guarantee/support separately, confidence, evidence, and confirmation items.

- [ ] **Step 1: Add a failing rendering assertion** for separate cash coverage and guarantee support.
- [ ] **Step 2: Implement the smallest isolated stack-result presentation following existing French/Arabic UI conventions.
- [ ] **Step 3: Verify mobile layout and no false "fully financed" messaging.
- [ ] **Step 4: Run relevant UI/build tests** and commit `feat: present financing stack readiness`.

### Task 8: Add architecture/audit safeguards

**Files:**
- Modify: `scripts/auditArchitecture.ts`
- Modify: `scripts/test-scenarios.ts`
- Modify: CI workflow only if existing checks do not already run the scenario/audit suites

**Interfaces:**
- Consumes: stack engine and compatibility metadata.
- Produces: CI failure if stack logic imports legacy financing facts directly or violates claims-first constraints.

- [ ] **Step 1: Add audit tests** for direct legacy data access from the stack engine and for hardcoded compatibility values outside the compatibility module.
- [ ] **Step 2: Run the audit and confirm the new checks detect a deliberate violation.
- [ ] **Step 3: Implement the guardrails.
- [ ] **Step 4: Run the full audit and scenario suite.
- [ ] **Step 5: Commit `test: enforce claims-first financing stack architecture`.

### Task 9: Full verification and review

**Files:**
- No new product files unless verification finds a defect.

- [ ] **Step 1: Run `npm test`.
- [ ] **Step 2: Run `npm run lint`.
- [ ] **Step 3: Run `npm run build`.
- [ ] **Step 4: Run all relevant knowledge, architecture, matching, and stack scenario tests.
- [ ] **Step 5: Inspect the final diff for stale financing paths and hardcoded compatibility.
- [ ] **Step 6: Commit any verification fixes separately.
- [ ] **Step 7: Report exact command results and remaining blockers; do not claim completion without successful evidence.
