import type { Metadata } from "next";
import { COMPANY_INFO } from "@/lib/constants";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";

export const metadata: Metadata = {
  title: "Terms & Conditions | Perfect Batteries",
  description: "Read the terms and conditions governing use of the Perfect Batteries platform by Chinna Mayil Industries.",
};

export default function TermsPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#0A0A0A]">
        <section className="bg-gradient-to-b from-black to-[#0A0A0A] border-b border-white/5 py-16 px-4">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-heading font-bold text-white">Terms & Conditions</h1>
            <p className="text-gray-400 mt-2">Last updated: January 2025</p>
          </div>
        </section>

        <div className="max-w-4xl mx-auto px-4 py-16">
          <div className="prose prose-invert max-w-none space-y-10">
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
              <section key={title}>
                <h2 className="text-xl font-heading font-bold text-white mb-3">{title}</h2>
                <p className="text-gray-300 leading-relaxed">{body}</p>
              </section>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
