---
type: vault-organisation
created: 2026-09-19
tags: [fixture, workflow]
query-topics: [fixtures, test-field, deliberate-defects]
---
# Fixtures

Synthetic documents with deliberate defects. They are the risk-free test field for the skills and for `scripts/check_vault.py`. Everything in them is fictional. The regular check skips this folder, `python scripts/check_vault.py --fixtures` checks only this folder, and `tests/test_check_vault.py` asserts that the machine-decidable defects are found.

## Defects

| Document | Defect | Found by |
|---|---|---|
| [[Fixture Glossary]] | restates [[Fixture Concept Alpha]] in its earlier state, one cause instead of three | `vault-knowledge` in mode check and refactor |
| [[Fixture Concept Beta]] | an enrichment was appended as a new section that contradicts the Key Points | `vault-knowledge` in mode enrich |
| [[Fixture Overview]] | cites the source of Alpha with other initials and another year | `vault-knowledge` in mode refactor |
| [[Fixture Overview]] | links an anchor that Alpha does not have | `scripts/check_vault.py`, `vault-audit` |
| [[Fixture Handoff Note]] | temporary note with one statement held nowhere else and one already held in Alpha | `vault-knowledge` in mode dissolve |
| [[Fixture Handoff Note]] | carries a tag that is not registered | `scripts/check_vault.py` |

[[Fixture Concept Alpha]] is the clean reference.

The folder is test data. A skill is tried on it only on an explicit order, and afterwards the seeded state is restored with `git restore "Vault Operations/Fixtures"`, because a repaired fixture makes the test of the check script fail.

## Related

- [[Convention Curation Round#Known error classes]]
- [[Vault Operations MOC]]
