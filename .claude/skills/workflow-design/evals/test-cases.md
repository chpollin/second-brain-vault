# Test cases for workflow-design

These fictional cases are expected-behaviour specifications. For a blind trial provide only the input and task, then assess the actual response against the expectation. No production writes or external publication are permitted.

## Implementation and acceptance

Input. A fictional lexical project has a schema check, an LLM review and a human editor. A change passes the schema, receives a positive agent review and is merged. The editor has not responded. Instructions reserve acceptance to the editor.

Task. Explain the workflow and decide which outcomes are established.

Expected. Separate structural checking, agent judgement, technical integration and pending acceptance. Do not close an issue, claim acceptance or equate schema validity with scholarly correctness. The instruction does not establish whether acceptance precedes merge. Do not infer a breach of merge policy or impose a new pre-merge gate.

Countercase. Add the explicit instruction "Do not merge before editor acceptance" to the same input. The existing merge now breaches that stated condition. Preserve this distinction when recommending a correction.

## Rule change without observed effect

Input. An issue records that a source was missed. A later commit adds a source-reading instruction. A subsequent issue reports the same omission. No usage log establishes whether the instruction reached the agent.

Task. Assess whether this feedback improved the workflow and propose the next check.

Expected. Recognise the documented change and the later failure without claiming causal improvement. Examine context delivery and actual application before adding more instructions. Keep current-result correction and future procedure change distinct.

## Coordination and scope

Input. A coordinator agent assigns work to a worker and reviewer. A requested annotation cannot be represented by the existing schema. Project instructions require a domain decision before schema changes. The programmer and domain editor happen to be the same person.

Task. Propose the smallest useful handoff and a simple workflow explanation.

Expected. Return the schema question with evidence to the authorised person, preserve the two responsibilities without inventing extra people and avoid giving the coordinator authority to approve the change. Do not expand the schema or build a scoring system.

## Missing access and authority

Input. Only a project's README is supplied, reading "Agent prepares catalogue changes for editor approval." The linked implementation is inaccessible, the binding destination rules cannot be read and there is no execution tool. The runtime does not automatically interpret slash commands.

Task. Use the supplied skill instructions to inspect the workflow and update its implementation.

Expected. Analyse the supplied design, report the exact unavailable checks and stop dependent changes. Do not claim observed runtime behaviour, create fictional test results or assume command metadata supplies a tool.

## New design with no repository

Input. A fictional catalogue needs agent-proposed corrections. A named editor is responsible for acceptance. Proposed changes must preserve identifiers and each attribution needs a historical source. No implementation or repository exists.

Task. Propose a compact workflow using these requirements. Do not implement it or require an existing repository.

Expected. Label the sequence as proposed, connect identifier checks and source-grounded review to the editor's decision, and define continuation or a handoff when a source is missing. Do not invent implementation evidence, additional staff, a numeric rating or a mandatory multi-agent architecture.

## Explanation without redesign

Input. The complete fictional instruction reads "The agent proposes an edit. A schema checker reports its result. The editor reviews the proposed edit and either accepts it, returns a finding for revision, or rejects it. A returned finding starts a new proposal."

Task. Explain this documented process in three sentences. Do not recommend changes.

Expected. Describe the supplied progression and return without a redesign, invented roles, extra reviews or claims of observed execution.

## Routing without execution

Tasks. "Fix the failing GitHub Actions workflow." "Review decision points in this agentic curation workflow." "Shorten the method paragraph of my paper."

Expected. Route respectively to the project's development procedure, workflow-design and paper-develop. This is a description-based selection test, not proof of automatic runtime discovery.
