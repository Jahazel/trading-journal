---
name: Trading Journal
description: A personal field notebook for logging and reviewing trading decisions.
colors:
  sage: "#7A8F5E"
  sage-hover: "#6A7D4E"
  sage-light: "#E0E9D8"
  surface: "#FDFEFE"
  surface-alt: "#F8F9F6"
  ink-primary: "#1A1E18"
  ink-secondary: "#6B7368"
  ink-muted: "#9CA398"
  border: "#E4E7E0"
  pnl-positive: "#059669"
  pnl-positive-bg: "#D1FAE5"
  pnl-negative: "#DC2626"
  pnl-negative-bg: "#FEE2E2"
typography:
  display:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "-0.01em"
  title:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 600
    lineHeight: 1.4
  body:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "0.05em"
rounded:
  sm: "6px"
  md: "8px"
  lg: "12px"
spacing:
  xs: "8px"
  sm: "12px"
  md: "16px"
  lg: "32px"
  xl: "40px"
components:
  button-primary:
    backgroundColor: "{colors.sage}"
    textColor: "{colors.surface}"
    rounded: "{rounded.md}"
    padding: "10px 20px"
  button-primary-hover:
    backgroundColor: "{colors.sage-hover}"
    textColor: "{colors.surface}"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.sage}"
    rounded: "{rounded.md}"
    padding: "6px 14px"
  button-ghost-hover:
    backgroundColor: "{colors.sage}"
    textColor: "{colors.surface}"
  input-default:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink-primary}"
    rounded: "{rounded.md}"
    padding: "10px 14px"
  card-stat:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink-primary}"
    rounded: "{rounded.lg}"
    padding: "14px 16px"
  entry-card:
    backgroundColor: "{colors.surface-alt}"
    textColor: "{colors.ink-primary}"
    rounded: "{rounded.sm}"
    padding: "8px 12px"
---

# Design System: Trading Journal

## 1. Overview

**Creative North Star: "The Field Notebook"**

A field notebook belongs to a practitioner who takes their work seriously. It is not decorated. It is not designed to impress. It is designed to be used, day after day, until the pages carry the weight of real history. This interface is that notebook: clean pages, honest data, no ornamentation competing with the record.

The visual language is restrained light mode: near-white surfaces with a faint sage tint, sage as the single accent, data colors (emerald and red) reserved strictly for financial outcomes. Whitespace is not empty space but active space; it tells the eye where to look. The sidebar is quiet and present, like a table of contents on a notepad. The content area is where the work happens.

This system explicitly rejects: Bloomberg-style data density and orange-on-black intimidation; crypto neon aggression; generic SaaS dashboard energy (white + blue-purple, hero metric cards with gradients, identical card grids); traditional finance formality (navy and gold, serif weight).

**Key Characteristics:**
- Light mode, subtle sage tint on all neutral surfaces
- Single accent color (sage) used sparingly; data colors are semantic only
- Breathing room: consistent generous padding, sparse chrome
- Flat-by-default surfaces with soft ambient shadows on hover and floating elements
- Typography hierarchy through weight and scale contrast, not color
- No decorative elements; every visual element earns its place

## 2. Colors: The Sage Palette

A near-monochrome neutral foundation with one grounded accent. Sage appears on interactive elements only; it is never used decoratively.

### Primary
- **Sage** (#7A8F5E): The sole interactive accent. Used on primary buttons, focus rings, hover states for entry cards, and active navigation indicators. Muted and organic, never vivid. Its restraint makes it meaningful when it does appear.
- **Sage Hover** (#6A7D4E): Deepened sage for button hover and active press states.
- **Sage Light** (#E0E9D8): Tinted background for selected states, active sidebar items, or subtle callout surfaces.

### Neutral
- **Surface** (#FDFEFE): Primary background for cards, modals, the sidebar, and the navbar. Near-white with a trace of cool.
- **Surface Alt** (#F8F9F6): Page-level background, entry card default state, form area fill. Slightly warmer than surface to create a two-tone tonal depth without shadows.
- **Ink Primary** (#1A1E18): All primary text. Headings, data values, field content. Near-black with a faint green bias so it never reads as pure black against the sage-tinted surfaces.
- **Ink Secondary** (#6B7368): Secondary labels, timestamps, helper text. Sufficient contrast on both surface values.
- **Ink Muted** (#9CA398): Placeholder text, empty-state messages, divider labels. Borderline for body copy — use only for intentionally subordinate content.
- **Border** (#E4E7E0): All hairline borders (cards, inputs, dividers, navbar bottom). Sage-tinted so the grid of borders doesn't read as cold gray.

### Tertiary (Data Colors — semantic only)
- **P&L Positive** (#059669): Trade wins and positive daily/weekly totals. Emerald — not sage. These are financial facts, not brand moments.
- **P&L Positive Background** (#D1FAE5): Calendar day cell fill for winning days.
- **P&L Negative** (#DC2626): Trade losses and negative totals.
- **P&L Negative Background** (#FEE2E2): Calendar day cell fill for losing days.

### Named Rules
**The One Voice Rule.** Sage appears on ≤10% of any given screen at rest. Every button, link, and hover state uses it — but surfaces, text, and containers stay neutral. Its scarcity is why it works.

**The Data Color Rule.** Emerald and red are reserved for financial outcomes only. No emerald success banners. No red error icons styled to match the P&L red. Data colors carry financial meaning and must not be diluted.

## 3. Typography

**Body Font:** Inter (with `system-ui, sans-serif` fallback)

Inter at this scale reads like a well-kept ledger: geometric enough to feel precise, humanist enough to feel approachable. No display typeface is needed — the field notebook aesthetic is achieved through weight contrast and generous whitespace, not type personality.

**Character:** Clean, neutral, and utilitarian. Hierarchy comes from size and weight jumps, not from decorative type choices. The lack of a headline font is intentional.

### Hierarchy
- **Display** (600 weight, 1.5rem / 24px, line-height 1.2, letter-spacing -0.01em): Page-level headings only. "Dashboard", entry detail titles. Appears at most once per view.
- **Title** (600 weight, 1rem / 16px, line-height 1.4): Section headings, sidebar group labels, card headings.
- **Body** (400 weight, 0.875rem / 14px, line-height 1.6): All prose content, journal entry text, form field values. Cap line length at 70ch in text-heavy views.
- **Label** (500 weight, 0.75rem / 12px, line-height 1.4, letter-spacing 0.05em): Metadata: timestamps, stat card category names, calendar day headers. Uppercase where used as a category label.

### Named Rules
**The No Display-Font Rule.** Do not introduce a serif or expressive display typeface for "notebook feel." The field notebook quality is architectural, not typographic. Adding a serif will push the design toward a lifestyle product aesthetic that conflicts with the tool register.

## 4. Elevation

Surfaces are flat at rest. Shadows appear as a response to state (hover interaction) or to communicate that an element is floating above the page (dropdowns, auth card).

The system uses soft ambient shadows — not Material-style directional lifts. Think paper resting on a table under diffuse daylight, not a card under a spotlight.

### Shadow Vocabulary
- **Ambient Rest** (`0 1px 4px rgba(26,30,24,0.05), 0 2px 12px rgba(26,30,24,0.04)`): Auth page card, floating sidebar dropdowns. Present but barely perceptible.
- **Hover Lift** (`0 4px 16px rgba(26,30,24,0.08), 0 1px 4px rgba(26,30,24,0.05)`): Stat cards on hover. Signals interactivity.
- **Dropdown** (`0 8px 24px rgba(26,30,24,0.10), 0 2px 8px rgba(26,30,24,0.06)`): Entry type dropdown in the sidebar. Slightly more prominent to communicate layer separation.

### Named Rules
**The Flat-By-Default Rule.** At rest, surfaces are differentiated by background tint (surface vs. surface-alt), not by shadow. Shadows appear only when an element lifts on hover or floats above the layout. A shadow at rest is visual noise.

## 5. Components

### Buttons

Tactile and quiet. Primary buttons use sage fill; ghost buttons use sage outline. Neither size competes with content.

- **Shape:** Gently rounded (8px radius)
- **Primary:** Sage fill (#7A8F5E), surface text (#FDFEFE), padding 10px 20px. Font: label weight (500), 0.875rem. Hover: deepened sage (#6A7D4E), transition 150ms ease-out.
- **Ghost:** Sage border (1px solid #7A8F5E), sage text, transparent fill. Hover: sage fill, surface text. Used for secondary actions (Sign Out, nav buttons).
- **Icon Button (circular):** Used in sidebar header for the new entry (+) action. 24px circle, sage fill, surface text. Hover: sage-hover fill.

### Inputs / Fields

Unfussy. No fill at rest — just a border.

- **Style:** Surface fill (#FDFEFE), border (#E4E7E0), rounded (8px), padding 10px 14px
- **Focus:** Border shifts to sage (#7A8F5E), transition 150ms. No glow or outer ring.
- **Error:** Border shifts to #DC2626, inline error text in #DC2626 at label weight below the field.
- **Placeholder:** Ink muted (#9CA398)
- **Labels:** Ink secondary (#6B7368), label weight (0.75rem, 500)

### Sidebar Entry Cards

The primary navigation element. Compact, scannable rows — not full cards.

- **Trade Entry Card:** Surface-alt fill, border-color border, rounded (6px), padding 8px 12px. P&L value displayed in emerald or red per the data color rule. Date in ink muted. Hover: border shifts to sage, fill to surface-alt darkened. Transition 150ms.
- **No Trade Entry Card:** Same treatment, no P&L value. Date centered or date + "No Trade" label.

### Stat Cards

The dashboard overview row. Four equal-width tiles.

- **Container:** Surface fill, border (#E4E7E0), rounded (12px), padding 14px 16px
- **Category Label:** Ink secondary, label weight, uppercase, letter-spacing 0.05em
- **Value:** Body weight with bold (700), ink primary. No color variation on the number itself — let the value speak.
- **Hover:** Subtle lift (hover shadow), no border color change, scale 1.02. Transition 300ms ease-out.

### Trade Calendar

The visual anchor of the dashboard. A week-grid where P&L data creates the color.

- **Container:** Surface fill, border (#E4E7E0), rounded (12px), max-width 700px
- **Header Row:** Border-bottom, prev/next as ghost buttons (sage)
- **Day Headers:** Ink muted, label weight, uppercase, tracking wide
- **Day Cells:** Transparent/surface-alt at rest. P&L positive days: pnl-positive-bg fill. P&L negative days: pnl-negative-bg fill. Hover: slightly deeper tint. Off-month cells: 35% opacity.
- **Week Summary Column:** Right-aligned numeric, tabular-nums. Positive weeks: pnl-positive. Negative weeks: pnl-negative.

### Navigation (Navbar + Sidebar)

The navbar and sidebar are chrome, not content. They hold space and provide orientation without demanding attention.

- **Navbar:** Surface fill, border-bottom (#E4E7E0), 52px height, horizontal padding 20px. Logo/app name in ink primary (not sage, not blue). User greeting in ink secondary. Sign out as ghost button.
- **Sidebar:** Surface fill, border-right (#E4E7E0), 240px fixed width. Header: "Entries" label in ink primary, label weight. The new-entry (+) button in sage. Entry list below with 8px internal padding.

### Rich Text Editor (Journal Entry Body)

The entry editor is the notebook page. It should feel minimal and writeable.

- **Container:** Surface-alt fill, border (#E4E7E0), rounded (8px), padding 10px, min-height 300px
- **Focus:** Border shifts to sage
- **Toolbar:** Surface fill, border (#E4E7E0), rounded (8px), compact button group. Active formatting button: sage fill, surface text. Inactive: transparent, ink secondary.

## 6. Do's and Don'ts

### Do:
- **Do** use sage (#7A8F5E) as the sole accent for all interactive states: buttons, focus rings, hover borders, active nav items.
- **Do** use emerald and red strictly for financial data: P&L values, calendar day fills, win/loss labels.
- **Do** differentiate surface depth tonally: surface-alt (#F8F9F6) for page backgrounds and entry cards; surface (#FDFEFE) for cards and layered elements. No shadow needed at rest.
- **Do** keep the sidebar visually quiet: no background fill variations, no colored section labels, no bold sidebar headers. It is infrastructure.
- **Do** apply the label scale (0.75rem, 500 weight, uppercase, tracking) for category identifiers and timestamps — never for primary content.
- **Do** use tabular-nums (`font-variant-numeric: tabular-nums`) on all currency and percentage values so columns align.
- **Do** cap prose line length at 70ch in the entry editor and any long-form text view.

### Don't:
- **Don't** use the current blue-600 (#2563EB) anywhere in the interface going forward. It belongs to the generic Tailwind default, not this system.
- **Don't** introduce gradient text, glassmorphism, or glow effects. This system has zero decorative surface treatments.
- **Don't** use side-stripe borders (border-left as a colored accent on cards or alerts). A tinted background or full border is always the right answer.
- **Don't** build hero metric displays: big number, label, gradient accent. The stat cards are intentionally subdued. The data is the hero, not the presentation.
- **Don't** color-code anything based on mood or status (success banners in green, info in blue). Semantic color is reserved for financial data. Errors use red text and border, nothing else.
- **Don't** make the sidebar compete for attention. No bold header blocks, no colored backgrounds, no distinct "active" fill that draws the eye away from content.
- **Don't** use Bloomberg terminal density, crypto neon styling, navy-and-gold traditional finance patterns, or the blue-purple-gradient SaaS dashboard aesthetic. Each of these is an explicit anti-reference from the product brief.
