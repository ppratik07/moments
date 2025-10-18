import React from "react";
import { Shield, User, Image as ImageIcon, Settings, Mail } from "lucide-react";
import { Footer } from "@/components/landing/Footer";
import { Header } from "@/components/landing/Header";
import { useCurrentUser } from "@/hooks/useCurrentUser";
export default function PrivacyPolicyPage() {

  const { isSignedIn } = useCurrentUser();

  return (
    <div>
      <Header isSignedIn= {isSignedIn ?? false} />
      <div className="max-w-5xl mx-auto px-6 py-16 mt-10">
        {/* Header */}
        <section className="text-center space-y-4 mb-16">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <Shield className="w-8 h-8 text-gray-900" />
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
              Privacy Policy
            </h1>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            At <span className="font-semibold text-gray-900">Moments</span> (also referred to as &ldquo;MemoryLane&rdquo; in some project files), we are committed to protecting your privacy. This policy explains how we collect, use, and safeguard your information.
          </p>
        </section>

        {/* Introduction */}
        <section className="mb-16 space-y-6">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
            <Settings className="w-6 h-6 text-gray-900" />
            <span>Introduction</span>
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Moments is a collaborative photo book creator that allows users to build personalized keepsakes for special occasions. We collect information to provide secure authentication, enable project collaboration, handle image uploads, generate previews and PDFs, and offer support via integrated chat. This Privacy Policy applies to our website, web application, and related services.
          </p>
        </section>

        {/* Information We Collect */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold mb-8 text-gray-900 dark:text-white flex items-center space-x-2">
            <User className="w-6 h-6 text-gray-900" />
            <span>Information We Collect</span>
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <DataCard
              icon={<User className="w-6 h-6 text-gray-900" />}
              title="Account & Authentication Data"
              desc="When you sign up or log in via Clerk, we process your name, email address, profile details, and authentication tokens to manage your account securely."
            />
            <DataCard
              icon={<ImageIcon className="w-6 h-6 text-gray-900" />}
              title="Project & Content Data"
              desc="Photos, messages, project metadata, layout choices, and uploaded files you and your collaborators contribute to create photo books."
            />
            <DataCard
              icon={<Settings className="w-6 h-6 text-gray-900" />}
              title="Usage & Device Data"
              desc="Analytics events, device identifiers, IP addresses, browser types, and performance metrics to improve our service and user experience."
            />
            <DataCard
              icon={<Mail className="w-6 h-6 text-gray-900" />}
              title="Support & Communication Data"
              desc="Messages and interactions via Tawk.to chat support, including timestamps and query details, to provide assistance."
            />
          </div>
        </section>

        {/* How We Use Your Information */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold mb-8 text-gray-900 dark:text-white flex items-center space-x-2">
            <ImageIcon className="w-6 h-6 text-gray-900" />
            <span>How We Use Your Information</span>
          </h2>
          <div className="space-y-4">
            <UseCard desc="Providing and improving core features like project creation, collaborative contributions, image uploads, customizable layouts, live previews, and PDF generation for download and printing." />
            <UseCard desc="Authentication, account management, and access control using Clerk to ensure secure sign-ups, logins, and dashboard access." />
            <UseCard desc="Storing and processing uploaded images and project data in secure object storage (R2/AWS) to enable collaboration and exports." />
            <UseCard desc="Communicating with you about your account, projects, orders, support requests via email or Tawk.to chat." />
            <UseCard desc="Enhancing security, preventing fraud, complying with legal obligations, and analyzing usage to refine the product." />
            <UseCard desc="Sending optional notifications about project updates or new features, with opt-out options in your account settings." />
          </div>
        </section>

        {/* Third-Party Services */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-white flex items-center space-x-2">
            <Shield className="w-6 h-6 text-gray-900" />
            <span>Third-Party Services</span>
          </h2>
          <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Service</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Purpose</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Data Shared</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
                <tr>
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">Clerk</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300">Authentication & User Management</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300">Name, email, profile info</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">R2 / AWS</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300">Image & File Storage</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300">Uploaded photos and PDFs</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">Tawk.to</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300">Live Chat Support</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300">Chat messages, IP address</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-sm text-gray-600 dark:text-gray-300">
            These providers process data on our behalf under strict contracts and do not use it for their own purposes. We do not sell your data to third parties.
          </p>
        </section>

        {/* Storage, Security & Retention */}
        <section className="mb-16 space-y-6">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
            <Shield className="w-6 h-6 text-gray-900" />
            <span>Storage, Security & Data Retention</span>
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Storage</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Your images, projects, and data are stored securely in configurable object storage (R2/AWS) with encryption at rest and in transit.
              </p>
            </div>
            <div className="p-6 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Security</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                We use industry-standard safeguards, including HTTPS, access controls, and regular audits. However, no online service is 100% secure—use strong passwords and review project sharing settings.
              </p>
            </div>
            <div className="p-6 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 md:col-span-2">
              <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Retention</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                We retain your data only as long as needed to provide the service or as required by law (e.g., 30 days after project completion for inactive data). You can request deletion of your account and data at any time via support.
              </p>
            </div>
          </div>
        </section>

        {/* Cookies & Tracking */}
        <section className="mb-16 space-y-6">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
            <Settings className="w-6 h-6 text-gray-900" />
            <span>Cookies & Tracking</span>
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            We use essential cookies for functionality (e.g., session management) and optional analytics cookies to understand usage patterns. You can manage preferences in your browser settings. Third-party services like Tawk.to may set their own cookies for chat functionality.
          </p>
          <ul className="list-disc pl-6 space-y-1 text-gray-600 dark:text-gray-300 text-sm">
            <li>Essential: Required for authentication and core features.</li>
            <li>Analytics: Aggregated data to improve the app (opt-out available).</li>
            <li>Third-Party: From services like Clerk and Tawk.to.</li>
          </ul>
        </section>

        {/* Your Rights & Choices */}
        <section className="mb-16 space-y-6">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
            <User className="w-6 h-6 text-gray-900" />
            <span>Your Rights & Choices</span>
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Access & Correction</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">View or update your profile and project data via the dashboard.</p>
            </div>
            <div className="p-6 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Deletion & Opt-Out</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">Request data deletion or unsubscribe from emails through support or account settings.</p>
            </div>
            <div className="p-6 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 md:col-span-2">
              <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Legal Rights</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Depending on your location (e.g., GDPR in EU, CCPA in California), you may have rights to access, portability, or objection. Contact us to exercise these.
              </p>
            </div>
          </div>
        </section>

        {/* Children & International */}
        <section className="mb-16 space-y-6">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Special Considerations</h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Children</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Moments is not intended for children under 13 (or 16 in some regions). We do not knowingly collect data from children without verifiable parental consent.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">International Data Transfers</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Data may be transferred to and processed in the US or other countries via third-party providers. We ensure adequate protections (e.g., Standard Contractual Clauses) for such transfers.
              </p>
            </div>
          </div>
        </section>

        {/* Changes & Contact */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
            <Mail className="w-6 h-6 text-gray-900" />
            <span>Contact & Changes</span>
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Changes to This Policy</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                We may update this policy periodically. Changes will be posted here with a new &ldquo;Last updated&rdquo; date. Significant changes will be notified via email.
              </p>
            </div>
            <div className="p-6 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Contact Us</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Questions? Email us at <a href="#" className="text-gray-900 hover:underline">support@moments.com</a>.
              </p>
            </div>
          </div>
    
        </section>

      </div>
      {/* Footer */}
      <Footer/>
    </div>
    
  );
}

function DataCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="p-6 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
      <div className="flex items-center space-x-3 mb-4">
        {icon}
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
      </div>
      <p className="text-gray-600 dark:text-gray-300 text-sm">{desc}</p>
    </div>
  );
}

function UseCard({ desc }: { desc: string }) {
  return (
  <div className="p-6 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 pl-8">
      <p className="text-gray-600 dark:text-gray-300 text-sm">{desc}</p>
    </div>
  );
}
