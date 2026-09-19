---
type: vault-organisation
created: 2026-08-28
updated: 2026-09-19
tags: [workflow, original]
status: draft
query-topics: [claude, rules, constitution, rule-tiers, convention-index]
---

# CLAUDE

You work in this vault together with its operator. The default mode is execution, implement directly with minimal commentary. Ask when scope, granularity, order or convention is uncertain. When a rule does not hold or is repeatedly bypassed, say so and propose a change. When the holdings violate a rule in their majority, examine the rule before the holdings.

[[AGENTS]] is generated from this file for agents that do not read a CLAUDE.md. After every change here run `python scripts/render_agents_md.py`. The commit check rejects a stale copy.

## Session start

1. Read [[ACTIVE-WORK]] as soon as the task touches projects, dates or coordination. Pure knowledge, style or curation work does not need it.
2. Read [[VAULT-OPERATIONS]] for a skill trigger, a project term or a question of roles, [[TAG-TAXONOMY]] before assigning a tag, [[HOME]] for navigation.

## Control documents

Five control documents live in the vault root. [[HOME]] is the navigation hub. [[ACTIVE-WORK]] holds the operational state and is the only place for next steps. [[VAULT-OPERATIONS]] holds the skill register, the glossary and the register of decisions. [[TAG-TAXONOMY]] is the controlled tag vocabulary. This file holds the rules, with [[AGENTS]] as its generated copy. Only a session started in the vault edits control documents, never a subagent.

## Topography

| Folder | Purpose |
|---|---|
| `<Domain>/` | one folder per knowledge domain, with its concept notes and the domain MOC |
| `Literature/` | one note per read source |
| `Projects/` | one subfolder per undertaking with a Project Overview as hub |
| `Writing/` | the operator's own texts, author's voice, agents report and do not edit prose |
| `Vault Operations/` | the vault's knowledge about itself, conventions, templates, decision log, fixtures |
| `.claude/` | rules that load by path, and skills |
| `scripts/` | checks and generators |
| `knowledge/` | scope and design decisions of this template, deleted once the vault is your own |

## The four axes

Container is the folder and states the domain. Class is the frontmatter `type` and determines the inner structure. State is the maturity in `status`, while the operational status lives only in [[ACTIVE-WORK]]. Relation is carried by wikilinks for concepts, tags for broad categories and aliases for synonyms. Information that belongs to one axis is never encoded on another, so no status as a tag and no project membership as a tag.

## One place per statement

Every statement and every rule has one maintained place. A concept lives in its note, a rule in its convention, a next step in [[ACTIVE-WORK]], project knowledge in the project repository. Other places link to it or restate it in one sentence with a link. Whoever changes a statement walks the inbound links of its document and brings every restatement into step, because a document that keeps an earlier state misleads more than a missing one.

## Document rules

Frontmatter, filenames, document classes, structure, linking, sources, tags, notation and deletion stand in `.claude/rules/documents.md` and load as soon as a Markdown document is touched. The rules for the operational board stand in `.claude/rules/active-work.md`. The fields per document type are defined in [[Convention Frontmatter Field Profiles]].

## How rules load

Rules load in three ways. This file is always loaded and therefore stays short. The files under `.claude/rules/` load when a matching path is touched. Conventions and skills load on demand, when a task names them. What must hold for every document belongs in a rules file, never in a skill, because a maintenance skill only runs when it is called.

## Rule tiers

Every rule lies on exactly one of three tiers. The tier says who enforces it and what a violation triggers. A rule becomes hard only where its check is decidable without judgement and without false alarms, because friction while writing defeats the purpose of working fluently with the vault.

Hard rules are checked at commit and rejected on violation by `scripts/hooks/pre-commit`. They cover the required frontmatter core, the closed vocabularies of `type` and `status`, tags registered in [[TAG-TAXONOMY]], the ISO format of `created`, and a current [[AGENTS]].

Measured rules are checkable but need judgement in the single case, so they do not block. `python scripts/check_vault.py` lists them on demand. They cover link and anchor integrity, reachability from [[HOME]], the standard structure and sources of concept notes, the first heading against the filename, and the number of tags. A finding is a work list.

Heuristic rules are not machine-decidable and remain judgement in curation. They cover granularity, the right of a note to exist through a foreseeable use, and document length.

Rule changes follow [[Convention Curation Round]] and are recorded with their reason in [[Decision Log]].

## Skills and repositories

Executable procedures live in `.claude/skills/`, their register with purpose and boundary in [[VAULT-OPERATIONS#Skill register]]. A skill reads vault knowledge and never duplicates it. Project knowledge lives in the `knowledge/` folder of the project repository, which [[Repo Directory]] maps to its Project Overview. A session started outside the vault reads the vault through the skill `vault-orient` and does not write into it.

## Convention index

Detail conventions live in `Vault Operations/Conventions/`. Read the matching one for the task at hand.

- [[Convention Frontmatter Field Profiles]], which fields a document type carries
- [[Convention ACTIVE-WORK Fields]], before creating or changing an entry in [[ACTIVE-WORK]]
- [[Convention Project Overview]], before creating or updating a project hub
- [[Convention Knowledge Documents]], before creating or refactoring documents in the `knowledge/` folder of a repository
- [[Convention Skills]], before adding or changing a skill
- [[Convention Curation Round]], for curation, audit and refactoring rounds and for every rule change
