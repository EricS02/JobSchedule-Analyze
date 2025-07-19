import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Lock, Eye, Users, Globe, Mail } from "lucide-react";
import Link from "next/link";

export default function PrivacyPolicy() {
  const currentDate = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-4">
            Privacy Policy
          </Badge>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            Privacy Policy
          </h1>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center text-muted-foreground">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span>Effective Date: {currentDate}</span>
            </div>
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4" />
              <span>Last Updated: {currentDate}</span>
            </div>
          </div>
        </div>

        {/* Introduction */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Introduction
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              JobSchedule ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website, web application, and Chrome browser extension (collectively, the "Services").
            </p>
            <p>
              By using our Services, you agree to the collection and use of information in accordance with this Privacy Policy.
            </p>
          </CardContent>
        </Card>

        {/* Information We Collect */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Information We Collect
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-3">1. Information You Provide to Us</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Account Information:</h4>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                    <li>Email address (for account creation and login)</li>
                    <li>Password (encrypted and stored securely)</li>
                    <li>Name (optional, for personalization)</li>
                    <li>Profile information you choose to add</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Job Tracking Data:</h4>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                    <li>Job titles, company names, and job descriptions you choose to track</li>
                    <li>Job application dates and status updates</li>
                    <li>Notes and comments you add to tracked jobs</li>
                    <li>Company information and logos from job postings</li>
                  </ul>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">2. Information Collected Through Our Chrome Extension</h3>
              <div>
                <h4 className="font-medium mb-2">Job Posting Content (Only when you click "Track with JobSchedule"):</h4>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                  <li>Job title and description</li>
                  <li>Company name and logo</li>
                  <li>Job location and workplace type (remote, hybrid, on-site)</li>
                  <li>Job posting URL and date</li>
                  <li>Job requirements and responsibilities</li>
                </ul>
                <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                  <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                    <strong>Important:</strong> Our extension only collects job information when you explicitly click the "Track with JobSchedule" button. We do not monitor your browsing activity or collect data automatically.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">3. Automatically Collected Information</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Usage Data:</h4>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                    <li>Log data (IP address, browser type, pages visited, time spent)</li>
                    <li>Device information (device type, operating system)</li>
                    <li>Analytics data to improve our Services</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Cookies and Similar Technologies:</h4>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                    <li>Essential cookies for authentication and functionality</li>
                    <li>Analytics cookies to understand how you use our Services</li>
                    <li>Preference cookies to remember your settings</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* How We Use Your Information */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              How We Use Your Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>We use the collected information for the following purposes:</p>
            
            <div>
              <h4 className="font-medium mb-2">Core Functionality</h4>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                <li>Provide job application tracking and management services</li>
                <li>Sync job data between our extension and web application</li>
                <li>Maintain your account and authenticate your access</li>
                <li>Store and organize your job tracking data</li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium mb-2">Service Improvement</h4>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                <li>Analyze usage patterns to improve our Services</li>
                <li>Develop new features and functionality</li>
                <li>Provide customer support and respond to inquiries</li>
                <li>Send important service updates and security notifications</li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium mb-2">Communication</h4>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                <li>Send account-related emails (login notifications, password resets)</li>
                <li>Provide customer support</li>
                <li>Send optional marketing communications (with your consent)</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Data Security and Protection */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Data Security and Protection
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Security Measures</h4>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                <li>Encryption: All sensitive data is encrypted both in transit (HTTPS) and at rest</li>
                <li>Token Security: Authentication tokens are encrypted using AES-GCM encryption</li>
                <li>Secure Storage: Passwords are hashed using industry-standard algorithms</li>
                <li>Access Controls: Strict access controls limit who can access your data</li>
                <li>Regular Security Audits: We regularly review and update our security practices</li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium mb-2">Chrome Extension Security</h4>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                <li>All data transmission uses HTTPS</li>
                <li>Input sanitization prevents malicious data injection</li>
                <li>Rate limiting prevents abuse</li>
                <li>Content Security Policy (CSP) prevents unauthorized scripts</li>
                <li>Minimal permissions requested (only LinkedIn job pages)</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Data Sharing and Disclosure */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Data Sharing and Disclosure</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances:</p>
            
            <div>
              <h4 className="font-medium mb-2">Service Providers</h4>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                <li>Cloud hosting providers (for secure data storage)</li>
                <li>Analytics services (anonymized data only)</li>
                <li>Customer support tools</li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium mb-2">Legal Requirements</h4>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                <li>When required by law, regulation, or legal process</li>
                <li>To protect our rights, privacy, safety, or property</li>
                <li>To enforce our Terms of Service</li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium mb-2">Business Transfers</h4>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                <li>In the event of a merger, acquisition, or sale of assets (with notice to you)</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Your Rights and Choices */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Your Rights and Choices</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Account Management</h4>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                <li>Access: View and download your personal data</li>
                <li>Update: Modify your account information and preferences</li>
                <li>Delete: Request deletion of your account and associated data</li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium mb-2">Data Portability</h4>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                <li>Export your job tracking data in a standard format</li>
                <li>Transfer your data to another service</li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium mb-2">Communication Preferences</h4>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                <li>Opt out of marketing emails (service emails will continue)</li>
                <li>Manage notification preferences</li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium mb-2">Cookie Choices</h4>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                <li>Disable non-essential cookies through browser settings</li>
                <li>Use our cookie preference center (if applicable)</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Data Retention */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Data Retention</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Account Data</h4>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                <li>We retain your account information while your account is active</li>
                <li>You can delete your account at any time</li>
                <li>After account deletion, personal data is removed within 30 days</li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium mb-2">Job Tracking Data</h4>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                <li>Job data is retained as long as you maintain your account</li>
                <li>You can delete individual job entries at any time</li>
                <li>Anonymized analytics data may be retained for service improvement</li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium mb-2">Legal Obligations</h4>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                <li>Some data may be retained longer if required by law</li>
                <li>Backup copies may exist for up to 90 days after deletion</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Children's Privacy */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Children's Privacy</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              Our Services are not intended for users under 13 years of age. We do not knowingly collect personal information from children under 13. If we become aware that we have collected personal information from a child under 13, we will take steps to delete such information.
            </p>
          </CardContent>
        </Card>

        {/* International Data Transfers */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>International Data Transfers</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place to protect your data during international transfers, including:
            </p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
              <li>Adequacy decisions by relevant authorities</li>
              <li>Standard contractual clauses</li>
              <li>Other appropriate safeguards</li>
            </ul>
          </CardContent>
        </Card>

        {/* Third-Party Services */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Third-Party Services</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">LinkedIn Integration</h4>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                <li>Our extension interacts with LinkedIn job pages to extract job information</li>
                <li>We only access job posting content when you explicitly use our tracking feature</li>
                <li>We are not affiliated with LinkedIn and operate independently</li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium mb-2">Analytics Services</h4>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                <li>We may use third-party analytics to understand service usage</li>
                <li>Analytics data is anonymized and aggregated</li>
                <li>You can opt out of analytics tracking</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Changes to Privacy Policy */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Changes to This Privacy Policy</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">We may update this Privacy Policy from time to time. When we make changes:</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
              <li>We will update the "Last Updated" date</li>
              <li>Significant changes will be prominently posted on our website</li>
              <li>We may notify you via email for material changes</li>
              <li>Continued use of our Services constitutes acceptance of changes</li>
            </ul>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Contact Us
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              If you have questions, concerns, or requests regarding this Privacy Policy or our data practices:
            </p>
            
            <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
              <p className="font-medium mb-2">Email: privacy@jobschedule.com</p>
            </div>

            <div>
              <h4 className="font-medium mb-2">Data Subject Requests</h4>
              <p className="mb-2">
                For requests related to your personal data (access, deletion, portability), please contact us at privacy@jobschedule.com with:
              </p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                <li>Your full name and email address</li>
                <li>Description of your request</li>
                <li>Verification of your identity</li>
              </ul>
              <p className="mt-2 text-sm text-muted-foreground">
                We will respond to your request within 30 days.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Regional Privacy Rights */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Regional Privacy Rights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-medium mb-2">California Residents (CCPA)</h4>
              <p className="mb-2">If you are a California resident, you have additional rights including:</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                <li>Right to know what personal information is collected</li>
                <li>Right to delete personal information</li>
                <li>Right to opt out of sale of personal information (we do not sell data)</li>
                <li>Right to non-discrimination for exercising your rights</li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium mb-2">European Union Residents (GDPR)</h4>
              <p className="mb-2">If you are in the EU, you have rights including:</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                <li>Right of access, rectification, and erasure</li>
                <li>Right to data portability</li>
                <li>Right to object to processing</li>
                <li>Right to restrict processing</li>
                <li>Right to lodge a complaint with supervisory authorities</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-12 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          <p className="text-muted-foreground">
            This Privacy Policy is designed to be transparent about our data practices while protecting your privacy and complying with applicable laws.
          </p>
          <div className="mt-4">
            <Link href="/" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 