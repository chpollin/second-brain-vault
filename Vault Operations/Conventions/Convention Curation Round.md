---
type: knowledge
created: 2026-09-19
tags: [knowledge, workflow]
status: draft
query-topics: [convention-curation-round, curation, refactoring, loss-audit, delegation-model, write-boundaries, error-classes]
---

# Convention Curation Round

## Trigger

Consult for every curation, audit or refactoring round over the vault, for every rule change, and whenever a skill points here.

## Order of a round

1. Run `python scripts/check_vault.py` and read the findings as a work list.
2. Read the holdings of the scope before judging them. A critique made without looking is a guess.
3. Collect findings as a numbered list with both locations per finding.
4. The operator accepts, rejects or changes findings by number.
5. Write in one place, the vault session. Verify, then commit a coherent unit.

## Known error classes

Stale restatement
: A concept note was revised, and a neighbouring document that restates it keeps the earlier state in the present tense. This is the most frequent and the most damaging class. It arises when a change is not followed by a walk along the inbound links.

Appended enrichment
: New material was added as a new section at the end, while the older sections that it corrects or supersedes stayed as they were. The document then holds two versions.

Divergent citation
: The same source appears with different authors, years or titles in two documents. The original decides, and afterwards it stands the same everywhere.

Rule copied into a procedure
: A skill or template carries its own copy of a rule value. The copies drift apart. A pointer replaces a copy only when the rule really stands at the target.

## Verification rules

- A redundancy pass overstates. Every claim that two passages are the same is proven on the full text of both sides before anything is merged.
- A concept note and a document of another genre that restates it are a deliberate pair. They are a finding only when they contradict each other.
- Findings are classified as identical text, same claim in other words, or divergent. Divergent findings come first.
- A pair that was examined and deliberately kept is recorded, so that the next round does not raise it again.

## Loss audit

Before a passage is shortened to a pointer and before a document is deleted, state per intervention where each statement now stands and which substance disappeared, meaning examples, mechanisms, findings, and positions on contested terms. In doubt the passage is restored. Nothing is deleted before every inbound link has been moved.

## Write boundaries

- `Writing/` is the author's voice. Agents report findings there and make no edits to prose or style. Metadata stays permissible.
- Control documents are edited only by the vault session, never by a subagent.
- A file that another session holds with unsaved changes is reported and not edited.
- From a session started outside the vault the vault is read-only.
- In the `knowledge/` folder of a repository [[Convention Knowledge Documents]] applies.

## Delegation model

Review lanes are subagents that read and never write. Each lane receives a bounded scope, the exclusion list verbatim and the publication boundary, and it returns numbered findings with locations. A lane report counts as unverified until its locations have been checked against the real file state. Writing happens in the vault session after the operator accepted the findings. Lanes do not spawn agents of their own.

## Rule changes

A rule change states its reason, names the templates, scripts and examples that depend on it, and updates them in the same move. It is recorded in [[Decision Log]] and registered in [[VAULT-OPERATIONS#Decisions in force]]. When the holdings violate a rule in their majority, the rule is examined first.

## Related

- [[CLAUDE]] — rule tiers
- [[Convention Skills]] — how procedures reference this convention
- [[Fixtures]] — synthetic examples of the error classes
