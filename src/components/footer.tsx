import Link from "next/link";
import { MapPin, MessageCircle, Phone } from "lucide-react";
import { SUPPORT_PHONE, SUPPORT_WHATSAPP } from "@/config/support";

export function Footer() {
  return (
    <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 mt-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
          <div>
            <p className="text-lg font-semibold text-slate-900 dark:text-white">
              Siargao <span className="text-primary">Delivery</span>
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Food delivery in General Luna, Siargao Island
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-6">
            <Link
              href="/#restaurants"
              className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              Browse
            </Link>
            <Link
              href="/track"
              className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              Track order
            </Link>
            <Link
              href="/orders/history"
              className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              Order history
            </Link>
            <a
              href={`https://wa.me/${SUPPORT_WHATSAPP}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              WhatsApp
            </a>
            <a
              href={`tel:${SUPPORT_PHONE}`}
              className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              <Phone className="w-4 h-4" />
              Call
            </a>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            © {new Date().getFullYear()} Siargao Delivery. General Luna, Siargao.
          </p>
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <MapPin className="w-3.5 h-3.5" />
            Delivering to General Luna area
          </div>
        </div>
      </div>
    </footer>
  );
}
