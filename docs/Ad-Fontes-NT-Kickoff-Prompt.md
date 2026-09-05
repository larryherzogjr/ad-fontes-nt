Begin implementation of Ad Fontes NT in this local project.

Product name: Ad Fontes NT
Subtitle: A New Testament study environment from Ordinary Means.

Read these two files in full before making changes. Look in the project root or docs/:
- Ad-Fontes-NT-Handoff.md
- Ad-Fontes-NT-Implementation-Plan.md

Use the handoff for product scope and editorial principles, and the implementation plan for milestones and acceptance criteria. Distinguish fixed requirements from recommendations and unresolved source assumptions. Do not assume access to earlier conversations. Inspect the existing project and applicable workspace instructions before scaffolding.

Your first implementation objective is to complete the foundation needed for M1 and deliver the M1 working BSB NT reader. Start implementing after a brief explanation of your approach; do not stop at another planning document. Record unresolved later-corpus questions without allowing them to block verified BSB reading work.

Preserve these requirements:
- NT-only, all 27 books, with BSB as the locally stored foundational corpus.
- Canonical, translation-neutral references such as ROM.3.23 and explicit mappings to source identifiers. A verse absent from an edition is different from missing application data.
- Independent corpus adapters; no dependency on a single Bible API.
- A calm, responsive reading experience for serious lay readers and teachers.
- Later comparison of Critical/Eclectic, Byzantine Majority, and Textus Receptus through named editions, not assumed uniform texts.
- Clear separation of Scripture, publisher notes, Ordinary Means commentary, confessional sources, personal notes, and any future AI material.
- Ordinary Means' Lutheran/confessional identity without requiring confessional knowledge to read the NT. Use the exact supplied branding; do not invent existing logos, resources, or endorsed theological explanations.

For this first milestone:
1. Choose and document a practical architecture compatible with the available environment and applicable skills. Keep the application maintainable and avoid unnecessary services.
2. Verify the exact BSB source artifact and rights evidence. Preserve its provenance, release information, checksum, original text, paragraphing, and note distinctions. Import the complete NT reproducibly.
3. Implement the canonical reference registry, reference resolution, and corpus-access interface.
4. Build chapter reading, book/chapter selection, direct passage navigation, previous/next chapter controls, basic English text search, adjustable text size, and reading-position persistence.
5. Verify source fidelity, reference edge cases, keyboard use, mobile layout, search, and reload/deep-link behavior. Use real corpus data rather than invented Scripture or simulated functionality.
6. Maintain a concise README with setup instructions and a project status file with completed backlog IDs, decisions, verification results, and next steps. Add concise project-specific AGENTS.md guidance if appropriate, preserving existing instructions.

Make reasonable reversible decisions and continue autonomously. Ask only when missing information blocks correct progress. Keep this milestone locally runnable; public deployment and paid services are outside this kickoff. Do not add accounts, payments, AI, group workflows, NET/ESV, or OT features. Those belong to later work.

At completion, provide the working preview or exact launch instructions, summarize what works and what was tested, identify any genuine limitations, and name the next milestone. Describe this as the first working milestone, not the finished MVP.
