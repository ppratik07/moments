import React from "react";
import { FileText, User, Image as ImageIcon, AlertCircle, CreditCard, Shield, Mail, Gavel, Settings } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      {/* Header */}
      <section className="text-center space-y-4 mb-16">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <FileText className="w-8 h-8 text-gray-900" />
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
            Terms and Conditions
          </h1>
        </div>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Welcome to <span className="font-semibold text-gray-900">Moments</span> (also referred to as &ldquo;MemoryLane&rdquo; in some project files). These Terms and Conditions (&ldquo;Terms&rdquo;) govern your access to and use of our collaborative photo book creator service. By using the Service, you agree to these Terms.
        </p>
      </section>

      {/* Acceptance of Terms */}
      <section className="mb-16 space-y-6">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
          <Settings className="w-6 h-6 text-gray-900" />
          <span>Acceptance of Terms</span>
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          By accessing or using the Moments website, web application, or any related services (collectively, the &ldquo;Service&rdquo;), you confirm that you have read, understood, and agree to be bound by these Terms, our Privacy Policy, and any applicable additional terms. If you do not agree, you must not use the Service. Use of the Service is at your own risk.
        </p>
      </section>

      {/* User Eligibility and Accounts */}
      <section className="mb-16">
        <h2 className="text-2xl font-semibold mb-8 text-gray-900 dark:text-white flex items-center space-x-2">
          <User className="w-6 h-6 text-gray-900" />
          <span>User Eligibility and Accounts</span>
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Eligibility</h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              You must be at least 13 years old (or the minimum age required in your jurisdiction) to use the Service. By using it, you represent that you meet this requirement and are not barred from using the Service under applicable law.
            </p>
          </div>
          <div className="p-6 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Accounts</h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              Certain features require creating an account via Clerk authentication. You are responsible for maintaining the confidentiality of your credentials and all activities under your account. Notify us immediately of any unauthorized use.
            </p>
          </div>
        </div>
      </section>

      {/* User Content and License */}
      <section className="mb-16 space-y-6">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
          <ImageIcon className="w-6 h-6 text-gray-900" />
          <span>User Content and License</span>
        </h2>
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-300">
            &ldquo;User Content&rdquo; includes photos, messages, project metadata, layouts, and other materials you or your collaborators upload or generate via the Service.
          </p>
            <div className="grid md:grid-cols-2 gap-6">
            <ContentCard
              title="Ownership"
              desc="You retain all ownership rights in your User Content. We claim no ownership over it."
            />
            <ContentCard
              title="License Grant"
              desc="By uploading User Content, you grant Moments and our affiliates a worldwide, non-exclusive, royalty-free, sublicensable license to host, store, display, reproduce, and distribute it solely to provide and improve the Service (e.g., for previews, PDF generation, and collaboration)."
            />
            <ContentCard className="md:col-span-2"
              title="Responsibilities"
              desc="You represent that you have all necessary rights to upload User Content and that it does not violate these Terms or third-party rights. We may remove User Content that breaches these Terms without notice."
            />
          </div>
        </div>
      </section>

      {/* Prohibited Activities */}
      <section className="mb-16">
        <h2 className="text-2xl font-semibold mb-8 text-gray-900 dark:text-white flex items-center space-x-2">
          <AlertCircle className="w-6 h-6 text-gray-900" />
          <span>Prohibited Activities</span>
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          <ProhibitedCard desc="Uploading or sharing content that infringes copyrights, trademarks, or other intellectual property rights of others." />
          <ProhibitedCard desc="Posting illegal, harmful, abusive, harassing, defamatory, obscene, or otherwise objectionable material." />
          <ProhibitedCard desc="Using the Service to transmit viruses, spam, or engage in phishing, fraud, or unauthorized access to systems." />
          <ProhibitedCard desc="Interfering with the Service, such as reverse engineering, scraping, or exceeding usage limits." />
          <ProhibitedCard className="md:col-span-2" desc="Violating any applicable laws or regulations, or encouraging others to do so." />
        </div>
        <p className="mt-4 text-gray-600 dark:text-gray-300">
          We reserve the right to suspend or terminate accounts and remove content for violations, at our sole discretion.
        </p>
      </section>

      {/* Service Features and Third Parties */}
      <section className="mb-16 space-y-6">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
          <Settings className="w-6 h-6 text-gray-900" />
          <span>Service Features and Third-Party Services</span>
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          The Service allows project creation, collaborative contributions, image uploads, customizable layouts, live previews, PDF downloads for printing, dashboard management, and chat support via Tawk.to. We may update features at any time.
        </p>
        <p className="text-gray-600 dark:text-gray-300">
          The Service integrates third-party providers (e.g., Clerk for authentication, R2/AWS for storage, Tawk.to for chat). Your use is subject to their terms, and we are not responsible for their services.
        </p>
      </section>

      {/* Payments and Billing */}
      <section className="mb-16">
        <h2 className="text-2xl font-semibold mb-8 text-gray-900 dark:text-white flex items-center space-x-2">
          <CreditCard className="w-6 h-6 text-gray-900" />
          <span>Payments and Billing</span>
        </h2>
        <div className="p-6 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 space-y-4">
          <p className="text-gray-600 dark:text-gray-300">
            The core Service is currently free, but we may introduce paid features, subscriptions, or printing integrations in the future. Any payments will be processed securely via third-party processors, subject to their terms.
          </p>
          <ul className="list-disc pl-6 space-y-1 text-gray-600 dark:text-gray-300 text-sm">
            <li>All purchases are final and non-refundable, except as required by law.</li>
            <li>You authorize recurring billing for subscriptions; cancel anytime via your account.</li>
            <li>We are not responsible for transaction errors or disputes—contact the processor directly.</li>
          </ul>
        </div>
      </section>

      {/* Termination */}
      <section className="mb-16 space-y-6">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
          <Shield className="w-6 h-6 text-gray-900" />
          <span>Termination</span>
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">By You</h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">You may stop using the Service and delete your account at any time via the dashboard. This will remove your projects and data, subject to our retention policies.</p>
          </div>
          <div className="p-6 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">By Us</h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">We may suspend or terminate your access for violations of these Terms, without notice or liability.</p>
          </div>
        </div>
      </section>

      {/* Disclaimers, Liability, and Indemnification */}
      <section className="mb-16 space-y-6">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Disclaimers, Liability, and Indemnification</h2>
        <div className="space-y-4">
          <div className="p-6 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Disclaimers</h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">The Service is provided &ldquo;as is&rdquo; without warranties of any kind. We do not guarantee uninterrupted access, error-free operation, or that User Content will be secure from loss.</p>
          </div>
          <div className="p-6 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Limitation of Liability</h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">To the maximum extent permitted by law, Moments and our affiliates shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of data or profits, arising from your use of the Service.</p>
          </div>
          <div className="p-6 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Indemnification</h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">You agree to indemnify and hold harmless Moments from any claims, losses, or damages arising from your User Content, violations of these Terms, or infringement of third-party rights.</p>
          </div>
        </div>
      </section>

      {/* Governing Law and Changes */}
      <section className="mb-16 space-y-6">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
          <Gavel className="w-6 h-6 text-gray-900" />
          <span>Governing Law and Changes</span>
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Governing Law</h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              These Terms are governed by the laws of [Your Jurisdiction, e.g., the State of Delaware, USA], without regard to conflict of laws principles. Any disputes shall be resolved exclusively in the courts of [Your Jurisdiction].
            </p>
          </div>
          <div className="p-6 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Changes to Terms</h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              We may update these Terms at any time. Changes will be posted here with a new &ldquo;Last updated&rdquo; date. Your continued use after changes constitutes acceptance. We may notify you of material changes via email.
            </p>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
          <Mail className="w-6 h-6 text-gray-900" />
          <span>Contact Us</span>
        </h2>
        <div className="p-6 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <p className="text-gray-600 dark:text-gray-300">
              If you have questions about these Terms, please contact us at <a href="#" className="text-gray-900 hover:underline">support@moments.com</a>.
          </p>
        </div>
        
      </section>
    </div>
  );
}

function ContentCard({ title, desc, className = "" }: { title: string; desc: string; className?: string }) {
  return (
  <div className={`p-6 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 ${className}`}>
      <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">{title}</h3>
      <p className="text-gray-600 dark:text-gray-300 text-sm">{desc}</p>
    </div>
  );
}

function ProhibitedCard({ desc, className = "" }: { desc: string; className?: string }) {
  return (
  <div className={`p-6 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 pl-8 ${className}`}>
      <p className="text-gray-600 dark:text-gray-300 text-sm">{desc}</p>
    </div>
  );
}