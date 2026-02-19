import Link from "next/link";
import { ArrowLeft, Shield, FileText, Scale } from "lucide-react";

export const metadata = {
  title: "Policies | Siargao Delivery",
  description: "Privacy Policy, Terms & Conditions, and other policies.",
};

export default function PoliciesPage() {
  return (
    <main className="pt-14 min-h-screen bg-slate-50 dark:bg-slate-900/50">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          Policies
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mb-8">
          Legal and policy documents for Siargao Delivery.
        </p>
        <div className="space-y-4">
          <Link
            href="/privacy"
            className="flex items-center gap-4 p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
          >
            <div className="p-3 rounded-lg bg-primary/10">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold text-slate-900 dark:text-white">
                Privacy Policy
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                How we collect, use, and protect your personal data.
              </p>
            </div>
          </Link>
          <Link
            href="/terms"
            className="flex items-center gap-4 p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
          >
            <div className="p-3 rounded-lg bg-primary/10">
              <FileText className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold text-slate-900 dark:text-white">
                Terms & Conditions
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Rules and conditions for using our service.
              </p>
            </div>
          </Link>
          <div className="flex items-center gap-4 p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 opacity-75">
            <div className="p-3 rounded-lg bg-slate-200 dark:bg-slate-700">
              <Scale className="w-6 h-6 text-slate-500" />
            </div>
            <div>
              <h2 className="font-semibold text-slate-700 dark:text-slate-300">
                Payment methods
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                We accept <strong>Cash on delivery</strong>, <strong>Card (Stripe)</strong>, <strong>GCash</strong>, and <strong>PayPal</strong>. Details in Privacy and Terms.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
