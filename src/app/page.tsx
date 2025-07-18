import HeroSection from "@/components/hero-section";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Briefcase, 
  Search, 
  BarChart3, 
  Users, 
  Zap, 
  Shield, 
  CheckCircle,
  ArrowRight,
  Star,
  ChevronRight,
  Cpu
} from "lucide-react";
import Link from "next/link";
import { RegisterLink, LoginLink } from "@kinde-oss/kinde-auth-nextjs/components";
import Image from "next/image";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <HeroSection />
      
      {/* Features Section */}
      <section className="py-16 sm:py-20 lg:py-24 bg-muted/50">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-12 sm:mb-16">
            <Badge variant="secondary" className="mb-4">
              Features
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Everything you need to track your job search
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
              Streamline your job application process with our comprehensive tracking system
            </p>
          </div>
          
          <div className="grid gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-4">
            <Card className="border-0 shadow-lg h-full flex flex-col">
              <CardHeader className="flex-1">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center mb-4">
                  <Briefcase className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                </div>
                <CardTitle className="text-lg sm:text-xl">Application Tracker</CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  Keep a detailed record of all your job applications, including company details, job titles, application dates, and current status.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-end">
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span className="text-xs sm:text-sm">Company & job details</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span className="text-xs sm:text-sm">Application dates</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span className="text-xs sm:text-sm">Status tracking</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg h-full flex flex-col">
              <CardHeader className="flex-1">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center mb-4">
                  <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
                </div>
                <CardTitle className="text-lg sm:text-xl">Activity Monitoring Dashboard</CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  Visualize your job search progress with an interactive dashboard that provides insights into your application activities, success rates, and upcoming tasks.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-end">
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span className="text-xs sm:text-sm">Interactive progress tracking</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span className="text-xs sm:text-sm">Success rate analytics</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span className="text-xs sm:text-sm">Upcoming task reminders</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg h-full flex flex-col">
              <CardHeader className="flex-1">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center mb-4">
                  <Users className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                </div>
                <CardTitle className="text-lg sm:text-xl">Resume Management</CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  Store and manage your resumes, and use it with AI to get reviews and match with job descriptions.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-end">
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span className="text-xs sm:text-sm">Resume storage & organization</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span className="text-xs sm:text-sm">AI-powered reviews</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span className="text-xs sm:text-sm">Job description matching</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg h-full flex flex-col">
              <CardHeader className="flex-1">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center mb-4">
                  <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" />
                </div>
                <CardTitle className="text-lg sm:text-xl">AI Assistant</CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  Leverage the power of AI to improve your resumes and cover letters. Get personalized job matching with scoring to identify the best opportunities tailored to your profile.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-end">
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span className="text-xs sm:text-sm">Resume & cover letter optimization</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span className="text-xs sm:text-sm">Personalized job matching</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span className="text-xs sm:text-sm">Opportunity scoring</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Content Section 1 */}
      <section className="py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-full space-y-6 sm:space-y-8 px-4 sm:px-6 md:space-y-12 lg:space-y-16">
          <h2 className="relative z-10 max-w-xl text-3xl sm:text-4xl font-medium lg:text-5xl">Ai Resume Reviewer</h2>
          <div className="grid gap-6 sm:grid-cols-2 md:gap-12 lg:gap-24">
            <div className="relative mb-6 sm:mb-0 order-2 sm:order-1">
              <div className="bg-linear-to-b relative rounded-2xl from-zinc-300 to-transparent p-px dark:from-zinc-700">
                <Image src="/images/AI Review.gif" className="hidden dark:block rounded-[20px] w-full h-full mx-auto my-4 shadow-2xl object-contain" alt="JobSchedule AI Review demo" width={2000} height={2000} />
                <Image src="/images/AI Review.gif" className="dark:hidden rounded-[20px] w-full h-full mx-auto my-4 shadow-2xl object-contain" alt="JobSchedule AI Review demo" width={2000} height={2000} />
              </div>
            </div>

            <div className="relative space-y-4 order-1 sm:order-2 pr-6 lg:pr-12">
              <p className="text-muted-foreground text-sm sm:text-base">
              Ai Resume Reviewer built in <span className="text-accent-foreground font-bold">Shows strenghs weakness and suggestions for improvement.</span> 
              </p>
              <p className="text-muted-foreground text-sm sm:text-base">It supports an entire ecosystem — from tracking applications to AI-powered resume optimization and professional development tools.</p>

            </div>
          </div>
        </div>
      </section>

      {/* Content Section 2 */}
      <section className="py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-full space-y-6 sm:space-y-8 px-4 sm:px-6 md:space-y-12 lg:space-y-16">
          <h2 className="relative z-10 max-w-xl text-3xl sm:text-4xl font-medium lg:text-5xl">Advanced AI technology meets intuitive design.</h2>
          <div className="grid gap-6 sm:grid-cols-2 md:gap-12 lg:gap-24">
            <div className="relative space-y-4 order-2 sm:order-1 pr-6 lg:pr-12">
              <p className="text-muted-foreground text-sm sm:text-base">
                Our AI assistant leverages cutting-edge technology. <span className="text-accent-foreground font-bold">It provides personalized insights</span> — to optimize your applications.
              </p>
              <p className="text-muted-foreground text-sm sm:text-base">It provides personalized insights — from resume optimization to job matching, helping job seekers succeed in today's competitive market.</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 pt-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Zap className="size-4" />
                    <h3 className="text-sm font-medium">Smart</h3>
                  </div>
                  <p className="text-muted-foreground text-xs sm:text-sm">AI-powered resume optimization and job matching with personalized insights.</p>
                </div>
              
              </div>
            </div>
            <div className="relative mt-6 sm:mt-0 order-1 sm:order-2">
              <div className="bg-linear-to-b relative rounded-2xl from-zinc-300 to-transparent p-px dark:from-zinc-700">
                <Image src="/images/Ai Job Match.gif" className="hidden dark:block rounded-[20px] w-full h-full mx-auto my-4 shadow-2xl object-contain" alt="AI Job Match demo" width={2000} height={2000} />
                <Image src="/images/Ai Job Match.gif" className="dark:hidden rounded-[20px] w-full h-full mx-auto my-4 shadow-2xl object-contain" alt="AI Job Match demo" width={2000} height={2000} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-20 lg:py-24 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="container mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to transform your job search?
          </h2>
          <p className="text-lg sm:text-xl text-blue-100 mb-6 sm:mb-8 max-w-2xl mx-auto">
            Join thousands of job seekers who have already improved their success rate with JobSchedule
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild>
              <RegisterLink>
                Get Started Free
                <ArrowRight className="ml-2 w-4 h-4" />
              </RegisterLink>
            </Button>
            <Button size="lg" variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20" asChild>
              <LoginLink>
                Sign In
              </LoginLink>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
} 