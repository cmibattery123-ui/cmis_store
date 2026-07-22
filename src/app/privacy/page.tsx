import type { Metadata } from "next";
import { COMPANY_INFO } from "@/lib/constants";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";

export const metadata: Metadata = {
  title: "Privacy Policy | Perfect Batteries",
  description: "Read our privacy policy to understand how Chinna Mayil Industries collects, uses, and protects your personal data.",
};

export default function PrivacyPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#0A0A0A]">
        <section className="bg-gradient-to-b from-black to-[#0A0A0A] border-b border-white/5 py-16 px-4">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-heading font-bold text-white">Privacy Policy</h1>
            <p className="text-gray-400 mt-2">Last updated: January 2025</p>
          </div>
        </section>

        <div className="max-w-4xl mx-auto px-4 py-16">
          <div className="prose prose-invert max-w-none space-y-10">
            {[
              {
                title: "1. Information We Collect",
                body: `We collect information you provide directly to us when you create an account, place an order, apply as a dealer, or contact us for support. This includes your name, email address, phone number, postal address, and payment information. We also collect technical data such as IP addresses, browser type, and pages visited through cookies and analytics tools.`,
              },
              {
                title: "2. How We Use Your Information",
                body: `Your information is used to process transactions and manage your account, communicate with you about orders and services, send promotional emails (only with your consent), improve our products and website, comply with legal obligations, and prevent fraud and maintain the security of our platform.`,
              },
              {
                title: "3. Data Sharing",
                body: `We do not sell, trade, or rent your personal information to third parties. We may share data with trusted service providers who assist in operating our website and conducting our business (such as payment processors, shipping partners, and cloud infrastructure providers), provided they agree to keep this information confidential.`,
              },
              {
                title: "4. Data Retention",
                body: `We retain your personal data for as long as your account is active or as needed to provide services. You can request deletion of your account and associated data by contacting us. We may retain certain information as required by law or for legitimate business purposes.`,
              },
              {
                title: "5. Security",
                body: `We implement industry-standard security measures including encrypted connections (HTTPS/TLS), hashed passwords, and secure payment processing. However, no method of transmission over the internet is 100% secure.`,
              },
              {
                title: "6. Cookies",
                body: `We use essential cookies to operate the website (authentication, cart), functional cookies for preferences, and analytics cookies to understand traffic patterns. You can control cookie settings through your browser preferences.`,
              },
              {
                title: "7. Your Rights",
                body: `You have the right to access, update, or delete your personal information at any time. You may also opt out of marketing communications. To exercise these rights, contact us at ${COMPANY_INFO.email}.`,
              },
              {
                title: "8. Contact Us",
                body: `For any privacy-related queries, contact: ${COMPANY_INFO.name}, ${COMPANY_INFO.address}. Email: ${COMPANY_INFO.email}. Phone: ${COMPANY_INFO.phone}.`,
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
