import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://strator.dev"),
  title: "Strator | UI-Agnostic MVVM State Management for Modern Web",
  description:
    "A lightweight, UI-framework agnostic state management library based on MVVM architecture. Define models as pure JS classes, utilize reactive Proxies when mounted to UI to dispatch updates, and unit-test business logic with zero UI mocks.",
  keywords: [
    "state management",
    "MVVM",
    "React",
    "Vue",
    "Svelte",
    "TypeScript",
    "Proxy",
    "zero-mock testing",
    "Strator",
    "frontend architecture",
  ],
  authors: [{ name: "Strator Team" }],
  openGraph: {
    title: "Strator | Pure Logic, Zero-Mock MVVM State Management",
    description: "Decouple your business logic from the UI. Pure JS classes, reactive proxies, and effortless testing.",
    url: "https://strator.dev",
    siteName: "Strator",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/brand/logo-512.png",
        width: 512,
        height: 512,
        alt: "Strator Logo",
      },
    ],
  },
  icons: {
    icon: [
      { url: "/favicon.png", sizes: "32x32", type: "image/png" },
      { url: "/brand/logo-48.png", sizes: "48x48", type: "image/png" },
      { url: "/brand/logo-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body className="min-h-screen bg-[#060913] text-slate-100 antialiased selection:bg-cyan-400 selection:text-slate-950">
        {children}
      </body>
    </html>
  );
}
