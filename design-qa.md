# Service landing — character-led revision

final result: passed

User supersedes real screenshots with the established editorial characters.

Latest spacing pass: the hero uses a responsive `clamp(400px, calc(33.333vw + 40px), 620px)` height with tighter intermediate-width padding and a lower image anchor, removing excess space below the characters and keeping them clear of the fixed header. Mobile keeps a 540px editorial composition with the characters anchored to the lower edge and the copy below the header.
- Removed all app captures and preview component/styles.
- Added three matching scenes for searching books, learning together and bookmarking a book. Used in feature stories and roadmap explanation.
- Existing hero, navigation, functional routes and Kiro themes retained.
- Desktop dark 1440×900 and mobile light 390×844 checked in-app: readable text and links, full character scenes, no horizontal overflow. DOM has no screenshot assets and four character scene instances.
- TypeScript and 16 tests passed. No remaining scoped P0/P1/P2 findings.

Assets generated using built-in imagegen and existing public/login/poker-learners.png reference:
- public/service/characters/search.png: bun-haired woman at poker bookshelf holding a book.
- public/service/characters/roadmap.png: glasses male and long-haired female discussing strategy book.
- public/service/characters/saved.png: seated short-haired male reading and inserting bookmark.
Prompts require square, complete figures, white background, black editorial lines, no text/UI/color/gradient, same character identities.

---

# Design QA: glossary card density

- source visual truth: `/var/folders/pw/rpvs3tk500z7b_c5gjyrcyt80000gn/T/TemporaryItems/NSIRD_screencaptureui_stViWX/スクリーンショット 2026-09-21 2.45.12.png`
- implementation URL: `http://127.0.0.1:3000/glossary/`
- implementation screenshot: `/tmp/potover-glossary-implementation.png`
- source pixels: 2466 x 632
- implementation capture pixels: 2560 x 1664; browser chrome excluded from the focused card-grid comparison
- state: glossary page, light mode, all categories selected, 30 terms visible

## Comparison

The reference showed three-column glossary cards with excessive vertical whitespace between the definition and footer. The revised implementation keeps the existing three-column structure, palette, borders, typography hierarchy, and content while reducing the card footprint. The first card measured 376 x 188 CSS pixels after the change, with a 16px definition-to-footer gap; the previous minimum height was 244px with an auto-pushed footer.

## Required fidelity surfaces

- Fonts and typography: existing Potover typography and purple hierarchy preserved; heading and body spacing tightened.
- Spacing and layout rhythm: card padding, top-row spacing, paragraph line-height, footer spacing, grid gap, and minimum height compacted.
- Colors and visual tokens: existing `--color-*` tokens, light-mode surfaces, borders, selected tags, and purple actions preserved.
- Image quality and asset fidelity: no image assets are used in this component; no substitutions introduced.
- Copy and content: term names, definitions, tags, related-article links, search, and category filters remain unchanged.

## Interaction and console checks

- Category filter changed the visible card count from 30 to 4 and restored it to 30.
- No new runtime error was observed after the revised render.

## Comparison history

1. Initial comparison: excessive card height and footer whitespace identified.
2. Revision: minimum height reduced from 244px to 188px, footer no longer pushed to the bottom, and grid gap reduced from 14px to 12px.
3. Post-fix comparison: more terms fit above the fold, card hierarchy remains readable, and category filtering remains functional.

final result: passed
