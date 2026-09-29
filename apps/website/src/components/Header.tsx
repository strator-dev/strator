"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ArrowRight } from "lucide-react";
import corePackage from "@strator/core/package.json";

function GithubIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isHome = pathname === "/" || pathname === "";
  const isReact = pathname?.startsWith("/react");
  const isVue = pathname?.startsWith("/vue");

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 border-b transition-all duration-300 ${
        scrolled
          ? "bg-[#060913]/90 backdrop-blur-md border-white/10 py-3 shadow-lg shadow-black/30"
          : "bg-[#060913]/40 backdrop-blur-sm border-white/5 py-4"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600/20 via-cyan-500/20 to-sky-400/20 border border-cyan-500/30 p-1 flex items-center justify-center shadow-md shadow-cyan-500/15 group-hover:scale-105 group-hover:border-cyan-400/60 transition-all">
              <img
                src="/brand/logo-64.png"
                alt="Strator Logo"
                width={36}
                height={36}
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-bold text-xl tracking-tight text-white font-mono">strator</span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  v{corePackage.version}
                </span>
              </div>
              <span className="text-[11px] text-slate-400 hidden sm:inline-block">MVVM State for Web</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 sm:gap-2">
            <Link
              href="/"
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                isHome
                  ? "text-cyan-400 bg-cyan-500/10 border border-cyan-500/20"
                  : "text-slate-300 hover:text-cyan-400 hover:bg-white/5"
              }`}
            >
              Overview
            </Link>

            <Link
              href="/react/"
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                isReact
                  ? "text-cyan-400 bg-cyan-500/10 border border-cyan-500/20"
                  : "text-slate-300 hover:text-cyan-400 hover:bg-white/5"
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              <span>React</span>
            </Link>

            <Link
              href="/vue/"
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                isVue
                  ? "text-emerald-400 bg-emerald-500/10 border border-emerald-500/20"
                  : "text-slate-300 hover:text-emerald-400 hover:bg-white/5"
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>Vue</span>
            </Link>

            <a
              href={isHome ? "#architecture" : "/#architecture"}
              className="px-3 py-1.5 rounded-lg text-sm font-medium text-slate-300 hover:text-cyan-400 hover:bg-white/5 transition-colors"
            >
              Architecture
            </a>
            <a
              href={isHome ? "#testing" : "/#testing"}
              className="px-3 py-1.5 rounded-lg text-sm font-medium text-slate-300 hover:text-cyan-400 hover:bg-white/5 transition-colors"
            >
              Zero-Mock Testing
            </a>
            <a
              href={isHome ? "#demo" : "/#demo"}
              className="px-3 py-1.5 rounded-lg text-sm font-medium text-slate-300 hover:text-cyan-400 hover:bg-white/5 transition-colors flex items-center gap-1.5"
            >
              Demo
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
            </a>
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden sm:flex items-center gap-3">
            <a
              href="https://github.com/strator/strator"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 hover:border-cyan-500/40 transition-all"
            >
              <GithubIcon className="w-4 h-4" />
              <span>GitHub</span>
            </a>
            <Link
              href="/react/"
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-md shadow-cyan-500/20 transition-all hover:shadow-cyan-500/40"
            >
              <span>Get Started</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#060913]/95 backdrop-blur-xl border-b border-white/10 px-4 pt-3 pb-6 space-y-2">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className={`block px-3 py-2 rounded-md text-base font-medium ${
              isHome ? "text-cyan-400 bg-cyan-500/10 font-semibold" : "text-slate-200 hover:bg-slate-800"
            }`}
          >
            Overview &amp; Home
          </Link>
          <Link
            href="/react/"
            onClick={() => setMobileMenuOpen(false)}
            className={`flex items-center justify-between px-3 py-2 rounded-md text-base font-medium ${
              isReact ? "text-cyan-400 bg-cyan-500/10 font-semibold" : "text-slate-200 hover:bg-slate-800"
            }`}
          >
            <span>React Guide (@strator/react)</span>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300">Docs</span>
          </Link>
          <Link
            href="/vue/"
            onClick={() => setMobileMenuOpen(false)}
            className={`flex items-center justify-between px-3 py-2 rounded-md text-base font-medium ${
              isVue ? "text-emerald-400 bg-emerald-500/10 font-semibold" : "text-slate-200 hover:bg-slate-800"
            }`}
          >
            <span>Vue Guide (@strator/vue)</span>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">Docs</span>
          </Link>
          <a
            href={isHome ? "#architecture" : "/#architecture"}
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-slate-200 hover:bg-slate-800 hover:text-cyan-400"
          >
            Architecture
          </a>
          <a
            href={isHome ? "#testing" : "/#testing"}
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-slate-200 hover:bg-slate-800 hover:text-cyan-400"
          >
            Zero-Mock Testing
          </a>
          <a
            href={isHome ? "#demo" : "/#demo"}
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-slate-200 hover:bg-slate-800 hover:text-cyan-400"
          >
            Live Demo
          </a>

          <div className="pt-3 flex flex-col gap-2">
            <a
              href="https://github.com/strator/strator"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-slate-200 bg-slate-800 border border-slate-700"
            >
              <GithubIcon className="w-4 h-4" />
              GitHub Repository
            </a>
            <Link
              href="/react/"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600"
            >
              Explore React Docs
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
