# Service imagery — 2026-09-07

## Art direction and scope

Generated with the built-in `image_gen` tool. The existing hero was supplied as a **style reference only**, not an edit target. New images use near-black and forest-green felt, ivory card stock, tactile linen and restrained mint highlights. They are illustrative still lifes, not screenshots of product functionality.

Main hero is unchanged: `public/banners/potover-midnight-hero.jpg`.
SHA-256: `f64a7fa44e1c4150a199d3a47c5fdbf14b7c0fd0904d67c1a7fdc737e9ec4f1d`.
Official Potover and information-source brand assets are preserved, not regenerated. Old blue banners remain available to the application routes that already use them, but are no longer referenced by ServiceLanding.

## Installed assets

| File (under public/banners/service) | Dimensions | Bytes | Subject |
| --- | --- | --- | --- |
| search.jpg | 1100 × 688 | 186582 | Study sheets, magnifier, cards and chip |
| progress.jpg | 1100 × 703 | 169932 | Four gradually taller chip stacks |
| bookmarks.jpg | 1100 × 688 | 171460 | Charcoal notebook with mint bookmark ribbon |
| study-table.jpg | 1600 × 900 | 312361 | Panoramic arrangement of cards, notebook and chips |

JPEG derivatives use quality 86 (cards) / 87 (banner), with proportional downsampling only; originals are retained. Combined weight: 840335 bytes. Static export has image optimization disabled, so files are optimized before installation. Supporting images keep lazy loading and explicit intrinsic dimensions. Feature slots are 16:10; the banner is framed at 3:1 desktop and 2:1 mobile, retaining the objects inside the crop.

## Source originals

- Search: `/Users/yota/.codex/generated_images/01a07777-523c-7ef2-8620-81ceadab35cd/exec-766460d3-1343-450f-aea7-177846ee06d1.png`
- Progress: `/Users/yota/.codex/generated_images/01a075b8-a593-77e1-a435-93a730b40b52/exec-ba7a7524-750a-4719-a872-a6f2c7484ab5.png`
- Bookmarks: `/Users/yota/.codex/generated_images/01a07777-a932-78e3-962f-a15ea40830f9/exec-97cf76a7-d0d8-4903-87f1-741290b65c34.png`
- Table: `/Users/yota/.codex/generated_images/01a075b8-a593-77e1-a435-93a730b40b52/exec-321e8d24-e495-4951-82eb-996ec096a160.png`

## Prompt set

### Search
Use case: product-mockup. Landscape 1600 × 1000 supporting image for the search feature of Potover, a premium poker-study service. Hero image is mood/material reference only. A neat layered spread of ivory poker study sheets with faint unlabeled lines and diagrams, two ivory playing cards, one forest-green chip and a realistic black metal magnifying glass revealing a spade detail. Deep green felt disappearing into near-black. Elevated three-quarter product photograph, tactile paper and felt, soft contact shadows, central grouping and at least 10% breathing room. Soft warm-neutral key and subtle mint edge illumination. No readable writing, logos, watermarks, people, fake UI, screens, blue, purple, neon or plastic 3D icons.
Finishing edit: preserve entire photograph and change only the tiny lower-right corner suit of the top playing card to an upside-down black spade consistent with the upper-left suit.

### Progress
Use case: ads-marketing. One landscape 1600 × 1000 supporting photograph for Potover. Match the supplied hero's low-key cinematic lighting, black/forest felt, tactile material, pale mint rim light and ivory accents. Four orderly dark forest-green chip stacks with worn ivory edge inlays increase in height left to right along a slight curve, with an ivory face-down card beside the shortest stack. Low three-quarter close-up, real proportions, centered fully within frame with 10% breathing room. Visible detail, soft directional light and clean near-black background. No text, logos, watermarks, charts, blue, purple, arrows, neon, floating UI, plastic icons or people.

### Bookmarks
Use case: product-mockup. One landscape 16:10 photograph, target 1600 × 1000, for the save-for-later feature. Hero is reference for palette, materials and lighting only; do not recreate its laptop. Closed charcoal linen study notebook with a muted mint fabric bookmark ribbon draped onto the table, ivory playing cards partly tucked beneath and exactly two forest-green chips nearby. Premium tactile editorial photography, visible linen weave and paper edges, three-quarter angle, central balanced still life with 10% safe margins. Black/forest backdrop, subdued mint highlights and warm ivory reflections. No text, logos, watermarks, people, hands, extra props, screens, fake UI, blue, purple, neon or glossy plastic 3D rendering.

### Study table
Use case: ads-marketing. A premium panoramic 1800 × 600 photographic banner for Potover. Hero is a color/material/mood reference only; no laptop. Dark green felt poker-study table from an elevated three-quarter angle with three stations left to right: ivory playing cards and two chips; a partially open charcoal linen notebook with blank ivory pages; a deck and taller orderly chip stacks. Continuity through the real felt and lighting, not drawn paths. Balanced wide still life; objects within center 80% of frame and middle 75% of height. Nearly black background with restrained mint highlights, sharp cloth and paper texture. No fake interfaces, text, logos, watermarks, neon, blue, purple, plastic icons, people, cash or trophies.

The generator returned a 1672 × 941 source rather than the requested 3:1 output. The final CSS crop was visually checked at both desktop and mobile sizes; it preserves cards, notebook, deck and chip stacks.
