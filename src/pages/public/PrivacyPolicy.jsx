import { Link } from 'react-router-dom'
import { ArrowLeft, Shield } from 'lucide-react'

export default function PrivacyPolicy() {
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
            <Shield className="w-8 h-8 text-primary-600" />
            <h1 className="text-3xl font-bold text-gray-900">Privacy Policy</h1>
          </div>
          <p className="mt-2 text-gray-600">Last updated: January 2025</p>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="prose prose-lg max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Introduction</h2>
            <p className="text-gray-600 mb-4">
              Welcome to Meridian EMS ("we," "our," or "us"). We are committed to protecting your personal information 
              and your right to privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard 
              your information when you use our education management platform.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Information We Collect</h2>
            <p className="text-gray-600 mb-4">We collect information that you provide directly to us, including:</p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li><strong>Personal Information:</strong> Name, email address, phone number, date of birth, address</li>
              <li><strong>Educational Information:</strong> Student records, grades, attendance, academic history</li>
              <li><strong>Account Information:</strong> Username, password, profile picture</li>
              <li><strong>Payment Information:</strong> Billing address, payment method details (processed securely via third-party providers)</li>
              <li><strong>Communication Data:</strong> Messages, feedback, and support requests</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. How We Use Your Information</h2>
            <p className="text-gray-600 mb-4">We use the collected information for:</p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>Providing and maintaining our education management services</li>
              <li>Processing transactions and sending related information</li>
              <li>Sending administrative information, updates, and security alerts</li>
              <li>Responding to inquiries and providing customer support</li>
              <li>Improving our platform through analytics and research</li>
              <li>Personalizing user experience with AI-powered features</li>
              <li>Complying with legal obligations</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Data Security</h2>
            <p className="text-gray-600 mb-4">
              We implement industry-standard security measures to protect your data:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>AES-256 encryption for data at rest</li>
              <li>TLS 1.3 encryption for data in transit</li>
              <li>Two-factor authentication (2FA) support</li>
              <li>Regular security audits and penetration testing</li>
              <li>Role-based access control (RBAC)</li>
              <li>Comprehensive audit logging</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Data Sharing</h2>
            <p className="text-gray-600 mb-4">
              We do not sell your personal information. We may share data with:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>Your educational institution (as authorized)</li>
              <li>Service providers who assist in platform operations</li>
              <li>Legal authorities when required by law</li>
              <li>Third parties with your explicit consent</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Compliance</h2>
            <p className="text-gray-600 mb-4">
              Meridian EMS is designed to comply with:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li><strong>GDPR:</strong> General Data Protection Regulation (EU)</li>
              <li><strong>FERPA:</strong> Family Educational Rights and Privacy Act (US)</li>
              <li><strong>COPPA:</strong> Children's Online Privacy Protection Act</li>
              <li><strong>IT Act 2000:</strong> Information Technology Act (India)</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Your Rights</h2>
            <p className="text-gray-600 mb-4">You have the right to:</p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>Access your personal data</li>
              <li>Correct inaccurate information</li>
              <li>Request deletion of your data</li>
              <li>Object to data processing</li>
              <li>Data portability</li>
              <li>Withdraw consent at any time</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Data Retention</h2>
            <p className="text-gray-600">
              We retain personal data only for as long as necessary to fulfill the purposes for which it was collected, 
              or as required by law. Educational records may be retained for longer periods as required by educational 
              regulations.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Contact Us</h2>
            <p className="text-gray-600">
              If you have questions about this Privacy Policy, please contact us at:
            </p>
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-700"><strong>Email:</strong> privacy@meridian-ems.com</p>
              <p className="text-gray-700"><strong>Phone:</strong> +91-9999999999</p>
              <p className="text-gray-700"><strong>Address:</strong> Bangalore, Karnataka, India</p>
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
