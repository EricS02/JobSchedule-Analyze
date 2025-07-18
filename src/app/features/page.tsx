import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Briefcase, BarChart3, Users, Zap } from 'lucide-react'
import { ReactNode } from 'react'
import { HeroHeader } from '@/components/hero/Header'

export default function FeaturesPage() {
    return (
        <div className="min-h-screen">
            <HeroHeader />
            <section className="bg-zinc-50 py-16 md:py-32 dark:bg-transparent">
                <div className="@container mx-auto max-w-5xl px-6">
                    <div className="text-center">
                        <h2 className="text-balance text-4xl font-semibold lg:text-5xl">Everything you need to track your job search</h2>
                        <p className="mt-4">Streamline your job application process with our comprehensive tracking system that helps you manage applications, monitor progress, and optimize your resume with AI.</p>
                    </div>
                    <Card className="@min-4xl:max-w-full @min-4xl:grid-cols-4 @min-4xl:divide-x @min-4xl:divide-y-0 mx-auto mt-8 grid max-w-sm divide-y overflow-hidden shadow-zinc-950/5 *:text-center md:mt-16">
                        <div className="group shadow-zinc-950/5">
                            <CardHeader className="pb-3">
                                <CardDecorator>
                                    <Briefcase
                                        className="size-6"
                                        aria-hidden
                                    />
                                </CardDecorator>

                                <h3 className="mt-6 font-medium">Application Tracker</h3>
                            </CardHeader>

                            <CardContent>
                                <p className="text-sm">Keep a detailed record of all your job applications, including company details, job titles, application dates, and current status.</p>
                            </CardContent>
                        </div>

                        <div className="group shadow-zinc-950/5">
                            <CardHeader className="pb-3">
                                <CardDecorator>
                                    <BarChart3
                                        className="size-6"
                                        aria-hidden
                                    />
                                </CardDecorator>

                                <h3 className="mt-6 font-medium">Activity Dashboard</h3>
                            </CardHeader>

                            <CardContent>
                                <p className="mt-3 text-sm">Visualize your job search progress with an interactive dashboard that provides insights into your application activities and success rates.</p>
                            </CardContent>
                        </div>

                        <div className="group shadow-zinc-950/5">
                            <CardHeader className="pb-3">
                                <CardDecorator>
                                    <Users
                                        className="size-6"
                                        aria-hidden
                                    />
                                </CardDecorator>

                                <h3 className="mt-6 font-medium">Resume Management</h3>
                            </CardHeader>

                            <CardContent>
                                <p className="mt-3 text-sm">Store and manage your resumes, and use AI to get reviews and match with job descriptions for better opportunities.</p>
                            </CardContent>
                        </div>

                        <div className="group shadow-zinc-950/5">
                            <CardHeader className="pb-3">
                                <CardDecorator>
                                    <Zap
                                        className="size-6"
                                        aria-hidden
                                    />
                                </CardDecorator>

                                <h3 className="mt-6 font-medium">AI Assistant</h3>
                            </CardHeader>

                            <CardContent>
                                <p className="mt-3 text-sm">Leverage the power of AI to improve your resumes and cover letters with personalized job matching and scoring.</p>
                            </CardContent>
                        </div>
                    </Card>
                </div>
            </section>
        </div>
    )
}

const CardDecorator = ({ children }: { children: ReactNode }) => (
    <div className="relative mx-auto size-36 duration-200 [--color-border:color-mix(in_oklab,var(--color-zinc-950)10%,transparent)] group-hover:[--color-border:color-mix(in_oklab,var(--color-zinc-950)20%,transparent)] dark:[--color-border:color-mix(in_oklab,var(--color-white)15%,transparent)] dark:group-hover:bg-white/5 dark:group-hover:[--color-border:color-mix(in_oklab,var(--color-white)20%,transparent)]">
        <div
            aria-hidden
            className="absolute inset-0 bg-[linear-gradient(to_right,var(--color-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-border)_1px,transparent_1px)] bg-[size:24px_24px]"
        />
        <div
            aria-hidden
            className="bg-radial to-background absolute inset-0 from-transparent to-75%"
        />
        <div className="bg-background absolute inset-0 m-auto flex size-12 items-center justify-center border-l border-t">{children}</div>
    </div>
) 