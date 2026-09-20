---
type: vault-organisation
created: 2026-09-19
tags: [hub, workflow]
status: draft
query-topics: [vault-operations, skill-register, glossary, decisions, task-types]
---

# VAULT-OPERATIONS

> [!info] Read trigger
> Read for a skill trigger, a term of the vault or a question of roles. The reasons behind a rule stand in [[Decision Log]].

## Task types

| Task | Procedure |
|---|---|
| Add knowledge from outside | skill `vault-knowledge`, mode research for new notes, mode enrich for an existing note |
| Check one note or folder | skill `vault-knowledge`, mode check |
| Resolve overlap or diverging versions | skill `vault-knowledge`, mode refactor |
| Dissolve temporary notes | skill `vault-knowledge`, mode dissolve |
| Check the vault across documents | skill `vault-audit` |
| Prepare content for a talk, a paper or a post | skill `vault-distill` |
| Find relevant vault and project context from a repository session | skill `vault-orient` |
| Work from a repository's maintained knowledge and integrate findings | skill `project-knowledge` |
| Report the operational state | skill `active-work-report` |
| Write prose for a reader | skill `writing-style` |
| Build or revise a personal research persona | skill `persona-init` |

## Skill register

| Skill | Loads | Purpose | Reads |
|---|---|---|---|
| vault-knowledge | on call | maintains knowledge documents without loss and keeps restatements in step, in the modes check, enrich, research, refactor and dissolve | [[Convention Curation Round]] |
| vault-audit | on call | reports dead links, dead anchors and unreachable documents | `scripts/check_vault.py` |
| vault-distill | on call | synthesises vault content into an outline, slide input or draft prose and edits nothing | [[HOME]] |
| vault-orient | on call, outside the vault | opens the vault as a read-only knowledge source for a repository session | [[HOME]], [[Repo Directory]] |
| project-knowledge | in a repository with a `knowledge/` folder | works from and writes back into the knowledge base of a repository | [[Convention Knowledge Documents]] |
| active-work-report | on call | reports the operational state and proposes changes, writes only on instruction | [[Convention ACTIVE-WORK Fields]] |
| writing-style | before prose is written | prose rules with contrast examples and a self-check | `.claude/rules/documents.md` |
| persona-init | when a personal profile is requested | builds a readable profile, a working agreement and source provenance through a short dialogue | [[Template Research Persona]] |

How a skill is built and tested stands in [[Convention Skills]].

## Roles

The operator is the person accountable for the vault. The operator accepts findings, decides rule changes and owns every judgement on content. A vault session is an agent session started in the vault directory with its configuration loaded, and it is the only one that writes. A review lane is a subagent that reads and returns numbered findings, which count as unverified until checked against the real file state.

## Glossary

Concept note
: One note that holds one concept in the standard structure. Other documents link it.

Collecting document
: A glossary, an overview or a manuscript that restates many concept notes. It carries outdated restatements most often.

Restatement
: A passage that repeats a statement whose maintained place is another document.

Divergence
: The same statement carried in different states in two documents. It weighs more than identical text, because the valid state then depends on which document a reader opens.

Loss audit
: The check before a deletion that every statement of the source stands in the target or was dropped for a stated reason.

Operator point
: One open question to the operator in [[ACTIVE-WORK]], answerable without opening another file.

Project knowledge base
: The `knowledge/` folder of a repository together with its action layer, the `CLAUDE.md` and `AGENTS.md` in the repository root.

## Decisions in force

| Date | Decision | Reason and history |
|---|---|---|
| 2026-09-20 | Project context follows explicit repository mappings and preserves the scope of transferred findings | [[Decision Log#2026-09-20 Research context across repositories]] |
| 2026-09-19 | Persona initialisation uses a neutral template and stores personal drafts outside the public explorer | [[Decision Log#2026-09-19 Personal research persona initialisation]] |
| 2026-09-19 | Skills preserve read-only entry, honor existing update instructions and keep expected test outcomes distinct from observed evidence | [[Decision Log#2026-09-19 Skill evaluation and bounded execution]] |
| 2026-09-19 | After a change the neighbours that restate the document are brought into step | [[Decision Log#2026-09-19 Propagation after change]] |
| 2026-09-19 | A skill replaces a rule by a pointer only when the rule stands at the target | [[Decision Log#2026-09-19 Pointers need a target]] |
