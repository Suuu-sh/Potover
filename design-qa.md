# Service landing — character-led revision

final result: passed

User supersedes real screenshots with the established editorial characters.

Latest spacing pass: the hero uses a responsive `clamp(400px, calc(33.333vw + 40px), 620px)` height with tighter intermediate-width padding and a lower image anchor, removing excess space below the characters and keeping them clear of the fixed header. Mobile keeps a 540px editorial composition with the characters anchored to the lower edge and the copy below the header.
- Removed all app captures and preview component/styles.
- Added three matching scenes for searching books, learning together and bookmarking a book. Used in feature stories and roadmap explanation.
- Existing hero, navigation, functional routes and Kiro themes retained.
- Desktop dark 1440×900 and mobile light 390×844 checked in-app: readable text and links, full character scenes, no horizontal overflow. DOM has no screenshot assets and four character scene instances.
- TypeScript and 16 tests passed. No remaining scoped P0/P1/P2 findings.

Assets generated using built-in imagegen and existing public/login/poker-learners.png reference:
- public/service/characters/search.png: bun-haired woman at poker bookshelf holding a book.
- public/service/characters/roadmap.png: glasses male and long-haired female discussing strategy book.
- public/service/characters/saved.png: seated short-haired male reading and inserting bookmark.
Prompts require square, complete figures, white background, black editorial lines, no text/UI/color/gradient, same character identities.
