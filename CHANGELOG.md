# Changelog

Every change ships as a new git tag, so any version can be restored. See README → "Versions and rollback".

## v1.0.0 (2026-11-25)

First release of **Apna Bazaar**, the mini checkout.

- Single-page checkout with two fixed-price products: Water Bottle ₹150.00 and Coffee Mug ₹239.00. Add, remove, −/+ and typed quantities; line and order totals update immediately.
- Money is held as integer paise throughout and formatted as ₹ with Indian digit grouping.
- Required name, optional email, and an optional delivery city with autocomplete (bundled list of Indian cities, accessible combobox).
- Validation: an empty cart, a blank name, an invalid email or an unknown city all block checkout. A focused `role="alert"` explains why, and everything the customer typed is preserved.
- Double-submit guard: a synchronous lock plus a disabled, `aria-busy` button during the simulated 500 ms order. A double-click produces one order.
- Confirmation shows an `ORD-XXXXXX` reference, a line summary, the total and the delivery city, plus "Place another order".
- Vibrant, animated UI from a Google Stitch design system. Fonts are Bagel Fat One, Fredoka and Gochi Hand. All motion respects `prefers-reduced-motion`.
- Tests: 19 unit tests and 12 Playwright tests, each run on desktop Chrome and mobile Pixel 7 (24 runs).
- Security: per-request nonce CSP, hardened headers, SHA-pinned actions, `npm ci`, a `npm audit` gate, and least-privilege workflows.
- Defects found and fixed during testing: DEF-01 (ticker accessibility), DEF-02 (3 px desktop overflow), DEF-03 (mobile viewport widened after ordering). See TEST-PLAN.md.
