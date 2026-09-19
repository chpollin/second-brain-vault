---
name: writing-style
description: Carries the vault's full prose style rules and loads before any prose deliverable is produced or substantially revised, meaning papers, blog posts, knowledge documents, documentation, slide text, speaker notes, mail drafts, chat replies and operator reports. Fires on "writing style", "style rules", "prose rules", "text style". Holds the four core bans, the punctuation rules, the justification duty and the self-check before delivery. Does not govern vault document structure, frontmatter or tags, where the vault document rules apply, nor code style, which the language guidelines govern, nor the building of a deck, which follows once the text exists.
---

Every prose deliverable follows these rules, regardless of format, length or output type. Moving into a file, a report or an artefact suspends nothing.

The language of a deliverable follows what the vault declares for its document class, and documents in a repository `knowledge/` folder, READMEs and code-adjacent documentation in public repositories are English unless the project declares otherwise. A rule below that is language-bound needs one contrast example per language the vault is written in, and the examples given here are English.

## Reads

- `.claude/rules/documents.md` for vault notation and document structure, read when the text becomes a vault document

Sources are read, not restated here. A source that cannot be read is reported, and the result is marked unverified.

## Procedure

1. Determine text type and language.
2. Write against the four core bans and the punctuation rules below.
3. Give every substantive claim its justification in the same place, and mark an inference as an inference. Name real conflicts and genuine uncertainties instead of smoothing them.
4. Run the self-check under Verification before delivering.

## Invariants

### The four core bans

These patterns are the frequent violations. They are banned in running prose without exception.

#### Dash and colon as connectors

No dash (en or em) and no colon as a connection, for emphasis, or before summaries and lists of examples. Use a comma, a relative clause, a conjunction or a separate sentence. The semicolon is no substitute, it is banned in running prose too and permitted only in parenthetical citation clusters, statistical notation, bibliographic entries and code. A colon stays permitted before a quotation, a code block, or a list whose items sit on their own lines. A dash only inside a genuine parenthetical insertion, and rarely. Code, file paths, technical syntax and inline code are exempt, and the range dash in numeric and alphanumeric ranges (1427–1496, pp. 12–18, E1–E61, 09:00–12:00) is notation and stays.

- Violation: `The result is unambiguous — the pipeline holds.`
- Conforming: `The result is unambiguous, the pipeline holds.`
- Violation: `Three tools are in use: a transcription service, an annotation editor and a custom runner.`
- Conforming: `In use are a transcription service, an annotation editor and a custom runner.`

#### Trailing negative apposition

Never sharpen a statement by an appended negation in the pattern `X, not Y`, even when it carries content. State the point positively, and put the excluded alternative, if it is needed at all, in its own sentence that stands on its own content.

- Violation: `This is a working instrument, not an archive.`
- Conforming: `This is a working instrument. It archives only at the margins.`
- Violation: `The point is not automation but traceability.`
- Also a violation, because the pattern has only moved into the second sentence: `The point is traceability. Automation is a means, not an end.`
- Conforming: `The point is that decisions stay traceable.`

An antithesis that corrects a real misconception and carries genuine content (capta versus data) stays permitted. The violation is the reflex of sharpening every statement through its negation.

#### Triads and pseudo-elegance

No triadic figures as ornament, no anaphora, no rhetorical parallelism.

- Violation: `We read the sources, we model the data, we build the tools.`
- Conforming: `The work covers source reading, data modelling and tool building.`

Listing three things that factually are three is not a triad. The violation is the rhythm, the building of the statement on the threefold beat.

#### Aphoristic endings and closing platitudes

No paragraph built towards a polished punchline, no obligatory closing platitude, no balanced both-sides ending.

- Violation: `In the end, what matters is what researchers make of it.`
- Violation: `Machine assistance speeds the edition up without replacing it.`
- Conforming: the text ends with its last substantive statement.

### Further rules

The prose rules of the vault's own instructions apply in full and are not repeated here. What follows goes beyond them.

- No emojis.
- No short framing sentence at the start of a paragraph that only introduces the subject. The first sentence already carries content.
- No announced enumerations. Parallel points stand directly as a numbered list, without a counting announcement and without a first, second running through the prose.
- Write LLM (on first occurrence Large Language Models) where an LLM is meant. The bare word model stays reserved for other model notions (provenance model, trust model, data model, operating model), because several of them regularly occur in the same document and the bare word then has no clear referent.
- Term definitions in glossary form. The term stands alone on its own line or as a heading, the definition follows as a paragraph beneath. Never term, separator and definition on one line, never a bold lemma with a full stop.
- Prefer the ordinary word over a coined or repurposed label. Before coining a name, check whether the ordinary descriptive word carries it, and whether the word already has a technical sense in the domain (corpus, edition, annotation, ontology, register), in which case it is taken. A genuinely new coinage is marked as a revisable choice on first use in a canonical document or left to the operator.
- No Mermaid, in chat and in produced documents. Diagrams are Unicode or ASCII boxes, tables and structured lists.
- A final version states the matter, not its own genesis. Source criticism, verification status and the production apparatus belong in footnotes, provenance blocks or the knowledge base, because workshop language in a product text reads as a draft. Genuinely open institutional decisions may stand in the text. One methodological self-description sentence per document is permitted.
- Where an annotation, transcription or claim carries a producer, name the producer (human verified, deterministic workflow, unrevised LLM agent). Never an abstract confidence level such as high, medium or low, because it has no operational definition.

## Boundaries

- The skill writes no vault structure. Frontmatter, filenames, document classes, tags, linking and vault notation live in `.claude/rules/documents.md` and are followed, not repeated here.
- Code, identifiers, comments, filenames and commit messages are English and out of scope here.
- A rule in a project CLAUDE.md takes precedence over this skill.
- The self-check is never mentioned inside the text itself. The delivery message states in one clause that it ran.

## Verification

Read the finished text once against the four core bans and rewrite every hit. Check specifically:

1. Does the opening carry a meta-announcement, a justifying preamble or a topic label?
2. Does the closing run into a punchline or a both-sides ending?
3. Does any dash, colon or semicolon in running prose act as a connector?
4. Is any bold used as emphasis or as a pseudo-label?
5. Does every substantive claim carry its justification, and is every inference marked?

Say what was checked and what was not. Where a source under Reads was unreadable, mark the result unverified and name the source.

## Output

The text itself, in the requested form, without a covering commentary on the style work. A delivery message names only what changed and what is open.
