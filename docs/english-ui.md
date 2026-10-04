# Interface languages on shared URLs

Japanese and English use the same URLs, including `/`, `/explore/`, and article pages. The first client render selects Japanese when the browser's primary language is Japanese (`ja` or `ja-*`), and English otherwise. A manual choice takes priority and persists in this browser's local storage under `potover.interface-language`. The choice also synchronizes across tabs. If storage is unavailable, switching still works for the current page session.

The header language button changes the interface in place. It does not navigate, create a history entry, or rewrite the current path, query, filter parameters, fragment, or sign-in return destination. Shared page components remain mounted so input state is retained. Language is a browser preference, so copying a page URL does not encode the sender's chosen interface language.

## Rendering and discovery

The static export provides Japanese HTML as the no-JavaScript and hydration fallback. The browser applies its selected UI language after hydration and updates the document language and page title. There is one canonical URL and one sitemap entry per public page. Separate language-path hreflang alternatives are not advertised because these are not separate pages.

Previously shared `/en` URLs are compatibility redirects declared in `public/_redirects` for Cloudflare Pages. They lead to the unprefixed URL; the browser preference still determines the interface language. Known pages have explicit redirects, and article redirects always start with the literal `/articles/` prefix, keeping malformed input from creating an external destination. Redirect query/fragment preservation must be checked on a Pages preview because the Next development server does not interpret this file.

## Content and state

- Interface language is separate from saved preferred content language. Signed-out English visitors get English-first recommendations; signed-in users keep their saved preference. Switching UI language does not overwrite account preferences.
- Article titles and publisher names remain original source data. Language badges identify whether the linked content is English or Japanese. No translated article body, excerpt, extracted heading, or thumbnail is added.
- Glossary and roadmap descriptions are Potover's own copy and have English dictionary entries.
- The public projection, publication manifest, collectors, ingestion authorization, source set, and retention gates are unchanged.

## Translation maintenance

`lib/translations/en.json` contains interface copy, `en-learning.json` owned learning copy, and `en-legal.json` policy translations. The original Japanese string is the key. Only display boundaries call `uiText`; stored filter values and source titles are not translated.

The privacy policy reflects the operator's conditional collection policy: assess each source's terms, robots.txt and access restrictions; collect automatically only where there is no explicit prohibition and restrictions can be followed. Absence of a prohibition is not a license. Collection remains paused until source-by-source assessment and a separate operational activation. The existing glossary descriptions of equity, odds and PKO have simplifications that should be reviewed separately in both languages.

## Verification and release

Run `npm run verify`, then `node scripts/verify-locales.mjs` against the generated production export. The latter checks all 1,258 shared content-route HTML files, canonical links, the 1,253-entry sitemap, legacy redirects, and the 1,244-article / 9-source public scope. Static generation is limited to two workers to fit smaller build runners.

Before production release, check an authorized Pages preview: first-visit language, both switch directions on the same URL, reload persistence, browser preference override, query/filter/fragment preservation, form-state retention, original article links, legacy `/en` redirects, responsive navigation, and signed-out sign-in destinations. Do not use production-account mutations for UI QA. A local build or preview is not evidence that the revision is live in production.
