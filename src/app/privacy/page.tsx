import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
          <div className="text-muted-foreground space-y-1">
            <p><strong>Effective Date:</strong> 2025-07-21</p>
            <p><strong>Last Updated:</strong> 2025-07-21</p>
          </div>
        </div>

        <div className="space-y-8">
          {/* Introduction */}
          <Card>
            <CardHeader>
              <CardTitle>1. Introduction</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <p>
                Welcome to JobSchedule ("we," "our," or "us"). This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website (jobschedule.io), our Chrome browser extension, and related services (collectively, the "Service").
              </p>
              <p>
                By using our Service, you agree to the collection and use of information in accordance with this Privacy Policy. If you do not agree with our policies and practices, please do not use our Service.
              </p>
            </CardContent>
          </Card>

          {/* Information We Collect */}
          <Card>
            <CardHeader>
              <CardTitle>2. Information We Collect</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">2.1 Personal Information You Provide</h3>
                <p>When you register for an account or use our Service, we may collect:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li><strong>Account Information:</strong> Name, email address, phone number, and password</li>
                  <li><strong>Profile Information:</strong> Professional headline, work experience, education details, skills, and resume content</li>
                  <li><strong>Contact Information:</strong> Address and other contact details you provide</li>
                  <li><strong>Payment Information:</strong> Billing information for premium subscriptions (processed securely through Stripe)</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">2.2 Job Application Data</h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li><strong>Job Details:</strong> Job titles, company names, job descriptions, application dates, and job URLs</li>
                  <li><strong>Application Status:</strong> Interview dates, application outcomes, and follow-up activities</li>
                  <li><strong>Resume Information:</strong> Resume files, extracted text content, and structured resume data</li>
                  <li><strong>Activity Tracking:</strong> Time spent on job search activities and application workflows</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">2.3 Browser Extension Data</h3>
                <p>Our Chrome extension collects:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li><strong>LinkedIn Integration:</strong> Job postings you choose to track from LinkedIn</li>
                  <li><strong>Browser Information:</strong> User agent, extension version, and browser type</li>
                  <li><strong>Usage Analytics:</strong> Feature usage patterns and error logs (anonymized)</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">2.4 Automatically Collected Information</h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li><strong>Log Data:</strong> IP address, browser type, operating system, access times, and pages viewed</li>
                  <li><strong>Cookies and Tracking:</strong> Session cookies, preference cookies, and analytics cookies</li>
                  <li><strong>Device Information:</strong> Device type, screen resolution, and browser settings</li>
                  <li><strong>Usage Analytics:</strong> Feature usage, page views, and user interactions (via Google Analytics)</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">2.5 Third-Party Integrations</h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li><strong>Gmail Integration:</strong> Email content analysis for job-related updates (with explicit consent)</li>
                  <li><strong>OAuth Providers:</strong> Basic profile information from Google, LinkedIn, or other connected accounts</li>
                  <li><strong>AI Services:</strong> Resume and job description content sent to OpenAI for analysis and matching</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* How We Use Your Information */}
          <Card>
            <CardHeader>
              <CardTitle>3. How We Use Your Information</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">3.1 Core Service Functionality</h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Provide job application tracking and management tools</li>
                  <li>Generate AI-powered resume reviews and job matching recommendations</li>
                  <li>Sync job application data across devices and platforms</li>
                  <li>Enable collaboration features and data sharing</li>
                  <li>Process payments for premium subscriptions</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">3.2 Service Improvement</h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Analyze usage patterns to improve our features and user experience</li>
                  <li>Conduct research and analytics to enhance our AI capabilities</li>
                  <li>Troubleshoot technical issues and provide customer support</li>
                  <li>Send service-related notifications and updates</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">3.3 Communication</h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Respond to your inquiries and provide customer support</li>
                  <li>Send administrative messages about your account or service changes</li>
                  <li>Deliver marketing communications (with your consent, where required)</li>
                  <li>Notify you about new features, updates, or promotional offers</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Information Sharing and Disclosure */}
          <Card>
            <CardHeader>
              <CardTitle>4. Information Sharing and Disclosure</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">4.1 We Do Not Sell Your Personal Information</h3>
                <p>We do not sell, rent, or trade your personal information to third parties for marketing purposes.</p>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">4.2 Service Providers</h3>
                <p>We may share your information with trusted third-party service providers who assist us in operating our Service:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li><strong>Hosting and Infrastructure:</strong> Vercel, AWS, or similar cloud providers</li>
                  <li><strong>Authentication:</strong> Kinde Auth for secure user authentication</li>
                  <li><strong>Payment Processing:</strong> Stripe for subscription billing and payment processing</li>
                  <li><strong>Analytics:</strong> Google Analytics for website usage analytics (anonymized)</li>
                  <li><strong>AI Services:</strong> OpenAI for resume analysis and job matching features</li>
                  <li><strong>Email Services:</strong> For transactional emails and notifications</li>
                  <li><strong>Customer Support:</strong> For providing technical support and assistance</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">4.3 Legal Requirements</h3>
                <p>We may disclose your information when required by law or to:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Comply with legal process, court orders, or government requests</li>
                  <li>Protect our rights, property, or safety, or that of our users</li>
                  <li>Investigate potential violations of our Terms of Service</li>
                  <li>Prevent fraud, security breaches, or illegal activities</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">4.4 Business Transfers</h3>
                <p>In the event of a merger, acquisition, or sale of assets, your information may be transferred to the acquiring entity, subject to the same privacy protections.</p>
              </div>
            </CardContent>
          </Card>

          {/* Data Security */}
          <Card>
            <CardHeader>
              <CardTitle>5. Data Security</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">5.1 Security Measures</h3>
                <p>We implement industry-standard security measures to protect your information:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li><strong>Encryption:</strong> All data transmitted to our servers is encrypted using TLS/SSL</li>
                  <li><strong>Data Encryption:</strong> Sensitive data is encrypted at rest using AES-256 encryption</li>
                  <li><strong>Access Controls:</strong> Role-based access controls and multi-factor authentication for our systems</li>
                  <li><strong>Regular Audits:</strong> Security assessments and vulnerability testing</li>
                  <li><strong>Secure Infrastructure:</strong> Hosting on secure, compliant cloud platforms</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">5.2 Data Retention</h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li><strong>Account Data:</strong> Retained while your account is active and for a reasonable period thereafter</li>
                  <li><strong>Job Application Data:</strong> Retained as long as necessary to provide our services</li>
                  <li><strong>Analytics Data:</strong> Anonymized usage data may be retained indefinitely for research purposes</li>
                  <li><strong>Legal Requirements:</strong> Some data may be retained longer to comply with legal obligations</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Your Rights and Choices */}
          <Card>
            <CardHeader>
              <CardTitle>6. Your Rights and Choices</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">6.1 Account Management</h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li><strong>Access:</strong> Request access to your personal information</li>
                  <li><strong>Update:</strong> Modify or correct your account information at any time</li>
                  <li><strong>Delete:</strong> Request deletion of your account and associated data</li>
                  <li><strong>Export:</strong> Download your job application data in a portable format</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">6.2 Communication Preferences</h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li><strong>Email Notifications:</strong> Opt out of promotional emails via unsubscribe links</li>
                  <li><strong>Account Settings:</strong> Manage notification preferences in your account dashboard</li>
                  <li><strong>Marketing Communications:</strong> Withdraw consent for marketing communications</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">6.3 Cookie Controls</h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li><strong>Browser Settings:</strong> Configure your browser to refuse or delete cookies</li>
                  <li><strong>Analytics Opt-out:</strong> Use Google Analytics opt-out tools</li>
                  <li><strong>Preference Management:</strong> Adjust cookie preferences through our cookie banner</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">6.4 Data Portability</h3>
                <p>You have the right to receive your personal data in a structured, commonly used format and to transmit that data to another service provider.</p>
              </div>
            </CardContent>
          </Card>

          {/* International Data Transfers */}
          <Card>
            <CardHeader>
              <CardTitle>7. International Data Transfers</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <p>
                Our Service is hosted in the United States. If you are accessing our Service from outside the United States, please be aware that your information may be transferred to, stored, and processed in the United States, where our servers are located and our central database is operated.
              </p>
              <p className="mt-4">
                For users in the European Economic Area (EEA), we ensure adequate protection for international transfers through:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Standard Contractual Clauses approved by the European Commission</li>
                <li>Adequacy decisions by the European Commission</li>
                <li>Other appropriate safeguards as required by applicable law</li>
              </ul>
            </CardContent>
          </Card>

          {/* Regional Privacy Rights */}
          <Card>
            <CardHeader>
              <CardTitle>8. Regional Privacy Rights</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">8.1 European Union (GDPR)</h3>
                <p>If you are located in the EU, you have additional rights under the General Data Protection Regulation:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li><strong>Legal Basis:</strong> We process your data based on legitimate interests, contract performance, or consent</li>
                  <li><strong>Right to Rectification:</strong> Correct inaccurate personal data</li>
                  <li><strong>Right to Erasure:</strong> Request deletion of your personal data ("right to be forgotten")</li>
                  <li><strong>Right to Restrict Processing:</strong> Limit how we process your data</li>
                  <li><strong>Right to Object:</strong> Object to processing based on legitimate interests</li>
                  <li><strong>Data Protection Officer:</strong> Contact our DPO at privacy@jobschedule.com</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">8.2 California (CCPA/CPRA)</h3>
                <p>California residents have specific rights under the California Consumer Privacy Act:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li><strong>Right to Know:</strong> Information about data collection and use</li>
                  <li><strong>Right to Delete:</strong> Request deletion of personal information</li>
                  <li><strong>Right to Opt-Out:</strong> Opt out of the sale of personal information (we don't sell data)</li>
                  <li><strong>Right to Non-Discrimination:</strong> Equal service regardless of privacy choices</li>
                </ul>
                <p className="mt-3">To exercise these rights, contact us at privacy@jobschedule.com.</p>
              </div>
            </CardContent>
          </Card>

          {/* Children's Privacy */}
          <Card>
            <CardHeader>
              <CardTitle>9. Children's Privacy</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <p>
                Our Service is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe your child has provided us with personal information, please contact us to have that information removed.
              </p>
            </CardContent>
          </Card>

          {/* Third-Party Services */}
          <Card>
            <CardHeader>
              <CardTitle>10. Third-Party Services</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-3">10.1 External Links</h3>
                <p>
                  Our Service may contain links to third-party websites or services. We are not responsible for the privacy practices of these external sites. We encourage you to review their privacy policies.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">10.2 Third-Party Integrations</h3>
                <p>
                  When you connect third-party services (like Gmail or LinkedIn), those services' privacy policies also apply to the data they share with us.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Changes to This Privacy Policy */}
          <Card>
            <CardHeader>
              <CardTitle>11. Changes to This Privacy Policy</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <p>
                We may update this Privacy Policy from time to time to reflect changes in our practices or applicable law. We will:
              </p>
              <ul className="list-disc pl-6 mt-3 space-y-1">
                <li>Post the updated policy on our website</li>
                <li>Update the "Last Updated" date at the top of this policy</li>
                <li>Notify users of material changes via email or prominent website notice</li>
                <li>For significant changes, we may request renewed consent</li>
              </ul>
              <p className="mt-4">
                Your continued use of our Service after any changes constitutes acceptance of the updated Privacy Policy.
              </p>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>12. Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <p>
                If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:
              </p>
              <div className="mt-4 space-y-2">
                <p><strong>Email:</strong> jobschedule4@gmail.com</p>
                <p><strong>Data Protection Officer (for EU inquiries):</strong> jobschedule4@gmail.com</p>
              </div>
              <p className="mt-4">
                For urgent privacy concerns, we will respond within 48 hours. For all other inquiries, we will respond within 30 days.
              </p>
              <p className="mt-4 text-muted-foreground">
                This Privacy Policy is designed to be transparent about our data practices. If you have suggestions for improvement or need clarification on any section, please don't hesitate to contact us.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 