# Design QA — compact global header search

- Source visual truth: `/var/folders/pw/rpvs3tk500z7b_c5gjyrcyt80000gn/T/TemporaryItems/NSIRD_screencaptureui_tPsGTX/スクリーンショット 2026-09-02 0.49.44.png`
- Implementation screenshot: `/tmp/potover-header-search.png`
- Combined comparison: `/tmp/potover-header-comparison.png`
- Viewport: 1440 × 420 CSS px, desktop, light theme, home route
- Source pixels: 2400 × 138; normalized to 1440 × 83 for comparison
- Implementation pixels: 1440 × 420 at device scale 1; header region compared at 1440 × 120
- State: default header, empty search field

## Full-view comparison evidence

The combined comparison confirms the intended Zenn-like hierarchy: brand at left, compact navigation, a restrained rounded search field toward the right, then utility actions. Potover keeps its own logo, blue tokens, navigation labels, and existing utility controls rather than copying Zenn-specific product actions.

## Focused header evidence

The header region was compared at full readable size. Search icon, placeholder, field border, radius, vertical alignment, submit affordance, and spacing to utility controls are visibly consistent. The smaller search width is intentional because the user requested a small field and Potover retains three navigation links.

## Required fidelity surfaces

- Fonts and typography: existing Noto Sans JP is retained; placeholder and control weights match the compact editorial hierarchy.
- Spacing and layout rhythm: 64px header, 40px search control, aligned icon/input/button, and balanced desktop gaps pass.
- Colors and visual tokens: neutral white/gray surface with Potover blue focus and action colors pass in light and dark token mappings.
- Image quality and assets: the existing Potover raster logo is preserved; Lucide supplies the standard search icon. No placeholder or CSS-drawn asset is used.
- Copy and content: Potover-specific placeholder and search action are clear and route to the existing article search.

## Findings

No actionable P0, P1, or P2 differences remain. The implementation intentionally adapts the reference rather than cloning Zenn branding or publishing controls.

## Primary interaction checks

- Search form submits `q` to `/docs`.
- Existing navigation, bookmarks, theme toggle, and profile links remain intact.
- Search collapses below the tablet/mobile breakpoint to protect the compact header.
- No new console-affecting runtime logic was introduced.

## Comparison history

- Initial implementation: passed visual comparison; no P0/P1/P2 fixes required.

## Follow-up polish

- P3: a mobile search icon could be added later if header search is desired below 900px.

final result: passed
