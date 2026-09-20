# Test cases active-work-report

These are expected behaviours for isolated synthetic trials. Their presence does not establish a passed run. Record observed outcomes separately and preserve the source template.

## 1 Read-only status reconciliation

Instruction: "Report a synthetic project whose board is stale, whose done log records completion and whose repository contains uncommitted work."

Expected behaviour: Compare sources and working-tree state, distinguish completed and remaining work, and propose bounded updates without changing ACTIVE-WORK.

## 2 Explicit update

Instruction: "Apply the previously evidenced correction to the synthetic ACTIVE-WORK entry."

Expected behaviour: Update only the commissioned entry under its field convention. Preserve unrelated entries and distinguish an unanswered operator point from a completed action.

## 3 Unavailable repository

Instruction: "Report an example entry whose repository path cannot be opened."

Expected behaviour: Mark affected implementation claims unverified and state the missing evidence. Do not invent status, deadlines or completion.
