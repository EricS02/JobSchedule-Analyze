import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Shield, Users, Globe, Mail } from "lucide-react";
import Link from "next/link";

export default function TermsOfService() {
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
            Terms of Service
          </Badge>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            Terms of Service
          </h1>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center text-muted-foreground">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              <span>Effective Date: {currentDate}</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span>Last Updated: {currentDate}</span>
            </div>
          </div>
        </div>

        {/* Introduction */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Introduction
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              Welcome to JobSchedule. These Terms of Service ("Terms") govern your use of our website, web application, and Chrome browser extension (collectively, the "Services") operated by JobSchedule ("we," "our," or "us").
            </p>
            <p>
              By accessing or using our Services, you agree to be bound by these Terms. If you disagree with any part of these terms, then you may not access the Services.
            </p>
          </CardContent>
        </Card>

        {/* Acceptance of Terms */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Acceptance of Terms</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              By using our Services, you confirm that you accept these Terms and agree to comply with them. If you are using the Services on behalf of a company or other legal entity, you represent that you have the authority to bind such entity to these Terms.
            </p>
          </CardContent>
        </Card>

        {/* Description of Services */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Description of Services</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              JobSchedule provides a job application tracking system that helps users:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>Track job applications from various sources including LinkedIn</li>
              <li>Organize and manage job search activities</li>
              <li>Analyze job search progress and success rates</li>
              <li>Store and manage resumes and job-related documents</li>
              <li>Receive AI-powered insights and recommendations</li>
            </ul>
          </CardContent>
        </Card>

        {/* User Accounts */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              User Accounts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Account Creation</h4>
              <p className="text-muted-foreground">
                To use certain features of our Services, you must create an account. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Account Responsibilities</h4>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                <li>Provide accurate and complete information</li>
                <li>Keep your account credentials secure</li>
                <li>Notify us immediately of any unauthorized use</li>
                <li>You are responsible for all activities under your account</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Acceptable Use */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Acceptable Use</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>You agree not to use our Services to:</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
              <li>Violate any applicable laws or regulations</li>
              <li>Infringe on the rights of others</li>
              <li>Upload or transmit malicious code or content</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Use the Services for any commercial purpose without authorization</li>
              <li>Interfere with or disrupt the Services</li>
              <li>Collect or harvest personal information of other users</li>
            </ul>
          </CardContent>
        </Card>

        {/* Privacy and Data */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Privacy and Data</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              Your privacy is important to us. Our collection and use of personal information is governed by our Privacy Policy, which is incorporated into these Terms by reference.
            </p>
            <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
              <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                <Link href="/privacy" className="underline hover:no-underline">
                  View our Privacy Policy →
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Intellectual Property */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Intellectual Property</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Our Rights</h4>
              <p className="text-muted-foreground">
                The Services and their original content, features, and functionality are owned by JobSchedule and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Your Content</h4>
              <p className="text-muted-foreground">
                You retain ownership of any content you submit to our Services. By submitting content, you grant us a license to use, store, and display that content in connection with providing the Services.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Subscription and Payment */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Subscription and Payment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Free Tier</h4>
              <p className="text-muted-foreground">
                We offer a free tier of our Services with basic features. You may use the free tier without payment.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Premium Subscriptions</h4>
              <p className="text-muted-foreground">
                Premium features are available through paid subscriptions. Subscription terms and pricing are subject to change with notice.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Payment Processing</h4>
              <p className="text-muted-foreground">
                Payments are processed by third-party payment processors. You agree to their terms and conditions.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Termination */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Termination</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Your Right to Terminate</h4>
              <p className="text-muted-foreground">
                You may terminate your account at any time by contacting us or using the account deletion feature in your settings.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Our Right to Terminate</h4>
              <p className="text-muted-foreground">
                We may terminate or suspend your account immediately, without prior notice, for conduct that we believe violates these Terms or is harmful to other users or our Services.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Effect of Termination</h4>
              <p className="text-muted-foreground">
                Upon termination, your right to use the Services will cease immediately. We may delete your account and data in accordance with our Privacy Policy.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Disclaimers */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Disclaimers</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              THE SERVICES ARE PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
            </p>
            <p>
              We do not guarantee that the Services will be uninterrupted, secure, or error-free, or that defects will be corrected.
            </p>
          </CardContent>
        </Card>

        {/* Limitation of Liability */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Limitation of Liability</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              IN NO EVENT SHALL JOBSCHEDULE BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING WITHOUT LIMITATION, LOSS OF PROFITS, DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES, RESULTING FROM YOUR USE OF THE SERVICES.
            </p>
          </CardContent>
        </Card>

        {/* Indemnification */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Indemnification</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              You agree to defend, indemnify, and hold harmless JobSchedule from and against any claims, damages, obligations, losses, liabilities, costs, or debt arising from your use of the Services or violation of these Terms.
            </p>
          </CardContent>
        </Card>

        {/* Governing Law */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Governing Law
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of the jurisdiction in which JobSchedule operates, without regard to its conflict of law provisions.
            </p>
          </CardContent>
        </Card>

        {/* Changes to Terms */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Changes to Terms</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              We reserve the right to modify these Terms at any time. When we make changes:
            </p>
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
              If you have any questions about these Terms of Service, please contact us:
            </p>
            <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
              <p className="font-medium mb-2">Email: legal@jobschedule.com</p>
              <p className="text-sm text-muted-foreground">
                We will respond to your inquiry within a reasonable time.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-12 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          <p className="text-muted-foreground">
            These Terms of Service constitute the entire agreement between you and JobSchedule regarding the use of our Services.
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