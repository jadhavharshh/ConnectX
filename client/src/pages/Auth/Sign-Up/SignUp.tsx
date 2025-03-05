import { GalleryVerticalEnd } from "lucide-react"
// If you have a SignUpForm component, import it. Otherwise, create your sign up form markup here.
import { SignUpForm } from "@/components/sign-up-form"
import RightSide from "../layout"

export default function SignUp() {
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
            <SignUpForm />
          </div>
        </div>
      </div>
      <RightSide />
    </div>
  )
}