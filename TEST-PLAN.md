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

### 3.1 Manual runs on the live site (v1.0.3, https://fyndhack.vercel.app)

Run by hand in a Chromium browser on 2026-11-25 against the deployed production build (no test hooks: `window.__resetStore` is `undefined`). Desktop at 1024 px wide; mobile at 375×812 with touch emulation. Screenshots are in `docs/evidence/manual/`.

| ID    | Device  | Actual result                                                                                                                                                                                                                       | Result                               | Evidence                                   |
| ----- | ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------ | ------------------------------------------ |
| MT-01 | Desktop | **Checkout →** disabled, total ₹0.00. Place Order with the name "Rahul Desktop" showed "Your bag is empty. Add at least one item before placing an order." (`role="alert"`, focus moved to it). The name was kept. 0 confirmations. | **Pass**                             | `desktop-MT-01-empty-cart-blocked.jpg`     |
| MT-01 | Mobile  | Same result with the name "Anjali Mobile". No horizontal scroll (`scrollWidth` = 375).                                                                                                                                              | **Pass**                             | `mobile-MT-01-empty-cart-blocked.jpg`      |
| MT-02 | Desktop | 2 × Coffee Mug (₹478.00), then a double-click. A DOM observer recorded the button as `disabled` + `aria-busy="true"` ("Placing your order…"). Result: exactly 1 confirmation, 1 reference `ORD-UTTAKJ`, total ₹478.00.              | **Pass**                             | `desktop-MT-02-double-click-one-order.jpg` |
| MT-02 | Mobile  | 1 × Water Bottle (₹150.00), then a double-tap. Button seen disabled + busy; exactly 1 confirmation, `ORD-HBY6W2`, ₹150.00. **But** a width monitor showed the page briefly widening to 394 px on the 375 px screen: see **DEF-05**. | **Pass** (order) / **Fail** (layout) | `mobile-MT-02-double-tap-one-order.jpg`    |
| n/a   | Both    | Exploratory: the Delivery city field is narrower than Name and Email (desktop 206 px vs 403 px; mobile 206 px vs 286 px): see **DEF-04**.                                                                                           | **Fail**                             | visible in both MT-01 screenshots          |
| MT-05 | Both    | Role, focus and `aria-invalid` verified. **Not tested with a real screen reader** (NVDA / TalkBack).                                                                                                                                | Pass (partial)                       |                                            |

The fixes for DEF-04 and DEF-05 ship in v1.0.4 and are verified by the automated suite (§3.2). The manual live-site pass was **not repeated** after v1.0.4 was deployed.

#### Earlier manual runs (release candidates of v1.0.0, `next start`)

Results read from the DOM; these found DEF-03 and confirmed its first fix.

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

| Spec                    | Test                                                                                                   | Covers                |
| ----------------------- | ------------------------------------------------------------------------------------------------------ | --------------------- |
| `checkout.spec.ts`      | happy path: confirmation, reference regex, exact total, reset                                          | MT-03, MT-06          |
| `checkout.spec.ts`      | double-click: one confirmation and one `placeOrder` call; viewport never widened (checked every frame) | MT-02, DEF-03, DEF-05 |
| `validation.spec.ts`    | blank name blocked, alert focused, cart and input preserved                                            | MT-05                 |
| `validation.spec.ts`    | empty cart blocked                                                                                     | MT-01                 |
| `quantity.spec.ts`      | typed qty and +/− give the exact total                                                                 | MT-03                 |
| `quantity.spec.ts`      | -3 / abc rejected, 10000 → 99, 0 removes                                                               | MT-04                 |
| `location.spec.ts`      | suggestions, keyboard pick, confirmation shows city                                                    | MT-07                 |
| `location.spec.ts`      | click pick, exact-name auto-fill on blur; city field full width                                        | MT-07, DEF-04         |
| `location.spec.ts`      | unknown city blocked, input kept                                                                       | MT-07                 |
| `security.spec.ts`      | nonce CSP and hardened headers                                                                         | n/a                   |
| `security.spec.ts`      | hydrates with 0 CSP violations and 0 external requests                                                 | n/a                   |
| `accessibility.spec.ts` | ticker duplicates hidden, Pause button works                                                           | DEF-01                |

**Evidence** (`docs/evidence/desktop-chrome/` and `docs/evidence/mobile-pixel7/`):

- screenshots: `happy-path-confirmation.png`, `double-click-single-confirmation.png`, `validation-blank-name.png`, `validation-empty-cart.png`, `quantity-exact-total.png`, `quantity-clamped-99.png`, `location-suggestions.png`
- traces: `MT-01-empty-cart-trace.zip`, `MT-02-double-click-trace.zip`

Open a trace with:

```bash
npx playwright show-trace docs/evidence/mobile-pixel7/MT-02-double-click-trace.zip
```

**CI on GitHub:** every push runs the same suites. The v1.0.3 run (CI + deploy + live header check, all green) is https://github.com/tevin-johnson/fynd-hackathon-checkoutApnaBazaar/actions/runs/45605351651. CI uploads the same report as the `playwright-report` and `playwright-evidence` artifacts on every run (kept 7 days).

## 4. Defects

Every defect below is real and was found while testing. All five are fixed, and each has a regression check. On desktop, the P1 checks (MT-01, MT-02) found no defects. On mobile, MT-02 found DEF-03 and later DEF-05.

### DEF-05: Mobile page widens when an item is added (regression of DEF-03, found on the live site)

- **Severity:** Medium on mobile. Orders were always correct, but the page could briefly be panned or zoomed sideways.
- **Found:** manual MT-02 on the live site (v1.0.3), mobile 375 px, with a per-frame width monitor attached.
- **Steps to reproduce (v1.0.3):**
  1. Open https://fyndhack.vercel.app on a 375 px touch viewport.
  2. Tap **Add to cart** on any product.
  3. Read `window.innerWidth` right after the tap.
- **Expected:** 375.
- **Actual:** 394–402 px, staying wide until the next large layout change (e.g. the confirmation appearing).
- **Root cause:** the new cart line's slide-in animation starts 60 px to the right, so for its first frames it sticks out past the screen edge. The DEF-03 fix only clipped the confirmation card. The DEF-03 regression test only checked the **settled** width, so it missed transient spikes. That is a test gap, now closed.
- **Evidence:** the strengthened test samples `innerWidth` on every animation frame. Against v1.0.3 it fails on `mobile-pixel7` with **431 px on a 412 px screen** and passes on desktop: `docs/evidence/DEF-05-before-fix/` (failure screenshot + trace).
- **Fix (v1.0.4):** `.page { overflow-x: clip }`, so no entrance animation inside the page can poke past the edge. (`clip` keeps the sticky sidebar working.) The per-frame regression assertion in `checkout.spec.ts` now passes on both devices.

### DEF-04: Delivery city field narrower than the other fields

- **Severity:** Low (cosmetic).
- **Found:** manual MT-01 screenshots on the live site (v1.0.3).
- **Steps to reproduce (v1.0.3):**
  1. Open the page.
  2. Compare the widths of the Name and Delivery city inputs.
- **Expected:** equal widths.
- **Actual:** city 206 px vs Name 403 px (desktop) / 286 px (mobile).
- **Root cause:** the city input sits inside a block wrapper (`.combo`) and didn't stretch like its flex-item siblings.
- **Evidence:** `docs/evidence/manual/desktop-MT-01-empty-cart-blocked.jpg` and `mobile-MT-01-empty-cart-blocked.jpg`.
- **Fix (v1.0.4):** `.combo .form__input { width: 100% }`. Regression check in `location.spec.ts` compares the two layout widths.

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
