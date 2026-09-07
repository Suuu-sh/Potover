# Compact learning section — 2026-09-07

Scope: replace two-column heading / vertically stacked steps with a full-width heading followed by three equal desktop columns. Reduce section padding from 100px to 64px, and mobile padding to 40px. Mobile retains one column with 20px gaps.

TypeScript passed; Vitest 5/5 passed; diff whitespace check passed. Mobile 359px rendering inspected successfully. Desktop screenshot verification is blocked: browser viewport override continued reporting 359px after requesting 1280px. Desktop grid rule verified in source, not visually verified. No functionality or copy changes.

final result: blocked (desktop visual verification only)

# Application palette — 2026-09-08

Scope: unify the product app (home, search, roadmap, bookmarks, profile, auth and review surfaces) around near-black / paper-white monochrome surfaces with violet as the single accent. Product artwork is desaturated and shifted toward cool violet; the marketing landing page remains scoped and unchanged.

Visual QA: dark and light home states, search, roadmap and bookmarks checked in the running local app. Header, cards, progress indicators, controls, footer and empty state use the monochrome + violet treatment, while article/video artwork intentionally retains its source colors.

TypeScript passed; Vitest 5/5 passed; production build passed with existing autoprefixer compatibility warnings; diff whitespace check passed.

final result: passed

# Purple surface depth — 2026-09-08

Scope: remove near-black app surfaces from dark mode and replace them with layered plum/violet tones for the canvas, header, cards, controls, dialogs and footer while preserving readable contrast.

Visual QA: dark search and roadmap views checked in the running local app; no pure-black product surface remains in the themed app chrome.

final result: passed

# Read-state contrast — 2026-09-08

Scope: replace the black read-state treatment with a soft violet surface, violet edge indicator and check badge while preserving full-color article artwork.

Visual QA: read rows checked in dark and light search views and in roadmap lesson lists. The state is distinguishable without reducing image opacity or introducing a second accent.

final result: passed

# Filter rail violet accents — 2026-09-08

Scope: replace black selected-filter treatments in the search sidebar with the app's violet palette in both light and dark modes.

Visual QA: light and dark search views checked in the running local app. The active 「すべて」 tile, check badge and 「詳細な絞り込み」 action now use violet surfaces with readable contrast.

final result: passed
