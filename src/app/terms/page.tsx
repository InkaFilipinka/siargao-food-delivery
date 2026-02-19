import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Terms & Conditions | Siargao Delivery",
  description: "Terms and Conditions for Siargao Delivery food delivery service.",
};

export default function TermsPage() {
  return (
    <main className="pt-14 min-h-screen bg-slate-50 dark:bg-slate-900/50">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <Link
          href="/policies"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Policies
        </Link>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-8">
          Terms & Conditions
        </h1>
        <div className="prose prose-slate dark:prose-invert max-w-none space-y-6 text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
          <p className="text-slate-600 dark:text-slate-400" suppressHydrationWarning>
            Last updated: {new Date().toLocaleDateString("en-PH")}
          </p>

          <section>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mt-8 mb-3">
              1. Acceptance of Terms
            </h2>
            <p>
              By using Siargao Delivery&apos;s website and services, you agree to these Terms & Conditions. If you do not agree, please do not use our service.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mt-8 mb-3">
              2. Service Description
            </h2>
            <p>
              Siargao Delivery provides food delivery in General Luna and surrounding areas of Siargao Island. We connect customers with local restaurants and arrange delivery to the specified address.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mt-8 mb-3">
              3. Payment Methods
            </h2>
            <p>We accept the following payment methods:</p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li><strong>Cash on delivery:</strong> Pay in cash when your order is delivered. Please have the exact amount or change ready.</li>
              <li><strong>Card (Stripe):</strong> Credit or debit card payments are processed securely by Stripe. You will be redirected to Stripe Checkout to complete payment. Refunds for card payments are processed through our staff portal and may take 5–10 business days.</li>
              <li><strong>GCash:</strong> Pay via GCash through our PayMongo integration. You will be redirected to complete the payment.</li>
              <li><strong>PayPal:</strong> Pay using your PayPal account. You will be redirected to PayPal to authorize the payment.</li>
            </ul>
            <p className="mt-3">
              All prices are in Philippine Pesos (₱). Taxes and fees (if any) are included unless otherwise stated.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mt-8 mb-3">
              4. Orders
            </h2>
            <p>
              By placing an order, you confirm that the information provided (name, address, phone, items) is accurate. Orders are subject to restaurant availability. We reserve the right to cancel or modify orders due to stock issues, delivery area limits, or other operational reasons.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mt-8 mb-3">
              5. Refunds and Cancellations
            </h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>Cancellations must be requested as early as possible. Once an order is confirmed or being prepared, cancellation may not be possible.</li>
              <li>Refunds for card, GCash, and PayPal payments are processed through the original payment method. Processing times vary by provider (typically 5–10 business days).</li>
              <li>For cash orders, refunds are handled on a case-by-case basis—contact us via WhatsApp.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mt-8 mb-3">
              6. Delivery
            </h2>
            <p>
              Delivery times are estimates. Delays may occur due to weather, traffic, or high demand. We deliver within our service area (General Luna and designated zones). You must provide a valid, accessible delivery address.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mt-8 mb-3">
              7. Limitation of Liability
            </h2>
            <p>
              Siargao Delivery is not liable for issues arising from restaurant preparation, food quality, allergies, or circumstances beyond our reasonable control. Our liability is limited to the order value in cases of our error.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mt-8 mb-3">
              8. User Conduct
            </h2>
            <p>
              You agree to use our service lawfully and not to harass staff, drivers, or restaurants. We may suspend or ban users who violate these terms.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mt-8 mb-3">
              9. Changes
            </h2>
            <p>
              We may update these Terms at any time. Continued use of the service after changes constitutes acceptance. We encourage you to review this page periodically.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mt-8 mb-3">
              10. Contact
            </h2>
            <p>
              For questions about these Terms, contact us via WhatsApp or the contact details on our website.
            </p>
          </section>
        </div>
        <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-700">
          <Link
            href="/privacy"
            className="text-primary hover:underline font-medium text-sm"
          >
            Read Privacy Policy →
          </Link>
        </div>
      </div>
    </main>
  );
}
