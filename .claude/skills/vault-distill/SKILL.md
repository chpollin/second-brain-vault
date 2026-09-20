---
name: vault-distill
description: Synthesises selected vault content and linked project knowledge on a question or topic into an outline, slide input or draft prose, at a chosen reading depth, and outputs the result without editing anything. Fires on "distil this", "distillate", "summarise the vault on this", "synthesis", and whenever material for slides, a paper, a blog post or a workshop concept is to be prepared, including as the step before slide building when a broad topic has no outline yet. Not for research that is written back into the vault, which is vault-knowledge in mode research, not for prose rules, which is writing-style, not for integrity findings, which is vault-audit, not for building a deck itself.
---

Synthesises selected vault and linked project knowledge for the requested question and changes nothing.

## Reads

- The MOCs of the topic for orientation, the full documents for a deep reading
- `Vault Operations/Repo Directory.md`, its linked Project Overviews and `Vault Operations/Conventions/Convention Knowledge Documents.md` when the question needs project evidence or a comparison across projects
- `Vault Operations/Conventions/Convention Curation Round.md#Write boundaries` for the write boundary that also binds a read-only run

If a source cannot be read, report it and mark the affected statement unverified.

## Procedure

1. Establish the question or topic, scope, depth and output form from the request. An omitted depth defaults to `deep`; an omitted output form defaults to `outline`. Ask only when missing task information prevents a useful synthesis.
2. Read at the requested depth or its default. `shallow` reads only the selected MOCs and entry points for orientation, `deep` reads the full selected documents, `research` is deep plus scholarly web research. Depth never expands the task into reading every linked knowledge folder. For project evidence follow `Convention Knowledge Documents.md#Working from the knowledge base` and its access rules, using the current runtime's available tools.
3. In `research`, open every cited source at the original. What cannot be opened stands separately under unverified.
4. Synthesise by purpose. An overview orders terms and relations, a comparison names criteria, alternatives and limits of validity. For cross-project claims apply `Convention Knowledge Documents.md#Ownership and transfer`. Preserve each claim's scope and conflicting or stale evidence. Work out a core thesis or a field of tension only where the question and the sources carry it. Keep own inferences apart from source findings.
5. Format and support. `outline` is a structured outline, `slides` is structured input for a slide build, `writing` is draft paragraphs. In every form, trace load-bearing statements back to the vault passages or external sources actually read, present nothing unread as checked, and name the remaining gaps.
6. Deliver the text in the conversation. No release step is needed for the requested output.

## Boundaries

- Edits nothing. No vault document is created, changed, moved or deleted, and no publication is triggered.
- A further processing step that was commissioned separately may follow, and this skill does not start one by itself.
- Write boundaries per `Vault Operations/Conventions/Convention Curation Round.md#Write boundaries`.

## Verification

Regression cases for skill maintenance stand in [evals/test-cases.md](evals/test-cases.md).

State which vault and project documents and external sources were read in full, which were read only at entry-point level, which mutable claims were checked against code or data, and which sources could not be opened. A `research` run reports whether every cited source was opened at the original and names any exceptions.

## Output

The extract in the conversation in the requested form, with the sources of the load-bearing statements and a closing list of the remaining gaps.
