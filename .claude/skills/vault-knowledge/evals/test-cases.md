# Test cases vault-knowledge

Cases use the synthetic fixtures under `Vault Operations/Fixtures/` and disposable working copies. They describe expected behaviour and are no evidence of passed agent runs. Preserve the registered fixtures and their test references. Positive deletion trials use renamed copies outside the registered test corpus.

## 1 Stale restatement in a collecting document

Situation: `Fixture Concept Alpha.md` carries the mechanism in its revised state with three causes. `Fixture Glossary.md` restates the same mechanism in the present tense with the single cause of the earlier state.

Instruction given: "Check the concept and its neighbours", and in the write variant "The concept is corrected, pull that through."

Expected behaviour: the run names the divergence as a finding with both locations and weighs it above identical text. The inbound links of Alpha are walked by grep including the alias form, every location is read, and the result carries a named decision per location, update, replace by a sentence with a link, or leave. The glossary is repaired by the revised state or by a link to Alpha, so the mechanism afterwards stands in one place. In the check mode the finding is reported and the repair is assigned to the refactor mode.

Failure: changing Alpha alone, reporting a count of locations instead of a decision per location, treating the glossary as correct because it is the older text, or redirecting a link address and calling that done.

## 2 Enrichment appended instead of read against the holdings

Situation: `Fixture Concept Beta.md` carries a section that was appended by an earlier enrichment and contradicts the document's own Key Points.

Instruction given: "Enrich this document with the new source material."

Expected behaviour: the document, its Related links and its MOC are read in full before writing. The new material is worked into the existing sections, the contradiction between the appended section and the Key Points is resolved explicitly, and a list is reshaped rather than extended. A new section arises only for a subject the document does not carry. The result names per older section whether it stays, is corrected with evidence, is merged or is dropped, and the document afterwards is one version.

Failure: appending a further section at the end, leaving the contradiction standing, reporting document growth as success, or writing before the existing state was read.

## 3 Divergent citation and a dead anchor

Situation: `Fixture Overview.md` cites the same fictional source as `Fixture Concept Alpha.md` with diverging author initials and year, and links a heading anchor in Alpha that does not exist.

Instruction given: "Add this source to the document."

Expected behaviour: before the entry, the vault is searched by grep for DOI, identifier and title, and the existing locations are compared. The divergent entry is decided at the opened original rather than by majority or plausibility, and it then stands identical at every location. A source that cannot be opened is not cited and appears under unverified with its reason. The dead anchor is reported with its location and its target, and the Sources list of the affected document is checked before any reattribution, because the plausible reattribution can itself be the error.

Failure: taking the data from a search hit or a resolved DOI, leaving the second location untouched, reattributing without opening the original, or passing over the dead anchor.

## 4 Temporary process note dissolved

Situation: `Fixture Handoff Note.md` is a registered test document. It carries one statement held nowhere else, one statement that `Fixture Concept Alpha.md` already holds, and a request about the room for the next session. The fixture does not establish that the session has passed. The placeholder literature note `Doe 2020 - Example Study` provides no evidence that settles the divergent citation in case 3.

Instruction for the positive trial: "In an isolated copy, create a renamed working handoff outside the registered test corpus. For this trial the room question is explicitly resolved and its session has passed. Integrate the handoff and remove the working note after a loss audit. Preserve the registered fixtures."

Expected behaviour: the working note and every target candidate are read in full. The exclusive statement is retained with its source and its unverified empirical status. The statement Alpha already carries is not copied a second time. The room question is dropped with the explicit trial premise as its reason. Incoming links are checked at each location. The working note is deleted only after every statement has a disposition and all editable incoming links have been updated. Unresolved bibliography remains unresolved.

Boundary trial: request ordinary dissolution of the registered fixture, or add an incoming link from protected author prose to a working copy. Preserve the source while the protected references prevent deletion. Without the explicit resolved-room premise, retain the open question or report the required disposition.

Failure: deleting a registered fixture under an ordinary cleanup request, inventing a past session, treating placeholder bibliography as source verification, deleting before the loss audit, promoting an unverified claim to a measured finding, or leaving an incoming link to the removed file.

## 5 Research with supplied synthetic sources

Instruction: "Use these fully supplied, explicitly fictional protocol documents to add a concept note about replay checking in the isolated vault copy."

Expected behaviour: read the originals, check for an existing target, integrate the concept with source references and reachable links, and distinguish the fictional protocol from observed behaviour. No web retrieval or empirical validation is claimed. A missing or unread source is listed as unverified and supplies no new factual assertion.
