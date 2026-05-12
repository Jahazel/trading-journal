---
name: Trading Journal
description: A focused trading journal for post-session reflection and behavioral pattern discovery
colors:
  accent: "#4072B0"
  accent-hover: "#3362A0"
  accent-light: "#EBF0F9"
  surface-page: "#F4F6FA"
  surface-card: "#FFFFFF"
  surface-sidebar: "#ECF0F8"
  ink-primary: "#1A2235"
  ink-secondary: "#4B5875"
  ink-muted: "#7C8BA4"
  border: "#D8E0ED"
  pnl-positive: "#059669"
  pnl-positive-bg: "#D1FAE5"
  pnl-negative: "#DC2626"
  pnl-negative-bg: "#FEE2E2"
  pnl-breakeven: "#6B7FAA"
  pnl-breakeven-bg: "#E8EEFF"
typography:
  display:
    fontFamily: "Manrope, system-ui, sans-serif"
    fontSize: "1.75rem"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "-0.01em"
  headline:
    fontFamily: "Manrope, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "-0.005em"
  title:
    fontFamily: "Manrope, system-ui, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 500
    lineHeight: 1.4
  body:
    fontFamily: "Manrope, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.6
    fontFeature: "\"tnum\" 1"
  label:
    fontFamily: "Manrope, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "0.01em"
rounded:
  sm: "4px"
  md: "8px"
  lg: "12px"
  pill: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.surface-card}"
    rounded: "{rounded.md}"
    padding: "8px 16px"
  button-primary-hover:
    backgroundColor: "{colors.accent-hover}"
    textColor: "{colors.surface-card}"
    rounded: "{rounded.md}"
    padding: "8px 16px"
  button-secondary:
    backgroundColor: "{colors.surface-card}"
    textColor: "{colors.ink-primary}"
    rounded: "{rounded.md}"
    padding: "8px 16px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.ink-secondary}"
    rounded: "{rounded.md}"
    padding: "8px 16px"
  card:
    backgroundColor: "{colors.surface-card}"
    rounded: "{rounded.lg}"
    padding: "{spacing.lg}"
  input:
    backgroundColor: "{colors.surface-card}"
    textColor: "{colors.ink-primary}"
    rounded: "{rounded.md}"
    padding: "8px 12px"
  nav-item:
    backgroundColor: "transparent"
    textColor: "{colors.ink-secondary}"
    rounded: "{rounded.md}"
    padding: "8px 12px"
  nav-item-active:
    backgroundColor: "{colors.accent-light}"
    textColor: "{colors.accent}"
    rounded: "{rounded.md}"
    padding: "8px 12px"
  status-pill:
    backgroundColor: "{colors.accent-light}"
    textColor: "{colors.accent}"
    rounded: "{rounded.pill}"
    padding: "2px 8px"
---

# Design System: Trading Journal

## 1. Overview

**Creative North Star: "The Honest Mirror"**

This is a tool for traders who want to see themselves clearly. Every design decision serves that premise: the interface recedes, the data speaks, and nothing performs. The visual register is calm and deliberate — closer to a well-designed notebook than a trading terminal. When a trader opens this product after a session, they should feel like they're sitting down with a trusted record, not logging into a platform.

The system is restrained by principle, not by laziness. The near-white page background, the single slate blue accent, and the strict tonal depth hierarchy all exist to keep the user's attention on the numbers. A cluttered or decorated interface would be a betrayal of the product's purpose: surfacing behavioral patterns honestly.

This product explicitly rejects the register of consumer brokerage platforms (Robinhood, Webull) — no gamification, no celebration of activity, no visual excitement for its own sake. It also rejects the feature-bloat aesthetic of tools like Tradezella, where UI complexity signals capability. Restraint is the feature here.

**Key Characteristics:**
- Light mode only, tonal depth, no decorative surfaces
- Single slate blue accent covering ≤10% of any screen at rest
- Manrope across all weights — the only typeface in the system
- Green and red reserved exclusively for financial P&L values
- Information-dense layout leaning toward data density over airiness
- Eased, considered interactions — gentle transitions, no snap animations
- Full accessibility: WCAG AA, keyboard navigation, screen reader support, reduced motion respected

## 2. Colors: The Slate Record Palette

A near-monochromatic palette anchored in blue-tinted neutrals with a single confident slate blue accent. Color does almost no work at rest — it activates on interaction and on financial data.

### Primary
- **Composed Slate** (`#4072B0`): The system accent. Used on interactive elements (active nav state, primary button, focus rings, links), and nowhere else. Its restraint is the point. Covers ≤10% of any screen at rest.
- **Accent Hover** (`#3362A0`): Darker state for hover and pressed on accent elements. Direct replacement, no other treatment.
- **Accent Wash** (`#EBF0F9`): Very light tint used for active nav backgrounds, selected pill backgrounds, and tinted surface states. Never used as a standalone decorative color.

### Neutral
- **Page Linen** (`#F4F6FA`): The page background. Near-white with a slight cool cast. Cards sit on top of this as pure white — the contrast creates tonal depth without shadows.
- **Card White** (`#FFFFFF`): All cards, panels, and content containers. Pure white against Page Linen creates the only structural depth in the system.
- **Sidebar Slate** (`#ECF0F8`): The sidebar background. Distinctly cooler and more saturated than Page Linen — this gives the sidebar its own identity without resorting to a dark treatment.
- **Deep Ink** (`#1A2235`): Primary text and headings. A very dark blue-black — not pure black.
- **Secondary Ink** (`#4B5875`): Secondary text, table cell values, metadata, inactive nav labels.
- **Muted Ink** (`#7C8BA4`): Table column headers, placeholder text, helper text, timestamp labels.
- **Hairline** (`#D8E0ED`): Borders, dividers, and input strokes. Blue-tinted — matches the system's overall temperature.

### Financial Semantic (reserved — never used for UI)
- **P&L Gain** (`#059669`): Positive P&L values and calendar cells. Green only. Never used for anything that isn't financial profit.
- **P&L Gain Wash** (`#D1FAE5`): Background tint behind positive P&L values when a cell or badge is needed.
- **P&L Loss** (`#DC2626`): Negative P&L values and calendar cells. Red only. Never used for errors, warnings, or any non-financial signal.
- **P&L Loss Wash** (`#FEE2E2`): Background tint behind negative P&L values.
- **P&L Breakeven** (`#6B7FAA`): Flat day/trade values. Neutral blue.
- **P&L Breakeven Wash** (`#E8EEFF`): Background tint for breakeven states.

### Named Rules
**The One Voice Rule.** Composed Slate (#4072B0) is used on ≤10% of any given screen at rest. It appears on active states, the primary button, and focus rings. Its rarity is the point — when it appears, it means something.

**The P&L Quarantine Rule.** Green (#059669) and red (#DC2626) are completely reserved for financial P&L values. They must not appear on error states, success toasts, status badges, navigation, loading indicators, or anything else. If a UI state needs to communicate success or error, use ink colors and copy — not green and red.

**The Color-Blind Accessibility Rule.** Because green and red are used for P&L, every instance must communicate the same information through a secondary signal (icon, label, or sign prefix like +/−) so color-blind users are never disadvantaged.

## 3. Typography

**Primary Font:** Manrope (with system-ui, sans-serif fallback)

Manrope only. Three weights: Regular (400) for body and labels, Medium (500) for table cells and secondary values, Semibold (600) for headings, primary numbers, and active states. No other weights. No other typefaces.

**Character:** Geometric and precise, with just enough warmth to avoid feeling cold. The weight contrast between Semibold and Regular creates clear hierarchy without display-heavy drama. Well-suited for financial data — numerals are clean and read well at small sizes.

### Hierarchy
- **Display** (Semibold 600, 1.75rem, −0.01em tracking, 1.2 line-height): Page titles and the primary number in stat cards. Appears rarely — once per screen at most.
- **Headline** (Semibold 600, 1.25rem, −0.005em tracking, 1.3 line-height): Section headings, card titles, modal titles.
- **Title** (Medium 500, 0.9375rem, 1.4 line-height): Sub-section labels, group headings in the sidebar, table card headers.
- **Body** (Regular 400, 0.875rem, 1.6 line-height): All running prose — journal entry text, descriptions, onboarding copy. Max line length 65–75ch.
- **Label** (Medium 500, 0.75rem, 0.01em tracking, 1.4 line-height): Table column headers, form labels, metadata timestamps, status pill text, all-caps never used.

### Numeric Treatment
**The Tabular Rule.** All currency values, percentages, counts, and any number that aligns in a column must use `font-variant-numeric: tabular-nums`. This is not optional — misaligned columns are a functional failure, not a style preference.

### Named Rules
**The Three-Weight Rule.** Only Regular, Medium, and Semibold are used. If a design impulse reaches for Bold or Light, it's a signal to solve the hierarchy problem differently — through size, color, or spacing, not weight extremes.

## 4. Elevation

This system uses tonal depth, not shadows at rest. The stack: Page Linen (`#F4F6FA`) as the base → Card White (`#FFFFFF`) for elevated containers → no further layers. The single tonal step is enough to read the structure without any shadow.

Shadows appear only in response to state: hover on interactive cards, lifted dropdowns, and focused modals. They never decorate resting surfaces.

### Shadow Vocabulary
- **Ambient** (`0 1px 3px rgba(26, 34, 53, 0.06), 0 2px 10px rgba(26, 34, 53, 0.04)`): Applied on card hover. Lifts the card slightly without drama.
- **Lift** (`0 4px 16px rgba(26, 34, 53, 0.08), 0 1px 4px rgba(26, 34, 53, 0.05)`): Dropdowns, popovers, floating panels.
- **Modal** (`0 8px 32px rgba(26, 34, 53, 0.12), 0 2px 8px rgba(26, 34, 53, 0.06)`): Modal dialogs and drawers only.

### Named Rules
**The Flat-by-Default Rule.** Surfaces are flat at rest. A card does not have a shadow until a user interacts with it. Decoration is prohibited; shadow as state feedback is allowed.

## 5. Components

### Buttons

Buttons are understated and precise. They do not announce themselves. The primary button is the loudest element on a screen — which is why most surfaces have at most one.

- **Shape:** Gently rounded (8px radius)
- **Primary:** Composed Slate background (#4072B0), white text, 8px 16px padding. Semibold 600 label at 0.875rem.
- **Primary Hover:** Darker slate (#3362A0), no scale transform, transition 150ms ease-out-quart.
- **Secondary:** White background, Deep Ink text, 1px Hairline border. Hover: Page Linen background.
- **Ghost:** Transparent background, Secondary Ink text, no border. Hover: Page Linen background.
- **Focus:** 2px Composed Slate outline, 2px offset. Visible on all button variants.
- **Disabled:** 40% opacity, no pointer events.

### Cards / Containers

- **Corner Style:** Gently rounded (12px radius) — consistent across all cards, panels, and section containers.
- **Background:** Card White (#FFFFFF)
- **Shadow:** Flat at rest. Ambient shadow on hover.
- **Border:** None. Tonal depth against Page Linen is sufficient.
- **Internal Padding:** 24px (lg spacing). Reduced to 16px on compact card variants.

### Inputs / Fields

- **Style:** White background, 1px Hairline border (#D8E0ED), 8px radius, 8px 12px padding.
- **Focus:** Border shifts to Composed Slate (#4072B0). 2px outline, 2px offset in Accent Wash (#EBF0F9).
- **Error:** Border shifts to P&L Loss red (#DC2626) — the one exception to the P&L Quarantine Rule, since form errors are a distinct pattern from financial data. Pair with an error icon and text label.
- **Disabled:** Page Linen background, Muted Ink text.
- **Placeholder:** Muted Ink (#7C8BA4).

### Navigation — Sidebar

The sidebar has its own identity. Background is Sidebar Slate (#ECF0F8) — cooler and more saturated than the page, which anchors it visually without resorting to darkness.

- **Container:** Full-height, fixed width (icon-only: 56px; icon + label: 220px). Sidebar Slate background.
- **Nav item — default:** Transparent background, Secondary Ink text/icons, 8px radius, 8px 12px padding.
- **Nav item — hover:** Page Linen background (#F4F6FA), Deep Ink text/icons. Transition 120ms ease-out.
- **Nav item — active:** Accent Wash background (#EBF0F9), Composed Slate text/icons, Semibold weight.
- **Section labels:** Muted Ink, Label size (0.75rem), Medium weight, uppercase never used.
- **Border:** A single 1px Hairline right-border separates sidebar from content area.

The sidebar feels like it belongs to this product. It is not a generic nav shell.

### Stat Cards

Three-level visual hierarchy — the pattern borrowed from the dotman reference:

- **Level 1 — Metric label:** Label size (0.75rem), Muted Ink, Regular weight. Top of card.
- **Level 2 — Primary value:** Display size (1.75rem), Deep Ink, Semibold. The number that matters. Tabular numerals required.
- **Level 3 — Delta indicator:** Label size (0.75rem), P&L color (green/red only), paired with a directional arrow icon. "this week" / "this session" in Muted Ink alongside.

Arc gauge variant (for percentage metrics like Win Rate): semicircular progress arc in Composed Slate, with the percentage value centered below. Never use a full-circle gauge — the arc reads direction at a glance.

### Calendar Heatmap

The signature component. Receives the highest craft investment in the system.

- **Cell — profitable day:** P&L Gain Wash background (#D1FAE5), P&L Gain text (#059669). Shows daily P&L (large), trade count (small label below), and win % (muted label).
- **Cell — losing day:** P&L Loss Wash background (#FEE2E2), P&L Loss text (#DC2626). Same structure.
- **Cell — breakeven:** P&L Breakeven Wash (#E8EEFF), Breakeven ink (#6B7FAA).
- **Cell — no trades:** Page Linen background, Muted Ink text (date number only).
- **Cell — today:** Thin 1px Composed Slate border, no fill change.
- **Cell — hover:** Ambient shadow lift, slight scale (1.02), transition 150ms ease-out-quart. Reveals a tooltip with full daily breakdown.
- **Weekly summary column:** Right-aligned, same P&L color rules, Semibold weight for the weekly total, Secondary Ink for trade count.
- **Corner radius:** 6px per cell.

### Status Pills

Compact, never boxy. Used for trade status, session state, and account indicators — never for P&L.

- **Style:** Accent Wash background (#EBF0F9), Composed Slate text (#4072B0), pill radius (9999px), 2px 8px padding, Label size (0.75rem), Medium weight.
- **Neutral variant:** Border (#D8E0ED) background, Secondary Ink text.

## 6. Do's and Don'ts

### Do:
- **Do** use `font-variant-numeric: tabular-nums` on every number that could appear in a column or alongside other numbers.
- **Do** keep Composed Slate (#4072B0) to ≤10% of any given screen at rest. When it appears, it should feel intentional.
- **Do** communicate P&L gain and loss with a secondary signal (+ / − prefix, up/down arrow icon) alongside color, so color-blind users receive the same information.
- **Do** use tonal depth (Page Linen → Card White) for structural separation. This is the only depth system at rest.
- **Do** keep the sidebar background as Sidebar Slate (#ECF0F8). Its distinct identity anchors the layout.
- **Do** respect `prefers-reduced-motion`: all transitions and animations must be gated behind this media query.
- **Do** use eased transitions (cubic-bezier ease-out-quart or ease-out-expo). State changes should feel considered, not instant.
- **Do** design empty states as warm welcomes — a new user with no trades should feel invited, not abandoned.
- **Do** keep the calendar heatmap as the primary visual landmark on the dashboard. It gets the most craft investment.
- **Do** use three levels of ink weight (Semibold / Medium / Regular) to build hierarchy within dense data displays.

### Don't:
- **Don't** use green (#059669) or red (#DC2626) for anything other than financial P&L values. No success toasts in green. No error borders in red. No status badges in these colors. This rule has one exception: input field error borders.
- **Don't** use shadows on resting surfaces. Cards, panels, and containers are flat at rest. Shadows activate on hover and elevation states only.
- **Don't** use side-stripe borders (`border-left` or `border-right` as a colored accent). Prohibited on cards, list items, callouts, and alerts.
- **Don't** use gradient text (`background-clip: text` with a gradient). Use solid Composed Slate or Deep Ink for emphasis.
- **Don't** use glassmorphism, backdrop-filter blur, or glow effects. They are decorative and prohibited.
- **Don't** let the UI feel like a brokerage platform. No gamification, no streaks presented as achievements, no visual celebration of trade activity. The product's job is honest reflection, not encouragement.
- **Don't** let the UI feel like Tradezella or similar tools — no feature-complexity signaling, no sidebar overloaded with navigation items, no dashboards competing for attention.
- **Don't** use any font other than Manrope. No display typefaces, no serifs, no mono as a display choice.
- **Don't** use font weights outside Regular (400), Medium (500), and Semibold (600).
- **Don't** use pure black (#000000) or pure white (#FFFFFF) for surfaces or type. Tint everything toward the system's blue temperature.
- **Don't** build identical card grids (same height, same icon + heading + body pattern repeated). Cards that display different data should reflect the structure of that data.
- **Don't** reach for a modal as the first interaction pattern. Exhaust inline and progressive alternatives first.
