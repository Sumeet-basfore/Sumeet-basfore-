"use client";

import { ArrowUpRight, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { portfolio } from "@/data/portfolio";

const links = [
  { label: "Work", href: "#work" },
  { label: "About", href: "#about" },
  { label: "Stack", href: "#stack" },
  { label: "Lab", href: "#lab" },
  { label: "Contact", href: "#contact" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [open]);

  return (
    <header className="site-header">
      <a className="brand" href="#top" aria-label={`${portfolio.name} home`}>
        <span className="brand-mark">S</span>
        <span className="brand-name">Sumeet Basfore</span>
      </a>

      <nav className="desktop-nav" aria-label="Primary navigation">
        {links.map((link) => (
          <a key={link.href} href={link.href} onClick={() => setOpen(false)}>
            {link.label}
          </a>
        ))}
        <a className="nav-github" href={portfolio.githubUrl} target="_blank" rel="noopener noreferrer" aria-label="GitHub profile (opens in a new tab)">
          GitHub <ArrowUpRight size={14} strokeWidth={1.7} aria-hidden="true" />
        </a>
      </nav>

      <button
        className="menu-button"
        type="button"
        aria-expanded={open}
        aria-controls="mobile-navigation"
        aria-label={open ? "Close navigation" : "Open navigation"}
        onClick={() => setOpen((current) => !current)}
      >
        {open ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
      </button>

      <nav id="mobile-navigation" className="mobile-nav" aria-label="Mobile navigation" hidden={!open}>
        {links.map((link) => (
          <a key={link.href} href={link.href} onClick={() => setOpen(false)}>
            <span>{link.label}</span><ArrowUpRight size={16} aria-hidden="true" />
          </a>
        ))}
        <a href={portfolio.githubUrl} target="_blank" rel="noopener noreferrer" onClick={() => setOpen(false)} aria-label="GitHub profile (opens in a new tab)">
          <span>GitHub</span><ArrowUpRight size={16} aria-hidden="true" />
        </a>
      </nav>
    </header>
  );
}
