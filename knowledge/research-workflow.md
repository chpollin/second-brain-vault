# Research workflow and knowledge continuity

Second Brain supports research across projects by connecting maintained knowledge with the questions people and agents are currently investigating. Its purpose is to help a researcher recover earlier reasoning, examine new contributions and preserve findings under the conditions that justify them. The [project description](project.md) defines the research purpose. The [paper](paper.md) develops its argument and working definitions.

## Research context and responsibilities

A research project connects a substantive purpose with material, methods and criteria for a justified contribution. It can span repositories, share tools with other projects and change direction as evidence develops. Portfolio categories such as commissioned work, independent research, writing and teaching describe working contexts. They do not by themselves determine the research method or provide sufficient grounds for selecting evaluation cases.

A personal research environment is the maintained arrangement of knowledge resources, tools and working practices through which a researcher conducts inquiry across projects. The researcher supplies questions and substantive judgement. Agents select relevant context, investigate bounded questions and prepare contributions whose grounds can be inspected. Their ability to act depends on their actual tools and authorization.

The personal vault holds conceptual knowledge, source readings and relations across projects. Each repository maintains the assumptions and decisions governing its own material and implementation. Skills describe recurring procedures and read this knowledge at its responsible location. The [integration contract](integration.md) specifies ownership and access boundaries. Explicit links provide routes for investigation. They establish neither automatic retrieval nor permission to read or change their targets.

## Relation to the methodological projects

[Promptotyping](https://github.com/DigitalHumanitiesCraft/Promptotyping) connects maintained project knowledge with iterative development and expert assessment of research artefacts. [Grounded Vault](https://github.com/DigitalHumanitiesCraft/grounded-vault) concerns the support and scope of research claims. [Research Mission Control](https://github.com/DigitalHumanitiesCraft/research-mission-control) supplies procedures for assigning work and verifying returned contributions. The optional [Research Persona procedure](../.claude/skills/persona-init/SKILL.md) develops a confirmed profile and dialogue agreement.

Second Brain brings these concerns into the researcher's working environment. Their conceptual relationship supplies design grounds. Combining them does not establish their effectiveness or install their mechanisms.

## Inquiry and authorized revision

The current question determines which knowledge is relevant. A coordinating agent can delegate an inquiry when it can proceed independently alongside useful work. Its brief identifies the question, permitted sources and changes, expected evidence and publication boundary. The coordinator checks returned claims against the material before incorporating them. Agreement among agents is insufficient evidence of correctness.

```text
Research question <---------------- Maintained knowledge
       |
       v
Select sources and investigate
       |
       +---- Optional delegated inquiries
       |                    |
       v                    v
        Contribution with evidence
                   |
                   v
     Verification and scholarly judgement
           /                    \
          v                      v
 Further inquiry        Authorized revision
                                  |
                                  v
                    Check affected restatements
                                  |
                                  v
                         Maintained knowledge
                                  |
                                  v
                       Later use and assessment
```

A useful contribution may require no document change. When a durable revision is warranted, its responsible document is identified before editing. Summaries and references that reproduce the changed claim are examined within the authorized scope. Technical corrections covered by an existing instruction can proceed directly. New scholarly interpretations and personal attributions require the corresponding human judgement.

Results can return independently from delegated inquiries. Parallel work creates additional verification and coordination work, which must be included when assessing its usefulness.

## Interface requirements

The project overview should help the researcher identify where a contribution is needed and enter the relevant task. Project descriptions state purpose and substance. Current tasks, decisions, results awaiting assessment and external dependencies appear separately because they call for different actions.

| Information | Required distinction |
|---|---|
| Project identity | Purpose and research material remain separate from temporary work state |
| Available work | A concrete action is distinguishable from an action whose prerequisite is missing |
| Decision or assessment | The question or result includes the evidence needed for judgement |
| External contribution | The required input and responsible role are identifiable |
| Researcher response | A saved response remains distinguishable from an incorporated revision |
| Incorporation | The destination, actual change and verification can be inspected |

The design discussion favoured a compact project overview with direct access to detailed contributions. Project symbols can carry the distinctions between decisions, assessments and requested inputs without repeating them as a second mandatory matrix. Compact rows can represent proposals and waiting items where only existence and current state matter. The screenshots supplied in the discussion establish what was displayed at that moment. They do not establish interaction behaviour or successful knowledge integration.

A completion mark needs an explicit meaning. A response can be recorded before an agent processes it, and processing can produce a proposed revision before that revision is authorized and verified. These distinctions should remain inspectable without introducing a required confirmation for every routine operation. Rejected contributions and useful answers requiring no revision also need a clear disposition.

The public template's explorer displays prescribed reading sequences. The operational work interface is a separate component. The requirements above describe the intended connection between work and maintained knowledge and do not establish its complete implementation.

## Lessons from the development session

The discussion and subsequent repository checks on 20 September 2026 exposed a concrete maintenance failure. A revised manuscript existed as a review copy while the maintenance repository still carried its predecessor. The related vault documents retained an earlier framing, and the work overview still described an already published extension as unpublished.

The discrepancies were corrected through a bounded comparison of the manuscript, repository knowledge and affected vault documents. Agent reviews contributed findings that the coordinating agent checked against actual files. Local verification, repository synchronization and deployment were observed separately. These development observations provide no measurement of research benefit or reduced human effort.

The existing procedures already required a responsible location, examination of affected restatements and verification before reporting completion. The episode therefore supports investigating how consistently those procedures are applied. It does not by itself justify adding another checklist.

The practical corrections are to establish the maintained version before editing, include affected restatements in the same completion scope, and report the achieved result precisely. Drafting, incorporation, publication and scholarly acceptance require different evidence. The remaining question is whether applying these existing distinctions reduces repeated clarification without adding disproportionate maintenance work.

## Proposed practical examination

A bounded next inquiry can ask which existing procedures should have caught the documented discrepancy and what, if anything, needs to change. A finding that the procedures are sufficient but were incompletely applied is admissible.

The inquiry would compare the relevant instructions with the recorded work, identify the supported failure and propose the smallest justified correction. The researcher would assess whether that correction improves the working practice. An accepted change would enter its responsible document and affected references would be checked.

A subsequent real task would provide the opportunity to examine whether a fresh session finds and uses the procedure correctly. The [evaluation protocol](evaluation.md) and [episode record](episode-template.md) already specify source revisions, observed reads, interventions, unsuccessful outcomes and missing evidence. The retrospective account above cannot substitute for that prospective record.

An actual decision reached through the project interface could supply another case. Selection should depend on the substantive question and its knowledge dependency. No particular project or question has been selected for this examination.

## Evidence and unresolved questions

Stored files establish persistence. Automated checks establish the properties they test. A deployed interface establishes availability, while a screenshot establishes a visible state. None alone establishes scholarly adequacy, personal usefulness or correct application in later work.

The unresolved questions concern whether researchers can follow the consequences of their interventions, whether later sessions recover the grounds and limits of accepted findings, and whether the benefit warrants the review and maintenance effort. Delegation and the Research Persona require separate comparisons if their individual effects are to be claimed.

Teams, organizations and civilizations were proposed as metaphors for increasing coordination complexity. An ant-colony analogy raises a different question about coordination through local interactions. These remain exploratory ideas. The documented design concerns a researcher working with a single agent or a small team and supplies no tested threshold at which additional agents require another organizational form.

## Source basis

The synthesis draws on the design discussion and session retrospective of 20 September 2026, including the supplied interface screenshots. This conversation is developmental evidence with incomplete experimental controls. No full transcript is distributed with the public template.

Maintained sources are the [paper](paper.md), [integration contract](integration.md), [knowledge-document convention](../Vault%20Operations/Conventions/Convention%20Knowledge%20Documents.md), [development record](skill-evaluation.md) and [journal](journal.md). The [evaluation protocol](evaluation.md) governs prospective examination. The practical inquiry described here remains a proposal.
