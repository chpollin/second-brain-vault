# Second Brain as a Personal Research Environment for Working with AI Agents

Dr. Christopher Pollin

## Abstract

Research with AI agents requires continuity between a current question, earlier reasoning and the documents in which findings are maintained. Second Brain connects a personal research vault with project repositories whose `knowledge/` folders hold requirements, decisions and methodological context. Task-specific procedures guide context selection, bounded delegation and authorized revision. A researcher examines contributions in conversation and through views linked to their sources. The publicly available implementation is a reusable vault template with synthetic examples, document conventions, skills, structural checks and a static explorer. This article presents the arrangement and its verification boundaries, then specifies an empirical evaluation based on real research episodes. The proposed study examines whether relevant reasoning can be recovered, whether contributions remain supported by evidence, and whether accepted revisions can be used correctly in later work. The design supports a single agent or a small team. Larger organizational structures remain a research question concerning responsibilities and shared knowledge.

## 1. Research continuity across projects

A research project distributes its reasoning across source readings, data, software, drafts and recorded decisions. In the working setting examined here, these materials belong to commissioned projects, independent research, writing and teaching. A question in one project can require a decision made elsewhere, while a technically successful change can invalidate an earlier description of the method. An agent working on the current task needs enough of this history to interpret the task correctly.

The practical problem is deciding what knowledge to consult and how a new contribution changes it. A useful response may recover an earlier argument, expose a contradiction or provide an implementation that can be examined. Its value depends on how accurately it uses the available material and whether subsequent work can recover the resulting decision.

Second Brain is a personal research environment that connects maintained documents with agent-assisted work. Its central research question is how explicit relationships between project knowledge, reusable procedures and researcher judgement can support continuity across sessions and projects. The public contribution is an inspectable implementation of this arrangement and a proposed method for evaluating it in use.

An AI agent here is a system based on a Large Language Model (LLM) that uses selected context and available tools to pursue an assigned task. The initial scope is one researcher working with a coordinating agent and, where useful, bounded subagents. The researcher brings questions and evaluates substantive contributions. The agents read selected sources, investigate assigned problems and prepare changes within their authority. Durable findings enter the documents responsible for them. This arrangement makes the relationship between an answer and its later use available for examination.

## 2. Related work and methodological context

Co-STORM combines participation in conversations among search-grounded agents with a dynamic mind map and report generation. Its evaluation addresses exploratory information seeking. Adaptation to prior user knowledge and greater conversational control remain identified limitations. These concerns are relevant to Second Brain's use of a researcher's existing knowledge and interventions during a task ([Jiang et al., 2024](https://aclanthology.org/2024.emnlp-main.554/)).

Agentic Context Engineering maintains external context through structured, incremental updates and evaluates this strategy on agent and financial reasoning benchmarks. It provides a technical precedent for treating context as material that develops through use ([Zhang et al., 2025](https://arxiv.org/html/2510.04618v1)). In Second Brain, scholarly claims and personal interpretations require evidence and appropriate authorization before becoming durable knowledge.

An analysis of multi-agent execution traces identifies failures involving task specification, alignment between agents and verification. This supports treating delegation as an operation with its own failure modes. The quality of a contribution must be assessed after agents return their work ([Cemri et al., 2025](https://arxiv.org/html/2503.13657v2)).

Second Brain also draws on related methodological projects. [Promptotyping](https://github.com/DigitalHumanitiesCraft/Promptotyping) connects maintained project knowledge with iterative development and expert acceptance. [Grounded Vault](https://github.com/DigitalHumanitiesCraft/grounded-vault) addresses the evidence supporting research claims. [Research Mission Control](https://github.com/DigitalHumanitiesCraft/research-mission-control) addresses research coordination. The optional [Research Persona procedure](https://github.com/chpollin/second-brain-vault/tree/main/.claude/skills/persona-init) specifies how a research profile and working agreement can be developed from sources and personal feedback. Their contribution here is a set of design inputs whose usefulness must be assessed in the resulting environment.

## 3. A maintained documentary environment

### 3.1. Knowledge and its responsible locations

The personal vault holds conceptual knowledge, source readings and relationships across projects. A project repository keeps implementation-specific knowledge beside its code and data. A repository directory links each project to its maintained knowledge and conceptual overview. These explicit references form a documentary network that a person or agent can follow selectively.

| Location | Responsibility |
|---|---|
| Personal research vault | Concepts, source readings and findings that apply across projects |
| Project `knowledge/` folder | Project purpose, requirements, data assumptions, decisions and implementation findings |
| Repository directory and project overview | Navigation between the vault and the responsible repository |
| Skills and conventions | Reusable procedures and the rules governing their application |
| Conversation | Current question, proposed interpretation and researcher feedback |
| Work records and their interface | Open work, dependencies, required judgement and recorded outcomes |

The maintenance rule assigns each durable statement a responsible location. Other documents link to it or provide a scoped summary. When the statement changes, its restatements need inspection. The synthetic development cases exercise the failure this rule addresses, in which a corrected note coexists with an outdated overview or glossary. Git preserves earlier revisions, while the maintained documents state the position that currently governs the work.

The network uses explicit document links and reading instructions. Access to another repository depends on the active agent environment. A link establishes a route to inspect. It does not establish that its target has been read or that a finding can be transferred without checking the receiving project's assumptions.

### 3.2. Procedures and context selection

Skills are written procedures that an agent reads and follows using the tools available in its execution environment. They identify when a procedure applies, which sources to read, the permitted operations and how to verify the result. Substantive knowledge remains in the relevant documents.

Context selection begins with the research question. The agent locates the responsible project, reads its applicable instructions and follows its knowledge index to the relevant material. Claims about implementation are checked against code or data when their current state matters. A conflict between a specification and observed behaviour remains explicit until it has been investigated.

Transferring a finding between projects requires a further judgement. The agent compares the source project's purpose, material and method with the receiving task. It preserves the conditions under which the finding was established. A plausible analogy can support a proposal, but its applicability remains an inference until checked against the new case. The [knowledge-document convention](https://github.com/chpollin/second-brain-vault/blob/main/Vault%20Operations/Conventions/Convention%20Knowledge%20Documents.md) defines this procedure.

### 3.3. The optional research profile

A Research Persona records a researcher's confirmed background and an explicit working agreement for dialogue. Its procedure distinguishes personal statements, source evidence, generated interpretation and simulated answers. A request to shorten one answer consequently applies to that answer unless the researcher expresses a general preference.

The profile can guide which earlier work is relevant and how a contribution should be discussed. Personal agreement and evidential correctness remain separate judgements. An agent may formulate a well-supported objection even when it differs from the researcher's initial view. The public template provides an [initialisation procedure and neutral template](https://github.com/chpollin/second-brain-vault#build-your-research-persona). Personal profiles and the author's research corpus are excluded from the public distribution.

## 4. Research work and bounded delegation

The workflow begins with a substantive question or a concrete change. The researcher and coordinating agent examine the available context and establish what result would answer the question. Delegation is useful when a bounded investigation can proceed independently, such as inspecting a second repository while the main conversation develops an interpretation.

Each delegated task identifies the question, relevant sources, permitted changes and expected evidence. The coordinating agent compares returned findings with the actual documents or artefacts and integrates their implications. Conflicting findings remain visible. Separate agents can share assumptions and errors, so their agreement alone does not establish validity.

```text
                     Researcher
               question and judgement
                         |
                         v
              Conversation and work view
                         |
                         v
              Context selection and task <---- Personal vault
                    formulation          <---- Project knowledge
                         |
                         v
                 Coordinating agent
                   /           \
                  v             v
          Bounded inquiry   Bounded inquiry
                  \             /
                   v           v
                Contribution and evidence
                         |
                         v
              Verification and, where needed,
                   scholarly judgement
                    /           \
                   v             v
          Further inquiry   Authorized revision
                                  |
                                  v
                       Maintained knowledge
                                  |
                                  +----> Later research question
```

Figure 1. The intended relationship between documentary context, collaborative inquiry and maintained knowledge. Delegated inquiries can return independently. Further inquiry may also follow a finding that requires no document change.

Human involvement follows the substance of the operation. A previously authorized technical correction can be implemented and checked directly. A new scholarly interpretation, an unresolved methodological choice or a personal attribution may require the researcher's judgement. Verification should identify the substantive decision and provide the evidence needed to make it.

An accepted finding is written to the responsible knowledge document. An operational consequence is reflected in the work record, and affected restatements are brought into agreement. A later session must be able to recover both the result and the grounds on which it was accepted. This last step is part of the proposed evaluation, since successful file storage alone cannot establish continuity of reasoning.

## 5. Implementation and available evidence

The public [Second Brain repository](https://github.com/chpollin/second-brain-vault), examined at its [20 September 2026 revision](https://github.com/chpollin/second-brain-vault/commit/05588f3f6d6fdaf72da5e2b1cfbc3043a1320645), provides an Obsidian vault template with synthetic notes, reusable procedures, document conventions and deterministic checks. Project knowledge documents describe its purpose and integration boundaries. The static explorer renders the template and shows reading sequences derived from its rules. Those sequences describe intended instruction loading. They are not observed traces of an agent's execution.

The author's working environment includes a separate interface over personal work records and a separate exporter that prepares explicitly selected vault documents for a conversation. The exporter records the selected sources. The public template, exporter and personal work interface have distinct implementations and access boundaries. The public template installs no agent runtime or automatic cross-repository retrieval service. Its [integration specification](https://github.com/chpollin/second-brain-vault/blob/main/knowledge/integration.md) identifies these boundaries.

| Evidence | What it supports | What remains to examine |
|---|---|---|
| Structural checks and regression tests | Defined file, link, generation and exclusion behaviour | Correctness of research claims |
| Local explorer inspection | Selected navigation and document-rendering behaviour | Usability during research work |
| Recorded synthetic skill trials | Reported behaviour in bounded development cases | Reliability across tasks and agent environments |
| Proposed study of research episodes | A procedure for examining practical use | Outcomes from actual execution of that study |

The [skill evaluation record](https://github.com/chpollin/second-brain-vault/blob/main/knowledge/skill-evaluation.md) describes synthetic maintenance, synthesis and profile-initialisation trials. Complete dialogue records and local trial artefacts are not included in the public template. The persona baseline reported no failure, which prevents an improvement claim for the added procedure. New cross-repository test cases specify expected behaviour and have not yet established behavioural results. The available evidence therefore supports an implemented and technically checked design, with research usefulness still requiring evaluation.

## 6. Evaluation through research episodes

The proposed unit of analysis is a research episode that connects an initial question with a contribution and its subsequent use. Episodes should be selected because they expose a particular dependency on maintained knowledge or judgement. The researcher's portfolio provides candidate material across different working conditions.

| Episode | Question under examination |
|---|---|
| Recovering an earlier decision | Can the agent recover its rationale, evidence and remaining conditions? |
| Transferring a method between projects | Does the proposed transfer preserve differences in material and purpose? |
| Resolving a contradiction | Are specification, implementation and source evidence distinguished accurately? |
| Incorporating a correction | Does the accepted change reach the responsible document and relevant restatements? |
| Continuing work in a later session | Can the revised knowledge guide work without repeating the earlier correction? |

For each episode, the study should preserve the initial question, available source revisions, selected passages, agent instructions and contributions, researcher interventions, and resulting changes. A later follow-up should examine whether the result can be recovered and applied. Rejected contributions and unresolved questions belong in this record because they reveal where the arrangement fails or creates additional work.

Assessment should distinguish evidence from utility. Source assessment examines whether a claim is supported by the cited passage and preserves its scope. Scholarly assessment examines whether the resulting inference or implementation answers the research question. The researcher's assessment concerns whether the contribution helped the work and whether the necessary judgement could be made from the information presented. Where feasible, a second qualified reader should assess the support for central claims independently of the development conversation.

The first study should document complete episodes under the proposed workflow. A subsequent comparison could hold the source snapshot, task, agent configuration and available tools constant while varying one component. Comparing explicit knowledge navigation with ordinary agent-led browsing would address the effect of context organization. A separate comparison could examine one agent against bounded delegation, recording additional agent calls, token use and elapsed time so that added processing can be distinguished from the effect of coordination. The persona should be assessed separately, since introducing it alongside additional agents and new retrieval procedures would make the source of any difference unclear.

Repeated use creates learning effects for the researcher, and identical tasks become easier after prior exposure. Comparative work must account for task order and researcher familiarity. Outcomes should include the corrections and maintenance work needed to reach an acceptable contribution. Producing more text or completing more agent actions is insufficient evidence of research benefit.

Each recorded episode includes its outcome as accepted, rejected or unresolved, with the grounds for that judgement. An accepted revision requires a later attempt to use the changed knowledge. Rejected and unresolved contributions retain their evidence, reasons and any remaining questions. This preserves unsuccessful cases in the analysis.

## 7. Organizational scope and limitations

The current design operates at the scale of a researcher and a small agent team. A coordinating agent provides a place to integrate delegated findings and surface questions requiring attention. Whether this reduces the effort of examining concurrent investigations requires observation during use.

Future work could distinguish a team pursuing a shared task from an organization coordinating teams with different responsibilities. A civilization metaphor would add questions about shared institutions and enduring knowledge, while an ant-colony analogy would direct attention to local interactions through a shared environment. These metaphors suggest different mechanisms to investigate. Introducing further organizational levels would require evidence that they help researchers understand and guide the work.

The personal corpus introduces further limits. It reflects the author's projects and documentary habits, and its usefulness depends on the quality of its maintained knowledge. An explicit ownership rule can locate a statement without establishing its truth. Selective reading can miss relevant material, and consistent documents can preserve the same error. Evaluation must therefore examine substantive claims as well as structural integrity.

Public reproduction also has limits. The template exposes the reusable structure through synthetic content, while the researcher's working corpus remains private. The proposed study will need a publishable set of episodes with sufficient source material to inspect central claims. Removing confidential content must preserve the evidential relationships being evaluated. Until such material and its analysis are available, conclusions remain specific to the implemented design and its development checks.

## 8. Conclusion

Second Brain organizes agent-assisted research around maintained knowledge with explicit responsibilities. A personal vault connects concepts and prior reasoning across projects, while project knowledge documents preserve the conditions of implementation and local decisions. Skills guide selective reading and revision, and bounded delegation supplies additional inquiry when the task warrants it. The public template makes this arrangement inspectable and reusable. Its practical value will depend on whether real research episodes preserve the connection between evidence, judgement and later work, including the effort required to maintain that connection.

## References

Cemri, Mert, et al. 2025. [Why Do Multi-Agent LLM Systems Fail?](https://arxiv.org/abs/2503.13657v2) arXiv:2503.13657, version 2.

Jiang, Yucheng, Yijia Shao, Dekun Ma, Sina J. Semnani, and Monica S. Lam. 2024. [Into the Unknown Unknowns: Engaged Human Learning through Participation in Language Model Agent Conversations](https://aclanthology.org/2024.emnlp-main.554/). Proceedings of EMNLP 2024, 9917–9955. DOI 10.18653/v1/2024.emnlp-main.554.

Zhang, Qizheng, et al. 2025. [Agentic Context Engineering: Evolving Contexts for Self-Improving Language Models](https://arxiv.org/abs/2510.04618v1). arXiv:2510.04618, version 1.

The linked project repositories document the implemented methods and artefacts. They are cited as primary implementation sources. Text and documentation are licensed under CC BY 4.0, and repository code under MIT.
