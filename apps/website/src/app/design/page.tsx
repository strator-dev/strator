import type { Metadata } from "next";
import React from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { DesignSystemShowcase } from "./DesignSystemShowcase";

export const metadata: Metadata = {
  title: "Design System | Strator",
  description: "Tokens, components and patterns behind strator.dev.",
  robots: { index: false, follow: false },
};

export default function DesignSystemPage() {
  return (
    <div className="min-h-screen flex flex-col bg-ink-900 text-slate-100 selection:bg-cyan-400 selection:text-slate-950 glow-mesh grid-pattern">
      <Header />
      <main className="flex-grow">
        <DesignSystemShowcase />
      </main>
      <Footer />
    </div>
  );
}
