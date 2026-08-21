---
name: BlockBid Institutional
colors:
  surface: '#16130b'
  surface-dim: '#16130b'
  surface-bright: '#3d392f'
  surface-container-lowest: '#110e07'
  surface-container-low: '#1f1b13'
  surface-container: '#231f17'
  surface-container-high: '#2d2a21'
  surface-container-highest: '#38342b'
  on-surface: '#eae1d4'
  on-surface-variant: '#d0c5af'
  inverse-surface: '#eae1d4'
  inverse-on-surface: '#343027'
  outline: '#99907c'
  outline-variant: '#4d4635'
  surface-tint: '#e9c349'
  primary: '#f2ca50'
  on-primary: '#3c2f00'
  primary-container: '#d4af37'
  on-primary-container: '#554300'
  inverse-primary: '#735c00'
  secondary: '#c1c6d6'
  on-secondary: '#2b303d'
  secondary-container: '#414754'
  on-secondary-container: '#b0b5c5'
  tertiary: '#c0d0e6'
  on-tertiary: '#233143'
  tertiary-container: '#a5b4ca'
  on-tertiary-container: '#384658'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffe088'
  primary-fixed-dim: '#e9c349'
  on-primary-fixed: '#241a00'
  on-primary-fixed-variant: '#574500'
  secondary-fixed: '#dde2f3'
  secondary-fixed-dim: '#c1c6d6'
  on-secondary-fixed: '#161c27'
  on-secondary-fixed-variant: '#414754'
  tertiary-fixed: '#d4e4fa'
  tertiary-fixed-dim: '#b9c8de'
  on-tertiary-fixed: '#0d1c2d'
  on-tertiary-fixed-variant: '#39485a'
  background: '#16130b'
  on-background: '#eae1d4'
  surface-variant: '#38342b'
typography:
  display-lg:
    fontFamily: Hanken Grotesk
    fontSize: 64px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Hanken Grotesk
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Hanken Grotesk
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.3'
  headline-sm:
    fontFamily: Hanken Grotesk
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.4'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-caps:
    fontFamily: Space Grotesk
    fontSize: 14px
    fontWeight: '500'
    lineHeight: '1.0'
    letterSpacing: 0.1em
  display-lg-mobile:
    fontFamily: Hanken Grotesk
    fontSize: 36px
    fontWeight: '700'
    lineHeight: '1.2'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  section-gap: 120px
  container-max: 1280px
  gutter: 24px
  card-padding: 32px
---

## Brand & Style
The design system embodies a **Premium Web3** aesthetic, specifically tailored for institutional blockchain procurement. It conveys high-stakes reliability, transparency, and technological sophistication. 

The visual narrative is driven by a fusion of **Corporate Minimalism** and **Modern Glassmorphism**. The environment is dark and expansive, utilizing depth through radial glows and a structural gold grid that suggests a "digital foundation." This system targets government entities and high-volume institutional bidders, evoking an emotional response of security, exclusivity, and precision.

Key stylistic hallmarks include:
- **Atmospheric Depth:** Using golden radial gradients to highlight key interaction zones.
- **Structural Integrity:** A background grid that reinforces the "blockchain" metaphor.
- **Refined Transparency:** Using glassmorphic surfaces to create a sense of lightness against the heavy dark background.

## Colors
The palette is rooted in a **Deep Navy (#050A15)** base, which provides a high-contrast canvas for institutional-grade readability. 

- **Primary Gold (#D4AF37):** Used for critical CTAs, active states, and structural accents like grid lines and radial glows. It signifies value and authority.
- **Secondary Navy:** The foundational layer, creating a sophisticated and serious environment.
- **Slate Gray (#94A3B8):** The primary color for long-form body copy and secondary labels, reducing eye strain in dark mode.
- **Glow & Translucency:** Accents are supported by semi-transparent gold borders and subtle background blurs to create the glassmorphic effect.

## Typography
The typography system uses a tri-font approach to balance authority with technicality.

- **Headlines (Hanken Grotesk):** Chosen for its sharp, contemporary terminals and professional weight. It feels institutional yet modern.
- **Body (Inter):** The workhorse for readability. Used for all descriptive text and data tables.
- **Labels & Tech Data (Space Grotesk):** Used for "Overhead Labels" (e.g., [ THE ECOSYSTEM ]) and technical metadata to lean into the Web3/Tech aesthetic.

**Scaling:** Large displays use tight line-heights and negative letter spacing for a "block" effect. On mobile, headlines should aggressively scale down to preserve the grid's integrity.

## Layout & Spacing
The layout uses a **12-column fixed grid** with generous vertical breathing room to maintain a premium, editorial feel. 

- **The Gold Grid:** A background visual element should align with the actual CSS grid. Grid lines occur every 64px or 80px to provide a mathematical rhythm to the design.
- **Sectioning:** Large vertical gaps (120px+) separate major narrative blocks, ensuring the user focuses on one "institutional pillar" at a time.
- **Alignment:** Central alignment is used for storytelling headers, while left-alignment is reserved for data-heavy sections and hero introductions.

## Elevation & Depth
This system does not use traditional drop shadows. Depth is achieved through:

1.  **Backdrop Blurs:** Glassmorphic cards use a `blur(12px)` to `blur(20px)` effect to lift them from the background.
2.  **Luminous Borders:** Instead of shadows, cards utilize a 1px border with a gradient transition from `rgba(D4AF37, 0.4)` to `transparent`.
3.  **Radial Under-Glows:** Key cards or CTA sections have a "halo" effect behind them—a soft, low-opacity gold radial gradient that suggests a light source emanating from the content itself.

## Shapes
The shape language is "Soft-Technical." 

- **Cards & Containers:** Use a consistent `1rem` (16px) radius to soften the high-contrast color palette.
- **Buttons:** Primary CTAs use the same roundedness for consistency, while secondary "Learn More" buttons may use a slightly sharper radius or a full-pill shape if they are located in navigation.
- **Icon Containers:** Icons are often housed in small glassmorphic squares with a `0.5rem` (8px) radius.

## Components

### Buttons
- **Primary:** Solid Gold (#D4AF37) with Navy text. No shadow, but a subtle hover scale effect.
- **Secondary:** Ghost style with a thin Slate Gray or Gold border and Slate Gray text.
- **Action Links:** Text with a trailing arrow (e.g., "Place Your Bid ↗"), utilizing Hanken Grotesk Bold.

### Glass Cards
- **Construction:** Background: `rgba(255, 255, 255, 0.03)`, Backdrop-filter: `blur(16px)`, Border: `1px solid rgba(212, 175, 55, 0.2)`.
- **Inner Content:** Icons should be positioned top-right or top-left, utilizing gold stroke-based iconography.

### Input Fields
- **Bidding Input:** Darker than the background, with a 1px gold border on focus. Text should be monospaced (Space Grotesk) to reflect financial precision.

### Status Indicators
- **Indicators:** Use "Glowing" dots for live states (e.g., "Live Transaction"). These utilize a CSS pulse animation with the primary gold color.
