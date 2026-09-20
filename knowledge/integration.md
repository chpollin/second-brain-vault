# Integration

## Documentary ownership

| Information or operation | Responsible place |
|---|---|
| Developed personal and conceptual knowledge, source readings and cross-project relations | Maintained personal Obsidian vault |
| Project requirements, data contracts, decisions and implementation findings | The relevant repository's `knowledge/` folder |
| Association between a repository and its Project Overview | The vault's Repo Directory |
| Reusable operations over knowledge | Executable skills, reading the relevant documents |
| Current question, proposed interpretation and immediate feedback | Conversation in the active agent host |
| Durable accepted findings | The responsible knowledge document, changed by an authorized session |
| A view of selected work records or a question-specific result | The applicable user interface, retaining its source references |

Together, the vault and linked repository knowledge form a distributed documentary structure. Explicit links and reading instructions make its relations inspectable. This does not imply an implemented automatic knowledge graph, a shared database or automatic retrieval across repositories. An agent must have access to each required location and inspect the relevant source.

## Component boundaries

The [research workflow](research-workflow.md) relates these responsibilities to collaborative inquiry, interface requirements and the examination of later knowledge reuse.

This public template supplies reusable structure and synthetic examples. Its static explorer renders the template and explains which files a task requires. The [public interface demo](interface-demo.md) uses the reviewed generic work and knowledge interface with this template's sources. The real ACTIVE-WORK interface lives in the separate private `active-work-ui` repository and provides views over personal knowledge and work records. Its private snapshots and project-specific readings are excluded from the public distribution.

The separate `second-brain-exporter` prepares read-only context from explicitly selected vault files. Its context manifest records the selected documents. It does not automatically follow references into external repositories. Repository knowledge becomes available to a conversation only through an additional explicit read or separately supplied context within the host's access boundaries. The exporter implements no model API client, dialogue service or scheduler, and it does not upload its output automatically.

The active conversation is where the person and agent interpret selected material, examine evidence and formulate possible additions. A displayed answer or generated proposal does not update canonical knowledge by itself. Write-back belongs to a session authorized for the responsible vault or repository. Loading a personal profile preserves the distinction between confirmed self-description, source evidence and generated interpretation.

The public [persona template](../Vault%20Operations/Templates/Template%20Research%20Persona.md) and [persona-init](../.claude/skills/persona-init/SKILL.md) support a new owner's own profile. The source owner's personal Research Persona is unpublished and is not an installation dependency.

## Maintenance and distribution

The maintenance source is `knowledge-structures/second-brain-vault`. The separate public `second-brain-vault` repository receives selected snapshots from that source. The [published explorer](https://chpollin.github.io/second-brain-vault/) represents its deployed snapshot. Local changes, synchronization and publication are separate operations.

Distribution includes the explorer source, the audited generic demo core and `.github/workflows/pages.yml`. The workflow builds the ignored `docs/data.json` and `docs/demo/` from the checked-out public template, then deploys the checked `docs/` artifact on a push to `main` or a manual run. Repository Pages settings must select GitHub Actions for this workflow to own deployment. Successful local checks do not establish that the remote workflow ran or that its artifact is live.

The maintained personal vault remains the place where its own rules are used and revised. The initial template was derived manually. The maintenance repository's derivation script transfers a committed template snapshot into the public clone without publishing the private source history. Whether future transfer of rules from the personal vault should be automated, or the template should become the upstream source for personal instances, remains an operator decision. Template-specific skill corrections do not automatically install into the personal vault.

The exporter and template are separate subprojects in the maintenance repository. Neither belongs to its parent paper's assertion chain. This template can be cloned independently and reads no private sibling repository at runtime.
