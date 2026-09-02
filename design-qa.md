# Design QA — Potover learning roadmap

- Source visual truth: `/Users/yota/.codex/generated_images/01a05d15-95f6-7d13-aec6-df621d47f844/exec-a133bbcc-e100-4f4d-8e09-053e7f3579e6.png`
- Implementation: `http://localhost:3000/roadmap/`
- Implementation screenshot: `.playwright-mcp/page-2026-09-02T09-58-13-063Z.png`
- Viewport: 1440 × 1024 CSS px, device scale factor 1
- Source pixels: 1488 × 1059; implementation pixels: 1440 × 1024
- Normalization: full desktop frames compared at equivalent 1.45:1 viewport ratio; app-owned content only, no browser chrome
- State: light theme, Japanese, beginner course, first chapter active, 0% progress

## Full-view comparison evidence

The supplied source and browser-rendered implementation were inspected together. Both use the same three-part course selector, compact course progress header, left chapter index, featured next lesson, line-based lesson syllabus, and restrained Potover blue/navy visual system. Main columns, whitespace, thin separators, and content density align closely with the target.

## Focused-region comparison evidence

The course switcher, chapter index, next-lesson feature, and lesson list were checked at readable scale. Typography hierarchy, active blue state, circular step markers, image crop, row spacing, and arrow affordances are consistent. The implementation uses real collected article imagery and Lucide icons rather than placeholders or handmade assets.

## Findings

No actionable P0, P1, or P2 mismatches remain.

### Required fidelity surfaces

- Fonts and typography: hierarchy, weights, Japanese wrapping, truncation, and small-label optical weight are consistent with the source. Existing project font stack is intentionally preserved.
- Spacing and layout rhythm: desktop grid, gutters, chapter rhythm, dividers, and radii match the source closely. Mobile reflows to a horizontal chapter selector and single-column lesson view without overflow.
- Colors and visual tokens: white, navy, muted blue-gray, bright-blue active states, and green completed states remain semantically consistent.
- Image quality and asset fidelity: the featured lesson uses a sharp, real GTO Wizard Japan article image with correct cover cropping. The source mock's exact thumbnail is illustrative, so real content imagery is an intentional product-data substitution.
- Copy and content: all visible lessons use real Potover article data; course, chapter, progress, duration, and source labels are meaningful.

## Interaction verification

- Course switching tested: beginner → cash course.
- Chapter switching tested inside the active course.
- Article rows and featured lesson are real links.
- Desktop viewport tested at 1440 × 1024.
- Mobile viewport tested at 390 × 844.
- Browser console: 0 errors, 0 warnings after interaction.

## Comparison history

1. Initial implementation had a non-GTO featured image and mixed-source lesson ordering (P2 visual/content mismatch).
2. Fixed roadmap article scoring to prioritize the language-matched GTO Wizard source and available imagery.
3. Post-fix capture shows GTO Wizard Japan as the featured article and throughout the active syllabus; no P0/P1/P2 issues remain.

## Follow-up polish

- P3: The real GTO Wizard Japan thumbnail is more colorful than the dark mock thumbnail, but keeps the requested article imagery and improves content authenticity.

## Implementation checklist

- [x] Faithful responsive layout
- [x] Functional course and chapter switching
- [x] Read-history progress integration
- [x] Real article links and imagery
- [x] Dark mode styles
- [x] Desktop and mobile verification
- [x] Console verification

final result: passed
