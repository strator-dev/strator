"use client";

import React, { useState } from "react";
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  Code2,
  Copy,
  Cpu,
  Info,
  Palette,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { CodeBlock } from "@/components/CodeBlock";
import {
  Button,
  Card,
  CodeWindow,
  CommandLine,
  Container,
  Eyebrow,
  IconButton,
  IconTile,
  Section,
  SectionHeader,
  SegmentedControl,
  StatTile,
  StatusBadge,
  StatusDot,
  Tag,
  VersionBadge,
  toneSoft,
  type Tone,
} from "@/components/ui";

const brand = [
  { name: "brand-cyan", value: "#04f8fc", cls: "bg-brand-cyan", note: "Glow, selection highlight" },
  { name: "brand-azure", value: "#00a2fc", cls: "bg-brand-azure", note: "Logo mark fill" },
  { name: "brand-blue", value: "#0052fe", cls: "bg-brand-blue", note: "Logo mid-tone" },
  { name: "brand-cobalt", value: "#003ffc", cls: "bg-brand-cobalt", note: "Logo deep tone" },
  { name: "brand-ice", value: "#d0f8ff", cls: "bg-brand-ice", note: "Specular highlight" },
];

const ink = [
  { name: "ink-950", value: "#050811", cls: "bg-ink-950", note: "Footer" },
  { name: "ink-900", value: "#060913", cls: "bg-ink-900", note: "Page background" },
  { name: "ink-850", value: "#070b12", cls: "bg-ink-850", note: "Code panes" },
  { name: "ink-800", value: "#080c14", cls: "bg-ink-800", note: "Inset wells" },
  { name: "ink-700", value: "#13223f", cls: "bg-ink-700", note: "Scrollbar thumb" },
  { name: "ink-600", value: "#1e3562", cls: "bg-ink-600", note: "Scrollbar hover" },
];

const textRoles = [
  { cls: "text-white", role: "Headings, values, primary labels" },
  { cls: "text-slate-200", role: "Code text, mobile nav" },
  { cls: "text-slate-300", role: "Lead paragraphs, nav items" },
  { cls: "text-slate-400", role: "Body copy, captions, icons at rest" },
  { cls: "text-slate-500", role: "Separators, comments, de-emphasised" },
  { cls: "text-slate-600", role: "Line numbers" },
];

const tones: Array<{ tone: Tone; use: string }> = [
  { tone: "cyan", use: "Primary accent, React" },
  { tone: "sky", use: "Secondary accent, info" },
  { tone: "blue", use: "Tertiary accent" },
  { tone: "teal", use: "Portability" },
  { tone: "emerald", use: "Vue, success, copied" },
  { tone: "amber", use: "Warning, gotchas" },
  { tone: "rose", use: "Critical, errors" },
  { tone: "purple", use: "Keywords, rare accent" },
];

const typeScale = [
  {
    label: "Display",
    spec: "text-4xl sm:text-6xl lg:text-7xl · extrabold · tracking-tight · leading-display",
    node: (
      <p className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-display">
        State that <span className="text-brand-gradient">never touches the UI</span>
      </p>
    ),
  },
  {
    label: "H2 · section",
    spec: "text-3xl sm:text-5xl · bold · tracking-tight",
    node: <p className="text-3xl sm:text-5xl font-bold tracking-tight text-white">How Strator compares</p>,
  },
  {
    label: "H2 · docs",
    spec: "text-3xl sm:text-4xl · bold · tracking-tight",
    node: <p className="text-3xl sm:text-4xl font-bold tracking-tight text-white">Current limitations</p>,
  },
  {
    label: "H3 · card",
    spec: "text-lg / text-xl · bold",
    node: <p className="text-lg font-bold text-white">Zero-Mock Unit Testing</p>,
  },
  {
    label: "Lead",
    spec: "text-lg sm:text-xl · slate-300 · leading-relaxed",
    node: (
      <p className="text-lg sm:text-xl text-slate-300 leading-relaxed">
        Define your business logic in standard JavaScript classes.
      </p>
    ),
  },
  {
    label: "Body",
    spec: "text-sm · slate-400 · leading-relaxed",
    node: (
      <p className="text-sm text-slate-400 leading-relaxed">
        Instantiate models directly in Vitest or Jest. Verify complex domain logic without mounting components.
      </p>
    ),
  },
  {
    label: "Overline",
    spec: "text-xs · semibold · uppercase · tracking-wider",
    node: <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Unit tests</p>,
  },
  {
    label: "Code",
    spec: "font-mono · text-xs sm:text-sm · leading-relaxed",
    node: <p className="font-mono text-sm text-slate-200">new CartModel(&#123; items: [] &#125;)</p>,
  },
  {
    label: "Micro",
    spec: "text-micro (11px) / text-nano (10px) · font-mono",
    node: <p className="font-mono text-micro text-slate-300">OOP &amp; Clean Code</p>,
  },
];

const radii = [
  { name: "rounded-chip", alias: "rounded-md · 6px", use: "Segments, inline chips" },
  { name: "rounded-control", alias: "rounded-lg · 8px", use: "Buttons, nav items" },
  { name: "rounded-tile", alias: "rounded-xl · 12px", use: "Tiles, install pill, hero CTA" },
  { name: "rounded-card", alias: "rounded-2xl · 16px", use: "Cards, code windows, tables" },
  { name: "rounded-full", alias: "9999px", use: "Pills, badges, dots" },
];

const radiusClass: Record<string, string> = {
  "rounded-chip": "rounded-chip",
  "rounded-control": "rounded-control",
  "rounded-tile": "rounded-tile",
  "rounded-card": "rounded-card",
  "rounded-full": "rounded-full",
};

const shadows = [
  { cls: "shadow-glow-sm", use: "Primary button at rest" },
  { cls: "shadow-glow", use: "Card hover lift" },
  { cls: "shadow-glow-lg", use: "Hero CTA" },
  { cls: "shadow-window", use: "Hero code window" },
];

const spacing = [
  { token: "gap-1.5 / gap-2", px: "6–8px", use: "Icon + label inside controls" },
  { token: "gap-4 / gap-6", px: "16–24px", use: "Grid gutters between cards" },
  { token: "p-4", px: "16px", use: "Stat tiles, compact panels" },
  { token: "p-6 (sm:p-8)", px: "24–32px", use: "Cards" },
  { token: "mb-16", px: "64px", use: "Section header → content" },
  { token: "py-20 / py-24", px: "80–96px", use: "Section band (docs / landing)" },
  { token: "pt-32 md:pt-40", px: "128–160px", use: "Hero top, clears fixed header" },
];

const syntax = [
  { token: "keyword", color: "#c084fc", sample: "export class" },
  { token: "function / class-name", color: "#fde047", sample: "CartModel" },
  { token: "method / function-name", color: "#60a5fa", sample: "addItem" },
  { token: "string", color: "#6ee7b7", sample: '"@strator/core"' },
  { token: "number / boolean / property", color: "#fdba74", sample: "0.1" },
  { token: "tag / variable", color: "#22d3ee", sample: "<button>" },
  { token: "operator / attr-name", color: "#38bdf8", sample: "=>" },
  { token: "punctuation", color: "#94a3b8", sample: "{ }" },
  { token: "comment (italic)", color: "#64748b", sample: "// pure logic" },
];

const sampleCode = `import { Model } from "@strator/core";

export class CounterModel extends Model<{ count: number }> {
  static initialState = { count: 0 };

  increment() {
    // Mutations dispatch automatically when mounted
    this.state.count += 1;
  }
}`;

function Swatch({ cls, name, value, note }: { cls: string; name: string; value: string; note: string }) {
  return (
    <div className="space-y-2">
      <div className={`h-20 rounded-xl border border-white/10 ${cls}`} />
      <div>
        <div className="font-mono text-xs text-white">{name}</div>
        <div className="font-mono text-micro text-slate-500">{value}</div>
        <div className="text-xs text-slate-400 mt-0.5">{note}</div>
      </div>
    </div>
  );
}

function Subheading({ children }: { children: React.ReactNode }) {
  return <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono mb-4">{children}</h3>;
}

export function DesignSystemShowcase() {
  const [tab, setTab] = useState<"model" | "view" | "test">("model");
  const [pm, setPm] = useState<"pnpm" | "npm" | "yarn" | "bun">("pnpm");

  return (
    <>
      {/* Intro */}
      <div className="relative pt-32 pb-16 overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-gradient-to-tr from-cyan-600/15 via-blue-600/15 to-purple-600/10 blur-[120px] pointer-events-none rounded-full" />
        <Container className="relative z-10">
          <div className="max-w-3xl">
            <Eyebrow icon={<Palette />} className="mb-6">
              Design System
            </Eyebrow>
            <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight mb-4">
              Strator <span className="text-brand-gradient">visual language</span>
            </h1>
            <p className="text-lg sm:text-xl text-slate-300 leading-relaxed">
              Dark navy surfaces, translucent glass panels, a cyan-to-cobalt brand gradient taken from the logo, and
              monospace accents that keep the site feeling like a developer tool. Tokens live in{" "}
              <code className="font-mono text-cyan-300 text-base">src/styles/tokens.css</code>, components in{" "}
              <code className="font-mono text-cyan-300 text-base">src/components/ui</code>.
            </p>
          </div>
        </Container>
      </div>

      {/* Color */}
      <Section id="color">
        <SectionHeader
          align="left"
          eyebrow="Tokens"
          title="Color"
          lead="Dark-only. Brand hues come from the logo mark; accents are Tailwind palette tints."
        />

        <Subheading>Brand</Subheading>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-12">
          {brand.map(c => (
            <Swatch key={c.name} {...c} />
          ))}
        </div>

        <Subheading>Ink · surfaces</Subheading>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-12">
          {ink.map(c => (
            <Swatch key={c.name} {...c} />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
          <div>
            <Subheading>Text roles</Subheading>
            <Card padding="md" className="space-y-3">
              {textRoles.map(t => (
                <div key={t.cls} className="flex items-baseline justify-between gap-4">
                  <span className={`text-base font-medium ${t.cls}`}>The quick brown model</span>
                  <span className="text-right">
                    <span className="block font-mono text-micro text-cyan-300">{t.cls}</span>
                    <span className="block text-xs text-slate-500">{t.role}</span>
                  </span>
                </div>
              ))}
            </Card>
          </div>
          <div>
            <Subheading>Lines &amp; glass</Subheading>
            <Card padding="md" className="space-y-4">
              {[
                ["border-white/5", "line-subtle", "Dividers, section borders, inner cards"],
                ["border-white/8", "line", "Glass panel border"],
                ["border-white/10", "line-strong", "Feature cards, code windows, scrolled header"],
              ].map(([cls, token, use]) => (
                <div key={token} className="flex items-center gap-4">
                  <div className={`w-16 h-10 rounded-lg border-2 ${cls}`} />
                  <div>
                    <div className="font-mono text-xs text-white">
                      {cls} <span className="text-slate-500">· {token}</span>
                    </div>
                    <div className="text-xs text-slate-400">{use}</div>
                  </div>
                </div>
              ))}
              <div className="flex items-center gap-4">
                <div className="w-16 h-10 rounded-lg glass-panel" />
                <div>
                  <div className="font-mono text-xs text-white">
                    .glass-panel <span className="text-slate-500">· glass + blur-glass</span>
                  </div>
                  <div className="text-xs text-slate-400">rgb(10 17 32 / 0.65), 12px backdrop blur</div>
                </div>
              </div>
            </Card>
          </div>
        </div>

        <Subheading>Accent tones</Subheading>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-12">
          {tones.map(({ tone, use }) => (
            <div key={tone} className={`rounded-xl border p-4 ${toneSoft[tone]}`}>
              <div className="font-mono text-sm font-semibold">{tone}</div>
              <div className="text-xs text-slate-400 mt-1">{use}</div>
            </div>
          ))}
        </div>

        <Subheading>Gradients</Subheading>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-2">
            <div className="h-16 rounded-xl bg-brand-gradient" />
            <div className="font-mono text-xs text-white">--gradient-brand</div>
            <div className="text-xs text-slate-400">cyan-500 → sky-500 → blue-600 · primary CTA</div>
          </div>
          <div className="space-y-2">
            <div className="h-16 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600" />
            <div className="font-mono text-xs text-white">--gradient-brand-active</div>
            <div className="text-xs text-slate-400">cyan-600 → blue-600 · selected segment</div>
          </div>
          <div className="space-y-2">
            <div className="h-16 rounded-xl border border-white/10 glow-mesh bg-ink-900" />
            <div className="font-mono text-xs text-white">.glow-mesh</div>
            <div className="text-xs text-slate-400">Four radial brand glows · page backdrop</div>
          </div>
        </div>
      </Section>

      {/* Typography */}
      <Section id="typography" tinted>
        <SectionHeader
          align="left"
          eyebrow="Tokens"
          title="Typography"
          lead="System sans for prose, the platform monospace for the wordmark, code, tags and labels. Headings are tight and heavy."
        />
        <Card padding="none" className="divide-y divide-white/5">
          {typeScale.map(t => (
            <div key={t.label} className="grid grid-cols-1 md:grid-cols-[180px_1fr] gap-2 md:gap-6 p-6">
              <div>
                <div className="text-sm font-semibold text-white">{t.label}</div>
                <div className="font-mono text-micro text-slate-500 mt-1">{t.spec}</div>
              </div>
              <div className="min-w-0">{t.node}</div>
            </div>
          ))}
        </Card>
      </Section>

      {/* Shape & space */}
      <Section id="shape">
        <SectionHeader align="left" eyebrow="Tokens" title="Radii, shadows, spacing" />

        <Subheading>Radii</Subheading>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-12">
          {radii.map(r => (
            <div key={r.name} className="space-y-2">
              <div className={`h-20 bg-slate-800/80 border border-cyan-500/30 ${radiusClass[r.name]}`} />
              <div className="font-mono text-xs text-white">{r.name}</div>
              <div className="font-mono text-micro text-slate-500">{r.alias}</div>
              <div className="text-xs text-slate-400">{r.use}</div>
            </div>
          ))}
        </div>

        <Subheading>Shadows · brand-tinted glows</Subheading>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-12">
          {shadows.map(s => (
            <div key={s.cls} className="space-y-3">
              <div className={`h-20 rounded-xl bg-slate-900 border border-white/10 ${s.cls}`} />
              <div className="font-mono text-xs text-white">{s.cls}</div>
              <div className="text-xs text-slate-400">{s.use}</div>
            </div>
          ))}
        </div>

        <Subheading>Spacing &amp; layout</Subheading>
        <Card padding="none" className="overflow-hidden">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-900 border-b border-white/10 text-slate-300">
              <tr>
                <th className="py-3 px-6 font-semibold">Utility</th>
                <th className="py-3 px-6 font-semibold">Size</th>
                <th className="py-3 px-6 font-semibold">Used for</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {spacing.map(s => (
                <tr key={s.token}>
                  <td className="py-3 px-6 font-mono text-cyan-300">{s.token}</td>
                  <td className="py-3 px-6 text-slate-400">{s.px}</td>
                  <td className="py-3 px-6 text-slate-300">{s.use}</td>
                </tr>
              ))}
              <tr>
                <td className="py-3 px-6 font-mono text-cyan-300">max-w-7xl px-4 sm:px-6 lg:px-8</td>
                <td className="py-3 px-6 text-slate-400">1280px</td>
                <td className="py-3 px-6 text-slate-300">Page container (Container)</td>
              </tr>
              <tr>
                <td className="py-3 px-6 font-mono text-cyan-300">max-w-3xl</td>
                <td className="py-3 px-6 text-slate-400">768px</td>
                <td className="py-3 px-6 text-slate-300">Section header & lead measure</td>
              </tr>
            </tbody>
          </table>
        </Card>
      </Section>

      {/* Components */}
      <Section id="components" tinted>
        <SectionHeader
          align="left"
          eyebrow="Primitives"
          title="Components"
          lead="Primitives exported from @/components/ui. Each one reproduces a pattern already on the site."
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card padding="lg" className="space-y-4">
            <Subheading>Button</Subheading>
            <div className="flex flex-wrap items-center gap-3">
              <Button href="#components">
                Get Started <ArrowRight className="w-3.5 h-3.5" />
              </Button>
              <Button variant="secondary">GitHub</Button>
              <Button variant="ghost">Architecture</Button>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button size="lg" className="group">
                Get Started in 2 Minutes
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
              <IconButton aria-label="Copy">
                <Copy className="w-3.5 h-3.5" />
              </IconButton>
            </div>
          </Card>

          <Card padding="lg" className="space-y-4">
            <Subheading>Badges &amp; pills</Subheading>
            <div className="flex flex-wrap items-center gap-3">
              <Eyebrow icon={<Cpu />}>Engineered for Maximum Utility</Eyebrow>
              <Eyebrow tone="amber" icon={<AlertTriangle />}>
                Honest Engineering
              </Eyebrow>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <StatusBadge tone="rose" icon={<AlertCircle />}>
                Critical Behavior
              </StatusBadge>
              <StatusBadge tone="amber" icon={<AlertTriangle />}>
                Important Gotcha
              </StatusBadge>
              <StatusBadge tone="sky" icon={<Info />}>
                Design Trade-off
              </StatusBadge>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Tag>OOP &amp; Clean Code</Tag>
              <VersionBadge version="100.1.1" />
              <span className="inline-flex items-center gap-1.5 text-sm text-slate-300">
                <StatusDot /> React
              </span>
              <span className="inline-flex items-center gap-1.5 text-sm text-slate-300">
                <StatusDot tone="emerald" /> Vue
              </span>
              <span className="inline-flex items-center gap-1.5 text-sm text-slate-300">
                Demo <StatusDot pulse />
              </span>
            </div>
          </Card>

          <Card interactive padding="md" className="flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <IconTile>
                  <ShieldCheck className="text-emerald-400" />
                </IconTile>
                <Tag>100x Faster CI</Tag>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Feature card (interactive)</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Glass panel with hover lift, cyan border and glow. Icon tile scales on hover.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-white/5 text-xs font-medium text-cyan-400 group-hover:text-cyan-300">
              Learn more about this pattern →
            </div>
          </Card>

          <div className="grid grid-cols-2 gap-4 content-start">
            <StatTile
              icon={<ShieldCheck />}
              label="Unit Tests"
              value="0 UI Mocks"
              caption="Test pure classes in <1ms"
            />
            <StatTile
              icon={<Zap />}
              iconClassName="text-blue-400"
              label="Reactivity"
              value="Fine-Grained"
              caption="Zero unnecessary re-renders"
            />
            <StatTile
              icon={<Code2 />}
              iconClassName="text-teal-400"
              label="Portability"
              value="100% Agnostic"
              caption="React, Vue, Svelte, Node"
            />
            <StatTile
              icon={<Cpu />}
              iconClassName="text-sky-400"
              label="Architecture"
              value="True MVVM"
              caption="Strict separation"
            />
          </div>

          <Card padding="lg" className="space-y-4">
            <Subheading>Segmented control</Subheading>
            <SegmentedControl
              aria-label="Code sample"
              value={tab}
              onChange={setTab}
              options={[
                { value: "model", label: "1. Pure Model (TS)" },
                { value: "view", label: "2. UI View (React)" },
                { value: "test", label: "3. Zero-Mock Unit Test" },
              ]}
            />
            <div>
              <SegmentedControl
                aria-label="Package manager"
                size="sm"
                mono
                value={pm}
                onChange={setPm}
                options={(["pnpm", "npm", "yarn", "bun"] as const).map(v => ({ value: v, label: v }))}
              />
            </div>
          </Card>

          <Card padding="lg" className="space-y-4">
            <Subheading>Command line</Subheading>
            <CommandLine command={`${pm} ${pm === "npm" ? "install" : "add"} @strator/core @strator/react`} />
          </Card>
        </div>

        <div className="mt-6">
          <CodeWindow
            title="strator-state-demo"
            actions={
              <IconButton aria-label="Copy snippet" className="p-2">
                <Copy className="w-3.5 h-3.5" />
              </IconButton>
            }
          >
            <CodeBlock code={sampleCode} language="typescript" />
          </CodeWindow>
        </div>
      </Section>

      {/* Syntax */}
      <Section id="syntax">
        <SectionHeader
          align="left"
          eyebrow="Code"
          title="Syntax highlighting"
          lead="Prism tokens, styled in globals.css. Colors map to Tailwind 300–400 steps so code glows against ink."
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {syntax.map(s => (
            <div
              key={s.token}
              className="rounded-xl bg-ink-850 border border-white/5 p-4 flex items-center justify-between gap-4"
            >
              <div>
                <div className="font-mono text-xs text-white">{s.token}</div>
                <div className="font-mono text-micro text-slate-500">{s.color}</div>
              </div>
              <span
                className="font-mono text-sm"
                style={{ color: s.color, fontStyle: s.token.startsWith("comment") ? "italic" : undefined }}
              >
                {s.sample}
              </span>
            </div>
          ))}
        </div>
      </Section>
    </>
  );
}
