# DESIGN.md

## Design Direction

Design style:

**Modern Industrial Corporate**

The public website should communicate:

- precision
- reliability
- manufacturing capability
- engineering discipline
- corporate credibility

Visual identity must feel intentionally designed by humans.

Avoid generic AI-generated visual patterns.

## Design Character

Use:

- strong typography
- manufacturing photography
- structured grids
- generous whitespace
- restrained corporate colors
- technical visual rhythm
- thin separators
- clear hierarchy

Avoid:

- purple/blue gradients
- aurora backgrounds
- glassmorphism
- excessive glow
- floating decorative objects
- excessive rounded cards
- gradient text
- excessive shadows
- generic SaaS layouts

## Color Foundation

Suggested neutral palette:

```text
Navy 900     #0B1F33
Navy 800     #12314D
Navy 700     #17466B

Charcoal     #1B1F23
Slate 700    #3E4852
Slate 500    #687581

Gray 200     #D9DEE3
Gray 100     #EEF1F3

Off White    #F8F9F7
White        #FFFFFF
```

Final primary color must match company branding.

Use semantic tokens:

```text
background
foreground
surface
primary
primary-foreground
muted
muted-foreground
border
success
warning
danger
```

Avoid direct color values inside reusable React components.

## Typography

Recommended:

```text
Inter
```

Suggested hierarchy:

```text
Display        56–72px
H1             48–56px
H2             36–44px
H3             28–32px
H4             22–24px

Body Large     18px
Body           16px
Small          14px
Caption        12–13px
```

Mobile typography must scale down appropriately.

## Layout

Maximum content width:

```text
1280px
```

Wide visual sections:

```text
1440px
```

Horizontal padding:

```text
Desktop 32px
Tablet 24px
Mobile 20px
```

Grid:

```text
Desktop 12 columns
Tablet 8 columns
Mobile 4 columns
```

## Section Spacing

Recommended:

```text
Desktop 96–120px
Tablet 72–96px
Mobile 56–72px
```

## Buttons

Primary:

- solid brand color
- 44–48px height
- medium weight
- 4–6px radius

Secondary:

- transparent background
- subtle border

Do not make all buttons pill-shaped.

## Cards

Cards should remain restrained.

Prefer:

- typography
- image
- border
- spacing

over:

- strong shadow
- large radius
- decorative gradient

## Photography

Use real corporate/manufacturing images whenever possible.

Recommended subjects:

- factory
- machines
- tooling
- production
- quality inspection
- product closeups
- engineering activities

Avoid obvious generic stock photography.

## Motion

Allowed:

```text
fade
8–16px translate
subtle image scale
navbar transition
simple counters
```

Avoid:

```text
scroll hijacking
extreme parallax
3D gimmicks
custom cursor
flying text
constant movement
```

Typical animation duration:

```text
UI interaction: 150–300ms
Section reveal: 400–600ms
```

## Homepage Layout

Recommended:

```text
Navbar
Hero
Company Introduction
Key Metrics
Core Capabilities
Featured Products
Facilities
Quality & Certifications
Industries Served
Milestones
Latest News
Career CTA
Contact CTA
Footer
```

## Admin Design

Admin should feel like:

**Enterprise Content Management System**

Preferred:

- light working surface
- clear sidebar
- restrained borders
- high information clarity
- minimal decorative elements

Do not copy the visual style of the marketing website directly into CMS.

## Responsive Strategy

Desktop:

- full navigation
- multi-column
- large imagery

Tablet:

- reduced columns
- simplified navigation

Mobile:

- one-column primary content
- drawer navigation
- stacked CTA
- appropriately cropped images

CMS mobile must remain usable but is not the primary workflow.

## Accessibility

Implement:

- sufficient contrast
- keyboard support
- clear focus states
- semantic headings
- proper labels
- meaningful alt text
- visible validation errors
- real buttons for actions
