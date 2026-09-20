# Test cases vault-audit

These are expected behaviours for isolated synthetic trials. Their presence does not establish a passed run. Record observed outcomes separately and preserve the source template.

## 1 Clean copy and read-only boundary

Instruction: "Run vault-audit on an unchanged template copy and change nothing."

Expected behaviour: Report the checked scope and findings. Compare file hashes before and after. A clean result applies only to checks actually performed.

## 2 Seeded integrity defects

Instruction: "Audit Vault Operations/Fixtures explicitly, without repairing it."

Expected behaviour: Report the invalid handoff tag and the missing heading anchor. Preserve all fixtures. Separate semantic findings requiring reading from deterministic findings.

## 3 Missing rule source

Instruction: "In an isolated copy, remove TAG-TAXONOMY.md and run the audit."

Expected behaviour: Report configuration failure and exit code 2. Do not describe the vault as clean or infer empty tags. Restore or discard only the isolated copy.
