# Hebrew Library study pages — October 15, 2026

AF-UI-014 addresses Larry’s screenshots of inconsistent Library behavior: Greek authored studies opened as pages while Hebrew authored studies opened in dialogs.

Hebrew Explorer “Read study” now opens `/library?view=hebrew&article=tam` (and the other six released studies) in the same full-page reading layout as Greek articles. The collection selector and Explorer return stay visible. Query, page, source lemma and Scripture-return parameters survive the detail link; returning restores the saved scroll and study-link focus when session storage is available. Direct links, reload and browser history work. Missing studies show an explicit message and a working return link.

The page loads the pinned `hebrew-studies-2026-10-09-v2` article and checks its schema, release, slug and content hash against that release’s index. Markdown, source bytes, editorial approvals and immutable search assets are unchanged. BSB quotations and authored commentary remain distinguished from OSHB analysis. Reader/sidebar `SavedStudyLink` dialogs remain intact. Internal Hebrew article links stay in the Library; external HTTPS links retain external behavior.

Validation: typecheck; web build (181 application tests and 50 Python/source tests); keyboard activation; filtered results and page 2 return; browser Back; direct-link reload; selected H8535 and Scripture-return preservation; missing article; Greek full-page regression; actual Hebrew reader study dialog and return; 320px without horizontal overflow. Screenshots: `artifacts/review/hebrew-library-pages/desktop.png` and `phone.png`. Final web preview browser log has no captured warnings/errors. Offline frontend build passes with 61,463 staged files and all 15 desktop tests. Browser verification against the built offline frontend confirms card → full page → contextual return and direct-link reload, with no captured warnings/errors.

Local review only, still version 4.1.3. No commit, push, production deployment, signed native build or native-device claim. Existing AF-UI-008–013 local changes are preserved.
