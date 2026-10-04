# Limited article-preview pilot

The pilot adds 11 source-linked cover previews to discovery/feed and article-index cards: 6 ポーカーアカデミー, 3 ポーカー道, 2 AJPC. All existing 1,244 links, 9 sources and slugs remain unchanged. No raw collection, automated collection gate, full-text field, video preview, hero background or decorative editorial image is enabled.

## Data boundary

- `data/article-preview-manifest.json` records exact source/article identity, original image, pixel dimensions, review evidence, and independent source/article enable flags. It states `jp-search-minor-use`, not licensed or permission-confirmed. Original image URLs in this review file are never imported into the browser bundle.
- `public/article-previews/` contains only 11 stripped, nonanimated WebP derivatives, 160px maximum long edge, 34,180 bytes total. Full-resolution preparation downloads were removed after reduction. The original historical collection is unchanged.
- A pure shared lookup requires exact source/slug/original URL and article type. The public static JSON and Worker API emit only `{src,width,height,credit}` for listed assets. D1 image fields are neither selected nor trusted for public projection. Public snapshot re-projection is idempotent.
- The client accepts only local hash-named preview paths and ≤160px dimensions, uses lazy images and visible attribution, links to the original article, and falls back to the existing icon on missing/invalid/broken images. The component caps render size without enlargement. It never contacts an external image host.
- No image proxy or runtime fetching exists. No client URL can trigger a server fetch. Image preparation was a bounded manual review, not a new automated collector. Any future asset addition requires repeat source/exclusion/visual review and a new code review; it cannot silently activate by changing raw data.

## Verification

`node scripts/verify-article-previews.mjs` checks finite scope membership, file hash, WebP container, no metadata/animation chunks, actual raster dimensions and unexpected files. Next configuration performs the same check before building. Both `npm run build` and `npm run build:production` additionally remove suppressed assets and audit the exact enabled output set and byte hashes. `npm run deploy:pages` requires the same export audit. CI runs `npm run verify` with unit, integration and production build checks.

A change of aspect ratio, full-size bytes merely styled small, source access refusals, new rights exclusions, and original-image URLs in public responses are release blockers. The 160px limit is an implementation constraint, not legal clearance.

## Stop or remove a preview

1. For an affected image set `articles[].enabled=false`; for an entire source set `sources[].enabled=false`. The suppressed thumbnail file can also be removed from the current checkout. Keep evidence and original article links unless their independent status changes. Never change `data/publication-scope.json` solely to suppress an image.
2. Rebuild through `npm run build:production`. Disabled previews disappear from JSON/UI and the new `out/article-previews` export. Deploy matching Worker and Pages revisions so anonymous API and site agree. `/article-previews/*` uses `Cache-Control: no-store`; verify the live header and absence of the affected asset/preview.
3. Remove affected files from old retained public deployments where supported and purge the affected production/cache URLs. Check stable production, preview aliases and direct deployment URLs. A new deployment alone does **not** revoke old immutable deployment URLs, public Git history, third-party copies or downloads. Track remaining copies and respond honestly to the requester; use the appropriate hosting/repository controls and required approvals.
4. Rights questions go to the visible `potover39@gmail.com` contact on Terms/Contact. Review promptly; disable while a material complaint is unresolved. Record the decision and basis before re-enabling. No automatic contacting of rights holders is configured.

## Review basis

See [source review](article-image-review.md) and per-asset evidence. This is a narrow implementation of the reviewed Japanese search/minor-use rationale. It does not claim individual licenses, source endorsement, or a universal conclusion for overseas audiences. Official embeds are a different option and are not included in this pilot.
