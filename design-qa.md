# Header Design QA

## Visual target
Current Home header at desktop width: white 64px bar, Potover lockup on the left, primary navigation in the middle, and bookmark/theme/profile actions fixed on the right.

## Routes checked
- `/`
- `/docs`
- `/review`
- `/profile`
- shared detail routes under `/articles/*` and `/sources/*`

## Findings
- Header height, logo dimensions, horizontal padding, navigation spacing, and action sizes use one authoritative shared rule set.
- Docs search and filters sit below the shared header and no longer resize or replace it.
- Active-route state does not change element dimensions.
- Tablet and mobile breakpoints preserve the same logo and action geometry while hiding primary navigation consistently.
- All routes use the shared `SiteHeader` component.

final result: passed
