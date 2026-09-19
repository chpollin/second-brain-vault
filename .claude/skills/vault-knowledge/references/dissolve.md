# dissolve

Temporary process artefacts in a given scope are found, their durable value is transferred to canonical knowledge documents without loss, links are carried along and the exhausted source is deleted. Where the overlapping documents are already known and no candidate search is needed, the refactor mode applies instead.

## Candidates

Candidate signals are names, paths or frontmatter carrying `handoff`, `meeting`, `session`, `notes`, `working`, `temporary`, `draft` or `plan`, markers such as `superseded`, `obsolete` or `fully integrated`, documents whose results a newer hub, specification, journal or knowledge document already carries, and handoffs or plans without open, still valid points. The signal list is extended by the equivalent words of every language the vault is written in. Extend the search over inbound links and semantically close neighbours. A signal proves no deletability, and a keyword search alone classifies nothing. A signal word counts in a name, a path or a title. The frontmatter value `status: draft` is the ordinary maturity of a document and no signal.

## Loss check

Read the source and every target candidate in full and divide the source's statement holdings into five sets, exclusive durable content, content already carried, content carried in a divergent state, outdated or purely procedural content, and conflicts with still open points. A source is deletable only when every statement has a disposition. Exclusive durable content then stands in the target, redundant content needs no second copy, and content carried in a divergent state counts as a conflict. Every real conflict and every open point blocks the deletion until a valid target or a factual decision exists.

Kept are documents with own source, evidence, publication or reuse value, among them published deliverables, proposals, primary feedback, legally or professionally relevant records of conversation and reproducible states of evidence. A document that a method uses as its evaluation corpus is kept, and its lifecycle status justifies no deletion. An open task without another permissible target blocks the deletion.

## Targets

Project decisions and stable project state go to the Project Overview or the responsible project knowledge document, methodical and subject insights to a thematic knowledge document, technical truths to the linked repository source or the responsible technical knowledge document with repository claims checked at the real state, and meeting decisions to the documents whose content they steer. Accepted results of a plan go to the current specification or the Project Overview, while unrealised options survive only while still relevant. Handoff points are integrated individually, discarded with reason, or preserved through git alone, and a journal gets a durable provenance entry only where the project convention provides for one. With several equally plausible targets the candidate stays open.

## Steps

1. Record candidates, inbound links and possible targets, then run the loss check on each candidate.
2. Work exclusive durable content into the existing sections of the canonical target by the enrich mode, taking over required sources, aliases and precise Related links.
3. Redirect inbound wikilinks to the target or remove references that became obsolete, reading the restatement at each referring location, then counter-search the old filename for remaining valid references.
4. Delete the fully disposed source rather than archiving it, then run `python scripts/check_vault.py --integrity` and `python scripts/check_vault.py` again.

A deletion is accepted when every deleted source was read in full, every exclusive durable statement is findable in the named target, sources and relevant provenance survive, no unresolved contradiction and no placeless open point remains, every inbound link was handled, the counter-search finds no unintended reference to the old filename, and the verification run reports no newly created integrity error.

## Output

Four groups, integrated and deleted with source, target and the value taken over, deleted directly with reason and link handling, kept with the own durable value, and open with the smallest factual decision required. Name the scope checked and the real verification state.
