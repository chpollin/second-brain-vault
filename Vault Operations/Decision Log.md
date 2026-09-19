---
type: vault-organisation
created: 2026-09-19
tags: [workflow, original]
query-topics: [decision-log, rule-history, reasons]
---
# Decision Log

The history and the reasons of the rules, newest first. The rules themselves stand in [[CLAUDE]], in `.claude/rules/` and in the conventions. The decisions in force are registered in [[VAULT-OPERATIONS#Decisions in force]].

## 2026-09-19 Pointers need a target

When skills were rewritten so that they reference rule values instead of copying them, several rules turned out to stand only in the old skill and not in the document the new pointer named. They would have been lost silently. A pointer therefore replaces a copy only after the rule was found at the target, and the loss audit of a skill change lists every such pointer with its target.

## 2026-09-19 Propagation after change

A review of one knowledge folder showed that duplicated text was the smaller problem. Concept notes had been revised while the documents that restate them kept the earlier state in the present tense, most often old collecting documents. No procedure inspected the neighbours after a change. The rule now stands in `.claude/rules/documents.md` so that it applies to every change, and the maintenance skill carries the step of walking the inbound links.

## Related

- [[Convention Curation Round#Rule changes]]
