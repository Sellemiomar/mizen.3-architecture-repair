# Primary-source follow-up — FOPROLOS and ANETI Chèque Entreprendre

Audit date: 2026-10-12  
Branch: fix/funding-gap-surplus-validation  
Purpose: update the evidence record without converting missing applicant data or inaccessible programme terms into eligibility claims.

## FOPROLOS — primary evidence recovered

**Primary source:** Ministry of Equipment and Housing, [FOPROLOS programme page](https://www.mehat.gov.tn/fr/principaux-secteurs/habitat/programmes-projets/foprolos/).

The Ministry page explicitly states:

- Eligible applicants are employees in professions in **non-agricultural sectors subject to the Labour Code**.
- Assessment uses **gross monthly income**.
- The employee and spouse (if applicable) must not own a dwelling, **except for extension operations**.
- Gross monthly income, including all allowances and the spouse's income where applicable, must not exceed **six times SMIG**.
- The page lists Decree No. 2016-1126 of 18 August 2016 and amending Decree No. 2023-127 of 10 February 2023.
- The Ministry presents four income bands: FOPROLOS 1 from 1 to 2.5 SMIG; FOPROLOS 2 from 2.5 to 3.5 SMIG; FOPROLOS 3 from 3.5 to 4.5 SMIG; and FOPROLOS 4 from 4.5 to 6 SMIG.

### Safe implementation disposition

The source now supports the **substantive policy statements** above. It does not establish that the current Mizen applicant profile collects all the necessary details or that every criterion has a safe evaluator. Therefore:

- Keep the existing ownership and salaried-category CUSTOM criteria as UNKNOWN until the product has structured applicant inputs and tested evaluators for them.
- Do not treat employmentStatus: salaried_private alone as proof that the applicant works in a covered non-agricultural sector subject to the Labour Code.
- Do not treat isFirstPropertyPurchase alone as proof that neither the applicant nor their spouse owns a dwelling.
- For extension projects, do not apply a blanket ownership failure: the Ministry explicitly states an exception for extension operations. The precise facts and supporting documents still need to be collected and checked.
- Preserve the gross household-income cap as a separate criterion. Its numeric input must represent gross monthly income, including applicable allowances and spouse income, relative to the applicable SMIG. A pass on that criterion alone is not overall FOPROLOS eligibility.
- Current application intake still requires separate current confirmation; a published programme page does not establish that an application is currently being accepted.

The current engine's conservative UNKNOWN results are correct until the missing fields and evaluator behavior are implemented and regression-tested. This audit does not mark overall FOPROLOS eligibility as verified.

## ANETI — Chèque Entreprendre remains unresolved

**Candidate primary URL:** [ANETI — Chèque Entreprendre](https://www.aneti.tn/fr/services/cheque-entreprendre).

The target page could not be retrieved during this audit. Searches across official ANETI and employment-ministry domains surfaced other employment-support measures, but did not yield an accessible primary source establishing the Chèque Entreprendre's specific support type, amount, eligibility, current intake, or stacking rules.

The Ministry of Equipment and Housing FOPROLOS page does not support ANETI claims. Likewise, other ANETI measures such as a *bourse d'accompagnement* or a *chèque d'appui à l'emploi* must not be substituted for Chèque Entreprendre without documentary evidence that they are the same mechanism.

**Safe disposition remains unchanged:**

- Keep the Chèque Entreprendre entry SOURCE_UNAVAILABLE / UNKNOWN.
- Do not infer that it is a cash grant, loan, or fixed-amount subsidy from its name.
- Do not publish an amount, eligibility result, current-intake status, or confirmed financing-stack compatibility.
- Request a working official document or written ANETI confirmation before promoting these fields to verified.

## Decision

This is an evidence clarification, not a new eligibility rule release. FOPROLOS policy facts are now explicitly recorded against a current Ministry primary source, while missing applicant inputs, implementation coverage, and current intake remain gates. ANETI Chèque Entreprendre remains an unresolved evidence gap. No production or merge decision is implied.
