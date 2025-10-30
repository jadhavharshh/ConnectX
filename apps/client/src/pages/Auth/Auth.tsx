import { useState } from "react";
import { GalleryVerticalEnd } from "lucide-react";

import { LoginForm } from "@/components/login-form";
import { SignUpForm } from "@/components/sign-up-form";
import { ForgotPassword } from "@/pages/Auth/Forgotpassword";
import RightSide from "./layout";

export default function Auth() {
  // formType can be "login", "signup" or "forgot"
  const [formType, setFormType] = useState<"login" | "signup" | "forgot">("login");

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
            {formType === "login" && (
              <LoginForm
                onForgotPassword={() => setFormType("forgot")}
                // You can add a prop for switching to sign up if needed:
                onSwitchForm={() => setFormType("signup")}
              />
            )}
            {formType === "signup" && (
              <SignUpForm
                onSwitchForm={() => setFormType("login")}
              />
            )}
            {formType === "forgot" && (
              <ForgotPassword onBack={() => setFormType("login")} />
            )}
          </div>
        </div>
      </div>
      <RightSide />
    </div>
  );
}