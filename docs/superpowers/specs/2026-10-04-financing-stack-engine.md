# Mizen Financing Stack Engine Specification

## Goal
Turn single-product financing matches into evidence-aware financing structures that can combine compatible funding roles without inventing compatibility, funding capacity, or current eligibility.

## Core model
A financing stack is a set of financing instruments plus non-financing support roles evaluated against one project funding need.

### Funding roles
- DEBT
- EQUITY
- QUASI_EQUITY
- GRANT
- PROMOTER_CONTRIBUTION
- GUARANTEE
- SUBSIDY

Guarantees and other risk-support instruments never count toward funding coverage unless an authoritative claim explicitly says they provide cash financing.

## Compatibility statuses
- VERIFIED_COMPATIBLE
- POTENTIALLY_COMPATIBLE
- UNKNOWN
- INCOMPATIBLE

No compatibility may be inferred from product category, provider identity, historical practice, or mathematical convenience.

## Evidence rules
- Current authoritative claims outrank historical or weaker claims.
- UNKNOWN remains UNKNOWN.
- Historical compatibility is never treated as current compatibility.
- A stack's confidence cannot exceed the weakest critical compatibility/eligibility assumption.
- Unverified or unknown capacity cannot be used to manufacture a covered amount.
- Fund capitalization is not entrepreneur financing capacity.

## Funding coverage
Coverage is calculated only from instruments that explicitly provide money toward the project.

`fundingGap = max(0, requiredFunding - verifiedCashFunding)`

Guarantee coverage is displayed separately as risk support.

## Candidate generation
The engine starts from authoritative single-product matches, then considers combinations only when every pair/combination has an explicit compatibility rule. It must preserve provenance and uncertainty for every stack component.

## Ranking
Prefer, in order:
1. verified compatible stacks;
2. stacks with fewer unresolved critical assumptions;
3. stacks with fewer instruments when coverage is equivalent;
4. stronger evidence quality;
5. smaller remaining funding gap.

Ranking must never convert UNKNOWN into a positive compatibility score equivalent to VERIFIED_COMPATIBLE.

## Safety examples
- BFPME 65% financing + SOTUGAR guarantee does not automatically become 100% cash financing.
- BFPME + SOTUGAR may be reported as POTENTIALLY_COMPATIBLE / LOW CONFIDENCE where only historical/direct evidence exists.
- AIR/AIR² plus debt/leasing/equity remains UNKNOWN unless direct evidence establishes compatibility.
- A 1M TND project with 650k verified debt and a guarantee has 650k cash coverage and a 350k funding gap; the guarantee is not another 350k.

## Output
The stack result must expose:
- required funding
- cash funding covered
- remaining funding gap
- components and their roles
- each component's capacity and evidence
- compatibility status and rationale
- guarantees/support separately
- overall stack status/confidence
- unresolved assumptions / lender confirmation items

## Non-goals
- No loan approval prediction.
- No invented rates, terms, fees, or repayment periods.
- No automatic application submission.
- No fabricated compatibility.
- No optimization that uses unknown financial values as if they were verified.
