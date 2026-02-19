import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Privacy Policy | Siargao Delivery",
  description: "Privacy Policy for Siargao Delivery food delivery service.",
};

export default function PrivacyPage() {
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
          Privacy Policy
        </h1>
        <div className="prose prose-slate dark:prose-invert max-w-none space-y-6 text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
          <p className="text-slate-600 dark:text-slate-400" suppressHydrationWarning>
            Last updated: {new Date().toLocaleDateString("en-PH")}
          </p>

          <section>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mt-8 mb-3">
              1. Introduction
            </h2>
            <p>
              Siargao Delivery (&quot;we&quot;, &quot;our&quot;, &quot;us&quot;) operates a food delivery service in General Luna, Siargao Island. This Privacy Policy explains how we collect, use, disclose, and protect your personal information when you use our website and services.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mt-8 mb-3">
              2. Information We Collect
            </h2>
            <p>We collect information you provide directly:</p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li><strong>Contact details:</strong> Name, phone number, WhatsApp number, email address</li>
              <li><strong>Delivery address:</strong> Location, landmark, room/floor, guest name</li>
              <li><strong>Order details:</strong> Items ordered, quantities, preferences, special requests</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mt-8 mb-3">
              3. Payment Information
            </h2>
            <p>We accept the following payment methods:</p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li><strong>Cash on delivery:</strong> No payment data is collected. Our driver collects cash when delivering your order.</li>
              <li><strong>Card (Stripe):</strong> Payment is processed securely by Stripe. We do not store full card numbers. For refund purposes, we store only the last 4 digits of your card and the card brand (e.g., Visa, Mastercard). Stripe&apos;s own privacy policy applies: <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">stripe.com/privacy</a>.</li>
              <li><strong>GCash (PayMongo):</strong> Payment is processed by PayMongo. We do not store your GCash account details. Their privacy policy applies to payment processing.</li>
              <li><strong>PayPal:</strong> Payment is processed by PayPal. We do not store your PayPal account or payment details. PayPal&apos;s privacy policy applies: <a href="https://www.paypal.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">paypal.com/privacy</a>.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mt-8 mb-3">
              4. How We Use Your Information
            </h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>To process and fulfill your orders</li>
              <li>To communicate with you (e.g., order updates, delivery status)</li>
              <li>To contact you via WhatsApp or phone regarding your order</li>
              <li>To improve our service and user experience</li>
              <li>To handle refunds when applicable</li>
              <li>To comply with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mt-8 mb-3">
              5. Data Sharing
            </h2>
            <p>We may share your information with:</p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li><strong>Restaurants:</strong> To prepare your order</li>
              <li><strong>Drivers:</strong> To deliver your order (name, address, phone)</li>
              <li><strong>Payment processors:</strong> Stripe, PayMongo, PayPal—only to process payments</li>
            </ul>
            <p className="mt-3">We do not sell your personal information to third parties.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mt-8 mb-3">
              6. Data Security
            </h2>
            <p>
              We use appropriate technical and organizational measures to protect your personal data. Payment card details are handled exclusively by our payment providers (Stripe, PayMongo, PayPal) in accordance with their security standards.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mt-8 mb-3">
              7. Data Retention
            </h2>
            <p>
              We retain order and contact information as needed to provide our services, handle refunds, and comply with legal requirements. For card payments, we store only the last 4 digits and card brand for refund purposes—not full card details.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mt-8 mb-3">
              8. Your Rights
            </h2>
            <p>
              You may request access to, correction of, or deletion of your personal data by contacting us via WhatsApp or the contact details provided on our website.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mt-8 mb-3">
              9. Contact
            </h2>
            <p>
              For privacy-related questions, contact us via WhatsApp or the contact details on our website.
            </p>
          </section>
        </div>
        <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-700">
          <Link
            href="/terms"
            className="text-primary hover:underline font-medium text-sm"
          >
            Read Terms & Conditions →
          </Link>
        </div>
      </div>
    </main>
  );
}
