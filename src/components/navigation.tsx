"use client";

import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { CartButton } from "./cart-button";
import { useLocale } from "@/contexts/locale-context";
import { t } from "@/lib/i18n";

const navLinkKeys: { href: string; key: string }[] = [
  { href: "/", key: "nav.home" },
  { href: "/#categories", key: "nav.categories" },
  { href: "/#restaurants", key: "nav.browse" },
  { href: "/track", key: "nav.track" },
  { href: "/orders/history", key: "nav.history" },
  { href: "/account", key: "nav.account" },
  { href: "/support", key: "nav.support" },
  { href: "/checkout", key: "nav.checkout" },
  { href: "/staff/orders", key: "nav.staff" },
  { href: "/restaurant-portal", key: "nav.restaurant" },
  { href: "/driver", key: "nav.driver" },
  { href: "/admin", key: "nav.admin" },
];

interface NavigationProps {
  onCartClick: () => void;
}

export function Navigation({ onCartClick }: NavigationProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { locale, setLocale } = useLocale();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
        isScrolled
          ? "bg-white dark:bg-slate-900 shadow-sm border-b border-slate-200 dark:border-slate-800"
          : "bg-white dark:bg-slate-900"
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">
          <Link
            href="/"
            className="flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-white"
          >
            <span className="text-primary font-bold">Siargao</span>
            <span className="text-slate-600 dark:text-slate-400 font-normal">Delivery</span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            <button
              onClick={() => setLocale(locale === "en" ? "tl" : "en")}
              className="px-2 py-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded"
              title={locale === "en" ? "Filipino" : "English"}
            >
              {locale === "en" ? "TL" : "EN"}
            </button>
            {navLinkKeys.map((link) => {
              const label = t(locale, link.key);
              return link.href.startsWith("/#") ? (
                <a
                  key={link.href}
                  href={link.href}
                  className="px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  {label}
                </a>
              ) : (
                <Link
                  key={link.href}
                  href={link.href}
                  className="px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  {label}
                </Link>
              );
            })}
            <div className="ml-2 pl-2 border-l border-slate-200 dark:border-slate-700">
              <CartButton onClick={onCartClick} />
            </div>
          </div>

          <div className="flex md:hidden items-center gap-1">
            <CartButton onClick={onCartClick} />
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              aria-label={isOpen ? "Close menu" : "Open menu"}
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {isOpen && (
          <div className="md:hidden py-4 border-t border-slate-200 dark:border-slate-800">
            <div className="flex flex-col gap-1">
              {navLinkKeys.map((link) => {
                const label = t(locale, link.key);
                return link.href.startsWith("/#") ? (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className="px-3 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    {label}
                  </a>
                ) : (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className="px-3 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    {label}
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
