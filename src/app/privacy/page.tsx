import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy | Inspire Blog",
  description: "Privacy Policy and GDPR compliance information for Inspire Blog.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="mb-12">
          <h1 className="text-4xl font-extrabold tracking-tight mb-4">Privacy Policy</h1>
          <p className="text-muted-foreground">Effective Date: May 27, 2026</p>
        </div>

        <div className="space-y-10 text-muted-foreground leading-relaxed">
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">1. Introduction</h2>
            <p>
              Welcome to Inspire Blog ("we," "our," or "us"). We are committed to protecting your personal data and respecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website (inspireblog.mythosh.com) and use our platform.
            </p>
            <p className="mt-4">
              This policy is designed to comply with the General Data Protection Regulation (GDPR) and other applicable privacy laws. By using Inspire Blog, you agree to the collection and use of information in accordance with this policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">2. Information We Collect</h2>
            <ul className="list-disc pl-6 space-y-3">
              <li>
                <strong className="text-foreground">Personal Data:</strong> When you register an account, subscribe to our newsletter, or contact us, we may collect personal information such as your name, email address, username, and profile picture.
              </li>
              <li>
                <strong className="text-foreground">Usage Data:</strong> We automatically collect information about how you interact with our platform, including your IP address, browser type, device information, pages visited, and timestamps.
              </li>
              <li>
                <strong className="text-foreground">Cookies and Tracking Technologies:</strong> We use cookies and similar technologies to enhance your experience, analyze trends, and administer the website. You can manage your cookie preferences through your browser settings.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">3. How We Use Your Information</h2>
            <p>We use the collected information for various purposes, including:</p>
            <ul className="list-disc pl-6 space-y-2 mt-4">
              <li>To provide, operate, and maintain our platform.</li>
              <li>To manage your account and provide customer support.</li>
              <li>To personalize your experience and deliver relevant content.</li>
              <li>To communicate with you, including sending updates, newsletters, and security alerts.</li>
              <li>To analyze usage patterns and improve our website's functionality and user experience.</li>
              <li>To detect, prevent, and address technical issues or fraudulent activities.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">4. Legal Basis for Processing (GDPR)</h2>
            <p>
              If you are from the European Economic Area (EEA), our legal basis for collecting and using the personal information described in this policy depends on the Personal Data we collect and the specific context in which we collect it:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-4">
              <li><strong className="text-foreground">Consent:</strong> You have given us permission to do so.</li>
              <li><strong className="text-foreground">Contract:</strong> Processing is necessary for the performance of a contract with you (e.g., providing our services).</li>
              <li><strong className="text-foreground">Legitimate Interests:</strong> Processing is in our legitimate interests and it's not overridden by your rights.</li>
              <li><strong className="text-foreground">Legal Obligation:</strong> We need to comply with the law.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">5. Data Sharing and Disclosure</h2>
            <p>We do not sell your personal data. We may share your information in the following situations:</p>
            <ul className="list-disc pl-6 space-y-2 mt-4">
              <li><strong className="text-foreground">With Service Providers:</strong> We may share data with third-party vendors who provide services on our behalf, such as hosting, analytics, database management, and email delivery.</li>
              <li><strong className="text-foreground">For Legal Reasons:</strong> We may disclose your information if required to do so by law or in response to valid requests by public authorities (e.g., a court or a government agency).</li>
              <li><strong className="text-foreground">Business Transfers:</strong> In connection with any merger, sale of company assets, financing, or acquisition, your information may be transferred.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">6. Your Data Protection Rights (GDPR)</h2>
            <p>If you are a resident of the European Economic Area (EEA), you have the following data protection rights:</p>
            <ul className="list-disc pl-6 space-y-2 mt-4">
              <li><strong className="text-foreground">The right to access, update, or delete:</strong> You can request access to or deletion of the information we have on you.</li>
              <li><strong className="text-foreground">The right of rectification:</strong> You have the right to have your information rectified if it is inaccurate or incomplete.</li>
              <li><strong className="text-foreground">The right to object:</strong> You have the right to object to our processing of your Personal Data.</li>
              <li><strong className="text-foreground">The right of restriction:</strong> You have the right to request that we restrict the processing of your personal information.</li>
              <li><strong className="text-foreground">The right to data portability:</strong> You have the right to be provided with a copy of your Personal Data in a structured, machine-readable, and commonly used format.</li>
              <li><strong className="text-foreground">The right to withdraw consent:</strong> You also have the right to withdraw your consent at any time where we relied on your consent to process your personal information.</li>
            </ul>
            <p className="mt-4">
              To exercise any of these rights, please contact us at <a href="mailto:privacy@mythosh.com" className="text-primary hover:underline">privacy@mythosh.com</a>.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">7. Data Retention</h2>
            <p>
              We will retain your Personal Data only for as long as is necessary for the purposes set out in this Privacy Policy. We will retain and use your information to the extent necessary to comply with our legal obligations, resolve disputes, and enforce our policies.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">8. Security of Data</h2>
            <p>
              The security of your data is important to us, but remember that no method of transmission over the Internet, or method of electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your Personal Data, we cannot guarantee its absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">9. Children's Privacy</h2>
            <p>
              Our platform does not address anyone under the age of 13 (or 16 in certain jurisdictions). We do not knowingly collect personally identifiable information from children. If you are a parent or guardian and you are aware that your child has provided us with Personal Data, please contact us so we can remove that information from our servers.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">10. Changes to This Privacy Policy</h2>
            <p>
              We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Effective Date" at the top. You are advised to review this Privacy Policy periodically for any changes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">11. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy or wish to exercise your data protection rights, please contact us:
            </p>
            <ul className="list-disc pl-6 mt-4 space-y-2">
              <li>By email: <a href="mailto:privacy@mythosh.com" className="text-primary hover:underline">privacy@mythosh.com</a></li>
              <li>By visiting the <Link href="/about" className="text-primary hover:underline">About page</Link> on our website.</li>
            </ul>
          </section>
        </div>
      </main>
    </div>
  );
}
