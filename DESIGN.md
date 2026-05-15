---
name: Beam
colors:
  surface: '#fbf9f6'
  surface-dim: '#dbdad7'
  surface-bright: '#fbf9f6'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f5f3f0'
  surface-container: '#efeeeb'
  surface-container-high: '#eae8e5'
  surface-container-highest: '#e4e2df'
  on-surface: '#1b1c1a'
  on-surface-variant: '#444748'
  inverse-surface: '#30312f'
  inverse-on-surface: '#f2f0ed'
  outline: '#747878'
  outline-variant: '#c4c7c7'
  surface-tint: '#5f5e5e'
  primary: '#181919'
  on-primary: '#ffffff'
  primary-container: '#2d2d2d'
  on-primary-container: '#959494'
  inverse-primary: '#c8c6c6'
  secondary: '#a73918'
  on-secondary: '#ffffff'
  secondary-container: '#fe7952'
  on-secondary-container: '#6c1900'
  tertiary: '#0a1c10'
  on-tertiary: '#ffffff'
  tertiary-container: '#1f3124'
  on-tertiary-container: '#859988'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e4e2e1'
  primary-fixed-dim: '#c8c6c6'
  on-primary-fixed: '#1b1c1c'
  on-primary-fixed-variant: '#474747'
  secondary-fixed: '#ffdbd1'
  secondary-fixed-dim: '#ffb5a0'
  on-secondary-fixed: '#3b0900'
  on-secondary-fixed-variant: '#862201'
  tertiary-fixed: '#d3e8d5'
  tertiary-fixed-dim: '#b7ccb9'
  on-tertiary-fixed: '#0e1f13'
  on-tertiary-fixed-variant: '#394b3d'
  background: '#fbf9f6'
  on-background: '#1b1c1a'
  surface-variant: '#e4e2df'
typography:
  display-lg:
    fontFamily: Newsreader
    fontSize: 48px
    fontWeight: '600'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Newsreader
    fontSize: 32px
    fontWeight: '500'
    lineHeight: '1.2'
  headline-sm:
    fontFamily: Newsreader
    fontSize: 24px
    fontWeight: '500'
    lineHeight: '1.3'
  body-lg:
    fontFamily: IBM Plex Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: IBM Plex Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  code-md:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
  label-caps:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1'
    letterSpacing: 0.05em
  display-lg-mobile:
    fontFamily: Newsreader
    fontSize: 36px
    fontWeight: '600'
    lineHeight: '1.1'
spacing:
  unit-1: 1px
  unit-2: 2px
  unit-3: 3px
  unit-5: 5px
  unit-8: 8px
  unit-13: 13px
  unit-21: 21px
  unit-34: 34px
  unit-55: 55px
  gutter: 21px
  margin-mobile: 13px
  margin-desktop: 34px
---

## Brand & Style

This design system embodies **Industrial Minimalism**, a philosophy that balances the raw utility required by developers with the sophisticated polish of a high-end editorial publication. It is designed to feel like a premium tool—heavy, deliberate, and quiet—evoking a sense of calm focus in high-pressure technical environments.

The aesthetic rejects the "toy-like" roundness of modern SaaS in favor of architectural precision. By combining the intellectual authority of classic serif typography with the cold efficiency of monospaced and technical sans-serifs, the system creates a workspace that feels both timeless and cutting-edge. It prioritizes information density without sacrificing legibility, utilizing a strict structural grid and a restrained palette to guide the user’s eye toward intentional points of interaction.

## Colors

The palette is rooted in natural, architectural materials. **Stone** provides a warm, non-glare canvas that reduces eye strain during long coding sessions. **Muted Charcoal** serves as the primary ink, used for all structural elements, text, and primary icons to maintain a high-contrast but grounded feel.

Functional color is used with extreme restraint:
- **Terracotta** is reserved exclusively for primary calls to action, focus states, and critical paths. It represents "the spark" within the machinery.
- **Soft Olive** indicates success and completion, chosen for its low-vibrancy to maintain the system's calm demeanor.
- **Stone-400 (#D1CEC7)** is the standard for 1px borders, providing just enough definition to separate modules without adding visual clutter.

## Typography

The typographic hierarchy creates a tension between the "Humanist" and the "Technical." 

- **Headings:** Use **Newsreader**. This adds an editorial, authoritative layer to the product. Use tighter tracking for display sizes and ensure a generous bottom margin to allow the serifs to breathe.
- **Body:** Use **IBM Plex Sans**. It is the workhorse of the system, chosen for its excellent legibility and neutral, systematic tone.
- **Metadata & Code:** Use **JetBrains Mono**. This is used for labels, status chips, and actual code blocks. It signals "technical precision" and should often be used in uppercase for small labels to create a distinct visual texture compared to body text.

## Layout & Spacing

This design system employs a **Fibonacci-based spacing scale** to create an organic yet structured rhythm. Instead of a standard 8pt grid, the system uses increments of 1, 2, 3, 5, 8, 13, 21, 34, 55, and 89 pixels. This creates a natural sense of hierarchy and "breathable" density.

The layout follows a **Fixed-Fluid hybrid grid**:
- **Desktop:** A 12-column grid with a max-width of 1440px. Gutters are fixed at 21px (Fibonacci).
- **Mobile:** A 4-column grid with 13px side margins. 
- **Density:** Components should favor the smaller end of the Fibonacci scale (5px, 8px) for internal padding to maintain a high-density, professional developer tool feel, while using larger gaps (34px, 55px) to separate major content sections.

## Elevation & Depth

In keeping with the Industrial Minimalist aesthetic, this system **shuns heavy shadows**. Depth is communicated through **tonal layering** and **low-contrast outlines**.

- **Level 0 (Background):** Stone (#F2F0ED).
- **Level 1 (Cards/Containers):** Same as background, defined by a 1px border of Stone-400.
- **Level 2 (Popovers/Modals):** A slightly lighter tint or white surface with a very fine, sharp 1px Charcoal border at 10% opacity. If a shadow is necessary for legibility, use a "Hard Ambient" style: 4px offset, 0px blur, Charcoal at 5% opacity.
- **Interaction:** Hover states are indicated by subtle background shifts to Stone-200 or the appearance of a 1px Terracotta bottom border, rather than a lift or shadow.

## Shapes

The shape language is **uncompromisingly sharp**. To reinforce the industrial, architectural feel, the base roundedness for all UI elements (buttons, inputs, cards) is **0px**. 

This geometric rigidity emphasizes the grid and the quality of the typography. The only exceptions are specific circular icons or status dots; otherwise, every container should present as a perfect rectangle. This creates a "blueprint" aesthetic that resonates with engineering precision.

## Components

- **Buttons:** Sharp 0px corners. Primary buttons use Muted Charcoal background with Stone text. Secondary buttons use a 1px Stone-400 border. CTA buttons use Terracotta. All buttons use JetBrains Mono (Label-Caps) for text.
- **Input Fields:** 1px Stone-400 border on all sides. On focus, the border changes to 1px Terracotta. Labels sit above the field in JetBrains Mono at 12px.
- **Status Chips:** Small, rectangular blocks with a 1px border. Use Soft Olive for "Success" and Muted Charcoal for "Default/Neutral." Text is always JetBrains Mono.
- **Lists:** Separated by 1px Stone-400 horizontal rules. High vertical density (8px padding). Use "hover" background of Stone-200 to indicate row selection.
- **Cards:** No shadows. Defined solely by 1px Stone-400 borders. Headers within cards should use Newsreader (Headline-sm).
- **Tabs:** Industrial style. Active tabs are indicated by a 2px Terracotta bottom bar and Charcoal text. Inactive tabs use Muted Charcoal text and no bar.
- **Code Blocks:** A slightly darker Stone variant (#E8E6E1) background, no border, using JetBrains Mono. Use the Fibonacci unit (13px) for internal padding.