# Potover color theme

## Source of truth

The user requested an exact match to Kiro White/Light and Dark on 2026-09-08.
Use **Kiro Light** and **Kiro Dark**, the built-in themes declared by the official Kiro IDE 1.0.437 theme-defaults extension. This is not the Kiro marketing website palette or a community imitation.

- Upstream: https://kiro.dev/downloads/
- Official theme selection: https://kiro.dev/docs/ide/setup/
- Exact archive URL, upstream paths and per-token source keys: `lib/kiro-theme.json`.
- The sole editable palette: `lib/kiro-theme.json`.
- Generated runtime variables: `app/theme.css`. Run `npm run theme:generate` after a deliberate source update; `npm run theme:check` detects drift.
- Component CSS must use semantic `--color-*` variables, never literal colors or additional per-page palettes.

## Mapping

| Potover role | Kiro source | Light | Dark |
| --- | --- | --- | --- |
| Page canvas | editor.background | #f2f1f4 | #211d25 |
| Card/dialog/input | editorWidget.background / input.background | #ffffff | #28242e |
| Header/toolbar | activityBar.background | #eae8ed | #28242e |
| Primary text | foreground | #352f3d | #ffffff |
| Secondary text | icon.foreground | #5e5966 | #c1bec6 |
| Borders | input.border | #c1bec6 | #4a464f |
| Link/accent | accent | #7138cc | #b080ff |
| Primary button | button.background | #7138cc | #7138cc |
| Button hover | button.hoverBackground | #6432b3 | #8e47ff |
| Selected row | list.activeSelectionBackground | #eae8ed | #352f3d |

All UI values are copied exactly, including Kiro's alpha values; no sampled or invented color approximations. Page regions are mapped by their role because Potover is not a code editor. Existing layout, type, content, images and behavior remain Potover's, not a clone of the Kiro IDE layout.

## Coverage and exceptions

Learning routes, search, filters, menus, article modal, roadmap/read states, bookmarks, profile, authentication, service landing UI/previews, and footer share the palette. The existing `potover-theme` key and header toggle are retained, defaulting to Light. The landing page follows that saved selection without adding controls.

Article images, vendor logos and existing hero artwork keep their original colors. Text directly over dark artwork uses Kiro Dark foreground and overlay values in both modes (`sourceMode: dark`), not the Light overlay. Semantic errors/success/warnings use Kiro's matching status tokens rather than painting every status purple. Do not recolor artwork with CSS filters.

This replaces the old Refero/blue, monochrome-violet and plum override palettes. Flat component surfaces avoid stacking old tinted shadows; dialogs retain Kiro's widget shadow color. No external deployment is part of this change.
