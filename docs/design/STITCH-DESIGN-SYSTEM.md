## Brand & Style

This design system channels the joyful friction of 1990s Memphis Group irreverence collided with analog risograph layer misregistration. It rejects sterile corporate minimalism in favor of unapologetic vibrancy, physical ink texture, and tactile playfulness. 

The aesthetic is expressive, artistic, and loud yet disciplined:
- **Target Audience:** Creative professionals, culture workers, digital natives, and brands wanting to break through algorithmic blandness with high-octane personality.
- **Atmospheric Feel:** Tactile print studio meets geometric pop gallery. Elements look stamped, cut out, layered, and physically pinned to rich, warm paper.
- **Design Movement:** Neo-Brutalist Pop & Memphis Revival. Built on heavyweight 3px–4px deep ink outlines, uncompromising hard-offset drop shadows (zero blur), slight rotation skews (-2° to +3°) on sticker elements, and energetic dot-grid/squiggle field textures that evoke multi-pass riso print runs.

## Layout & Spacing

The layout is grounded in a modular 12-column grid that shifts into irregular, collage-like arrangements through asymmetric offsets and overlapping layers.

### Grid & Breakpoints
- **Desktop (1024px+):** 12-column fluid grid, `3rem` margins, `1.5rem` gutters. Maximum content bound is 1280px. Columns can be offset vertically by 8px–16px to create stepped Memphis compositions.
- **Tablet (640px - 1023px):** 8-column grid, `2rem` margins, `1rem` gutters. Elements snap into tighter rhythmic groupings.
- **Mobile (<640px):** 4-column grid, `1.25rem` margins, `1rem` gutters. Overlapping elements unstack into single vertical streams while retaining border weight and punchy shadows.

### Spatial Cadence
- Padding uses the strict 4-point/8-point geometric scale. Components favor generous interior padding (`space-md` to `space-lg`) to balance the heavy 3px–4px black border weights.
- Sections utilize contrasting background blocks (e.g., shifting from Cream to Electric Yellow or Dot-Grid patterned sections) bounded by horizontal 4px black divider rules.

## Elevation & Depth

This system outright forbids gaussian blur, diffusion, ambient color halos, or soft gradients. Depth is entirely hard-edged and mechanical, reflecting screen-printing separation and paper-cut layering.

### The Hard Offset Shadow
- **Standard Surface (Cards, Toolbars):** `5px 5px 0px #111111`.
- **Floating Prominent (Hero Modals, Sticky Nav, Feature Cards):** `8px 8px 0px #111111`.
- **Interactive Element Depressed (Active/Pressed Buttons):** Translates `+3px, +3px` with shadow snapping down to `2px 2px 0px #111111`, creating the tactile feel of an arcade switch or spring-loaded rubber stamp.
- **Static Inset / Deep Wells:** `inset 3px 3px 0px #111111` on input fields or empty dropzones.

### Memphis Decorative Underlays
Cards frequently use an offset colored underlay block (e.g., a card with a `#FAF4E8` face, a `#FFE600` background slab shifted 8px right and down, all locked by a 3px `#111111` border).

## Components

### Buttons
- **Primary:** Solid `#FF2E88` background, 3px solid `#111111` border, `5px 5px 0 #111111` shadow, uppercase Space Grotesk bold text. Hover shifts background to `#FFE600`, shifts position `translate(-2px, -2px)` and extends shadow to `7px 7px 0 #111111`. Active shifts `translate(3px, 3px)` with shadow `2px 2px 0 #111111`.
- **Secondary:** Solid `#2D5BFF` or `#FAF4E8` background, 3px `#111111` border, `5px 5px 0 #111111` shadow. Text in `#111111` or `#FAF4E8`.
- **Ghost/Tertiary:** No shadow, 3px `#111111` border, hover fills with Mint `#2BE0A8`.

### Sticker Badges & Chips
- Compact pills or soft rectangles with 2.5px solid `#111111` borders.
- Fills rotate between `#FFE600`, `#2BE0A8`, and `#FF7A1A`.
- Positioned floating over headers or card edges with an intentional `rotate(-2deg)` or `rotate(3deg)` offset to emulate manually applied physical stickers.

### Cards & Panels
- **Default Card:** `#FAF4E8` background, 3px `#111111` outline, `6px 6px 0 #111111` shadow. Padding `1.5rem`.
- **Hero Card:** Dual-layer layout; bottom decorative layer in Tangerine `#FF7A1A` with a halftone dot pattern, top content layer in warm paper `#FFF9EF`.
- **Hover State:** Cards lift slightly (`translate(-2px, -2px)`) with shadow expanding to `8px 8px 0 #111111`.

### Form Controls (Inputs, Checkboxes, Radios)
- **Input Fields:** Crisp `#FFF9EF` interior, 3px `#111111` border, `3px 3px 0 #111111` shadow. Placeholder text in `#111111` at 50% opacity. Focus state shifts border color to `#111111`, outline to 2px solid `#2D5BFF`, and shadow to `5px 5px 0 #2D5BFF`.
- **Checkboxes:** 22px × 22px squares, 3px `#111111` border, 3px hard shadow. Checked state fills `#2BE0A8` with a thick, high-contrast black graphic checkmark.
- **Radio Buttons:** Circular, 3px `#111111` border. Selected state places a solid `#FF2E88` concentric disc inside.

### Lists & Tables
- Divided by bold 3px `#111111` horizontal lines. Alternating rows swap between `#FAF4E8` and `#FFF9EF`. Hovering a row highlights it in Electric Yellow `#FFE600`.

### Patterns & Memphis Flourishes
- **Halftone / Dot Grid:** Repeating 2px deep ink dots on 16px centers for section backdrops or banner edges.
- **Squiggle Dividers:** SVG-driven serpentine paths (3px stroke) used as horizontal dividing lines between major editorial sections.