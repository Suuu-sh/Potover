# Login redesign — option 3

final result: passed

## Target and evidence
- Selected visual: third displayed login proposal, `exec-e836e9bf-5634-465e-9a1f-7a2dcec2a4b8.png` (1487×1058).
- Local route: http://localhost:3000/login/.
- In-app browser captures: desktop dark 1487×1058, mobile dark 390×844, tablet light 900×900. Desktop reference and implementation were emitted together for visual comparison. Screenshot capture uses CSS viewport dimensions; browser preview rendering may soften text, so no pixel-level antialiasing claim is made.
- No screenshots containing autofilled account fields are committed.

## Findings and fixes
- P2, initial mobile: copy overlapped the central dark sculpture at 240px hero height. Increased mobile hero to 360px and adjusted crop to 60%. Recapture places copy over the pale floor with legible dark text.
- No remaining P0/P1/P2 findings in the scoped login redesign.

## Required fidelity surfaces
- Typography: existing product sans for functional UI; system Japanese Mincho for artwork headline. Hierarchy, two-line artwork copy and form order match. Minor font-size differences from the generated mock are accepted P3; real fonts remain accessible/selectable.
- Layout: 55.5/44.5 desktop split, approximately 100px form inset, centered form, underlined mode controls, pill submit. At tablet widths retain split; mobile stacks artwork above form. No horizontal overflow at 390 or 900px.
- Colors: existing Kiro semantic tokens used throughout. Dark canvas and purple actions match the direction; light mode follows saved product theme. No new UI palette.
- Image: generated standalone portrait with purple spade, three chips, ribbon, pale architectural backdrop; sharp original asset and intentional cover crops. Real image, not code-drawn art.
- Copy: selected mock headline and artwork copy reproduced. Existing registration copy and bookmark login notice retained.

## Intentional product constraints
- Shared application header/footer retained rather than replacing them with the illustrative mock header.
- Login input backgrounds and solid CTA use existing Kiro tokens, not the mock's texture/gradient.
- Browser autofill may populate fields; credentials were not submitted or saved during testing.

## Interaction and validation
- Login/register toggle changes heading and submit label.
- Password visibility toggles input type and accessible button label.
- Bookmark reason notice verified with next destination query preserved.
- Existing login/register handlers retained; server authentication not exercised with real credentials.
- TypeScript passed; theme generation check passed; 16 unit tests passed.
- Browser had no runtime errors; existing unrelated autoprefixer warnings remain.

## Asset provenance
- Saved asset: public/login/spade-gallery.png.
- Built-in imagegen, reference-driven standalone artwork generation.
- Prompt: Recreate reference illustration as portrait (~824:986): monumental dark-purple metallic spade on pale lavender marble plinth, exactly three floating purple poker chips, translucent lavender ribbon, airy classical architectural hall, soft daylight. Match reference materials, lighting, placement. Main objects in upper 75%; calm pale marble floor below for HTML copy. Edge-to-edge; no words, logos, watermark, header, navigation, buttons, form, frame, or dark right panel.

## Checklist
- [x] Selected reference implemented in existing app
- [x] Asset saved in project
- [x] Superseded global auth selectors removed
- [x] Desktop/mobile/light/dark checked
- [x] Existing auth integration preserved
