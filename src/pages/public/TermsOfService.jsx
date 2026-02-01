import { Link } from 'react-router-dom'
import { ArrowLeft, FileText } from 'lucide-react'

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-gray-50 border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link to="/" className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 mb-4">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <div className="flex items-center gap-3">
            <FileText className="w-8 h-8 text-primary-600" />
            <h1 className="text-3xl font-bold text-gray-900">Terms of Service</h1>
          </div>
          <p className="mt-2 text-gray-600">Last updated: January 2025</p>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="prose prose-lg max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-600">
              By accessing or using Meridian EMS ("the Platform"), you agree to be bound by these Terms of Service. 
              If you do not agree to these terms, please do not use our services.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Description of Service</h2>
            <p className="text-gray-600 mb-4">
              Meridian EMS is an AI-enabled education management platform that provides:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>Student and staff management</li>
              <li>Academic administration tools</li>
              <li>Fee management and payment processing</li>
              <li>Attendance and examination management</li>
              <li>Communication tools for institutions</li>
              <li>AI-powered analytics and insights</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. User Accounts</h2>
            <p className="text-gray-600 mb-4">
              When creating an account, you agree to:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>Provide accurate and complete information</li>
              <li>Maintain the security of your account credentials</li>
              <li>Notify us immediately of any unauthorized access</li>
              <li>Accept responsibility for all activities under your account</li>
              <li>Not share your account with others</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. User Responsibilities</h2>
            <p className="text-gray-600 mb-4">Users agree not to:</p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>Violate any applicable laws or regulations</li>
              <li>Infringe on the rights of others</li>
              <li>Upload malicious content or malware</li>
              <li>Attempt to gain unauthorized access to the system</li>
              <li>Use the platform for any illegal or unauthorized purpose</li>
              <li>Interfere with the proper functioning of the service</li>
              <li>Scrape, copy, or redistribute content without permission</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Institution Responsibilities</h2>
            <p className="text-gray-600 mb-4">
              Educational institutions using Meridian EMS agree to:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>Obtain necessary consents for student data processing</li>
              <li>Ensure accurate data entry by authorized personnel</li>
              <li>Manage user access appropriately within their institution</li>
              <li>Comply with applicable education and privacy laws</li>
              <li>Use the platform in accordance with these terms</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Intellectual Property</h2>
            <p className="text-gray-600">
              All content, features, and functionality of Meridian EMS are owned by us and are protected by 
              international copyright, trademark, and other intellectual property laws. You may not copy, 
              modify, distribute, or create derivative works without our express written permission.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Payment Terms</h2>
            <p className="text-gray-600 mb-4">
              For paid subscriptions:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>Fees are billed in advance on a subscription basis</li>
              <li>All fees are non-refundable unless otherwise stated</li>
              <li>We reserve the right to modify pricing with 30 days notice</li>
              <li>Failure to pay may result in service suspension</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Service Availability</h2>
            <p className="text-gray-600">
              We strive for 99.9% uptime but do not guarantee uninterrupted service. We may suspend service 
              for maintenance, updates, or circumstances beyond our control. We will provide advance notice 
              for planned maintenance when possible.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Limitation of Liability</h2>
            <p className="text-gray-600">
              To the maximum extent permitted by law, Meridian EMS shall not be liable for any indirect, 
              incidental, special, consequential, or punitive damages, including loss of profits, data, 
              or other intangible losses resulting from your use of the service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Termination</h2>
            <p className="text-gray-600">
              We may terminate or suspend your account at any time for violation of these terms. Upon 
              termination, your right to use the service will cease immediately. Data export options 
              will be provided where technically feasible.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Changes to Terms</h2>
            <p className="text-gray-600">
              We reserve the right to modify these terms at any time. We will notify users of significant 
              changes via email or platform notification. Continued use after changes constitutes acceptance 
              of the modified terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Governing Law</h2>
            <p className="text-gray-600">
              These terms shall be governed by and construed in accordance with the laws of India. 
              Any disputes shall be subject to the exclusive jurisdiction of courts in Bangalore, Karnataka.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">13. Contact</h2>
            <p className="text-gray-600">
              For questions about these Terms of Service:
            </p>
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-700"><strong>Email:</strong> legal@meridian-ems.com</p>
              <p className="text-gray-700"><strong>Phone:</strong> +91-9999999999</p>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-100 border-t border-gray-200 py-6">
        <div className="max-w-4xl mx-auto px-4 text-center text-gray-600 text-sm">
          &copy; {new Date().getFullYear()} Meridian EMS. All rights reserved.
        </div>
      </footer>
    </div>
  )
}
