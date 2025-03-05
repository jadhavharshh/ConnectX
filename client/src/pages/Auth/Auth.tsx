import { useState } from "react";
import { GalleryVerticalEnd } from "lucide-react";

import { LoginForm } from "@/components/login-form";
import { SignUpForm } from "@/components/sign-up-form";
import RightSide from "./layout";

export default function Auth() {
  const [isSignUp, setIsSignUp] = useState(false);

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
            {isSignUp ? <SignUpForm /> : <LoginForm />}
            <div className="mt-4 text-center text-sm">
              {isSignUp ? "Already have an account? " : "Don't have an account? "}
              <a
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-blue-500 underline underline-offset-4 cursor-pointer hover:text-blue-600" 
              >
                {isSignUp ? "Sign In" : "Sign Up"}
              </a>
            </div>
          </div>
        </div>
      </div>
      <RightSide />
    </div>
  );
}