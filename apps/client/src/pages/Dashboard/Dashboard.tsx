import { useMemo } from "react"
import { useUser } from "@clerk/clerk-react"

import { AppSidebar } from "@/components/app-sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import type { LucideIcon } from "lucide-react"
import {
  ArrowDownRight,
  ArrowUpRight,
  CalendarClock,
  CheckCircle2,
  Clock,
  MessageCircle,
  Rocket,
  Sparkles,
  Target,
  Users,
} from "lucide-react"

type OverviewStat = {
  label: string
  value: string
  change: string
  icon: LucideIcon
  trend: "up" | "down"
}

type UpcomingSession = {
  id: number
  title: string
  date: string
  time: string
  focus: string
  type: string
  mentees: { name: string; initials: string; avatar?: string }[]
}

type FocusArea = {
  id: number
  title: string
  subtitle: string
  progress: number
  due: string
}

type ActivityItem = {
  id: number
  title: string
  description: string
  time: string
  icon: LucideIcon
}

type QuickAction = {
  id: number
  label: string
  description: string
  icon: LucideIcon
}

export default function Dashboard() {
  const { user } = useUser()

  const overviewStats: OverviewStat[] = useMemo(
    () => [
      {
        label: "Active mentees",
        value: "18",
        change: "+4.2%",
        icon: Users,
        trend: "up",
      },
      {
        label: "Check-ins logged",
        value: "36",
        change: "+12.5%",
        icon: MessageCircle,
        trend: "up",
      },
      {
        label: "Upcoming deliverables",
        value: "5",
        change: "-2 vs last week",
        icon: Clock,
        trend: "down",
      },
      {
        label: "Satisfaction score",
        value: "92%",
        change: "+3.1%",
        icon: Sparkles,
        trend: "up",
      },
    ],
    [],
  )

  const upcomingSessions: UpcomingSession[] = useMemo(
    () => [
      {
        id: 1,
        title: "Design review huddle",
        date: "Mon, Jun 3",
        time: "10:30 AM",
        focus: "UI polish & empty states",
        type: "Check-in",
        mentees: [
          { name: "Ananya Patel", initials: "AP" },
          { name: "Rohit Shah", initials: "RS" },
        ],
      },
      {
        id: 2,
        title: "Growth strategy sync",
        date: "Tue, Jun 4",
        time: "2:00 PM",
        focus: "North-star metrics alignment",
        type: "Strategy",
        mentees: [
          { name: "Priya Singh", initials: "PS" },
          { name: "Luis Gomez", initials: "LG" },
        ],
      },
      {
        id: 3,
        title: "Student AMA session",
        date: "Thu, Jun 6",
        time: "5:00 PM",
        focus: "Career paths & internships",
        type: "Community",
        mentees: [
          { name: "Devika Rao", initials: "DR" },
          { name: "Arjun Mehta", initials: "AM" },
          { name: "Sara Lee", initials: "SL" },
        ],
      },
    ],
    [],
  )

  const focusAreas: FocusArea[] = useMemo(
    () => [
      {
        id: 1,
        title: "Launch onboarding playbook",
        subtitle: "Review final assets before publishing",
        progress: 78,
        due: "Due Tue",
      },
      {
        id: 2,
        title: "Curate mentor pairings",
        subtitle: "Match remaining mentees with mentors",
        progress: 54,
        due: "Due Thu",
      },
      {
        id: 3,
        title: "Capture cohort feedback",
        subtitle: "Share a pulse survey with students",
        progress: 32,
        due: "Open",
      },
    ],
    [],
  )

  const activityLog: ActivityItem[] = useMemo(
    () => [
      {
        id: 1,
        title: "Sprint retro wrap-up",
        description: "Priya shared highlights and action items for cohort 5.",
        time: "2h ago",
        icon: CheckCircle2,
      },
      {
        id: 2,
        title: "New resource published",
        description: "Luis uploaded the case study template for design mentors.",
        time: "4h ago",
        icon: Rocket,
      },
      {
        id: 3,
        title: "Mentor availability updated",
        description: "Arjun opened three new slots for upcoming check-ins.",
        time: "Yesterday",
        icon: CalendarClock,
      },
      {
        id: 4,
        title: "Community thread buzzing",
        description: "12 replies in the product analytics discussion board.",
        time: "2 days ago",
        icon: MessageCircle,
      },
    ],
    [],
  )

  const quickActions: QuickAction[] = useMemo(
    () => [
      {
        id: 1,
        label: "Schedule mentor sync",
        description: "Share agenda & available slots in one click.",
        icon: CalendarClock,
      },
      {
        id: 2,
        label: "Log a milestone",
        description: "Celebrate a mentee win and notify the cohort.",
        icon: CheckCircle2,
      },
      {
        id: 3,
        label: "Drop a community note",
        description: "Kick off a conversation or share upcoming events.",
        icon: MessageCircle,
      },
      {
        id: 4,
        label: "Refine growth targets",
        description: "Align OKRs and keep mentors focused on outcomes.",
        icon: Target,
      },
    ],
    [],
  )

  const firstName = user?.firstName ? `${user.firstName}` : "there"

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/dashboard">ConnectX</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Dashboard</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-6 p-6 pt-0">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
            <div className="grid gap-4 lg:grid-cols-[2fr,1fr]">
              <Card className="relative overflow-hidden border-none bg-gradient-to-br from-primary/10 via-primary/5 to-transparent shadow-sm">
                <div
                  className="absolute right-10 top-10 hidden h-40 w-40 rounded-full bg-primary/30 blur-3xl lg:block"
                  aria-hidden="true"
                />
                <CardContent className="relative flex flex-col gap-6 p-6 sm:p-8">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <Badge variant="secondary" className="bg-white/70 text-primary shadow-sm backdrop-blur">
                      This week
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-white/60 text-primary shadow-sm backdrop-blur hover:bg-white"
                    >
                      View reports
                    </Button>
                  </div>
                  <div>
                    <CardTitle className="text-3xl font-semibold">
                      Welcome back, {firstName}.
                    </CardTitle>
                    <CardDescription className="mt-2 text-base text-muted-foreground">
                      Your mentees are progressing steadily. Keep the momentum with purposeful check-ins and
                      curated resources.
                    </CardDescription>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">Completion rate</p>
                      <p className="mt-1 text-2xl font-semibold text-primary">86%</p>
                      <p className="text-xs text-muted-foreground">↑ 5% vs last sprint</p>
                    </div>
                    <Separator className="hidden sm:block" orientation="vertical" />
                    <div>
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">NPS pulse</p>
                      <p className="mt-1 text-2xl font-semibold">47</p>
                      <p className="text-xs text-muted-foreground">Fresh check-in closes in 2 days</p>
                    </div>
                    <Separator className="hidden sm:block" orientation="vertical" />
                    <div>
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">New joiners</p>
                      <p className="mt-1 text-2xl font-semibold">3</p>
                      <p className="text-xs text-muted-foreground">Kickoff calls ready to schedule</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Today&apos;s focus</CardTitle>
                  <CardDescription>Ship meaningful progress in bite-sized steps.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                  {focusAreas.map((item) => (
                    <div key={item.id} className="rounded-lg border bg-muted/40 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-medium">{item.title}</p>
                          <p className="text-sm text-muted-foreground">{item.subtitle}</p>
                        </div>
                        <Badge variant="outline" className="whitespace-nowrap">
                          {item.due}
                        </Badge>
                      </div>
                      <Progress value={item.progress} className="mt-4" />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {overviewStats.map((stat) => {
                const Icon = stat.icon
                const TrendIcon = stat.trend === "up" ? ArrowUpRight : ArrowDownRight
                return (
                  <Card key={stat.label} className="h-full">
                    <CardContent className="flex h-full flex-col gap-4 p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-2">
                          <p className="text-sm text-muted-foreground">{stat.label}</p>
                          <p className="text-2xl font-semibold">{stat.value}</p>
                        </div>
                        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                          <Icon className="h-5 w-5 text-primary" />
                        </span>
                      </div>
                      <p
                        className={`flex items-center gap-1 text-sm font-medium ${
                          stat.trend === "up" ? "text-emerald-600" : "text-rose-600"
                        }`}
                      >
                        <TrendIcon className="h-4 w-4" />
                        {stat.change}
                      </p>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Upcoming sessions</CardTitle>
                  <CardDescription>Prep key talking points before you go live.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {upcomingSessions.map((session, index) => (
                    <div key={session.id} className="space-y-3">
                      {index > 0 && <Separator />}
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">
                            {session.date} · {session.time}
                          </p>
                          <p className="text-base font-semibold">{session.title}</p>
                          <p className="text-sm text-muted-foreground">{session.focus}</p>
                        </div>
                        <div className="flex flex-col items-start gap-3 sm:items-end">
                          <div className="flex -space-x-2">
                            {session.mentees.map((mentee) => (
                              <Avatar
                                key={`${session.id}-${mentee.initials}`}
                                className="h-8 w-8 border border-background"
                              >
                                {mentee.avatar ? (
                                  <AvatarImage src={mentee.avatar} alt={mentee.name} />
                                ) : null}
                                <AvatarFallback>{mentee.initials}</AvatarFallback>
                              </Avatar>
                            ))}
                          </div>
                          <Badge variant="outline" className="w-fit">
                            {session.type}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                  <Button variant="ghost" className="px-0 text-sm text-primary hover:text-primary">
                    View calendar
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Latest activity</CardTitle>
                  <CardDescription>Stay in sync with every touchpoint across cohorts.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {activityLog.map((item) => {
                    const Icon = item.icon
                    return (
                      <div key={item.id} className="flex gap-3 rounded-lg border bg-muted/40 p-4">
                        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-background shadow-sm">
                          <Icon className="h-5 w-5 text-primary" />
                        </span>
                        <div className="space-y-1">
                          <p className="text-sm font-medium">{item.title}</p>
                          <p className="text-sm text-muted-foreground">{item.description}</p>
                          <p className="text-xs text-muted-foreground">{item.time}</p>
                        </div>
                      </div>
                    )
                  })}
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Quick actions</CardTitle>
                <CardDescription>Lightweight workflows to help you keep momentum.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3 sm:grid-cols-2">
                {quickActions.map((action) => {
                  const Icon = action.icon
                  return (
                    <Button
                      key={action.id}
                      variant="outline"
                      className="h-auto items-start justify-start gap-2 rounded-xl border-dashed bg-background/80 px-4 py-3 text-left hover:border-primary/40 hover:bg-background"
                    >
                      <span className="flex items-center gap-2 text-sm font-medium">
                        <Icon className="h-4 w-4 text-primary" />
                        {action.label}
                      </span>
                      <span className="text-xs text-muted-foreground">{action.description}</span>
                    </Button>
                  )
                })}
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
