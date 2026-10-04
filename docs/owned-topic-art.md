# Potover topic illustrations

Eight original raster illustrations were generated for Potover on 2026-10-04 with the built-in OpenAI image-generation tool. No publisher images, artist-name references, logos, text, identifiable people or external-provider image downloads were inputs. The prompt set is [artwork/prompts.json](artwork/prompts.json). The palette follows Potover's existing plum, violet, lavender and ivory artwork context without changing UI theme tokens.

Every selected image was visually inspected. The 1672×941 generated outputs were proportionally downscaled and converted to metadata-free WebP (quality82) with no crop or creative alteration. Project assets are `public/topic-art/{topic}.webp`: 1280×720 each, 364,128 bytes combined. Originals remain in their generated-output location and the reusable WebPs were also saved to the owner's Library. No private Library identifiers or transfer details are part of this repository.

## Classification

This is an image-selection helper, not a claim that all article meaning has been understood. Existing title, source, source link, slug, language, content type and search tags remain unchanged.

Priority: clear mental/learning title words; explicit bankroll title words; clear beginner/rules title clues use General Poker; then tags in this order: preflop → bluff/exploit → flop/turn/river → mtt/icm/spin → cash-game → gto. Anything unmatched uses General Poker. English patterns use word boundaries, so “fundamentals” does not accidentally match “mental”. Japanese patterns use specific terms. No random assignment or source-based guess is used.

Current public snapshot (1,244 records / 9 sources):

| Display topic | Records |
|---|---:|
| General Poker | 394 |
| Preflop | 139 |
| Postflop | 140 |
| GTO & Solvers | 122 |
| Bluffing & Exploits | 126 |
| Tournaments & ICM | 263 |
| Mindset & Learning | 25 |
| Cash Games & Bankroll | 35 |

Selection reasons: tags821, clear mental/bankroll title clues29, explicit beginner/rules title clues19, unmatched fallback375. The 375 unmatched records are not relabeled as basic instruction. The UI marks the artwork as a topic illustration in Japanese and English. Videos use themed artwork as well, not captured video frames or source thumbnails.

## Data and rendering boundary

`scripts/public-articles.mjs` and the anonymous Worker API derive the same `illustration` object from sanitized metadata and `data/owned-topic-art.json`. The object contains only the known topic, first-party path, label and dimensions. Input `imageUrl`, old `preview`, summaries and headings are ignored by public projection. Authenticated internal exports and the 1,406-record raw archive remain unchanged.

`ArticleArtwork` accepts only the eight fixed `/topic-art/*.webp` paths and renders an icon if the descriptor is invalid or the asset fails. It is used by feed cards, EditorPicks, homepage recommendations and the article index. Larger visual frames return without any provider-image loading. The first promo uses General Poker artwork. Topic art does not contact source image servers; existing site hosting, account and advertising behavior is unchanged.

## Release validation and removal

`validateOwnedArtwork` checks exact file names, hashes, actual dimensions, stripped WebP structure and the absence of `article-previews` files. The final export is checked again before publication; stale or mismatched assets fail closed. All new builds omit the former 11 third-party preview files. Historical review evidence was moved under `docs/archive/`, outside app/build inputs.

Changing an illustration requires generating/reviewing the replacement, updating its manifest hash, rerunning tests/build and checking the UI. To temporarily remove an affected artwork, change the fixed mapping to another reviewed generated illustration and rebuild; never substitute a remote URL. Contact/removal enquiries remain available on the site.

A new deployment does not erase old immutable preview deployments, public Git history, cached copies or user downloads. Retiring those requires the corresponding hosting/repository operations. No claim is made that historical copies were removed by this source change.

## Verification record (2026-10-04)

The full local verification passed: 276 unit tests, 50 isolated Worker/D1 integration checks, lint/type checks and production export. Independent read-only review confirmed unchanged public metadata/tags, the raw archive hash, all eight exported assets and zero archived image URL or retired-preview references across 2,559 emitted files. Its one article-index frame finding was fixed with scoped block/aspect-ratio styling and a new focused regression test (9 title/link tests passed). Managed preview visual verification is the remaining release gate.
