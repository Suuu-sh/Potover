# Potover service landing design QA — 2026-09-06

## Source and scope
- Selected visual: /Users/yota/.codex/generated_images/01a075b8-a593-77e1-a435-93a730b40b52/exec-d324d1a0-a371-494b-a951-fd3afe3f3b2c.png (option 1).
- Implemented root service page; existing application routes and global styles retained through route-specific SiteChrome.
- Latest user adjustment: fit the whole desktop hero image within the first viewport and fix the header during scrolling.
- Hero source: /Users/yota/.codex/generated_images/01a075d7-bf92-7d42-a46e-841e6a0a2ac2/exec-190c5e0e-ecd1-4063-8641-1b58a1f73cb4.png. JPEG derivative: public/banners/potover-midnight-hero.jpg (1654 × 951).

## Visual comparison and iterations
- Selected reference and desktop implementation were inspected together. Initial photographic crop clipped the laptop/cards; changed the image sizing to contain.
- Latest user screenshot (2560 × 1360) and /tmp/potover-service-fit.png (1280 × 680) were inspected together, normalized at 0.5 source scale.
- Final desktop hero bounds: top 0, bottom 680. Image bounds: top 100, bottom 680, height 580; object-fit contain preserves the whole image without stretching.
- Header is fixed, with opaque dark backing and subtle border. After scrolling to scrollY 1568 its top remained 0.
- FAQ anchor lands below the fixed header; heading is unobscured.
- Mobile 390 × 844 inspected; no horizontal overflow. Evidence: /tmp/potover-service-mobile-fixed.png. Mobile retains a stacked composition and responsive photo crop rather than shrinking the full desktop composition.
- Dark/mint palette, Japanese typography, hierarchy, CTA, photographic asset, spacing and navigation reviewed. No remaining actionable P0/P1/P2 visual issues in scope.

## Functional and automated checks
- Primary CTA opens /docs with the original application header and content list.
- FAQ navigation and native disclosure expansion work.
- Mobile menu open, Escape close and focus return verified during implementation.
- Roadmap links match actual existing course anchors.
- Product copy describes search, external content, roadmap and browser-local bookmarks; it does not claim a solver or cross-device bookmark sync.
- TypeScript check passed.
- Vitest: 5 tests across 3 files passed with cache disabled.
- Production build passed, generating all 1376 static pages in an isolated build directory to avoid disrupting localhost.
- Saved-item persistence not re-exercised; existing bookmark implementation remains unchanged.
- Local preview remains running at http://localhost:3000/.

final result: passed
