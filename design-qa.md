# Design QA — dark theme consistency

- Source visual truth: `/var/folders/pw/rpvs3tk500z7b_c5gjyrcyt80000gn/T/TemporaryItems/NSIRD_screencaptureui_usWLFw/スクリーンショット 2026-09-02 0.55.04.png`
- Implementation screenshots: `/tmp/dark-home-final.png`, `/tmp/dark-home.png`, `/tmp/dark-articles.png`, `/tmp/dark-bookmarks.png`, `/tmp/dark-docs.png`, `/tmp/dark-profile.png`, `/tmp/dark-review.png`, `/tmp/dark-sources.png`, `/tmp/dark-detail.png`
- Combined comparison: `/tmp/dark-home-comparison.png`
- Cross-route contact sheet: `/tmp/dark-montage.png`
- Primary viewport: 2048 × 874 CSS px, device scale 1
- Cross-route viewport: 1440 × 1000 CSS px, device scale 1
- State: dark theme enabled; default state for each route

## Full-view comparison evidence

The supplied screenshot showed an abrupt white hero-art panel against the otherwise dark navy interface. The revised comparison shows the same source artwork retained but toned into the dark canvas, while preserving card detail and blue accents. Header, hero, article section, and topic section now share a continuous dark hierarchy.

## Focused and cross-route evidence

The eight-route contact sheet was inspected for residual light cards, chips, borders, inputs, empty states, and low-contrast text. Home, article index, bookmarks, search, profile, review, sources, and source detail now use the same navy surface ladder and readable foreground tokens.

## Required fidelity surfaces

- Fonts and typography: unchanged; headings, metadata, body copy, and placeholders retain readable dark-theme contrast.
- Spacing and layout rhythm: unchanged from the verified light layout; no new overflow, clipping, or alignment regressions were found.
- Colors and visual tokens: light-only surfaces were replaced with navy cards, blue-gray borders, accessible muted text, and restrained blue chips.
- Image quality and assets: original hero and article imagery are retained. The hero uses a dark visual treatment rather than replacing or redrawing the supplied artwork.
- Copy and content: unchanged across all routes.

## Findings and comparison history

- Earlier P1: the white hero artwork panel dominated the dark home page. Fixed with a dark overlay and calibrated image filtering; post-fix evidence is `/tmp/dark-home-final.png`.
- Earlier P2: light chips, interest tags, recommendation panels, empty states, and review callouts were inconsistent across dark routes. Fixed with consolidated component-level dark tokens; post-fix evidence is `/tmp/dark-montage.png`.
- Earlier P2: muted metadata and disabled states had uneven contrast. Fixed with explicit dark foreground and disabled-control colors.

## Primary interaction checks

- Theme persistence remains driven by `potover-theme` in local storage.
- Header search, navigation, bookmarks, theme toggle, and profile links remain visible.
- All eight primary routes rendered successfully in the same dark browser state.

## Follow-up polish

- P3: individual article images can receive per-image dark-mode tuning later if a future source image is unusually bright.

final result: passed
