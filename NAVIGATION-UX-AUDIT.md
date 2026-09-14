# Navigation UX Audit — ALLROUND DIRECT

## Router

- **React Router v7** via `BrowserRouter` in `src/main.tsx` (not `createBrowserRouter`).
- Routes declared in `src/App.tsx` with `Routes` / `Route`.
- No Data Router `ScrollRestoration` available; custom history-aware manager used instead.

## Issues found

1. **Critical:** Navigating after scrolling (e.g. homepage bottom → `/vloeren`) left the new page at roughly the previous scroll Y. No app-wide scroll reset on PUSH.
2. Browser back/forward did not restore prior listing scroll positions.
3. Body scroll lock used raw `document.body.style.overflow` in mobile menu and product lightbox (fragile with nested overlays / route changes).
4. Mobile menu did not close on pathname change if navigation bypassed `onClose`.
5. Catalog pagination / filter / sort did not scroll to the product listing region.
6. Sticky header offset was not centralized (`scroll-margin` / programmatic scroll).
7. Cookie preferences dialog did not lock body scroll.
8. Admin mobile drawer had no body lock / no close-on-route-change.
9. Checkout validation used `scrollIntoView` without sticky-header awareness.

## Issues fixed

| Area | Fix |
|------|-----|
| Central scroll | `src/lib/scroll.ts` — header offset CSS var, `scrollToTop` / `scrollToElement` / `scrollToHash`, refcounted `lockBodyScroll`, position store |
| History-aware restore | `src/components/navigation/ScrollManager.tsx` — PUSH/REPLACE → top (or hash); POP → restore by `location.key`; same-path query → leave document scroll for catalog |
| Manual history | `history.scrollRestoration = 'manual'` while app runs |
| Mount | `ScrollManager` mounted once in `App` (storefront, checkout, admin) |
| Mobile menu | `useBodyScrollLock` + close on `pathname` change in `Header` |
| Lightbox / cookies / filters / admin drawer | Shared body scroll lock + cleanup on unmount / route change (`unlockAllBodyScroll`) |
| Catalog | `#catalog-results` + scroll to listing on search-param changes (page/filter/sort) |
| PDP anchors | `#specificaties` / `#bezorgen` + hash opens the matching tab |
| Checkout | Validation / review “edit” scrolls via `scrollToElement` |
| A11y | Focus `#main` on new PUSH navigations (`:focus-visible` only); skip focus on POP |
| 404 | Adds “Bekijk assortiment” CTA |
| CSS | `--app-header-offset`, `.scroll-mt-header`; no global `scroll-behavior: smooth` |

## Scroll restoration behavior

| Navigation | Behavior |
|------------|----------|
| Link / programmatic PUSH to new pathname | Instant scroll to **top**; focus main |
| REPLACE pathname change | Same as PUSH |
| Same pathname, query only (catalog) | **Do not** force document top; listing scrolls to `#catalog-results` under sticky header |
| POP (back/forward) | Restore saved `window.scrollY` for that history key |
| URL hash present | Scroll to target with header offset (smooth for intentional anchors) |
| Overlay open + navigate | Body unlock + drawers close |

## Remaining / intentional limits

- Scroll memory is in-memory (session tab only); full page reload cannot restore SPA history scroll map.
- Soft page fade transition was **not** added (speed preferred over polish).
- Pixel-perfect multi-viewport Safari testing was not run in a device lab; logic is responsive via CSS header offset.
- Admin list→editor uses the same POP restore rules (useful for long product lists).

## Tests / QA

- Added `tests/scroll-navigation.test.ts` for query-only detection and scroll position store.
- Run: `npm test`, `npm run typecheck`, `npm run lint`, `npm run build`.
