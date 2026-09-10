# Handoff: apply Greek-article count corrections to larryherzogjr.com

Date: September 10, 2026  
Owner: Larry Herzog Jr., publishing as Ordinary Means

## Objective

Apply the same six-article factual cleanup prepared for the Ad Fontes NT app-only edition to the source articles on `larryherzogjr.com`. This is a future author-site task. Do not alter the Ad Fontes NT immutable v4 release as part of that task.

## Start here

The author-site repository is expected at:

`/Users/lherzog/Documents/Codex/larryherzogjr`

Before editing, read that repository’s `AGENTS.md`, inspect its Git status, and read:

- `/Users/lherzog/Documents/Codex/ad-fonts-nt/docs/editorial-review/om-count-corrections-2026-09-10/README.md`
- `/Users/lherzog/Documents/Codex/ad-fonts-nt/docs/editorial-review/om-count-corrections-2026-09-10/CORRECTIONS.json`
- `/Users/lherzog/Documents/Codex/ad-fonts-nt/docs/audits/Greek-Explorer-Standalone-Editorial-2026-09-09.md`

Treat these as project context, not as authority to publish. Larry’s future instruction controls whether to prepare, approve, or deploy the author-site changes.

## Required source edits

Apply the ten exact replacements from `CORRECTIONS.json` to these source files under `content/greek/`:

- `anthropos.md`
- `anomia.md`
- `logos.md`
- `pistos-ho-logos.md`
- `pater.md`
- `kyrios.md`

The intended results are:

1. *Ecce homo* is identified as two Latin words.
2. *Hē hamartia estin hē anomia* is identified as five Greek words.
3. *En archē ēn ho logos* is identified as five Greek words.
4. The correct eight-word Greek count in 1 Timothy 1:15 is not transferred to its nine-word English rendering.
5. The Lord’s Prayer discussion calls its three selected units “elements,” because the third is a phrase.
6. *Kyrios Iēsous* is consistently identified as two Greek words, distinguished from the three-word English “Jesus is Lord”; “Lord, have mercy” should not be described as the identical creed.

## Editorial and release safeguards

- Preserve the author site’s existing Scripture edition and quotation policy. These corrections do not authorize replacing NET references or synchronizing the author site with the BSB app edition.
- Preserve existing URLs, titles, headwords, categories, source provenance, and unrelated prose.
- Follow the author repository’s provisional-copy, `COPY-REVIEW.md`, approval-hash, and deployment rules.
- Do not silently overwrite an approved source state. Produce a focused before/after review packet and bind approval to final hashes.
- Run the author site’s required checks, including `make check build`, after approval-ready edits.
- Do not deploy until Larry explicitly approves the exact author-site candidate and requests publication.
- If the approved author-site files are later imported into Ad Fontes NT, create another immutable successor release; never rewrite v3, v4, or the app-only v5 correction release.

## Verification

At minimum, verify:

- all ten old strings are absent and all ten approved replacements are present;
- only the six intended Markdown files changed, apart from required review/approval records;
- internal Greek links, front matter, blockquotes, footnotes, and Scripture quotations are unchanged;
- the generated pages show the corrected wording at desktop and phone widths;
- `make check build` passes;
- any publication uses the established author-site workflow and is checked at the six public article URLs.

## Scope boundary

The originating audit was intentionally narrow: explicit word counts and adjacent language labels across the 250 Ad Fontes article files. It found six definite article-level problems. It was not a comprehensive lexical, historical, theological, or bibliographic re-review of all articles.
