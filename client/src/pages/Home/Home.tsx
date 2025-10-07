import React from "react"
import { useUser } from "@clerk/clerk-react"
import {
  ArrowRight,
  BarChart3,
  Compass,
  Quote,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import LoadingLoop from "@/components/ui/LoadingLoop"

type Feature = {
  title: string
  description: string
  icon: React.ElementType
}

type Stat = {
  label: string
  value: string
}

type Testimonial = {
  quote: string
  author: string
  role: string
}

const featureHighlights: Feature[] = [
  {
    title: "Guided Cohort Journeys",
    description:
      "Design intentional mentorship tracks with smart nudges, curated resources, and effortless follow-up.",
    icon: Compass,
  },
  {
    title: "Signal-Rich Analytics",
    description:
      "Spot the wins and the warning signs in real time with sentiment, engagement, and outcome reporting.",
    icon: BarChart3,
  },
  {
    title: "Trust-First Collaboration",
    description:
      "Secure messaging, instant feedback loops, and ritual templates keep every stakeholder aligned.",
    icon: ShieldCheck,
  },
  {
    title: "Community Pulse",
    description:
      "Celebrate momentum, surface blockers, and keep conversations vibrant across the entire cohort.",
    icon: Users,
  },
]

const momentumStats: Stat[] = [
  { label: "Mentor satisfaction", value: "94%" },
  { label: "Average response time", value: "12m" },
  { label: "Active cohorts", value: "27" },
]

const testimonials: Testimonial[] = [
  {
    quote:
      "ConnectX turned our mentorship program into a living, breathing community. The clarity and cadence we needed was finally here.",
    author: "Aditi Sharma",
    role: "Program Director, Horizon Labs",
  },
  {
    quote:
      "From onboarding to retros, every step feels crafted. Our mentors show up prepared and our mentees stay energised week after week.",
    author: "Marcus Allen",
    role: "Head of Learning, Blend Collective",
  },
]

const Home: React.FC = () => {
  const { isLoaded } = useUser()

  if (!isLoaded) {
    return <LoadingLoop />
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.16),transparent_50%),radial-gradient(circle_at_bottom,_rgba(139,92,246,0.12),transparent_55%)]"
        aria-hidden="true"
      />

      <main className="mx-auto flex w-full max-w-6xl flex-col gap-24 px-6 pb-24 pt-20 sm:px-10 lg:px-12">
        <section className="relative overflow-hidden rounded-3xl border bg-gradient-to-br from-background via-background/70 to-primary/10 p-10 shadow-[0_25px_60px_-40px_rgba(15,23,42,0.35)] backdrop-blur">
          <div className="absolute right-10 top-10 hidden h-40 w-40 rounded-full bg-primary/25 blur-3xl lg:block" />
          <div className="absolute -left-14 bottom-10 hidden h-44 w-44 rounded-full bg-secondary/15 blur-3xl sm:block" />
          <div className="relative flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-xl space-y-6">
              <Badge
                variant="outline"
                className="inline-flex items-center gap-2 rounded-full border-primary/40 bg-primary/10 px-4 py-1 text-primary"
              >
                <Sparkles className="h-4 w-4" />
                Elevate every mentorship moment
              </Badge>
              <div className="space-y-4">
                <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                  A quieter, smarter workspace for purposeful connections.
                </h1>
                <p className="text-lg text-muted-foreground sm:text-xl">
                  Design journeys, keep momentum, and celebrate progress—all in one elegant canvas that
                  mentors and mentees genuinely love.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-4">
                <Button size="lg" className="gap-2">
                  Start building
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Button size="lg" variant="outline" className="border-primary/30 bg-background/80">
                  Explore the product
                </Button>
              </div>
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                {momentumStats.map((stat) => (
                  <div key={stat.label} className="rounded-full border border-white/10 bg-white/5 px-4 py-2">
                    <span className="font-medium text-primary">{stat.value}</span>{" "}
                    <span className="text-muted-foreground">{stat.label}</span>
                  </div>
                ))}
              </div>
            </div>
            <Card className="relative w-full max-w-md border-primary/10 bg-white/70 p-0 shadow-xl backdrop-blur">
              <CardContent className="flex flex-col gap-6 p-8">
                <div className="space-y-2">
                  <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Program pulse</p>
                  <p className="text-2xl font-semibold text-foreground">This week&apos;s snapshot</p>
                </div>
                <div className="space-y-5">
                  <div className="flex items-center justify-between rounded-2xl border bg-background/70 p-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Active journeys</p>
                      <p className="text-2xl font-semibold">128</p>
                    </div>
                    <span className="rounded-full bg-primary/10 px-3 py-1 text-sm text-primary">+14%</span>
                  </div>
                  <div className="flex items-center justify-between rounded-2xl border bg-background/70 p-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Check-in health</p>
                      <p className="text-2xl font-semibold">Excellent</p>
                    </div>
                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm text-emerald-600">97%</span>
                  </div>
                  <div className="flex items-center justify-between rounded-2xl border bg-background/70 p-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Moments celebrated</p>
                      <p className="text-2xl font-semibold">342</p>
                    </div>
                    <span className="rounded-full bg-secondary/20 px-3 py-1 text-sm text-secondary-foreground">
                      +38 this week
                    </span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Everything in ConnectX is crafted for calm focus. No clutter, just the signals you need to
                  keep humans thriving together.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="flex flex-col gap-10">
          <div className="flex flex-col gap-3 text-center">
            <Badge variant="outline" className="mx-auto rounded-full border-primary/30 bg-primary/5 px-4 py-1">
              Why teams choose ConnectX
            </Badge>
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Craft experiences that feel considered.
            </h2>
            <p className="mx-auto max-w-2xl text-base text-muted-foreground sm:text-lg">
              Every interaction is designed to feel intentional. From first hello to final celebration, we
              keep the flow serene and the outcomes powerful.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {featureHighlights.map((feature) => {
              const Icon = feature.icon
              return (
                <Card
                  key={feature.title}
                  className="border border-transparent bg-background/80 shadow-[0_16px_40px_-32px_rgba(15,23,42,0.6)] transition hover:border-primary/30 hover:bg-background/95"
                >
                  <CardContent className="space-y-4 p-7">
                    <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" />
                    </span>
                    <div className="space-y-2">
                      <h3 className="text-xl font-semibold text-foreground">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground">{feature.description}</p>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </section>

        <section className="grid gap-10 lg:grid-cols-[1.2fr,0.8fr] lg:items-center">
          <div className="space-y-6 rounded-3xl border bg-background/80 p-10 shadow-[0_30px_70px_-50px_rgba(15,23,42,0.55)]">
            <Badge variant="outline" className="rounded-full border-primary/40 bg-primary/10 px-3 py-1">
              How it flows
            </Badge>
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              A rhythm that keeps everyone in sync.
            </h2>
            <div className="space-y-5">
              {[
                {
                  title: "Kick-off with clarity",
                  description:
                    "Set intentions, define outcomes, and align around rituals with templates that remove the guesswork.",
                },
                {
                  title: "Nurture meaningful check-ins",
                  description:
                    "Smart prompts and shared notes make every conversation actionable without sacrificing authenticity.",
                },
                {
                  title: "Reflect and celebrate together",
                  description:
                    "Moments, milestones, and insights flow into living dashboards that fuel momentum and trust.",
                },
              ].map((step, index) => (
                <div key={step.title} className="flex gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border bg-primary/10 font-medium text-primary">
                    {index + 1}
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-lg font-semibold text-foreground">{step.title}</p>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex h-full flex-col justify-between gap-6 rounded-3xl border bg-gradient-to-br from-primary/15 via-background to-background/90 p-10 shadow-[0_25px_60px_-45px_rgba(59,130,246,0.65)]">
            <div className="space-y-4">
              <Badge variant="outline" className="rounded-full border-white/20 bg-white/10 px-3 py-1 text-white">
                Voices from the field
              </Badge>
              <p className="text-3xl font-semibold text-white">
                “We finally have a space that mirrors the intention behind our programs. It&apos;s quiet,
                human, and deeply effective.”
              </p>
            </div>
            <div className="space-y-4">
              <p className="text-sm text-white/80">
                ConnectX helps you move fast without the noise. Elegant workflows, thoughtful automation, and
                rich storytelling when it matters most.
              </p>
              <div className="flex items-center gap-3 text-white/80">
                <Quote className="h-5 w-5" />
                <div>
                  <p className="text-sm font-medium">Maya Chen</p>
                  <p className="text-xs text-white/60">Lead Mentor, Aurora Fellowship</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-12">
          <div className="flex flex-col gap-3 text-center">
            <Badge variant="outline" className="mx-auto rounded-full border-primary/30 bg-primary/5 px-4 py-1">
              Chosen by modern learning teams
            </Badge>
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Momentum the whole organisation can feel.
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {testimonials.map((testimonial) => (
              <Card key={testimonial.author} className="border bg-background/85 p-0 shadow-[0_18px_50px_-35px_rgba(15,23,42,0.6)]">
                <CardContent className="flex h-full flex-col gap-6 p-8">
                  <p className="text-lg text-muted-foreground">“{testimonial.quote}”</p>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{testimonial.author}</p>
                    <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="relative overflow-hidden rounded-3xl border bg-gradient-to-r from-primary/10 via-background to-secondary/10 p-12 text-center shadow-[0_28px_70px_-48px_rgba(15,23,42,0.65)]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.24),transparent_65%)]" aria-hidden="true" />
          <div className="relative mx-auto flex max-w-2xl flex-col items-center gap-6">
            <Badge variant="outline" className="rounded-full border-primary/30 bg-primary/10 px-3 py-1">
              Let&apos;s begin
            </Badge>
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Build the mentorship culture you always imagined.
            </h2>
            <p className="text-base text-muted-foreground sm:text-lg">
              Partner with us to craft programmes that feel personal, purposeful, and measurable—without the
              manual effort.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg" className="gap-2">
                Request a walkthrough
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" className="border-primary/30 bg-background/70">
                Access the playbook
              </Button>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

export default Home
