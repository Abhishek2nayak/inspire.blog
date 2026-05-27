import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service | Inspire Blog",
  description: "Terms of Service and Usage Guidelines for Inspire Blog.",
};

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="mb-12">
          <h1 className="text-4xl font-extrabold tracking-tight mb-4">
            Terms of Service
          </h1>
          <p className="text-muted-foreground">Effective Date: May 27, 2026</p>
        </div>

        <div className="space-y-10 text-muted-foreground leading-relaxed">
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">
              1. Acceptance of Terms
            </h2>
            <p>
              By accessing or using Inspire Blog ("we," "our," or "us"), you
              agree to be bound by these Terms of Service. If you do not agree
              with any part of these terms, you must not use our platform. These
              terms govern your access to and use of our website, services, and
              any content or information provided on the platform.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">
              2. User Accounts
            </h2>
            <ul className="list-disc pl-6 space-y-3">
              <li>
                <strong className="text-foreground">Registration:</strong> To
                publish articles or interact with content, you must create an
                account. You agree to provide accurate, current, and complete
                information during registration.
              </li>
              <li>
                <strong className="text-foreground">Security:</strong> You are
                responsible for safeguarding your password and account
                credentials. Any activity occurring under your account is your
                responsibility.
              </li>
              <li>
                <strong className="text-foreground">Termination:</strong> We
                reserve the right to suspend or terminate your account at any
                time if we suspect a violation of these Terms of Service or for
                any other reason we deem necessary to protect our community.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">
              3. User-Generated Content
            </h2>
            <p>
              Inspire Blog allows users to publish articles, comments, and other
              content ("User Content").
            </p>
            <ul className="list-disc pl-6 space-y-3 mt-4">
              <li>
                <strong className="text-foreground">Ownership:</strong> You
                retain ownership of any intellectual property rights that you
                hold in your User Content. We do not claim ownership of your
                content.
              </li>
              <li>
                <strong className="text-foreground">License:</strong> By posting
                content, you grant Inspire Blog a worldwide, non-exclusive,
                royalty-free license to use, reproduce, modify, adapt, publish,
                translate, and distribute your content in connection with
                operating and promoting the platform.
              </li>
              <li>
                <strong className="text-foreground">Acceptable Use:</strong> You
                agree not to post content that is illegal, abusive, harassing,
                defamatory, fraudulent, or infringes on the rights of any third
                party. Spam and promotional material without educational value
                are strictly prohibited.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">
              4. Intellectual Property
            </h2>
            <p>
              The Inspire Blog platform itself, including its original content,
              features, and functionality (excluding User Content), is owned by
              Inspire Blog and is protected by international copyright,
              trademark, patent, trade secret, and other intellectual property
              or proprietary rights laws.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">
              5. Disclaimer of Warranties
            </h2>
            <p>
              Your use of the platform is at your sole risk. The service is
              provided on an "AS IS" and "AS AVAILABLE" basis. We disclaim all
              warranties of any kind, whether express or implied, including, but
              not limited to, implied warranties of merchantability, fitness for
              a particular purpose, and non-infringement.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">
              6. Limitation of Liability
            </h2>
            <p>
              In no event shall Inspire Blog, nor its directors, employees,
              partners, agents, suppliers, or affiliates, be liable for any
              indirect, incidental, special, consequential, or punitive damages,
              including without limitation, loss of profits, data, use,
              goodwill, or other intangible losses, resulting from your access
              to or use of or inability to access or use the service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">
              7. Links to Other Websites
            </h2>
            <p>
              Our platform may contain links to third-party websites or services
              that are not owned or controlled by Inspire Blog. We have no
              control over, and assume no responsibility for, the content,
              privacy policies, or practices of any third-party websites or
              services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">
              8. Changes to Terms
            </h2>
            <p>
              We reserve the right, at our sole discretion, to modify or replace
              these Terms at any time. If a revision is material, we will
              provide at least 30 days' notice prior to any new terms taking
              effect. By continuing to access or use our platform after any
              revisions become effective, you agree to be bound by the revised
              terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">
              9. Contact Us
            </h2>
            <p>
              If you have any questions about these Terms of Service, please
              contact us:
            </p>
            <ul className="list-disc pl-6 mt-4 space-y-2">
              <li>
                By email:{" "}
                <a
                  href="mailto:legal@mythosh.com"
                  className="text-primary hover:underline"
                >
                  legal@mythosh.com
                </a>
              </li>
              <li>
                By visiting the{" "}
                <Link href="/contact" className="text-primary hover:underline">
                  Contact page
                </Link>{" "}
                on our website.
              </li>
            </ul>
          </section>
        </div>
      </main>
    </div>
  );
}
