import { useState } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { BellIcon, SunIcon, UserIcon, GlobeIcon, ShieldIcon } from "lucide-react"
import { DarkMode } from "./components/darkmode"
import { LightMode } from "./components/lightmode"
import { SystemMode } from "./components/systemmode"
import { useTheme } from "@/components/theme-provider"

export default function Settings() {
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [pushNotifications, setPushNotifications] = useState(false)
  // const [darkMode, setDarkMode] = useState(false)
  const { theme, setTheme } = useTheme()

  const [twoFactorAuth, setTwoFactorAuth] = useState(false)

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
                  <BreadcrumbLink href="/dashboard">
                    ConnectX
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Settings</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="mb-2 mt-2">
            <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
            <p className="text-sm text-muted-foreground">
              Manage your account settings and preferences.
            </p>
          </div>

          <Tabs defaultValue="account" className="w-full">
            <TabsList className="mb-4 w-full max-w-md">
              <TabsTrigger value="account" className="flex-1">
                <UserIcon className="mr-2 h-4 w-4" />
                Account
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex-1">
                <BellIcon className="mr-2 h-4 w-4" />
                Notifications
              </TabsTrigger>
              <TabsTrigger value="appearance" className="flex-1">
                <SunIcon className="mr-2 h-4 w-4" />
                Appearance
              </TabsTrigger>
              <TabsTrigger value="privacy" className="flex-1">
                <ShieldIcon className="mr-2 h-4 w-4" />
                Privacy
              </TabsTrigger>
            </TabsList>

            <TabsContent value="account" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>
                    Update your personal details here.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input id="name" placeholder="John Doe" defaultValue="John Doe" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" placeholder="john@example.com" defaultValue="john@example.com" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <textarea
                      id="bio"
                      className="flex min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder="Tell us about yourself"
                      defaultValue="Software developer with interest in AI and machine learning."
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end gap-2">
                  <Button variant="outline">Cancel</Button>
                  <Button>Save Changes</Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Connected Accounts</CardTitle>
                  <CardDescription>
                    Manage your linked accounts and services.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <GlobeIcon className="h-5 w-5" />
                      <div>
                        <p className="font-medium">Google</p>
                        <p className="text-xs text-muted-foreground">john@gmail.com</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">Connected</Badge>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <GlobeIcon className="h-5 w-5" />
                      <div>
                        <p className="font-medium">GitHub</p>
                        <p className="text-xs text-muted-foreground">Not connected</p>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">Connect</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notifications" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Notification Preferences</CardTitle>
                  <CardDescription>
                    Choose how and when you want to be notified.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="email-notifications">Email Notifications</Label>
                      <p className="text-xs text-muted-foreground">Receive notifications via email.</p>
                    </div>
                    <Switch
                      id="email-notifications"
                      checked={emailNotifications}
                      onCheckedChange={setEmailNotifications}
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="push-notifications">Push Notifications</Label>
                      <p className="text-xs text-muted-foreground">Receive notifications on your device.</p>
                    </div>
                    <Switch
                      id="push-notifications"
                      checked={pushNotifications}
                      onCheckedChange={setPushNotifications}
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="ml-auto">Save Preferences</Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Notification Categories</CardTitle>
                  <CardDescription>
                    Customize which types of notifications you receive.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="flex items-center space-x-2">
                      <Switch id="messages" defaultChecked />
                      <Label htmlFor="messages">Messages</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="mentions" defaultChecked />
                      <Label htmlFor="mentions">Mentions</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="updates" defaultChecked />
                      <Label htmlFor="updates">Platform Updates</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="reminders" />
                      <Label htmlFor="reminders">Reminders</Label>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="appearance" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Theme Preferences</CardTitle>
                  <CardDescription>
                    Customize how ConnectX looks for you.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                <div className="space-y-4">
  <div className="space-y-2">
    <Label>Theme</Label>
    <p className="text-xs text-muted-foreground">Select how ConnectX appears to you</p>
  </div>
  <div className="grid grid-cols-3 gap-4">
  <div 
      className={`flex flex-col items-center justify-center cursor-pointer rounded-md border-2 p-3 transition-all ${theme === "system" ? "border-primary" : "border-transparent hover:border-muted"}`}
      onClick={() => setTheme("system")}
    >
      <div className="flex justify-center w-full">
        <SystemMode />
      </div>
      <p className="mt-2 text-center text-sm font-medium">System</p>
    </div>
    <div 
      className={`flex flex-col items-center justify-center cursor-pointer rounded-md border-2 p-3 transition-all ${theme === "light" ? "border-primary" : "border-transparent hover:border-muted"}`}
      onClick={() => setTheme("light")}
    >
      <div className="flex justify-center w-full">
        <LightMode />
      </div>
      <p className="mt-2 text-center text-sm font-medium">Light</p>
    </div>
    <div 
      className={`flex flex-col items-center justify-center cursor-pointer rounded-md border-2 p-3 transition-all ${theme === "dark" ? "border-primary" : "border-transparent hover:border-muted"}`}
      onClick={() => setTheme("dark")}
    >
      <div className="flex justify-center w-full">
        <DarkMode />
      </div>
      <p className="mt-2 text-center text-sm font-medium">Dark</p>
    </div>

  </div>
</div>
                  <Separator />
                  <div className="space-y-2">
                    <Label htmlFor="font-size">Font Size</Label>
                    <Select defaultValue="medium">
                      <SelectTrigger id="font-size" className="w-full">
                        <SelectValue placeholder="Select font size" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="small">Small</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="large">Large</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="ml-auto">Save Preferences</Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Display Options</CardTitle>
                  <CardDescription>
                    Additional display customizations.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="flex items-center space-x-2">
                      <Switch id="compact-view" />
                      <Label htmlFor="compact-view">Compact View</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="reduce-motion" />
                      <Label htmlFor="reduce-motion">Reduce Motion</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="high-contrast" />
                      <Label htmlFor="high-contrast">High Contrast</Label>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="privacy" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Security Settings</CardTitle>
                  <CardDescription>
                    Manage your account security preferences.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="two-factor">Two-Factor Authentication</Label>
                      <p className="text-xs text-muted-foreground">Add an extra layer of security to your account.</p>
                    </div>
                    <Switch
                      id="two-factor"
                      checked={twoFactorAuth}
                      onCheckedChange={setTwoFactorAuth}
                    />
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    <Label htmlFor="current-password">Current Password</Label>
                    <Input id="current-password" type="password" />
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="new-password">New Password</Label>
                      <Input id="new-password" type="password" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Confirm New Password</Label>
                      <Input id="confirm-password" type="password" />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="destructive">Reset Password</Button>
                  <Button>Update Password</Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Data Privacy</CardTitle>
                  <CardDescription>
                    Control how your data is used and accessed.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Activity Tracking</Label>
                      <p className="text-xs text-muted-foreground">Allow us to collect usage data to improve our services.</p>
                    </div>
                    <Switch id="activity-tracking" defaultChecked />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Data Sharing</Label>
                      <p className="text-xs text-muted-foreground">Share your usage data with our partners.</p>
                    </div>
                    <Switch id="data-sharing" />
                  </div>
                  <Button variant="outline" className="w-full mt-2">Download My Data</Button>
                </CardContent>
                <CardFooter>
                  <Button variant="destructive" className="w-full">Delete Account</Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}