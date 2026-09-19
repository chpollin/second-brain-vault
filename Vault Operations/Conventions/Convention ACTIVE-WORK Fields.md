---
type: knowledge
created: 2026-09-19
tags: [knowledge, workflow]
status: draft
query-topics: [convention-active-work-fields, inline-fields, operator-point, next-step, done-log]
---

# Convention ACTIVE-WORK Fields

## Trigger

Consult before creating or changing an entry in [[ACTIVE-WORK]].

## Entry

An entry is a fourth-level heading that links the Project Overview, followed by inline fields, operator points and next steps. The field names are fixed identifiers, because generators and views read them. Renaming a field means changing every reader in the same move.

| Field | Content | Required |
|---|---|---|
| `project_id` | stable identifier, never derived from the visible name | always |
| `folder` | vault folder of the undertaking | always |
| `category` | kind of undertaking, from a closed list the vault defines | always |
| `status` | `active`, `waiting`, `dormant`, `upcoming`, `offer-made` | always |
| `repo` | URL of the repository, or `no repository` | always |
| `knowledge` | path of the knowledge index inside the repository | when a repository exists |
| `updated` | date of the last change to the entry | always |
| `state` | the present observable state | when active or waiting |
| `goals` | what the undertaking is meant to achieve | when active or waiting |
| `waiting-on` | a dependency on somebody else, stated as a state | when it exists |
| `milestone` | one fixed date of the operator's own, never the end of the project | when upcoming |

## The state field

`state` is precise before it is short. It names what exists now, in a form an agent can start from. It does not narrate how the state came about and carries no correspondence. Technical detail that a repository holds is linked, not copied.

## Operator points

`waiting-on-operator:: [Type] question. Context: what depends on it.` followed on the next line by a block anchor `^op-<project>-<topic>`.

- The type is one of Decision, Authorization, Action, Input.
- A point holds exactly one question. Several independent decisions are several points.
- A point is answerable without opening another file. It names the options or the object of the decision in its own words.
- A point is removed only after an actual answer, never because it looks settled.
- Views may key their data on the anchor and on the wording. Rewording a point therefore updates those views in the same move.

## Next steps

A next step is a line that begins with `→` and names one executable action. A waiting or dormant status is deliberately passive and is not a task. No invented tasks.

## What stays out

History, finished work, other people's responsibilities, meeting dates of others, monetary amounts, personal names, links to private online documents. Finished work goes to [[Done Log]] with its date.

## Related

- [[ACTIVE-WORK]]
- [[Convention Project Overview]] — the slow counterpart of an entry
