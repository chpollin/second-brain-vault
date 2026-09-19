---
paths:
  - "**/*.md"
---

# Rules for vault documents

Applies to every Markdown document in the vault. The machine-checked parts are reported by `python scripts/check_vault.py`, and the commit check rejects hard violations.

## Filenames

- Concept notes `Concept Name.md` in the singular, literature notes `Author Year - Title.md`, dated research notes `YYYY-MM-DD - Topic.md`
- Folders with spaces and without number prefixes
- Preparation documents for meetings are never created. Preparation lives in the project document or in the repository.

## Frontmatter

```yaml
type: knowledge|literature|concept|research|specification|vault-organisation
created: YYYY-MM-DD
tags: [2 to 4 tags from TAG-TAXONOMY, lowercase-hyphenated]
status: idea|draft|stub|complete|reviewed|released
```

The `type` vocabulary is closed. A convention that needs a new type registers it here. `knowledge` is the default for synthesised notes, `concept` only for the definition of a single term, `research` only for dated notes, `literature` for one read source.

`status` describes the maturity of the document. The operational status of a project is the inline field `status::` in ACTIVE-WORK with its own vocabulary.

`query-topics` holds lowercase-hyphenated search terms, so that an agent finds the document by full-text search without opening it. The first entry is the title as a slug, then subtopics, proper names and abbreviations that stand neither in the title nor in the tags. `aliases` resolves abbreviations and synonyms for wikilinks.

Which further fields a document type carries stands in [[Convention Frontmatter Field Profiles]]. A field that is not registered there is not allowed.

## Document class and structure

The class is decided before writing. A concept note follows this order:

1. `## Summary`, at most three paragraphs
2. `## Key Points` or `## Core Concepts`
3. `## Synthesis`, which states connections and does not repeat the summary
4. `## Sources`
5. `## Related`, with the links that actually matter

The first heading begins with the filename. `CLAUDE.md` and `AGENTS.md` carry their conventional heading.

## Linking and sources

- On the first mention of a concept check or create the wikilink, set links in both directions, aim at a place with `[[Document#Heading]]`
- Every document is reachable from [[HOME]] along wikilinks, through its MOC or through a lateral link from a reachable document
- A concept note carries at least three sources, scholarly ones inline as `(Author, Year)` and in full under `## Sources`, web sources as a footnote with access date, DOI or URL where available
- A source is cited only after it was opened at the original. A search hit or an abstract proves neither authorship nor content.

## One place per statement

- One concept is one note. A neighbouring document links the note or restates it in one sentence with a link.
- After a statement has changed, walk the inbound links of the document and decide per location whether the restatement is updated, replaced by a link or left as it is. Old collecting documents such as a glossary or an overview carry outdated restatements most often.
- Evidenced errors and outdated statements are corrected in the running text with their source. Earlier wording stays traceable in Git. Open conflicts are named with positions, evidence and scope. Dated findings stay as time-bound records.

## Tags, MOCs, quantities

- Only tags from [[TAG-TAXONOMY]]. A new tag is registered there before first use. What is linked needs no tag.
- MOCs and indexes carry no statistics and no update history.
- No volatile quantities, meaning dataset sizes, processing states, code and test metrics, accuracy values. Dates and version names stay as historical facts. A version claimed as current points to its source of truth.

## Closure and deletion

The vault has no archive state, no archive folder, no prefix and no status value for it. Everything in the vault is active knowledge.

1. A document with knowledge value stays in place and receives `status: complete`. When it is outdated it carries a callout under the title with date, reason and the pointer to the current source of truth.
2. A document without knowledge value of its own, or whose knowledge was fully extracted, is deleted after a loss audit. The target is named in the commit or in the receiving document, and inbound wikilinks are moved first.
