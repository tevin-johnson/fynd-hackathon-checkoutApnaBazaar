# Test Plan: Fynd Funk Shop Mini Checkout

**Scope:** the single-page checkout (`/`): catalog, cart, quantity editing, totals, the name/email form, order placement and confirmation.
**Out of scope:** payments, backend, persistence. None of these exist; the order is simulated client-side with a 500 ms delay.
**Build under test:** `v1.0.0` (commit tagged `v1.0.0`), Next.js production build.
**Environment:** Windows 11, Node 23.7.0, Playwright 1.65.1 (Chromium headless shell), plus a Chromium browser for manual runs. Executed 2026-11-25.

## 1. Risks, prioritised

| ID    | Priority | Risk                                    | Why it matters                                               | Covered by                                              |
| ----- | -------- | --------------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------- |
| MT-01 | P1       | Empty-cart checkout                     | It has to be blocked with a clear message, not fail silently | Manual + `validation.spec.ts` (empty cart)              |
| MT-02 | P1       | Rapid double-click on Place Order       | Could create duplicate orders or references                  | Manual + `checkout.spec.ts` (double-click)              |
| MT-03 | P1       | Price math precision                    | Floating-point errors corrupt totals                         | `quantity.spec.ts`, `checkout.spec.ts`, `money.test.ts` |
| MT-04 | P2       | Quantity edge cases: 0, negative, 10000 | Clamping and overflow behaviour                              | `quantity.spec.ts` (edge cases), `logic.test.ts`        |
| MT-05 | P2       | Validation accessibility                | Screen-reader users need to hear the error                   | `validation.spec.ts` (role, focus, aria-invalid)        |
| MT-06 | P3       | Reset / new-order flow                  | State could leak from one order into the next                | `checkout.spec.ts` (happy path, tail)                   |

## 2. Test cases

### MT-01 (P1): Empty cart is blocked

- **Preconditions:** fresh page load, nothing in the cart.
- **Steps:**
  1. Check that the **Checkout →** button in the summary is disabled.
  2. Type a name, e.g. `Empty Cart Tester`, into **Name**.
  3. Click **Place Order**.
- **Expected:** an alert (`role="alert"`) reads "Your bag is empty. Add at least one item before placing an order." Focus moves to the alert. The typed name stays. No confirmation and no order reference appear.

### MT-02 (P1): Rapid double-click produces one order

- **Preconditions:** at least one item in the cart, and a non-blank name.
- **Steps:**
  1. Double-click **Place Order** as fast as possible.
  2. Wait for the confirmation.
- **Expected:** while the order is in flight, the button switches to "Printing your order…" and is disabled (`aria-busy="true"`). Exactly one confirmation and one `ORD-XXXXXX` reference appear. `placeOrder()` runs exactly once.

### MT-03 (P1): Totals are exact to the cent

- **Preconditions:** empty cart.
- **Steps:**
  1. Add 2 × Water Bottle ($24.00) and 1 × Coffee Mug ($12.50).
  2. Read the order total.
  3. Place the order and read the confirmation total.
- **Expected:** both totals show **$60.50**. Every price and total is computed in integer cents; formatting happens only for display.

### MT-04 (P2): Quantity edge cases

- **Preconditions:** 2 × Water Bottle in the cart.
- **Steps:**
  1. Type `-3` in the quantity box.
  2. Type `abc`.
  3. Type `10000`.
  4. Type `0`.
- **Expected:**
  - `-3` and `abc` are rejected. The value stays `2`, the hint "Whole numbers from 0 to 99 only." appears, and the total is unchanged.
  - `10000` is clamped to `99`. The total becomes $2,376.00 and **+** is disabled.
  - `0` removes the line, and the cart shows its empty state.

### MT-05 (P2): Validation is accessible

- **Preconditions:** items in the cart.
- **Steps:**
  1. Enter a name of only spaces and an email.
  2. Click **Place Order**.
- **Expected:** the alert has `role="alert"` and `aria-live="assertive"` and receives focus. **Name** gets `aria-invalid="true"` and `aria-describedby` pointing at the alert. The cart and the email are preserved.

### MT-06 (P3): Reset between orders

- **Preconditions:** an order was just placed.
- **Steps:**
  1. Click **Place another order**.
- **Expected:** the cart is empty, the total is $0.00, and the Name and Email fields are blank.

## 3. Executed results

### 3.1 Manual runs (production build, no test hooks, `next start`)

| ID    | Actual result                                                                                                                                                                                                                                                                                                      | Result                     | Evidence                                                                                                                                    |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| MT-01 | **Checkout →** was disabled. Clicking **Place Order** with the name `Empty Cart Tester` showed "Your bag is empty. Add at least one item before placing an order." The alert had `role="alert"` and focus moved to it (`document.activeElement.id === "form-errors"`). The name was kept. 0 confirmations.         | **Pass**                   | DOM state read in the browser pane. Automated twin: `docs/evidence/validation-empty-cart.png` and `MT-01-empty-cart-trace.zip`              |
| MT-02 | Added 2 × Coffee Mug and typed the name `Manual Tester`, then double-clicked **Place Order**. The button showed "Printing your order…". Result: exactly 1 confirmation, 1 reference (`ORD-KB9P1X`), total $25.00. `window.__resetStore` is `undefined` in the production build, so the test hooks are not shipped. | **Pass**                   | DOM state read in the browser pane. Automated twin: `docs/evidence/double-click-single-confirmation.png` and `MT-02-double-click-trace.zip` |
| MT-05 | Keyboard and DOM checks passed (role, focus, aria-invalid). **Not tested with a real screen reader** (NVDA, VoiceOver).                                                                                                                                                                                            | Pass (partial)             | `docs/evidence/validation-blank-name.png`                                                                                                   |
| n/a   | Exploratory run: mobile width (375 px) has no horizontal scroll (`scrollWidth === clientWidth === 375`).                                                                                                                                                                                                           | Pass                       | n/a                                                                                                                                         |
| n/a   | Exploratory run: accessibility tree and 1009 px viewport turned up two defects, listed below.                                                                                                                                                                                                                      | **2 defects (both fixed)** | See §4                                                                                                                                      |

### 3.2 Automated runs (Playwright, `npx playwright test`)

All 9 browser tests pass locally against a production build (`npm run build:e2e`). The earlier 6-test suite was also run with `--repeat-each=3` (18/18 passed) to check for flakiness.

| Spec                    | Test                                                                | Covers       | Result |
| ----------------------- | ------------------------------------------------------------------- | ------------ | ------ |
| `checkout.spec.ts`      | happy path → confirmation, reference regex, exact total, reset      | MT-03, MT-06 | Pass   |
| `checkout.spec.ts`      | double-click → one confirmation, one reference, 1 `placeOrder` call | MT-02        | Pass   |
| `validation.spec.ts`    | blank name blocked, alert focused, cart and input preserved         | MT-05        | Pass   |
| `validation.spec.ts`    | empty cart blocked                                                  | MT-01        | Pass   |
| `quantity.spec.ts`      | typed quantity and +/− update the exact total                       | MT-03        | Pass   |
| `quantity.spec.ts`      | negative/non-numeric rejected, 10000 → 99, 0 removes                | MT-04        | Pass   |
| `security.spec.ts`      | CSP and hardened headers present                                    | n/a          | Pass   |
| `security.spec.ts`      | hydrates under CSP with 0 violations and 0 external requests        | n/a          | Pass   |
| `accessibility.spec.ts` | marquee duplicates hidden, pause button works (DEF-01 regression)   | MT-05        | Pass   |

Unit tests (`npm run test:unit`): 13/13 pass (money math, quantity parsing, store, order reference and delay, CSP builder).

CI runs the same suites on every push or PR. Its HTML report, screenshots and traces are uploaded as the `playwright-report` and `playwright-evidence` artifacts (kept 7 days).

**Evidence files** (`docs/evidence/`): `happy-path-confirmation.png`, `double-click-single-confirmation.png`, `validation-blank-name.png`, `validation-empty-cart.png`, `quantity-exact-total.png`, `quantity-clamped-99.png`, `MT-01-empty-cart-trace.zip`, `MT-02-double-click-trace.zip`. Open a trace with `npx playwright show-trace docs/evidence/MT-02-double-click-trace.zip`.

## 4. Defects found

Both P1 checks (MT-01 empty cart, MT-02 double-click) passed with no defects. The two defects below came up in exploratory manual testing. Both are real, both are now fixed, and the fix for DEF-01 has a regression test.

### DEF-01: Ticker read twice by screen readers, and no way to pause it

- **Severity:** Medium (accessibility, WCAG 1.3.1 / 2.2.2). No impact on the checkout logic.
- **Steps to reproduce (before the fix):**
  1. Load `/`.
  2. Inspect the accessibility tree, e.g. search it for "Hand-dipped enamel".
  3. Try to stop the scrolling ticker with the keyboard.
- **Expected:** each announcement is exposed once, and the moving ticker can be paused.
- **Actual:** every item appeared **twice** in the accessibility tree. The duplicate copy that makes the loop seamless sat inside a `display: contents` wrapper whose `aria-hidden` was not honoured. The only way to pause was mouse hover.
- **Evidence:** the browser-pane accessibility search returned two `"● Hand-dipped enamel"` nodes (`ref_7` and `ref_13`).
- **Fix:** `aria-hidden="true"` is now on each duplicate item, and there is a real **Pause ticker** toggle button (`aria-pressed`). Regression test: `tests/e2e/accessibility.spec.ts`.

### DEF-02: 3 px horizontal overflow on desktop

- **Severity:** Low (cosmetic).
- **Steps to reproduce (before the fix):**
  1. Load `/` in a viewport about 1009 px wide.
  2. Compare `document.documentElement.scrollWidth` with `clientWidth`.
- **Expected:** they are equal (no horizontal scroll).
- **Actual:** `scrollWidth` was 1012 and `clientWidth` was 1009. The rotating square SVG inside the circular "HANDMADE • RISO" badge pushed past the page edge at some rotation angles.
- **Fix:** `.spin-badge { overflow: hidden }` clips the SVG to the circle.

### Not a defect, but a documented spec deviation

The brief's suggested header `Content-Security-Policy: script-src 'self'` would **break** the app. Next.js App Router injects 3 inline `<script>` tags (verified with curl against the build), so that policy would block hydration and no button would work. The app uses a per-request **nonce** CSP instead (`proxy.ts`, `lib/csp.ts`). It is just as strict: no `unsafe-inline` or `unsafe-eval` for scripts. `security.spec.ts` asserts the header and checks for zero CSP violations.
