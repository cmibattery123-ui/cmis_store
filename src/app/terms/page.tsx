import type { Metadata } from "next";
import { COMPANY_INFO } from "@/lib/constants";
import Footer from "@/components/shared/Footer";

export const metadata: Metadata = {
  title: "Terms & Conditions | Perfect Batteries",
  description: "Read the terms and conditions governing use of the Perfect Batteries platform by Chinna Mayil Industries.",
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-slate-50 dark:bg-[#07080C] text-slate-900 dark:text-white pt-36 md:pt-44 transition-colors duration-200">
      <section className="py-12 md:py-16 border-b border-slate-200 dark:border-white/10 px-4">
        <div className="max-w-4xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 dark:bg-primary/10 border border-amber-500/20 dark:border-primary/20 text-amber-700 dark:text-primary text-xs font-semibold">
            Legal & Compliance
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
            Terms & Conditions
          </h1>
          <p className="text-slate-500 dark:text-gray-400 text-xs">Last updated: January 2025</p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="space-y-8">
          {[
            {
              title: "1. Acceptance of Terms",
              body: "By accessing or using the Perfect Batteries platform, you agree to be bound by these Terms and Conditions. If you disagree with any part of these terms, you may not access the service.",
            },
            {
              title: "2. User Accounts",
              body: "You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You must notify us immediately of any unauthorized use. We reserve the right to terminate accounts that violate these terms.",
            },
            {
              title: "3. Dealer Program",
              body: "Dealer accounts require approval by Chinna Mayil Industries. Approved dealers get access to special pricing and the quotation system. We reserve the right to suspend or revoke dealer status if the terms of the dealer agreement are violated.",
            },
            {
              title: "4. Orders and Pricing",
              body: "All prices are in Indian Rupees (INR) and include applicable GST unless stated otherwise. We reserve the right to refuse or cancel any order for any reason. In case of pricing errors, we will notify you before processing the order.",
            },
            {
              title: "5. Payment",
              body: "Payments are processed securely through our payment gateway. By providing payment information, you represent that you are authorized to use the payment method. All transactions are subject to authorization and verification.",
            },
            {
              title: "6. Shipping and Delivery",
              body: "Delivery timelines are estimates and may vary due to factors beyond our control. Risk of loss and title pass to you upon delivery. For bulk or dealer orders, specific shipping terms will be outlined in the order confirmation.",
            },
            {
              title: "7. Returns and Warranty",
              body: "Products may be returned within 7 days of receipt if found to be defective. Warranty claims are handled as per our Warranty Policy. Products damaged due to misuse, accidents, or improper installation are not eligible for returns or warranty.",
            },
            {
              title: "8. Intellectual Property",
              body: "All content on this platform — including logos, product images, descriptions, and software — is the property of Chinna Mayil Industries and protected by applicable intellectual property laws. Unauthorized use is strictly prohibited.",
            },
            {
              title: "9. Limitation of Liability",
              body: "To the fullest extent permitted by law, Chinna Mayil Industries shall not be liable for any indirect, incidental, or consequential damages arising from use of our platform or products beyond the value of the product purchased.",
            },
            {
              title: "10. Governing Law",
              body: `These Terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of courts in Coimbatore, Tamil Nadu. For queries, contact: ${COMPANY_INFO.email}.`,
            },
          ].map(({ title, body }) => (
            <div key={title} className="p-6 md:p-8 rounded-3xl bg-white dark:bg-[#0C0D14] border border-slate-200 dark:border-white/15 shadow-sm">
              <h2 className="text-lg md:text-xl font-black uppercase tracking-tight text-slate-900 dark:text-white mb-3">{title}</h2>
              <p className="text-slate-600 dark:text-gray-300 leading-relaxed text-sm md:text-base font-normal">{body}</p>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </main>
  );
}
