---
name: active-work-report
description: Scans the vault and the referenced repositories and reports the operational state of projects, teaching and deadlines, then proposes concrete changes to ACTIVE-WORK.md and writes them only on explicit instruction. Fires on "what is on", "status report", "project status", "update ACTIVE-WORK", "check the deadlines", and whenever the operator wants the overall operational state. Not for the substance of a project, which lives in its Project Overview and its repository knowledge, not for vault integrity, which is vault-audit, not for knowledge documents, which is vault-knowledge, not for prose rules, which is writing-style.
---

Reports the operational state from its real sources and changes ACTIVE-WORK.md only on instruction.

## Reads

- `ACTIVE-WORK.md` as the current state and as the work list
- `Vault Operations/Conventions/Convention ACTIVE-WORK Fields.md` for the field contract, the field register, the status vocabulary, action-item formats, entry naming and the done-log rule
- `.claude/rules/active-work.md` for the scope of the document
- `Vault Operations/Done Log.md`, most recent entries, so completed work is not reported as open again
- `Vault Operations/Repo Directory.md` for the mapping from `repo::` to a local path

This skill does not repeat the field rules. If a source cannot be read, report it and mark the affected entry unverified.

## Procedure

1. Load the current state and the rule sources above.
2. Reconcile every existing entry against its own sources. The work list is ACTIVE-WORK itself, and each entry names its project folder in `folder::` and its repositories in `repo::`. Per entry, read the main document in the `folder::` path, read the project's status tables where they exist, and for every repository check `git log --oneline -15` without a `--since` filter and `git status --short`. Uncommitted work counts as state, and without it the report calls finished what still lies in the working tree.
3. Scan the vault broadly for undertakings that have no entry yet, and take up only those that have reached project or commitment status.
4. Extract per document the status, deadlines, next actions, blockers and the progress since the state described in the entry. Compare semantically rather than temporally, because an `updated::` field serves traceability and not analysis. Commits after the described state and newer information in the vault document are the indicators of a stale entry.
5. Deliver the situation report in the conversation, ordered chronologically where dates exist, covering near deadlines, active projects, waiting or blocked entries, fixed dates in the near term, and what changed against the previous state. One entry is one bullet, several aspects of one entry become sub-bullets rather than a comma chain or a parenthesis, at most one line per bullet.
6. Follow the report with the recommended changes to ACTIVE-WORK.md, numbered, each naming exactly what to change and where. For a changed narrative text give the old text, the new text and the reason, so the operator can check the change. Name the entries that need no change.
7. For a report-only request, deliver the recommendations and await an implementation instruction. An explicit update instruction already given authorizes evidenced changes within its scope without renewed confirmation. Keep unresolved substantive decisions and unanswered operator points open.
8. Execute authorized changes following the field contract. After every change to an entry and before reporting back, check each touched entry against the field contract table and output the result as one line per entry with the missing field names or the word complete.

## Boundaries

- ACTIVE-WORK.md is never changed on the skill's own initiative, only on the operator's explicit instruction.
- A field that records an open operator question is never removed on the skill's own initiative, only after an actual answer.
- No invented tasks. Only what the scanned documents support. A waiting or dormant status is deliberately passive and is not a task. Where something is uncertain, ask instead of speculating.
- A missing field is not filled with placeholder text. The content is obtained with evidence from the project document, the repository or the git state, or the gap is reported.
- Statements about local checkouts, knowledge folders and data stores come from the file system of the machine the session runs on. Where a path cannot be seen, the existing entry value stays and the report names the gap. The session's own inability to check is never entered as a project state.
- No third-party personal names, no e-mail addresses, roles instead of names.
- No new sections are invented. The section structure is the one ACTIVE-WORK already carries.
- Write boundaries per `Vault Operations/Conventions/Convention Curation Round.md#Write boundaries`.

## Verification

Regression cases for skill maintenance stand in [evals/test-cases.md](evals/test-cases.md).

Per repository, `git log --oneline -15` and `git status --short` in the real local path. After a write, the field-contract check per touched entry. State which entries were checked against repository and file system, which only against the vault document, and which could not be checked.

## Output

Situation report and recommendation block in the conversation, not as a file. After an instructed write, the list of changed entries with the field-contract result per entry.
