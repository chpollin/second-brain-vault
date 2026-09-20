---
name: vault-audit
description: Checks the vault for integrity across document boundaries and reports dead wikilinks, dead anchors, orphans, documents unreachable from HOME, frontmatter gaps and control-document drift. Fires on "check the vault", "integrity check", "vault-audit", "dead links", "orphaned documents", "check consistency", after a reorganisation or refactoring round, and before a vault evaluation. Not for the quality of a single document or a cluster, which is vault-knowledge in mode check, not for prose rules, which is writing-style, not for a synthesis of vault content, which is vault-distill, not for the operational state of projects, which is active-work-report.
---

Reports integrity findings across the vault and repairs only within an explicitly commissioned scope.

## Reads

- `CLAUDE.md`, `TAG-TAXONOMY.md`, and the MOCs of the scope, as the basis for judging findings and for the drift check
- `Vault Operations/Conventions/Convention Curation Round.md` for check order, verification and resolver rules, and known error classes
- `Vault Operations/Conventions/Convention Frontmatter Field Profiles.md` for the mandatory field core

If a source cannot be read, report it and mark the result unverified.

## Procedure

1. Load the rule sources above. The checker judges nothing, and the assessment, the drift check and every repair stay with the model.
2. Run `python scripts/check_vault.py` from the vault root. It checks the hard rules and the measured findings against the canonical maintenance places. Exit code 0 also holds with measured findings, 1 on a hard violation, 2 on a configuration error, so the finding list decides. A configuration error is a failed check, not a passed one. A finding in the working tree does not prove the write-time check was bypassed.
3. Run `python scripts/check_vault.py --integrity` from the vault root. It reports dead wikilinks, dead anchors and documents unreachable from HOME, and it stays deterministic and offline. A scoped check runs the whole vault and filters the findings onto the folder or the document at hand.
4. Judge the finding classes. Action findings are defects, meaning dead links with a near target and a repair suggestion, dead anchors, and true orphans. Hygiene is frontmatter. Informative rather than defective are forward links, which are deliberate links to documents not yet created and are scanned only for a real typo, and files reachable by query rather than by link.
5. Check control-document drift, which the checker does not do. Reconcile folder lists, convention lists and topography tables in the control documents against the real holdings.
6. Order the findings by severity, integrity breaks before drift before hygiene, with the informative classes separate from the action part. Each finding carries its location as a clickable link, a short diagnosis and a concrete proposal.
7. Close according to the commission. A check commission delivers findings. Commissioned repairs run without renewed confirmation inside the released scope, pull the affected inventories and references along in the same run, and re-check integrity afterwards.

## Boundaries

- A check commission is read-only. A repair commission does not extend itself to deletions, moves or substantive changes.
- Write boundaries per `Vault Operations/Conventions/Convention Curation Round.md#Write boundaries`.
- A changed convention, meaning a new exempt folder, a new control document or a changed tag rule, is carried into the checker in the same round.

## Verification

Run `python scripts/check_vault.py` and `python scripts/check_vault.py --integrity`, after a repair a second time. State which checks ran, on which scope, and what was not checked.

After an authorized repair, if the template's generated explorer is present, run `python scripts/build_site.py` before the closing check. A read-only audit reports stale generated data without rewriting it. Regression cases for skill maintenance stand in [evals/test-cases.md](evals/test-cases.md).

## Output

Findings in the conversation, ordered by severity, one finding per line with location, diagnosis and proposal. Informative classes separate. After a repair, what was changed and what stayed open as a substantive decision.
