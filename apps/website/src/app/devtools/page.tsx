import React from "react";
import type { Metadata } from "next";
import {
  ArrowRight,
  Boxes,
  Download,
  ExternalLink,
  FileJson,
  FlaskConical,
  GitCompareArrows,
  History,
  Layers,
  ListTree,
  PanelsTopLeft,
  Puzzle,
  Timer,
  Users,
} from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CodeCard } from "@/components/docs/CodeCard";
import { Button, Card, CommandLine, IconTile, Section, SectionHeader, Tag } from "@/components/ui";
// All @strator packages, the devtools and the extensions are released together under one version.
import corePackage from "@strator/core/package.json";
import { DevtoolsPreview } from "./DevtoolsPreview";

export const metadata: Metadata = {
  title: "Strator Devtools | Inspect models, method calls and state diffs",
  description:
    "Strator Devtools show every model instance your app holds, every method called on them and exactly what each call changed. Available as a Chrome and Firefox extension and as an in-app panel.",
};

const VERSION = corePackage.version;
const REPO = "https://github.com/strator-dev/strator";
const RELEASES = `${REPO}/releases`;
/** Release assets keep the same name in every release, so this always serves the newest build. */
const downloadUrl = (browser: "chrome" | "firefox") => `${RELEASES}/latest/download/strator-devtools-${browser}.zip`;

const features = [
  {
    icon: <Boxes className="text-cyan-400" />,
    title: "Instances by scope",
    description:
      "Every model the app holds, grouped as global, shared or local, with its key, version and subscriber count. Disposed instances stay visible with their final state.",
    tag: "Instances",
  },
  {
    icon: <ListTree className="text-sky-400" />,
    title: "Every method call",
    description:
      "Arguments, status (done, threw or pending), duration and the number of state changes. Nested calls appear under their caller.",
    tag: "Action log",
  },
  {
    icon: <GitCompareArrows className="text-blue-400" />,
    title: "Leaf-level state diffs",
    description:
      "See exactly what a call changed, down to the leaf, e.g. items[0].qty: 1 → 2. The changed fields are highlighted in the state tree.",
    tag: "Inspector",
  },
  {
    icon: <History className="text-cyan-300" />,
    title: "Jump back, edit, replay",
    description:
      'Put an instance back into the state it had before a call, edit its state in place, or "Dispatch again" with the original arguments.',
    tag: "Time travel",
  },
  {
    icon: <FlaskConical className="text-emerald-400" />,
    title: "Tests from real calls",
    description:
      "Every call comes with a ready-to-paste Vitest test that replays it against the model, so a bug you just saw becomes a regression test.",
    tag: "Zero-mock testing",
  },
  {
    icon: <Users className="text-sky-300" />,
    title: "Who is subscribed",
    description:
      "The components that use an instance, the hook and selector each one uses, and how many times it rendered.",
    tag: "Subscribers",
  },
  {
    icon: <Timer className="text-amber-400" />,
    title: "Async calls, attributed",
    description:
      "State written after an await is attributed to the async method that is still pending, so long-running calls stay readable.",
    tag: "Async",
  },
  {
    icon: <FileJson className="text-purple-400" />,
    title: "Pause, filter, export",
    description:
      "Filter the log by text or instance, pause recording, clear it, or export the whole session as JSON to share or attach to a bug report.",
    tag: "Session",
  },
  {
    icon: <PanelsTopLeft className="text-teal-400" />,
    title: "Fits any layout",
    description:
      "Resize or fold the Instances and Inspector panes. On narrow screens they open as drawers over the log. The panel renders in a shadow root, so your CSS never leaks in.",
    tag: "Responsive",
  },
];

const chromeSteps = [
  <>
    Download <span className="font-mono text-slate-200">strator-devtools-chrome.zip</span> and unzip it.
  </>,
  <>
    Open <span className="font-mono text-slate-200">chrome://extensions</span> and turn on{" "}
    <strong className="text-white">Developer mode</strong>.
  </>,
  <>
    Click <strong className="text-white">Load unpacked</strong> and pick the unzipped folder.
  </>,
  <>
    Open a page that uses Strator, open DevTools and pick the <strong className="text-white">Strator</strong> tab.
  </>,
];

const firefoxSteps = [
  <>
    Download <span className="font-mono text-slate-200">strator-devtools-firefox.zip</span>.
  </>,
  <>
    Open <span className="font-mono text-slate-200">about:debugging#/runtime/this-firefox</span>.
  </>,
  <>
    Click <strong className="text-white">Load Temporary Add-on…</strong> and pick the downloaded zip.
  </>,
  <>
    Open a page that uses Strator, open DevTools and pick the <strong className="text-white">Strator</strong> tab.
  </>,
];

const anyAppCode = `import { mountDevtools } from "@strator/devtools";

if (import.meta.env.DEV) mountDevtools();`;

const reactCode = `import { StratorDevtools } from "@strator/devtools/react";
import { StratorProvider } from "@strator/react";

export function Root() {
  return (
    <StratorProvider>
      <App />
      {import.meta.env.DEV && <StratorDevtools />}
    </StratorProvider>
  );
}`;

function InstallSteps({
  browser,
  steps,
  note,
}: {
  browser: "Chrome" | "Firefox";
  steps: React.ReactNode[];
  note: React.ReactNode;
}) {
  return (
    <Card padding="lg" className="flex flex-col">
      <div className="flex items-center justify-between gap-4 mb-6">
        <h3 className="text-xl font-bold text-white">{browser}</h3>
        <Button
          href={downloadUrl(browser === "Chrome" ? "chrome" : "firefox")}
          variant="secondary"
          aria-label={`Download Strator Devtools for ${browser}`}
        >
          <Download className="w-4 h-4" />
          <span>Download .zip</span>
        </Button>
      </div>
      <ol className="space-y-4 flex-grow">
        {steps.map((step, index) => (
          <li key={index} className="flex gap-3 text-sm text-slate-400 leading-relaxed">
            <span className="shrink-0 w-6 h-6 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 font-mono text-xs flex items-center justify-center">
              {index + 1}
            </span>
            <span className="pt-0.5">{step}</span>
          </li>
        ))}
      </ol>
      <p className="mt-6 pt-4 border-t border-white/5 text-xs text-slate-400 leading-relaxed">{note}</p>
    </Card>
  );
}

export default function DevtoolsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#060913] text-slate-100 selection:bg-cyan-400 selection:text-slate-950 glow-mesh grid-pattern">
      <Header />

      <main className="flex-grow">
        {/* Hero */}
        <div className="relative pt-32 pb-16 overflow-hidden">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-gradient-to-tr from-cyan-600/15 via-blue-600/15 to-purple-600/10 blur-[120px] pointer-events-none rounded-full" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-900/80 border border-white/10 text-xs font-semibold mb-6 shadow-sm backdrop-blur-md">
                <span className="inline-block w-2 h-2 rounded-full bg-cyan-400 shadow-md shadow-cyan-400/50 animate-pulse" />
                <span className="font-mono text-white">Devtools</span>
                <span className="text-slate-500">|</span>
                <span className="font-mono text-cyan-400">v{VERSION}</span>
              </div>

              <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-display mb-4">
                See what your <span className="text-brand-gradient">models</span> are doing
              </h1>

              <p className="text-lg sm:text-xl text-slate-300 leading-relaxed mb-8">
                Every model instance your app holds, every method called on it, and exactly what each call changed.
                Install the browser extension and inspect any page that uses Strator, with no code changes.
              </p>

              <div className="flex flex-wrap items-center gap-3 mb-4">
                <Button href={downloadUrl("chrome")} size="lg" aria-label="Download Strator Devtools for Chrome">
                  <Download className="w-5 h-5" />
                  <span>Download for Chrome</span>
                </Button>
                <Button
                  href={downloadUrl("firefox")}
                  variant="secondary"
                  size="lg"
                  aria-label="Download Strator Devtools for Firefox"
                >
                  <Download className="w-5 h-5" />
                  <span>Download for Firefox</span>
                </Button>
              </div>
              <p className="text-xs text-slate-400 font-mono flex flex-wrap items-center gap-x-3 gap-y-1">
                <span>Chrome 111+ · Edge · Brave · Arc · Firefox 128+</span>
                <a
                  href={RELEASES}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-slate-300 hover:text-cyan-400 transition-colors"
                >
                  All releases
                  <ExternalLink className="w-3 h-3" />
                </a>
              </p>
            </div>

            <div className="mt-14">
              <DevtoolsPreview />
            </div>
          </div>
        </div>

        {/* Features */}
        <Section id="features" tinted>
          <SectionHeader
            eyebrow="What you get"
            eyebrowIcon={<Layers />}
            title="One panel for your whole state layer"
            lead="Instances, the calls made on them and the changes those calls caused, side by side."
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(feature => (
              <Card key={feature.title} interactive className="flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <IconTile>{feature.icon}</IconTile>
                  <Tag>{feature.tag}</Tag>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{feature.description}</p>
              </Card>
            ))}
          </div>
        </Section>

        {/* Two ways to run it */}
        <Section id="usage">
          <SectionHeader
            eyebrow="Two ways to run it"
            eyebrowIcon={<Puzzle />}
            title="In the browser, or inside your app"
            lead="Both show the same panel. The extension needs no code; the in-app panel works anywhere, including browsers without the extension."
          />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card padding="lg" className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <IconTile>
                  <Puzzle className="text-cyan-400" />
                </IconTile>
                <div>
                  <h3 className="text-xl font-bold text-white">Browser extension</h3>
                  <p className="text-xs font-mono text-slate-400">Chrome · Firefox</p>
                </div>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed">
                Adds a <strong className="text-white">Strator</strong> tab to the browser devtools. The extension
                installs its hook before the page&apos;s own scripts run, so it sees every model from the first render.
                Pages that never create a Strator model never talk to it.
              </p>
              <div className="flex flex-wrap gap-3 mt-auto pt-2">
                <Button href={downloadUrl("chrome")} aria-label="Download Strator Devtools for Chrome">
                  <Download className="w-4 h-4" />
                  <span>Chrome</span>
                </Button>
                <Button
                  href={downloadUrl("firefox")}
                  variant="secondary"
                  aria-label="Download Strator Devtools for Firefox"
                >
                  <Download className="w-4 h-4" />
                  <span>Firefox</span>
                </Button>
                <Button href="#install" variant="ghost">
                  <span>How to install</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </Card>

            <Card padding="lg" className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <IconTile>
                  <PanelsTopLeft className="text-sky-400" />
                </IconTile>
                <div>
                  <h3 className="text-xl font-bold text-white">In-app panel</h3>
                  <p className="text-xs font-mono text-slate-400">@strator/devtools · React, Vue, plain JS</p>
                </div>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed">
                A launcher in the corner opens the panel docked to the bottom of the page. React is bundled in, so it
                works the same in any app and never clashes with your React version. Import it before your app creates
                its first model.
              </p>
              <CommandLine command="pnpm add -D @strator/devtools" />
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 items-start gap-6 mt-6">
            <CodeCard title="Any app" filename="main.ts" language="typescript" code={anyAppCode} />
            <CodeCard title="React" filename="main.tsx" language="tsx" code={reactCode} />
          </div>
        </Section>

        {/* Install */}
        <Section id="install" tinted>
          <SectionHeader
            eyebrow="Install the extension"
            eyebrowIcon={<Download />}
            title="Up and running in a minute"
            lead={`Both downloads are built from the v${VERSION} release on GitHub. The extensions are not in the Chrome Web Store or on addons.mozilla.org yet, so you load them yourself.`}
          />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <InstallSteps
              browser="Chrome"
              steps={chromeSteps}
              note={
                <>
                  Works in Chrome 111+ and other Chromium browsers (Edge, Brave, Arc). Keep the unzipped folder: Chrome
                  loads the extension from it. To update, unzip the new release over it and click reload on the
                  extension card.
                </>
              }
            />
            <InstallSteps
              browser="Firefox"
              steps={firefoxSteps}
              note={
                <>
                  Needs Firefox 128+. The add-on is not signed by Mozilla yet, so Firefox keeps it only until you
                  restart the browser; load it again after a restart. If the tab stays empty, allow the add-on on the
                  site: Extensions menu in the toolbar → Strator Devtools.
                </>
              }
            />
          </div>
        </Section>
      </main>

      <Footer />
    </div>
  );
}
