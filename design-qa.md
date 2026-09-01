# Design QA — bookmarks article feed

- Source visual truth: `/var/folders/pw/rpvs3tk500z7b_c5gjyrcyt80000gn/T/TemporaryItems/NSIRD_screencaptureui_vBlPWy/スクリーンショット 2026-09-02 1.02.32.png`
- Implementation screenshots: `/tmp/potover-bookmarks.png`, `/tmp/potover-docs.png`
- Viewport: 1600 × 900 CSS px, device scale 1
- State: dark theme; two saved articles on `/bookmarks/`; default feed on `/docs/`

## Comparison evidence

The supplied screenshot identified two changes: remove the oversized `YOUR LIBRARY / ブックマーク` intro and make saved items identical to the article blocks on `/docs`. The implementation screenshot confirms that saved content begins with the compact count toolbar and uses the same cover, source, title, summary, tags, metadata, bookmark action, and external-link action as `/docs`.

## Required fidelity surfaces

- Hierarchy: the decorative bookmark heading and description are removed.
- Component parity: `/bookmarks/` and `/docs/` render the shared `ArticleFeedRow` component.
- Spacing: bookmarks retain the library page width while the shared rows keep the docs feed rhythm.
- Theme: row borders, copy, tags, controls, and the local-storage note all use the established dark tokens.
- Responsive behavior: the existing docs feed breakpoints now apply to saved rows as well.

## Findings and history

- P1: bookmarks used a separate text-only row that visually diverged from `/docs`. Fixed by extracting and reusing one article-feed component.
- P2: the large bookmark intro delayed access to saved content. Fixed by removing it and tightening the page top spacing.
- P2: desktop docs scrolling constraints could clip a reused feed outside `/docs`. Fixed with bookmark-scoped height and overflow overrides.
- Post-fix visual comparison found no actionable P0/P1/P2 differences.

## Primary interaction checks

- Saved bookmark state renders correctly.
- Bookmark removal control and original-article link remain present.
- The `記事を探す` route back to `/docs` remains visible.

final result: passed
