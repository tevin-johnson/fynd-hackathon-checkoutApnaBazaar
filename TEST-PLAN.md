# Test Plan: Apna Bazaar Mini Checkout

**Scope:** the single-page checkout (`/`). That covers the two products (Water Bottle ₹150.00, Coffee Mug ₹239.00), the cart, quantity editing, totals, the details form (name required; email and delivery city optional), order placement and confirmation.
**Out of scope:** payments, backend, persistence. None exist; the order is simulated client-side with a 500 ms delay.
**Devices:** desktop (Chrome, 1280×800) and mobile (Chromium phone emulation, touch: 375×812 manual, Pixel 7 412×915 automated).
**Tools:** Playwright 1.65.1, Node 23.7 (local) / 22.23.5 (CI), Windows 11. Executed 2026-11-25.

## 1. Risks, prioritised

| ID    | Priority | Risk                                           | Why it matters                                               | Covered by                                              |
| ----- | -------- | ---------------------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------- |
| MT-01 | P1       | Empty-cart checkout                            | It has to be blocked with a clear message, not fail silently | Manual (desktop + mobile), `validation.spec.ts`         |
| MT-02 | P1       | Rapid double-click / double-tap on Place Order | Could create duplicate orders or references                  | Manual (desktop + mobile), `checkout.spec.ts`           |
| MT-03 | P1       | Price math precision                           | Floating-point errors corrupt totals                         | `quantity.spec.ts`, `checkout.spec.ts`, `money.test.ts` |
| MT-04 | P2       | Quantity edge cases: 0, negative, text, 10000  | Clamping and overflow behaviour                              | `quantity.spec.ts`, `logic.test.ts`                     |
| MT-05 | P2       | Validation accessibility                       | Screen-reader users need to hear the error                   | `validation.spec.ts`, `accessibility.spec.ts`           |
| MT-06 | P3       | Reset / new-order flow                         | State could leak from one order into the next                | `checkout.spec.ts` (happy path, tail)                   |
| MT-07 | P3       | Delivery-city autocomplete                     | A wrong or unknown city on an order                          | `location.spec.ts`, `locations.test.ts`                 |

## 2. Test cases

### MT-01 (P1): Empty cart is blocked

- **Preconditions:** fresh page load, nothing in the cart.
- **Steps:**
  1. Check that **Checkout →** is disabled.
  2. Type a name.
  3. Press **Place Order**.
- **Expected:** a `role="alert"` reads "Your bag is empty. Add at least one item before placing an order." Focus moves to the alert. The name is kept. No confirmation or reference appears.

### MT-02 (P1): Double-click / double-tap produces one order

- **Preconditions:** at least one item in the cart and a non-blank name.
- **Steps:**
  1. Double-click (desktop) or double-tap (mobile) **Place Order**.
- **Expected:**
  - While the order is in flight, the button shows "Placing your order…" and is disabled (`aria-busy="true"`).
  - Exactly one confirmation and one `ORD-XXXXXX` reference appear, and `placeOrder()` runs once.
  - The page does not become wider than the screen (no sideways panning).

### MT-03 (P1): Totals are exact

- **Steps:**
  1. Add 2 × Water Bottle and 1 × Coffee Mug.
  2. Place the order.
- **Expected:** the order total and the confirmation total both read **₹539.00**. All money is integer paise; ₹ formatting happens at display only, with Indian grouping (e.g. ₹14,850.00, ₹1,00,000.00).

### MT-04 (P2): Quantity edge cases

- **Preconditions:** 2 × Water Bottle in the cart.
- **Steps:**
  1. Type `-3`.
  2. Type `abc`.
  3. Type `10000`.
  4. Type `0`.
- **Expected:**
  - `-3` and `abc` are rejected: the value stays `2`, the hint "Whole numbers from 0 to 99 only." appears, and the total is unchanged.
  - `10000` is clamped to `99`: the total becomes ₹14,850.00 and **+** is disabled.
  - `0` removes the line.

### MT-05 (P2): Validation is accessible

- **Steps:**
  1. Enter a name of only spaces.
  2. Press **Place Order**.
- **Expected:** the alert has `role="alert"` and `aria-live="assertive"` and is focused. Name has `aria-invalid="true"` and `aria-describedby` pointing at the alert. The cart and the email are preserved.

### MT-06 (P3): Reset between orders

- **Steps:**
  1. After a confirmation, press **Place another order**.
- **Expected:** empty cart, total ₹0.00, and blank name, email and city.

### MT-07 (P3): Delivery-city autocomplete

- **Steps:**
  1. Type `pu`.
  2. Press ↓ ↓ then Enter.
  3. Type `jaipur` and leave the field.
  4. Type `Atlantis` and press **Place Order**.
- **Expected:**
  - `pu` shows a "Matching cities" listbox (Puducherry, Pune…).
  - ↓ ↓ Enter fills "Pune, Maharashtra" without submitting the form.
  - `jaipur` auto-fills to "Jaipur, Rajasthan" on blur.
  - `Atlantis` shows no suggestions; Place Order is blocked with "We don't deliver to that location yet…", the field is marked `aria-invalid`, and the input is kept.
  - A chosen city appears on the confirmation as "📍 Delivering to Pune, Maharashtra".

## 3. Executed results

### 3.1 Manual runs (production build, `next start`, no test hooks)

The manual runs were done in the Chromium browser pane on release-candidate builds of v1.0.0. They were repeated after each fix. Results were read from the live DOM.

| ID    | Device  | Actual result                                                                                                                                                                                                                                                                    | Result                  |
| ----- | ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------- |
| MT-01 | Desktop | **Checkout →** was disabled. Place Order with the name "Rahul Desktop" showed "Your bag is empty…" with `role="alert"`, and focus moved to it (`activeElement.id = "form-errors"`). The name was kept. 0 confirmations.                                                          | **Pass**                |
| MT-01 | Mobile  | Same result after tapping with the name "Anjali Mobile". No horizontal scroll (`scrollWidth` = 375).                                                                                                                                                                             | **Pass**                |
| MT-02 | Desktop | 2 × Coffee Mug, then a double-click. During the request the button was `disabled` with `aria-busy="true"`. Result: 1 confirmation, 1 reference `ORD-SC3N5G`, total ₹478.00. `window.__resetStore` is undefined in the production build.                                          | **Pass**                |
| MT-02 | Mobile  | **First run:** 1 confirmation (`ORD-1CRKOJ`, ₹150.00), correct, **but** the layout viewport grew from 375 to 508 px, so the page could pan sideways. This is **DEF-03** below. **After the fix:** 1 confirmation (`ORD-RXNUFT`, ₹150.00) and `innerWidth` stayed 375 throughout. | **Fail → fixed → Pass** |
| MT-05 | Both    | Role, focus and `aria-invalid` were verified. **Not tested with a real screen reader** (NVDA / TalkBack).                                                                                                                                                                        | Pass (partial)          |

### 3.2 Automated runs

Local run against a production build (`npm run build:e2e`), commit `v1.0.0`:

- **Unit tests** (`npm run test:unit`): **19/19 pass**. They cover money/paise math and ₹ formatting, quantity rules, the store, the order reference and delay, the CSP builder, and location search.
- **Browser tests** (`npx playwright test`): **24/24 pass**, which is 12 tests × 2 projects (`desktop-chrome`, `mobile-pixel7`). `retries: 0`, so nothing is masked. An earlier desktop-only suite was also run with `--repeat-each=3` (18/18) to check for flakiness.

| Spec                    | Test                                                                           | Covers        |
| ----------------------- | ------------------------------------------------------------------------------ | ------------- |
| `checkout.spec.ts`      | happy path: confirmation, reference regex, exact total, reset                  | MT-03, MT-06  |
| `checkout.spec.ts`      | double-click: one confirmation and one `placeOrder` call; viewport not widened | MT-02, DEF-03 |
| `validation.spec.ts`    | blank name blocked, alert focused, cart and input preserved                    | MT-05         |
| `validation.spec.ts`    | empty cart blocked                                                             | MT-01         |
| `quantity.spec.ts`      | typed qty and +/− give the exact total                                         | MT-03         |
| `quantity.spec.ts`      | -3 / abc rejected, 10000 → 99, 0 removes                                       | MT-04         |
| `location.spec.ts`      | suggestions, keyboard pick, confirmation shows city                            | MT-07         |
| `location.spec.ts`      | click pick, exact-name auto-fill on blur                                       | MT-07         |
| `location.spec.ts`      | unknown city blocked, input kept                                               | MT-07         |
| `security.spec.ts`      | nonce CSP and hardened headers                                                 | n/a           |
| `security.spec.ts`      | hydrates with 0 CSP violations and 0 external requests                         | n/a           |
| `accessibility.spec.ts` | ticker duplicates hidden, Pause button works                                   | DEF-01        |

**Evidence** (`docs/evidence/desktop-chrome/` and `docs/evidence/mobile-pixel7/`):

- screenshots: `happy-path-confirmation.png`, `double-click-single-confirmation.png`, `validation-blank-name.png`, `validation-empty-cart.png`, `quantity-exact-total.png`, `quantity-clamped-99.png`, `location-suggestions.png`
- traces: `MT-01-empty-cart-trace.zip`, `MT-02-double-click-trace.zip`

Open a trace with:

```bash
npx playwright show-trace docs/evidence/mobile-pixel7/MT-02-double-click-trace.zip
```

CI uploads the same report as the `playwright-report` and `playwright-evidence` artifacts on every run (kept 7 days).

## 4. Defects

Every defect below is real and was found while testing. All three are fixed, and each has a regression check. On desktop, the P1 checks (MT-01, MT-02) found no defects. On mobile, MT-02 found DEF-03.

### DEF-03: The mobile page widens after placing an order (found by MT-02)

- **Severity:** Medium on mobile. The order itself was correct (one confirmation), but the confirmation screen could be panned or zoomed sideways on a phone.
- **Steps to reproduce (v1.0.0 release candidate, before the fix):**
  1. Open the page on a 375 px touch viewport.
  2. Add an item and enter a name.
  3. Tap (or double-tap) **Place Order**.
  4. Read `window.innerWidth`.
- **Expected:** `innerWidth` = 375, no sideways overflow.
- **Actual:** `innerWidth` was 508 (other runs: 470, 494) and `scrollWidth` 508. It stayed that way until the next layout change.
- **Root cause:** isolated step by step. It was not the double-tap gesture (`touch-action: manipulation` didn't help) and not the confetti (bounding the pieces didn't help). It was the **"ORDERED!" stamp**, whose entrance animation starts at `scale(3)`. For a moment that element is about three times the screen width, and mobile Chrome enlarged the layout viewport to fit it. A JS-triggered order appeared fine only because no further layout happened before the measurement.
- **Evidence:** DOM measurements in the browser pane (`innerWidth` 508 → 375 the moment the overflowing layer was removed). A regression assertion in `checkout.spec.ts` (double-click test) **fails on `mobile-pixel7` when the fix is reverted**. I checked this by temporarily removing the fix.
- **Fix:** `.confirm { overflow: clip }` clips the stamp's entrance inside the card. Also hardened: confetti pieces stay within the viewport, confetti unmounts after 6 s, and `touch-action: manipulation` on controls.

### DEF-01: Ticker read twice by screen readers, and no way to pause it

- **Severity:** Medium (accessibility, WCAG 1.3.1 / 2.2.2).
- **Steps to reproduce:**
  1. Load `/`.
  2. Inspect the accessibility tree for a ticker item.
  3. Try to stop the ticker with the keyboard.
- **Expected:** each item is exposed once, and motion can be paused.
- **Actual:** every item appeared twice: the duplicate loop copy sat inside a `display: contents` wrapper whose `aria-hidden` wasn't honoured. The only way to pause was mouse hover.
- **Evidence:** the browser-pane accessibility search returned two nodes per ticker item.
- **Fix:** `aria-hidden` on each duplicate and a real **Pause ticker** toggle (`aria-pressed`). Regression test: `accessibility.spec.ts`.

### DEF-02: 3 px horizontal overflow on desktop

- **Severity:** Low (cosmetic).
- **Steps to reproduce:**
  1. Load `/` in a viewport about 1009 px wide.
  2. Compare `scrollWidth` with `clientWidth`.
- **Expected:** they are equal.
- **Actual:** 1012 vs 1009. The rotating square SVG in the circular badge poked past the edge.
- **Fix:** `.spin-badge { overflow: hidden }`.

### Not a defect, but a documented spec deviation

A static `Content-Security-Policy: script-src 'self'` header would block the 3 inline scripts that Next.js emits (verified with curl), and the page would never hydrate. The app instead sends a per-request **nonce** CSP from `proxy.ts`, which is equally strict (no `unsafe-inline` or `unsafe-eval` for scripts). `security.spec.ts` asserts the header and checks for zero violations.
