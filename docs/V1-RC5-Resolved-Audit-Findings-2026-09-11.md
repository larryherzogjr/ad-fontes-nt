# Ad Fontes NT 1.0.0-rc.5 resolved-audit candidate

Date: 2026-09-11  
Status: corrected cross-platform rebuild in progress; web content deployed, desktop packages not yet published

Larry Herzog Jr. approved exact candidate-manifest SHA-256 `58cab201852f955de95af4ee2a3531a4f03708e867a0183bc884651a752792d8`. Promotion created immutable article release `om-studies-2026-09-11-v7` and refreshed the approval record for comparison unit `candidate-18`.

The content changes resolve the five findings deliberately held out of the preceding full-corpus audit release:

- `AUDIT-062`: use the supplied absolute author-site destination in Hades;
- `AUDIT-063`: remove the unidentified *The Knowledge of Him* reference in Epiphaneia;
- `AUDIT-064`: identify Nestle 1904, Robinson–Pierpont and the displayed Textus Receptus edition separately in Eusebeia;
- `AUDIT-065`: identify “for you” as the intended two-syllable phrase in Hyper;
- `AUDIT-086`: limit candidate-18's Textus Receptus description to the Stephanus, Elzevir and Scrivener basis documented by C7.

No Scripture, corpus mapping, lexical bundle, account behavior, source website, production service, public Downloads-page link, or existing RC4 binary changes. Because v7 changes future desktop bundle bytes, the coordinated local application version advances to `1.0.0-rc.5`; RC4 remains the public version until RC5 native artifacts pass the established signing, runtime-test, exact-manifest approval and publication gates.

## Desktop rebuild note

The first signed artifacts from source commit `ee8d472ef62345b2d2833e26ffa7c83472bce144` passed platform verification but exposed stale RC4 wording on the shared offline Sources page. They and combined manifest SHA-256 `755f05ab94e72b2ff3115675c0c26e54df2474541b68122bab2bd5cb247ecd6f` are superseded before publication. The corrected rebuild must produce new platform artifacts and a new exact manifest for approval.
