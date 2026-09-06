# Service supporting-image refresh QA — 2026-09-07

## Source and scope
- User authorized direct installation of new supporting images while keeping the main hero unchanged.
- Style source: `/Users/yota/Projects/Products/Potover/public/banners/potover-midnight-hero.jpg`, 1654 × 951. Main hero SHA-256 before/after: `f64a7fa44e1c4150a199d3a47c5fdbf14b7c0fd0904d67c1a7fdc737e9ec4f1d`.
- Asset originals, prompts, dimensions and optimized paths: `docs/design/service-imagery.md`.
- Four replacements only: three feature photographs and one roadmap table photograph. Hero markup/CSS/asset, official logos, copy, links, header and scroll behavior are unchanged.

## Evidence and comparison
- Desktop: 1280 × 800 CSS px. `/tmp/potover-imagery-features-desktop.png` and `/tmp/potover-imagery-roadmap-desktop.png`.
- Mobile: 390 × 844 CSS px. `/tmp/potover-imagery-features-mobile.png` and `/tmp/potover-imagery-roadmap-mobile.png`.
- The hero style reference and desktop feature screenshot were opened in the same comparison input. The banner source and its desktop screenshot were opened together in that input too. This compares material/palette and framing, not a pixel-identical new page mockup.
- Screenshot dimensions match the listed CSS viewport dimensions (1:1). Image originals scale into the measured slots; no page-wide density normalization was applied. Desktop feature images render approximately 347 × 216 and banner 1150 × 382. Natural dimensions were read from loaded DOM images.
- Full-section review confirms consistent photographic materials and green/black palette. Focused banner review confirms all study objects remain inside desktop crop. Mobile images were visually inspected after rendering; no horizontal overflow.

## Findings and adjustments
- Initial incompatibility: old 3:1 feature slots would clip the new 16:10 still lifes. Updated feature slots and intrinsic dimensions before the first rendered comparison; removed blue media backgrounds and saturation filters.
- Typography: unchanged Manrope/Noto Sans JP system, hierarchy and copy. Text sits below feature photos, not on top of busy subjects.
- Layout: existing three-column desktop / single-column mobile grid preserved. Taller feature photographs are intentional so objects remain legible. No stretched or distorted imagery.
- Palette/tokens: near-black, forest green and ivory photographs now match the hero. Media fallback backgrounds changed from blue to forest. Official source brand graphics remain originals.
- Image quality: JPEG derivatives retain readable material detail, have no placeholder UI, and load with explicit dimensions. Banner framing preserves all primary objects on desktop and mobile. Generated details are illustrative, not instructional charts.
- No actionable P0/P1/P2 findings remain in the scoped image replacement.

## Verification
- TypeScript passed.
- Vitest: 5 tests across 3 files passed.
- Production static export passed (1376 pages) in `/tmp/potover-imagery-qa.bfJyo2`, not in the live development directory. Existing globals.css autoprefixer warning is unchanged.
- All four new images loaded successfully; total installed size 840335 bytes. No horizontal overflow at 1280 or 390 widths.
- Image-bearing search link navigated to `/docs/` and rendered the real 1362-item content listing.
- Browser captured error log query returned an empty list after mobile review.
- Hero checksum and code diff confirm main hero unchanged. Its existing mobile text overlay is retained.
- Existing bookmark persistence and login were not re-tested; no related code changed.
- Local application remains running on http://localhost:3000/.

final result: passed
