# Design QA — simplified page headings

- Source visual truth: `/var/folders/pw/rpvs3tk500z7b_c5gjyrcyt80000gn/T/TemporaryItems/NSIRD_screencaptureui_rwfqIT/スクリーンショット 2026-09-02 1.01.57.png`
- Implementation screenshots: `/tmp/headings-home.png`, `/tmp/headings-articles.png`, `/tmp/headings-bookmarks.png`, `/tmp/headings-docs.png`, `/tmp/headings-profile.png`, `/tmp/headings-review.png`, `/tmp/headings-sources.png`, `/tmp/headings-detail.png`
- Cross-route comparison: `/tmp/headings-montage.png`
- Viewport: 1440 × 1000 CSS px, device scale 1
- State: dark theme, default route states

## Full-view comparison evidence

The supplied source showed the unwanted pattern: a decorative uppercase English eyebrow above a very large page title and description. The revised pages remove that repeated eyebrow treatment and use compact Japanese page titles only where route identity is necessary.

## Focused and cross-route evidence

The eight-route contact sheet confirms the hierarchy change across home, article index, bookmarks, search, profile, review, sources, and source detail. Decorative labels such as `CURATED SOURCES`, `YOUR LIBRARY`, `POKER LEARNING`, `CURATED FOR YOU`, `LEARNING MAP`, `AI HAND REVIEW`, `Library`, and `Source profile` no longer occupy page-level heading space. Functional labels such as article sources and review step numbers remain.

## Required fidelity surfaces

- Fonts and typography: page titles use a consistent 32–36px desktop scale and 28px mobile scale; decorative uppercase eyebrows are removed.
- Spacing and layout rhythm: top padding and intro margins are reduced so primary content begins earlier.
- Colors and visual tokens: existing verified light/dark tokens are preserved.
- Image quality and assets: no imagery was changed or replaced.
- Copy and content: route labels are localized where touched (`記事一覧`, `最新の記事`, article counts).

## Findings and comparison history

- Earlier P1: repeated marketing-style eyebrow/title blocks made utility pages feel oversized and redundant. Fixed by removing decorative labels and compacting page intros.
- Earlier P2: English utility headings were inconsistent with the Japanese product. Fixed by localizing the remaining route-level labels.
- Post-fix evidence: `/tmp/headings-montage.png`; no actionable P0/P1/P2 differences remain.

## Primary interaction checks

- Navigation, header search, filters, bookmarks, profile actions, review upload, sources, and detail links remain in place.
- All eight routes rendered in the same dark browser state after the change.

## Follow-up polish

- P3: the home value proposition remains intentionally larger than utility-page titles because it is the landing page’s primary message.

final result: passed
