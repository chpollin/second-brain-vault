---
name: vault-knowledge
description: >
  Works on the knowledge content of the vault in the five modes check, enrich, research,
  refactor and dissolve. Fires on "curate this document", "check this document", "vault
  hygiene", "enrich", "add sources", "bring this up to the current research", "research and
  integrate", "work this research into my vault", "consolidate", "merge these", "resolve the
  redundancy", "these documents overlap", "refactor the knowledge", "knowledge refactoring",
  "clean up the vault", "work in the handoffs", "dissolve the temporary documents", "consolidate
  the meeting notes". It does not fire for cross-document integrity scans, which belong to
  vault-audit, for vault-internal synthesis that changes nothing, which belongs to vault-distill,
  or for prose style alone, which belongs to writing-style. Vault session only.
---

Checks, enriches, researches into, refactors and dissolves vault knowledge documents under one set of invariants, with one file per mode.

## Reads

- `.claude/rules/documents.md`, the rule source for filenames, frontmatter, document class and structure, linking, sources, tags, notation, closure and deletion. Rule values are read there, never restated here.
- `Vault Operations/Conventions/Convention Frontmatter Field Profiles.md`, the field profile per document type.
- `TAG-TAXONOMY.md`, the controlled tag vocabulary.
- `CLAUDE.md`, the rule levels and the control documents.
- `Vault Operations/Conventions/Convention Curation Round.md`, the playbook. Its check order, verification rules, known error classes, write boundaries (`#Write boundaries`), loss audit (`#Loss audit`) and delegation model (`#Delegation model`) apply as written there.
- The convention of the document class actually touched, `Vault Operations/Conventions/Convention Project Overview.md` for a project hub and `Vault Operations/Conventions/Convention Knowledge Documents.md` for a `knowledge/` folder in a repository.

If a source cannot be read, the skill reports that and marks its result as unverified.

## Procedure

1. Load the rule sources above for the document class at hand.
2. Take the baseline. Run the check of the Verification section before the first edit and keep the findings of the area you are about to touch, so that inherited findings and caused ones can be told apart.
3. Choose the mode by the shape of the object.
   - [check](references/check.md), when a document or folder is to be judged and nothing is changed.
   - [enrich](references/enrich.md), when one named existing document receives material from outside, researched or supplied by the operator.
   - [research](references/research.md), when the order is a question and no target document exists yet.
   - [refactor](references/refactor.md), when two or more documents carry the same statements.
   - [dissolve](references/dissolve.md), when the object is a temporary process document.
   When the work inside an ordered scope meets an object of another mode, the mode file of that object applies to it, and the output names the switch.
4. Read the existing state before writing. The target document, its Related links and its MOC are read in full. Compare the sections of the document with the structure of its class first. A section the class does not know, such as an update or addendum at the end, is an appended enrichment and is worked into the sections it corrects. New knowledge goes into the existing sections, a new section arises only for a subject the document does not yet carry, and a growing list is reshaped rather than extended.
5. Run the mode file.
6. Close with the verification below and the output form.

## Invariants

- An order to check or to research without a write order produces findings in the conversation and changes no file. An implementation order already given is executed within its scope without asking again, and its interventions are numbered after the fact.
- After any changed statement, walk the inbound links of the target (grep for the wikilink including its alias form), read each location and decide per location whether to update it, to replace it by a sentence with a link, or to leave it. The decision list belongs in the output. Old collection documents such as a glossary or an overview carry outdated restatements most often. Locations in `Writing/` and in files another session holds are reported, not edited.
- Divergence weighs more than identical text. The same statement carried in a different state (another number, another status, another definition, another citation) is the heavier finding, because the state that looks valid then depends on which document a reader opens. The mode files rely on this rule and do not restate it.
- A source that this run adds or corrects is opened at the original, because a search hit, an abstract or a resolvable DOI proves neither title nor authorship nor content. A source the operator supplies and declares as read counts as opened. A source that cannot be opened is not added and appears under unverified with its reason. Citations that already stand in a document stay, and they are flagged only where a finding depends on them.
- For every new or corrected source, grep the vault for its DOI, arXiv number or title and check how it is already cited. A divergent entry is decided at the original. Where the original cannot be reached, the vault's own literature note counts as the record of the read source, and without one the divergence is reported with both locations and left undecided. It is never settled by majority or plausibility.
- Evidence kinds stay apart, the source finding, the own transfer, and behaviour observed at the project. A repository claim needs code read at the named state. A sensible implementation proposal stays a proposal until its execution is ordered.
- Evidenced errors and outdated statements are corrected in the running text with their source, unevidenced generalisations are limited to their evidenced scope, and the reason for the correction is stated in the result. Earlier wording stays traceable in Git, so no historical double text is kept. Where the touched folder is not under version control, the earlier wording is quoted in the output before it is overwritten. A newer source alone does not settle a real conflict. An open conflict stands in the Summary and the Key Points of a concept note with its positions, evidence and scope, never in a section of its own. Dated findings keep their time reference.
- Nothing is deleted before the loss audit of [[Convention Curation Round#Loss audit]] has run per intervention, which asks where each statement stands now and what substance has disappeared (examples, mechanisms, empirical findings, positions on contested terms). In doubt it is restored. Before deleting a source, check that every inbound link is caught by alias, remap or plain text.
- A deletion can end blocked, through an inbound link in a document this run may not edit or through a substantive open point without a permissible target. The document then stays intact, the output names it as blocked with the smallest decision that would release it, and a failing check on that document is stated and not hidden. An organisational leftover whose occasion has passed is no open point and is dropped with its reason.
- Test corpora, fixtures and evaluation corpora, and the register documents that describe them, are neither repaired nor deleted outside an explicit maintenance order that names the affected tests. Before deleting any document, grep the test folders for its name.
- `status` is never raised towards a reviewed state by this skill, that state is set by the operator only. Setting `complete` on a document that is closed according to the rules file is closure and no raise. An `updated` field that is present is set to the day of the change, and a document without the field does not receive one.
- The skill runs in a vault session, meaning a session started in the vault directory with its configuration loaded, whatever the agent topology. From outside, `vault-orient` applies and the result is a proposal.

## Boundaries

- `Writing/` is the author's voice. No prose and no style intervention there, findings are reported only, and metadata stays permissible.
- The root control documents named in [[CLAUDE#Control documents]] are changed by the vault session itself, never by a delegated reading agent. [[ACTIVE-WORK]] changes only on explicit instruction, and registering a tag in [[TAG-TAXONOMY]] is a vocabulary decision that is reported and not taken.
- The further write boundaries of [[Convention Curation Round#Write boundaries]] apply as written there and are not repeated.
- A mass operation over many files is written as a script under `scripts/` first and then run, and this skill holds the interpreting part.
- Delegation follows [[Convention Curation Round#Delegation model]] and pays off for a cluster that one reading pass cannot hold. Reading agents deliver finding lists, writing happens in the vault session after the operator has accepted the numbered findings, and exclusion lists are passed on verbatim. Findings that are already accepted need no further lane.

## Verification

Run from the vault root, before the first edit and after the last, and state which of these ran and which did not:

```powershell
python scripts/check_vault.py
python scripts/check_vault.py --fixtures
```

The check decides the required frontmatter core, the closed vocabularies, registered tags, the first heading against the filename, the number of tags, the sections and sources of a concept note, links, anchors and reachability. It decides neither the field profile table beyond the required core, nor style, nor factual correctness, nor whether a restatement is current. The first command skips the fixture folder and the second checks only that folder, and `--integrity` and `--hard` narrow either run. Exit code 0 also stands with measured findings, 1 on a hard violation, 2 on a configuration error, so exit code 0 does not mean a clean area. Read the findings of the changed area and name them, and make sure the run covers the folder that was touched, because a check that skips a folder proves nothing about it. Run the self-check of the `writing-style` skill against every changed prose passage and state that it ran. Check agent self-reports against the real file state before adopting anything.

After an authorized edit, if the template's generated explorer is present, run `python scripts/build_site.py` before the closing check. A read-only run reports stale generated data without rewriting it. Regression cases for skill maintenance stand in [evals/test-cases.md](evals/test-cases.md).

## Output

One form for every mode. Findings and interventions stand in the conversation, numbered so the operator can accept or reject them one by one, each with its target document. Then follow the decision per inbound location, new sources with their reference, unverified sources with the reason, open conflicts, blocked deletions with the decision that would release them, and the verification actually run with its result before and after. A mode file may add groups of its own to this form. No bare file counts without a substantive statement.
