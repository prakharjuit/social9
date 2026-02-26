export default function Terms() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-sm p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Terms of Service</h1>
        
        <p className="text-sm text-gray-600 mb-8">
          Last updated: {new Date().toLocaleDateString()}
        </p>

        <div className="space-y-6 text-gray-700">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Acceptance of Terms</h2>
            <p>
              By accessing and using Social9, you accept and agree to be bound by the terms and 
              provision of this agreement. If you do not agree to these Terms of Service, please 
              do not use our service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Description of Service</h2>
            <p>
              Social9 is a social media management platform that allows users to schedule, publish, 
              and manage content across multiple social media platforms including Instagram and LinkedIn.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">3. User Accounts</h2>
            <p className="mb-2">When you create an account with us, you agree to:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Provide accurate and complete information</li>
              <li>Maintain the security of your password</li>
              <li>Notify us immediately of any unauthorized use</li>
              <li>Be responsible for all activities under your account</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Content Ownership</h2>
            <p>
              You retain all rights to the content you create and post through Social9. By using 
              our service, you grant us permission to store and transmit your content to the social 
              media platforms you've connected.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Acceptable Use</h2>
            <p className="mb-2">You agree not to use Social9 to:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Post illegal, harmful, or offensive content</li>
              <li>Violate any laws or regulations</li>
              <li>Infringe on intellectual property rights</li>
              <li>Engage in spam or unauthorized advertising</li>
              <li>Interfere with the service or other users</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Third-Party Platforms</h2>
            <p>
              Social9 integrates with third-party platforms (Instagram, LinkedIn, etc.). You are 
              responsible for complying with their terms of service. We are not responsible for 
              changes to their APIs or policies that may affect our service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Subscription and Billing</h2>
            <p>
              Some features require a paid subscription. You agree to pay all fees associated with 
              your subscription plan. Subscriptions automatically renew unless cancelled before the 
              renewal date.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">8. Service Availability</h2>
            <p>
              We strive to maintain 99% uptime but do not guarantee uninterrupted access. We may 
              modify, suspend, or discontinue the service at any time with reasonable notice.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">9. Limitation of Liability</h2>
            <p>
              Social9 is provided "as is" without warranties of any kind. We shall not be liable 
              for any indirect, incidental, special, or consequential damages arising from your use 
              of the service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">10. Termination</h2>
            <p>
              We reserve the right to terminate or suspend your account for violations of these 
              terms. You may terminate your account at any time through your account settings.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">11. Changes to Terms</h2>
            <p>
              We may modify these terms at any time. We will notify you of significant changes 
              via email or through the service. Continued use after changes constitutes acceptance.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">12. Contact Information</h2>
            <p>
              For questions about these Terms of Service, contact us at:
            </p>
            <p className="mt-2">
              <strong>Email:</strong> support@social9.com<br />
              <strong>Address:</strong> [Your Business Address]
            </p>
          </section>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <a 
            href="/" 
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            ← Back to Home
          </a>
        </div>
      </div>
    </div>
  );
}
