import React from "react";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { ArchitectureDiagram } from "@/components/ArchitectureDiagram";
import { InteractiveDemo } from "@/components/InteractiveDemo";
import { TestingShowcase } from "@/components/TestingShowcase";
import { KeyFeatures } from "@/components/KeyFeatures";
import { CodePlayground } from "@/components/CodePlayground";
import { ComparisonTable } from "@/components/ComparisonTable";
import { QuickStart } from "@/components/QuickStart";
import { FAQ } from "@/components/FAQ";
import { Footer } from "@/components/Footer";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#060913] text-slate-100 selection:bg-cyan-400 selection:text-slate-950 glow-mesh grid-pattern">
      <Header />
      <main className="flex-grow">
        <Hero />
        <ArchitectureDiagram />
        <InteractiveDemo />
        <TestingShowcase />
        <KeyFeatures />
        <CodePlayground />
        <ComparisonTable />
        <QuickStart />
        <FAQ />
      </main>
      <Footer />
    </div>
  );
}
