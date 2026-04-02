"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border/80 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <Image src="/icon.png" alt="Drift Bottle" width={36} height={36} className="rounded-lg shadow-sm" />
          <div className="leading-tight">
            <span className="block font-display text-lg font-semibold text-foreground">Drift Bottle</span>
            <span className="hidden text-xs text-muted-foreground sm:block">漂流瓶</span>
          </div>
        </Link>
        <nav className="hidden items-center gap-8 text-sm font-medium text-foreground/90 md:flex">
          <a className="transition hover:text-primary" href="#features">
            功能
          </a>
          <a className="transition hover:text-primary" href="#download">
            获取 App
          </a>
        </nav>
        <button
          type="button"
          className="inline-flex rounded-xl border border-border bg-card px-3 py-2 text-sm font-semibold text-foreground md:hidden"
          aria-expanded={open}
          aria-controls="nav-panel"
          onClick={() => setOpen((v) => !v)}
        >
          菜单
        </button>
      </div>
      <div
        id="nav-panel"
        className={`${open ? "flex" : "hidden"} flex-col gap-1 border-t border-border/70 bg-background px-4 py-3 md:hidden`}
      >
        <a
          className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-muted"
          href="#features"
          onClick={() => setOpen(false)}
        >
          功能
        </a>
        <a
          className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-muted"
          href="#download"
          onClick={() => setOpen(false)}
        >
          获取 App
        </a>
      </div>
    </header>
  );
}
