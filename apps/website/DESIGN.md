# Strator design system

The visual language of [strator.dev](https://strator.dev), extracted from the website as it ships today.
It has three parts:

| Part               | Where                                                                   | What it is                                                                                |
| ------------------ | ----------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| Tokens             | [`src/styles/tokens.css`](src/styles/tokens.css)                        | Tailwind v4 `@theme` tokens: color, type, radii, shadows, motion, plus gradient variables |
| Primitives         | [`src/components/ui`](src/components/ui)                                | React components for the patterns the site repeats (buttons, pills, cards, sections, ...) |
| Living style guide | [`/design`](src/app/design/page.tsx) (`pnpm dev`, then open `/design/`) | Every token and primitive rendered on one page. Not linked from the nav, and `noindex`.   |

Everything here describes what the site already does. When the site and this document disagree, fix one of them.

## Principles

1. **Dark only.** The site has no light theme. Surfaces are near-black navy (`ink`), never pure black or grey.
2. **Light comes from the brand.** Glows, gradients and hover states are cyan to cobalt, sampled from the logo. Shadows are tinted with the brand, not black.
3. **Glass over a mesh.** Content sits on translucent, blurred `glass-panel` cards over a radial `glow-mesh` and a faint 32px `grid-pattern`.
4. **Hairlines, not borders.** Edges are white at 5 to 10% alpha.
5. **It is a developer tool.** Monospace carries the wordmark, code, tags, versions and overlines. Copy is short and technical.

## Color

### Brand (from `public/favicon.svg`)

| Token                  | Value     | Use                                  |
| ---------------------- | --------- | ------------------------------------ |
| `--color-brand-cyan`   | `#04f8fc` | Glow mesh highlight, selection       |
| `--color-brand-azure`  | `#00a2fc` | Logo mark fill, card hover glow      |
| `--color-brand-blue`   | `#0052fe` | Logo mid-tone                        |
| `--color-brand-cobalt` | `#003ffc` | Logo deep tone, glow mesh lower edge |
| `--color-brand-ice`    | `#d0f8ff` | Specular highlight in the mark       |

In UI, the brand is expressed through Tailwind's `cyan`, `sky` and `blue` scales, which sit close to these values.

### Ink (surfaces)

| Token             | Value     | Use                            |
| ----------------- | --------- | ------------------------------ |
| `--color-ink-950` | `#050811` | Footer                         |
| `--color-ink-900` | `#060913` | Page background (`bg-ink-900`) |
| `--color-ink-850` | `#070b12` | Code panes                     |
| `--color-ink-800` | `#080c14` | Inset wells                    |
| `--color-ink-700` | `#13223f` | Scrollbar thumb                |
| `--color-ink-600` | `#1e3562` | Scrollbar thumb hover          |

Inside cards, the site also layers Tailwind slate with alpha: `bg-slate-900/90` for title bars and pills, `bg-slate-950/60` for inset tracks, `bg-slate-800/80` for icon tiles and secondary buttons. Landing sections alternate between transparent and `bg-slate-950/30` to `/50`.

### Glass and lines

| Token                 | Value                  | Use                                    |
| --------------------- | ---------------------- | -------------------------------------- |
| `--color-glass`       | `rgb(10 17 32 / 0.65)` | `.glass-panel` fill, with 12px blur    |
| `--color-glass-hover` | `rgb(15 26 48 / 0.7)`  | `.glass-panel-hover:hover`             |
| `--color-line-subtle` | `white / 5%`           | Dividers, section borders, inner cards |
| `--color-line`        | `white / 8%`           | Glass panel border                     |
| `--color-line-strong` | `white / 10%`          | Feature cards, code windows            |

### Text roles

| Class            | Role                               |
| ---------------- | ---------------------------------- |
| `text-white`     | Headings, values, primary labels   |
| `text-slate-200` | Code text                          |
| `text-slate-300` | Lead paragraphs, nav items         |
| `text-slate-400` | Body copy, captions, icons at rest |
| `text-slate-500` | Separators, de-emphasised text     |
| `text-slate-600` | Line numbers                       |

### Accent tones

Accents are always a _tint_: `bg-<hue>-500/10`, `border-<hue>-500/20` (or `/30` for status), `text-<hue>-400`. The full class strings live in [`tones.ts`](src/components/ui/tones.ts).

| Tone      | Meaning                                    |
| --------- | ------------------------------------------ |
| `cyan`    | Primary accent, active nav, **React**      |
| `sky`     | Secondary accent, info, "design trade-off" |
| `blue`    | Tertiary accent                            |
| `teal`    | Rare accent (portability)                  |
| `emerald` | **Vue**, success, "copied"                 |
| `amber`   | Warning, "important gotcha"                |
| `rose`    | Critical, errors                           |
| `purple`  | Keywords in code, rare accent              |

React vs Vue is a fixed mapping (`frameworkTone`): anything React-specific is cyan, anything Vue-specific is emerald.

### Gradients

| Variable / utility                             | Stops                         | Use                             |
| ---------------------------------------------- | ----------------------------- | ------------------------------- |
| `--gradient-brand`, `bg-brand-gradient`        | cyan-500 → sky-500 → blue-600 | Primary buttons                 |
| `--gradient-brand-hover`                       | cyan-400 → blue-500           | Primary button hover            |
| `--gradient-brand-active`                      | cyan-600 → blue-600           | Selected segment                |
| `--gradient-brand-text`, `text-brand-gradient` | cyan-300 → sky-400 → blue-500 | Highlighted words in a headline |
| `--gradient-glow-mesh`, `.glow-mesh`           | four radial brand glows       | Page backdrop                   |

Hero and docs headers also place one large blurred blob (`blur-[120px]`, cyan/sky/blue at 15 to 20%) behind the heading.

## Typography

Prose uses the system sans stack (`--font-sans`); code, the `strator` wordmark, tags, versions and footer overlines use Tailwind's default monospace.

| Role         | Classes                                                                          |
| ------------ | -------------------------------------------------------------------------------- |
| Display (h1) | `text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-display` |
| H2 (landing) | `text-3xl sm:text-5xl font-bold tracking-tight`                                  |
| H2 (docs)    | `text-3xl sm:text-4xl font-bold tracking-tight`                                  |
| H3 (card)    | `text-lg font-bold` (or `text-xl`)                                               |
| Lead         | `text-lg sm:text-xl text-slate-300 leading-relaxed`                              |
| Section lead | `text-base sm:text-lg text-slate-400`                                            |
| Body         | `text-sm text-slate-400 leading-relaxed`                                         |
| Overline     | `text-xs font-semibold uppercase tracking-wider text-slate-400`                  |
| Code         | `font-mono text-xs sm:text-sm leading-relaxed`                                   |
| Micro        | `text-micro` (11px) or `text-nano` (10px), usually `font-mono`                   |

## Shape

| Token             | Equals        | Use                                            |
| ----------------- | ------------- | ---------------------------------------------- |
| `rounded-chip`    | `rounded-md`  | Segments, inline code chips                    |
| `rounded-control` | `rounded-lg`  | Buttons, nav items, icon buttons               |
| `rounded-tile`    | `rounded-xl`  | Stat tiles, icon tiles, install pill, hero CTA |
| `rounded-card`    | `rounded-2xl` | Cards, code windows, tables                    |
| `rounded-full`    |               | Pills, badges, dots                            |

The aliases and Tailwind's names are interchangeable; existing components use Tailwind's names.

## Elevation

| Token            | Use                                                     |
| ---------------- | ------------------------------------------------------- |
| `shadow-glow-sm` | Primary button at rest (`shadow-md shadow-cyan-500/20`) |
| `shadow-glow`    | Card hover lift                                         |
| `shadow-glow-lg` | Hero CTA (`shadow-xl shadow-cyan-500/25`)               |
| `shadow-window`  | Hero code window (`shadow-2xl shadow-cyan-950/40`)      |

The scrolled header uses the one black shadow on the site: `shadow-lg shadow-black/30`.

## Spacing and layout

- **Container:** `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8` (`<Container>`).
- **Section band:** `py-24` on the landing page, `py-20` in docs, separated by `border-t border-white/5` (`<Section>`).
- **Section header:** `max-w-3xl`, centered with `mb-16` on the landing page, left-aligned with `mb-12` in docs (`<SectionHeader>`).
- **Hero:** `pt-32 md:pt-40` to clear the fixed header.
- **Grids:** `gap-6` between cards, `gap-4` between tiles; columns step `1 → md:2 → lg:3`.
- **Inside cards:** `p-6` (`sm:p-8` for long-form), `p-4` for tiles; icon + label gaps are `gap-1.5` to `gap-2`.

## Motion

- `transition-colors` for nav and text links; `transition-all` for buttons.
- Card hover: `.glass-panel-hover` lifts 2px with `ease-glide` (`cubic-bezier(0.16, 1, 0.3, 1)`) over 250ms and adds a cyan border and `shadow-glow`.
- Small delights: arrows nudge `group-hover:translate-x-1`, icon tiles `group-hover:scale-110`, the hero CTA `hover:scale-[1.02]`.
- "Live" items use a pulsing dot (`animate-pulse`).
- Copy buttons swap to an emerald check for 2 seconds.

## Primitives

All exported from `@/components/ui`.

| Component                               | Pattern on the site                                                                                                        |
| --------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `Button`                                | `primary` gradient CTA, `secondary` slate chip, `ghost` nav link; sizes `sm`, `md`, `lg`; renders a link when given `href` |
| `IconButton`                            | Copy / menu buttons                                                                                                        |
| `Eyebrow`                               | Pill above section headings                                                                                                |
| `Tag`                                   | Monospace label on feature cards                                                                                           |
| `VersionBadge`                          | `v100.1.1` chip next to the wordmark                                                                                       |
| `StatusBadge`                           | Severity badges in the docs limitations                                                                                    |
| `StatusDot`                             | React/Vue dots and the pulsing "Demo" dot                                                                                  |
| `Card`                                  | `glass-panel` container, optional `interactive` hover                                                                      |
| `IconTile`                              | Feature icon square                                                                                                        |
| `StatTile`                              | Hero metric tiles                                                                                                          |
| `Container`, `Section`, `SectionHeader` | Page structure                                                                                                             |
| `SegmentedControl`                      | Code tab switcher and package-manager picker                                                                               |
| `CommandLine`                           | Install command with copy                                                                                                  |
| `CodeWindow`                            | Traffic-light code window around `CodeBlock`                                                                               |

Existing components still use inline Tailwind classes; the primitives reproduce those classes, so pages can move to them one at a time without visual change.

## Syntax highlighting

Prism token colors live in `src/app/globals.css` and use Tailwind 300 to 400 steps so code stays bright against ink: keywords purple-400, functions yellow-300, methods blue-400, strings emerald-300, numbers orange-300, tags cyan-400, operators sky-400, punctuation slate-400, comments slate-500 italic.

## Accessibility notes

- Body text on ink (`slate-400` on `#060913`) is about 7.7:1; `slate-500` is about 4.2:1, just under AA for body text, so keep it for large or secondary text.
- `IconButton` requires an `aria-label`; `SegmentedControl` renders `role="tablist"` with `aria-selected`.
- `Button` shows a cyan focus ring on keyboard focus. Existing hand-rolled buttons on the site do not yet.
