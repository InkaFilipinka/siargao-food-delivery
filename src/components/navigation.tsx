"use client";

import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { CartButton } from "./cart-button";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/#categories", label: "Categories" },
  { href: "/#restaurants", label: "All Restaurants" },
  { href: "/track", label: "Track" },
  { href: "/checkout", label: "Checkout" },
  { href: "/staff/orders", label: "Staff" },
  { href: "/#order", label: "Order" },
];

interface NavigationProps {
  onCartClick: () => void;
}

export function Navigation({ onCartClick }: NavigationProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white shadow-lg border-b border-orange-100 dark:bg-slate-900 dark:border-orange-900/30"
          : "bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          <Link
            href="/"
            className="flex items-center space-x-2 text-xl md:text-2xl font-bold bg-gradient-to-r from-orange-600 to-amber-500 dark:from-orange-400 dark:to-amber-400 bg-clip-text text-transparent"
          >
            <span className="text-2xl">🍽️</span>
            <span>Siargao Delivery</span>
          </Link>

          <div className="hidden md:flex items-center space-x-4">
            {navLinks.map((link) =>
              link.href.startsWith("/#") ? (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-slate-700 dark:text-slate-300 hover:text-orange-600 dark:hover:text-orange-400 font-semibold transition-colors"
                >
                  {link.label}
                </a>
              ) : (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-slate-700 dark:text-slate-300 hover:text-orange-600 dark:hover:text-orange-400 font-semibold transition-colors"
                >
                  {link.label}
                </Link>
              )
            )}
            <CartButton onClick={onCartClick} />
          </div>

          <div className="flex md:hidden items-center gap-2">
            <CartButton onClick={onCartClick} />
            <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-slate-700 dark:text-slate-300 p-2"
            aria-label={isOpen ? "Close menu" : "Open menu"}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          </div>
        </div>

        {isOpen && (
          <div className="md:hidden py-4 border-t border-slate-200 dark:border-slate-700">
            {navLinks.map((link) =>
              link.href.startsWith("/#") ? (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="block py-3 text-slate-700 dark:text-slate-300 hover:text-orange-600 font-semibold"
                >
                  {link.label}
                </a>
              ) : (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="block py-3 text-slate-700 dark:text-slate-300 hover:text-orange-600 font-semibold"
                >
                  {link.label}
                </Link>
              )
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
