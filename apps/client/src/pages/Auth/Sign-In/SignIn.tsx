import { GalleryVerticalEnd } from "lucide-react"
import { LoginForm } from "@/components/login-form"
import RightSide from "../layout"

export default function SignIn() {
  return (
    <div className="grid min-h-screen lg:grid-cols-2 w-screen">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="#" className="flex items-center gap-2 font-medium">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <GalleryVerticalEnd className="size-4" />
            </div>
            ConnectX.
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <LoginForm />
          </div>
        </div>
      </div>
      <RightSide />
    </div>
  )
}