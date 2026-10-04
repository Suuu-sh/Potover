# English interface

The explicit English entry point is `/en/`. Japanese URLs remain at `/` and their existing paths. Both languages share the same UI and state logic under `components/pages/`; route wrappers under `app/(ja)/` and `app/(english)/en/` provide metadata and server-rendered document language. There is no geolocation or browser-language redirect.

## Navigation and content

- The header language link preserves the current path, query, filters, and fragment in its rendered href, including copy-link and modified-click actions. The control is a non-interactive label during the static-export fallback until client URL state is available. It also adjusts a login return destination to the selected locale.
- `LocaleLink` and the locale router preserve locale for internal navigation. Original publisher links and asset/API paths are left untouched.
- Interface language is separate from the saved preferred content language. Signed-out English visitors get English-first recommendations; signed-in users keep their saved preference. Switching UI language does not overwrite preferences.
- Article titles and publisher names are original source data. Language badges explain whether the linked content is English or Japanese. No translated article body, excerpt, extracted heading, or thumbnail is added.
- Glossary and roadmap descriptions are Potover's own copy and have English dictionary entries.
- The approved public projection, publication manifest, collectors, ingestion authorization, source set, and retention gates are unchanged.

## Translation maintenance

`lib/translations/en.json` contains interface copy, `en-learning.json` owned learning copy, and `en-legal.json` faithful policy translations. The original Japanese string is the key. Only display boundaries call `uiText`; stored filter values and source titles are not translated. Add tests when changing dynamic labels, route helpers, or a shared component.

The privacy policy reflects the operator's conditional collection policy: assess each source's terms, robots.txt and access restrictions; collect automatically only where there is no explicit prohibition and restrictions can be followed. Absence of a prohibition is not a license. Collection remains paused until source-by-source assessment and a separate operational activation; this interface change does not enable collection or expand the public manifest. The existing glossary descriptions of equity, odds and PKO have simplifications that should be reviewed separately in both languages.

## Verification and release

Run `npm run verify`, then `node scripts/verify-locales.mjs` against the generated production export. The latter checks all 2,516 content-route HTML files, document language, canonical/hreflang links, sitemap article entries, English/Japanese homepage labels, and the 1,244-article / 9-source public scope. Static generation is limited to two workers to fit smaller build runners.

Before production release, perform browser QA on an authorized preview: desktop/tablet/phone layout, language switching with filters and fragments, search and filter dialogs, article modal close/back behavior, sign-in interruption/retry, original source links, bookmarks/follows, settings, and account-security confirmation. Use isolated test accounts and no production credential changes. A build or draft branch is not evidence that `/en/` is live.
