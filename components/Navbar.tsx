"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const navigation = [
  { label: "Home", href: "/" },
  { label: "Teams", href: "/teams" },
  { label: "Players", href: "/players" },
  { label: "Matches", href: "/matches" },
  { label: "Brackets", href: "/brackets" },
  { label: "Stats", href: "/stats" },
  { label: "Contact", href: "/contact" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-white/10 bg-[#090909]/90 backdrop-blur-xl">
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-5 lg:px-8">
        {/* LOGO */}
        <Link
          href="/"
          onClick={() => setOpen(false)}
          className="flex items-center gap-3"
        >
          <div className="flex h-10 w-10 items-center justify-center bg-[#ff6b00] font-black italic text-black">
            FN
          </div>

          <div className="leading-none">
            <div className="font-black tracking-tight text-white">
              NWIS FORTNITE
            </div>

            <div className="mt-1 text-[9px] font-bold uppercase tracking-[0.25em] text-zinc-500">
              Zone Wars
            </div>
          </div>
        </Link>

        {/* DESKTOP NAV */}
        <div className="hidden items-center gap-6 lg:flex">
          {navigation.map((item) => {
            const active = isActive(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative py-2 text-sm font-semibold transition ${
                  active
                    ? "text-[#ff6b00]"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                {item.label}

                {active && (
                  <span className="absolute bottom-0 left-0 h-px w-full bg-[#ff6b00]" />
                )}
              </Link>
            );
          })}

          <Link
            href="/admin"
            className="border border-[#ff6b00]/40 bg-[#ff6b00]/10 px-4 py-2 text-xs font-black uppercase tracking-wide text-[#ff8a33] transition hover:bg-[#ff6b00] hover:text-black"
          >
            Admin
          </Link>
        </div>

        {/* MOBILE BUTTON */}
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="flex h-10 w-10 items-center justify-center border border-white/10 bg-white/5 text-zinc-300 transition hover:border-white/20 hover:text-white lg:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* MOBILE MENU */}
      <div
        className={`overflow-hidden border-t border-white/10 transition-all duration-300 lg:hidden ${
          open
            ? "max-h-[500px] opacity-100"
            : "max-h-0 border-t-transparent opacity-0"
        }`}
      >
        <div className="px-5 py-4">
          <div className="space-y-1">
            {navigation.map((item) => {
              const active = isActive(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`flex items-center justify-between px-4 py-3 text-sm font-bold uppercase tracking-wide transition ${
                    active
                      ? "bg-[#ff6b00]/10 text-[#ff6b00]"
                      : "text-zinc-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  {item.label}

                  {active && (
                    <span className="h-2 w-2 bg-[#ff6b00]" />
                  )}
                </Link>
              );
            })}

            <Link
              href="/admin"
              onClick={() => setOpen(false)}
              className="mt-3 block border border-[#ff6b00]/30 bg-[#ff6b00]/10 px-4 py-3 text-center text-xs font-black uppercase tracking-wider text-[#ff8a33] transition hover:bg-[#ff6b00] hover:text-black"
            >
              Admin Portal
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}