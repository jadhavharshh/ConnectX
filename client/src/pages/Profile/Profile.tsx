import { useState, useEffect } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { Breadcrumb } from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/duplicate-card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import useStore from "@/store/store"

export default function Profile() {
  const userData = useStore((state) => state.userData)
  // userData assumed to have shape { role: string; data: any }
  const profile = userData?.data

  // Set up initial form values based on the logged in role.
  const [editMode, setEditMode] = useState(false)
  const [formValues, setFormValues] = useState<any>({})

  useEffect(() => {
    if (profile) {
      if (userData.role === "teacher") {
        setFormValues({
          name: profile.name,
          department: profile.department,
          teacherId: profile.teacherId,
        })
      } else if (userData.role === "student") {
        setFormValues({
          name: profile.name,
          studentId: profile.studentId,
          email: profile.email,
          year: profile.year,
          division: profile.division,
        })
      }
    }
  }, [profile, userData?.role])

  const handleInputChange = (field: string, value: string) => {
    setFormValues((prev: any) => ({ ...prev, [field]: value }))
  }

  const handleCancel = () => {
    // Reset to original profile values and disable edit mode
    if (profile) {
      if (userData.role === "teacher") {
        setFormValues({
          name: profile.name,
          department: profile.department,
          teacherId: profile.teacherId,
        })
      } else if (userData.role === "student") {
        setFormValues({
          name: profile.name,
          studentId: profile.studentId,
          email: profile.email,
          year: profile.year,
          division: profile.division,
        })
      }
    }
    setEditMode(false)
  }

  const handleSave = async () => {
    const changed: any = {}

    if (profile) {
      if (userData.role === "teacher") {
        if (formValues.name !== profile.name) changed.name = formValues.name
        if (formValues.department !== profile.department) changed.department = formValues.department
        if (formValues.teacherId !== profile.teacherId) changed.teacherId = formValues.teacherId
      } else if (userData.role === "student") {
        if (formValues.name !== profile.name) changed.name = formValues.name
        if (formValues.studentId !== profile.studentId) changed.studentId = formValues.studentId
        if (formValues.email !== profile.email) changed.email = formValues.email
        if (formValues.year !== profile.year) changed.year = formValues.year
        if (formValues.division !== profile.division) changed.division = formValues.division
      }
    }

    // If no change, disable edit mode without updating backend.
    if (Object.keys(changed).length === 0) {
      setEditMode(false)
      return
    }

    try {
      const response = await fetch("/api/updateProfile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(changed),
      })
      if (response.ok) {
        // Optionally update global state or notify the user
        setEditMode(false)
      } else {
        console.error("Failed to update profile")
      }
    } catch (error) {
      console.error("Error updating profile", error)
    }
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            Profile Page
          </Breadcrumb>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          {profile ? (
            <Card>
              <CardHeader className="flex items-center justify-between">
                <div className="flex flex-col items-start">
                  <CardTitle className="text-2xl font-bold">Profile</CardTitle>
                  <CardDescription>Your information as stored in our system.</CardDescription>
                </div>
                <div className="flex gap-2">
                  {editMode ? (
                    <>
                      <Button variant="outline" onClick={handleCancel}>Cancel</Button>
                      <Button onClick={handleSave}>Save</Button>
                    </>
                  ) : (
                    <Button onClick={() => setEditMode(true)}>Edit Profile</Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {userData.role === "teacher" ? (
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground text-left">Name</p>
                      <Input
                        value={formValues.name}
                        readOnly={!editMode}
                        className={!editMode ? "cursor-not-allowed" : ""}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                      />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground text-left">Department</p>
                      <Input
                        value={formValues.department}
                        readOnly={!editMode}
                        className={!editMode ? "cursor-not-allowed" : ""}
                        onChange={(e) => handleInputChange("department", e.target.value)}
                      />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground text-left">Teacher Id (Email)</p>
                      <Input
                        value={formValues.teacherId}
                        readOnly={!editMode}
                        className={!editMode ? "cursor-not-allowed" : ""}
                        onChange={(e) => handleInputChange("teacherId", e.target.value)}
                      />
                    </div>
                  </div>
                ) : userData.role === "student" ? (
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground text-left">Name</p>
                      <Input
                        value={formValues.name}
                        readOnly={!editMode}
                        className={!editMode ? "cursor-not-allowed" : ""}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                      />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground text-left">Student Id</p>
                      <Input
                        value={formValues.studentId}
                        readOnly={!editMode}
                        className={!editMode ? "cursor-not-allowed" : ""}
                        onChange={(e) => handleInputChange("studentId", e.target.value)}
                      />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground text-left">Email</p>
                      <Input
                        value={formValues.email}
                        readOnly={!editMode}
                        className={!editMode ? "cursor-not-allowed" : ""}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                      />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground text-left">Year</p>
                      <Input
                        value={formValues.year}
                        readOnly={!editMode}
                        className={!editMode ? "cursor-not-allowed" : ""}
                        onChange={(e) => handleInputChange("year", e.target.value)}
                      />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground text-left">Division</p>
                      <Input
                        value={formValues.division}
                        readOnly={!editMode}
                        className={!editMode ? "cursor-not-allowed" : ""}
                        onChange={(e) => handleInputChange("division", e.target.value)}
                      />
                    </div>
                  </div>
                ) : null}
              </CardContent>
            </Card>
          ) : (
            <p className="text-center text-lg text-muted-foreground">
              No profile data available.
            </p>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}