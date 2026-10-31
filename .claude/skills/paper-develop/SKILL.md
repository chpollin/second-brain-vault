---
name: paper-develop
description: Develops or revises the argument and prose of a compact scholarly exposé, abstract or short paper. Fires on "write the short paper", "revise the abstract", "kurzes Paper" and "Exposé" when a scholarly draft is requested. Source synthesis without manuscript development belongs to vault-distill, prose style alone to writing-style, and agentic workflow design to workflow-design. Does not submit or publish manuscripts.
---

Develop a compact scholarly argument whose claims fit the available evidence and whose revisions preserve the author's accepted decisions.

## Reads

Resolve vault paths against the verified vault root and skill resources against this folder. Use the supplied material when it is sufficient for the requested revision.

- The selected manuscript or latest supplied draft, author corrections and venue requirements when supplied.
- `Vault Operations/Conventions/Convention Knowledge Documents.md` and the selected project sources when repository evidence needs checking. Use `Vault Operations/Repo Directory.md` only to resolve an unknown project location.
- `.claude/skills/vault-distill/SKILL.md` when selecting and synthesising vault sources, and `.claude/skills/writing-style/SKILL.md` before drafting prose.
- `Vault Operations/Conventions/Convention Curation Round.md#Write boundaries` before a file edit.

An unread source cannot support a checked claim. An unreadable binding rule stops the dependent edit. Continue supported reading or return a draft in the conversation and name the exact limitation.

## Procedure

1. Recover the requested unit, reader, contribution, length and accepted decisions from the draft and author feedback. A critique returns findings. A revision changes the requested passage and any demonstrably dependent statements. Preserve unrelated wording. Follow a supplied word limit or venue format. When neither exists, use the existing draft's scale and avoid expanding its scope.
2. Check the evidence needed for the contribution. Source selection and synthesis follow `vault-distill` only when needed. Separate documented practice, observed outcomes and proposed extensions. A conceptual paper need not invent an empirical study. Repository reading during preparation becomes a research method only when the paper actually adopts and explains it as such. Evidence that qualifies the argument remains visible.
3. Draft one connected argument. Give each paragraph a distinct function, define necessary terms at first use and place case evidence beside the claim it supports. Remove repeated explanations and unexplained technical lists. Preserve accepted distinctions even when shortening. Do not impose a chapter count. For a requested figure, show the relation needed for the argument and identify whether it is conceptual or an observed trace.
4. Apply the requested citation style and check each new or altered attribution against the source actually read. Distinguish source findings from inference and retain revisions for mutable implementation claims. Publication year comes from bibliographic metadata, not the DOI string. Repeated citation of one implementation can be reduced while its attribution remains clear. Independently sourced cases retain their own references. Abstract references follow the requested format rather than being added automatically.
5. Deliver the requested unit. Put source-access limits and editorial checks outside the manuscript unless they are part of its methodological argument. If persistence is authorised, use the existing manuscript and responsible project knowledge rather than creating a parallel revision history.

## Boundaries

Follow the current authorisation and `Convention Curation Round.md#Write boundaries`. A draft request alone does not grant access to edit an existing protected manuscript. An explicit revision instruction is handled under the governing rules without an additional approval stage. No submission or publication is part of this procedure.

## Verification

Read the finished text against its supporting passages, accepted author decisions and the loaded style self-check. Check that the abstract and conclusion claim no more than the body establishes, that cited references resolve to the sources actually read, and that repeated passages have a distinct purpose. If files were edited, read them back and run the destination's applicable checks. A proposed evaluation is never reported as executed.

Maintenance cases are in [evals/test-cases.md](evals/test-cases.md). They specify expected behaviour and do not establish successful runs.

## Output

Return the requested prose or critique in the conversation, with citations and references appropriate to that unit. Add a brief separate statement of material checks and unresolved evidence. Name saved files only after writing and reading them back.
