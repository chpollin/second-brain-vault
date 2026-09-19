# refactor

Knowledge refactoring over a pair or a cluster, which finds redundancy and versions of the same statement that have drifted apart, merges them without loss into a canonical place, deletes sources after full extraction and carries links and restatements along. The most expensive error here is a statement silently lost in the merge, the second most expensive a deleted source whose content was not fully extracted.

## Steps

1. Determine candidates. Named documents are taken as given. For a folder or a subject, search overlap (same concepts, same tags, mutual links, similar titles) and name the candidate pairs before changing anything. The search applies to single statements too, so a term, a criterion or a list standing in two documents is a candidate even across different subjects, and for each doubling the canonical place and the document that will only link are named. Divergence is searched for explicitly and weighs more than identical text.
2. Read both documents in full and quarter the statement holdings into only in A, only in B, congruent and divergent. That division is the working basis and goes into the output. A factual contradiction is shown as a conflict instead of silently resolved.
3. Choose exactly one intervention per finding and name it. The possible interventions are replacing a restatement by a link, moving a statement to the canonical place, carrying a changed definition into the neighbours, merging documents, dissolving a collection document, and aligning a citation. Only merging deletes a source and runs steps 4 to 7 in full.
4. Choose the target. Canonical is the document with the better place, the standard structure and the most inbound links. With an unclear candidate, ask instead of deciding.
5. Merge. Integrate valid exclusive knowledge from both sides into the target, carry redundancy once, merge Sources, take aliases of the source into the target. Every exclusive statement must survive in the target or its correction must be justified. Where both sides carry the same source with divergent data, the original decides and the entry then stands identical everywhere. Tags and structure follow the rule sources.
6. Carry links and restatements along. Redirect every inbound wikilink of the source documents to the target and update MOC entries. Redirecting the address is not enough, so read each referring location and decide whether its restatement matches the new canonical version, is carried along, or is replaced by a sentence with a link.
7. Delete the source after full extraction, not archive it, and name in the result where the knowledge went. Close with the loss audit, a counter-search for dead links to the old name, the check run, and the writing-style self-check on the target. For the formal check, recommend the check mode on the target.

Three verification rules hold for every run. The redundancy pass overdraws, so a candidate is a hypothesis until both full texts confirm it. Every merge claim is evidenced at the full text of both sides. An atom and a document of another genre standing on the same subject are a deliberate set and become a finding only on contradiction. For a cluster, delegation follows [[Convention Curation Round#Delegation model]].

## Output

Target document or cluster, the division of the statement holdings in brief, the intervention per finding, the redirected link locations as a file list, the deleted sources. Conflicts and uncertainties explicit.
