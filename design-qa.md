# Service landing — shared character identity and real app previews

final result: passed

Scope: remove violet glass-card hero; reuse user-approved login characters; replace fictitious app previews with captures from actual public app UI.

- Hero uses the same poker learner artwork as login, with neutral theme-aware blending. Initial black backdrop in dark theme fixed by giving the isolated hero its canvas background; recaptured successfully.
- Real UI captured from /docs, /roadmap and /bookmarks at 1280×820 in both themes. Logged-out state; bookmarks empty, no personal saved content. Static captures, not live embeds. Existing feature links open the corresponding live app routes.
- Larger two-column feature cards make the real UI legible. Mobile stacks preview and description.
- Desktop 1440×900 hero and feature section visually checked; mobile 390×844 has no horizontal overflow or overlapping copy. Mobile whitespace tightened after review.
- Typography/content and Kiro colors retained. Unsupported sample titles and artificial toolbar removed. FAQ corrected to match actual login-required bookmark saving.
- Old unreferenced hero assets removed; no personal screenshots or credentials included.
- TypeScript and 16 unit tests passed. Reference is a directed revision of the existing landing page, not a pixel clone of the supplied before screenshots.
