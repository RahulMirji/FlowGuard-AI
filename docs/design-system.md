# Design System — FlowGuard AI

Based on a Sentry-inspired design language: deep purple-violet midnight canvas, electric lime accents, and a developer-tools personality.

## Color Tokens

| Token | Hex | Use |
|-------|-----|-----|
| `--primary` | `#150f23` | Deepest surface, primary button fill on light |
| `--ink-deep` | `#1f1633` | Dark canvas, body text on light |
| `--on-primary` | `#ffffff` | Text on dark, CTA labels |
| `--accent-lime` | `#c2ef4e` | Keyword highlight chips, squiggle divider |
| `--accent-pink` | `#fa7faa` | Secondary punctuation, alert accents |
| `--accent-violet` | `#6a5fc1` | Links, route lines, eyebrows |
| `--accent-violet-deep` | `#422082` | Spotlight cards, select fills |
| `--accent-violet-mid` | `#79628c` | Tag chips, faint accents |
| `--surface-dark` | `#1f1633` | Hero/feature page background |
| `--surface-night` | `#150f23` | Cards on dark, code blocks |
| `--hairline-violet` | `#362d59` | Dark card borders |
| `--on-dark-muted` | `#bdb8c0` | Secondary text on dark |
| `--on-dark-faint` | `#3f3849` | Ghost button fills, dim text |

## Flood-Specific Colors

| Token | Hex | Use |
|-------|-----|-----|
| `--flood-severe` | `#E2462F` | Severe risk zones |
| `--flood-high` | `#FF8C42` | High risk zones |
| `--flood-medium` | `#F5C842` | Medium risk zones |
| `--flood-low` | `#4CAF82` | Low risk, live indicators |

## Typography

- **Display:** Rubik 700, clamp(3rem, 6vw, 5.5rem), leading 1.05
- **Body (marketing):** Rubik 400, 16px, leading 2.0
- **Body (UI):** Rubik 500, 16px, leading 1.5
- **Eyebrow:** Rubik 500, 15px, uppercase, tracking 0.02em
- **Button:** Rubik 700, 14px, uppercase, tracking 0.02em
- **Caption:** Rubik 400, 12px
- **Code:** Monaco/Menlo, 16px

## Key Principles

1. Lime (`--accent-lime`) is a keyword highlight chip — never a button background, never body text
2. Two-polarity canvas: dark for marketing/features, light for transactional
3. Buttons: white-on-dark surfaces, dark-on-light surfaces (inverted CTA hierarchy)
4. Ghost buttons use translucent `--on-dark-faint` fill
5. Uppercase eyebrows + button labels with tracking give "developer console" cadence
6. Starfield texture on dark hero canvas for atmospheric depth
7. Squiggle lime divider above footer for personality
