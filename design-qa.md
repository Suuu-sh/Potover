# Design QA — horizontal home recommendations

- Source visual truth: `/var/folders/pw/rpvs3tk500z7b_c5gjyrcyt80000gn/T/TemporaryItems/NSIRD_screencaptureui_M56prb/スクリーンショット 2026-09-02 10.26.47.png`
- Implementation screenshot: `/tmp/potover-home-carousel.png`
- Viewport: 1600 × 900 CSS px, device scale 1
- State: light theme, initial home carousel position

## Comparison evidence

The source identified the oversized static marketing hero to remove. The implementation replaces that entire region with a compact, horizontally scrollable editorial rail containing a Potover promotion and recommended articles.

## Required surfaces

- The former headline, hero search, popular keywords, and split illustration are removed.
- The rail exposes multiple recommendations at once and previews the next card.
- Arrow controls and native horizontal swipe/trackpad scrolling both work.
- Cards use real article imagery, source labels, titles, and working links.
- Mobile uses an 82vw snap card so the following recommendation remains discoverable.
- Light and dark theme tokens are covered.

## Findings

- P1: static hero consumed most of the first viewport without surfacing content. Fixed.
- P2: recommendations were previously below the fold and not browsable horizontally. Fixed.
- Post-fix capture found no actionable P0/P1/P2 issue.

final result: passed
