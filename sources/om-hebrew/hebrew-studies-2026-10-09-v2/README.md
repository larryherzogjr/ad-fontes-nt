# Hebrew studies · BSB adaptation

Larry requested removal of NET references from Ad Fontes and replacement with Berean Standard Bible references on October 9, 2026. This release applies that bounded request to all seven Hebrew articles. The author's website checkout is read-only and was not changed.

The predecessor `hebrew-studies-2026-10-09-v1` retains the exact original published article bytes and its original authorization. This successor stores adapted articles separately. `sourceSha256` identifies the original; `contentSha256` identifies the adapted Markdown, including frontmatter. Existing titles, author attribution, URLs and lemma keys are retained.

`changes.json` records every exact replacement and its reason. `quotations.json` records 34 full-verse quotations and excerpts verified against the pinned official `sources/bsb/raw/bsb.txt` authority. The manifest pins that authority, both evidence ledgers, adapted articles and all generated outputs. The importer reconstructs each adaptation from its preserved original and refuses undocumented changes or a remaining NET label.

The 37 replacements include ten block quotations, inline Scripture excerpts, translation-dependent explanations and removal of three NET translator-note recommendations. In particular, Job 16:20–21 now uses BSB's “My friends are my scoffers” and the following plea, rather than attributing the predecessor's intercessor reading to BSB. Job 19:25 explains BSB's “in the end”; Job 9:33 uses “mediator.” No NET notes are relabeled as BSB notes. Hebrew lexical glosses, alternate Hebrew/Greek readings and authored theological commentary remain distinct from direct BSB quotations. This request does not establish a new scholarly approval of those retained interpretations.

The web article provider and desktop asset allowlist select this release. Historical source records are retained for reproducibility; they are not active reading content. Clean production web builds exclude pre-existing generated `app/public/om` directories via `.dockerignore` and regenerate only active collections. Desktop staging includes only its explicit release allowlist.
