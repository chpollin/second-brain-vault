---
type: knowledge
created: 2026-08-28
updated: 2026-09-19
tags: [knowledge, workflow]
status: draft
query-topics: [convention-frontmatter-field-profiles, frontmatter, required-fields, field-profile]
---

# Convention Frontmatter Field Profiles

## Trigger

Consult when a document is created, when its `type` changes, or when a field is to be added to the vault.

## Required core

The block below is the single source for the hard check. `scripts/check_vault.py` reads it and hard-codes none of its values.

```yaml
required: [type, created, tags, status]
type: [knowledge, literature, concept, research, specification, vault-organisation]
status: [idea, draft, stub, complete, reviewed, released]
tags_min: 2
tags_max: 4
status_optional_for: [vault-organisation]
```

## Profiles

| Type | Required beyond the core | Optional | Not allowed |
|---|---|---|---|
| knowledge | | `query-topics`, `aliases`, `updated`, `project-type`, `agent-modus` on a Project Overview | operational status |
| concept | | `query-topics`, `aliases`, `updated` | |
| literature | `author`, `year` | `doi`, `url`, `query-topics` | |
| research | | `query-topics` | `updated`, a dated note is not revised |
| specification | | `query-topics`, `updated` | |
| vault-organisation | | `updated`, `query-topics` | |

A field that stands in no profile is not allowed. A convention that needs a new field registers it here first, with the type it belongs to and the reader that uses it. A field without a reader is not added.

## What does not belong in frontmatter

The operational status of a project, dates of meetings, monetary amounts and anything that changes faster than the document itself. The operational status lives in [[ACTIVE-WORK]].

## Related

- [[CLAUDE]] — rule tiers and convention index
- [[TAG-TAXONOMY]] — the vocabulary behind `tags`
