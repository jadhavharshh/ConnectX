import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import UserTypeCard from "@/components/user-type-card";
import { useSignUp, useClerk } from "@clerk/clerk-react";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";
import { SEND_SIGNUP_DATA } from "@/utils/constants";

// Add the additional onSwitchForm prop to the component props
interface SignUpFormProps {
  onSwitchForm?: () => void;
}

const SignUpForm = ({ onSwitchForm }: SignUpFormProps) => {
  const [step, setStep] = useState<number>(1);
  const [role, setRole] = useState<string>("");
  const [value, setValue] = useState<string>(""); // OTP value state

  // States for student sign-up
  const [studentYear, setStudentYear] = useState<
    "first" | "second" | "third" | "fourth" | ""
  >("");
  const [studentDivision, setStudentDivision] = useState<string>("");

  const yearOptions: Record<"first" | "second" | "third" | "fourth", string> = {
    first: "First Year",
    second: "Second Year",
    third: "Third Year",
    fourth: "Fourth Year",
  };

  const [studentData, setStudentData] = useState({
    name: "",
    studentId: "",
    email: "",
    password: "",
  });

  const [teacherData, setTeacherData] = useState({
    name: "",
    department: "",
    teacherId: "",
    password: "",
  });

  // Get Clerk signUp and clerk resources
  const { signUp } = useSignUp();
  const clerk = useClerk();
  const navigate = useNavigate();

  const handleNext = () => setStep(step + 1);
  const handleBack = () => setStep(step - 1);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (role === "student") {
      setStudentData({
        ...studentData,
        [name]: value,
      });
    } else if (role === "teacher") {
      setTeacherData({
        ...teacherData,
        [name]: value,
      });
    }
  };

  // Registers the user via Clerk API and sends an OTP email.
  // API calls have been removed from here.
  const handleRegistration = async () => {
    if (!signUp) {
      console.error("SignUp resource is not ready");
      return;
    }
    const emailToRegister =
      role === "student" ? studentData.email : teacherData.teacherId;
    const passwordToRegister =
      role === "student" ? studentData.password : teacherData.password;
    setStep(3);
    try {
      await signUp.create({
        emailAddress: emailToRegister,
        password: passwordToRegister,
      });
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
    } catch (error) {
      console.error("Sign up error", error);
      alert("There was an error during sign up. Please try again.");
    }
  };

  // In step 3, verifies the OTP and sends the additional signup data to the backend.
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!signUp) {
      console.error("SignUp resource is not ready");
      return;
    }
    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code: value,
      });
      if (completeSignUp.status === "complete") {
        await clerk.setActive({ session: completeSignUp.createdSessionId });
        // Get the Clerk user id from the sign-up response
        const clerkUserId = completeSignUp.createdUserId;
        // Omit the password field from the payload using destructuring
        if (role === "teacher") {
          const { password, ...teacherPayload } = teacherData;
          await apiClient.post(SEND_SIGNUP_DATA, { 
            ...teacherPayload, 
            role,
            clerkUserId // sending Clerk id to backend
          });
        } else if (role === "student") {
          const { password, ...studentPayload } = studentData;
          await apiClient.post(SEND_SIGNUP_DATA, {
            ...studentPayload,
            role,
            year: studentYear,
            division: studentDivision,
            clerkUserId // sending Clerk id to backend
          });
        }
        console.log("User signed up:", completeSignUp);
        navigate("/dashboard");
        toast.success("Account created successfully!");
      } else {
        alert("OTP verification did not complete. Please try again.");
      }
    } catch (error) {
      console.error("OTP verification error", error);
      alert("There was an error during OTP verification. Please try again.");
    }
  };

  return (
    <form
      onSubmit={step === 3 ? handleSubmit : (e) => e.preventDefault()}
      className={cn("flex flex-col gap-6")}
    >
      {step === 1 && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2 text-start">
            <h2 className="text-start md:text-3xl font-bold">
              Create an account
            </h2>
            <p className="text-iridium md:text-sm">
              Tell us about yourself! What do you do?
            </p>
          </div>
          <div className="flex flex-col gap-4">
            <UserTypeCard
              setUserType={setRole}
              title="Student"
              text="I am a student ready to learn and grow."
              userType={role}
              value="student"
            />
            <UserTypeCard
              setUserType={setRole}
              title="Teacher"
              text="I am a teacher committed to inspiring minds."
              userType={role}
              value="teacher"
            />
          </div>
          <Button
            type="button"
            onClick={handleNext}
            disabled={!role}
            className="w-full"
          >
            Next
          </Button>
        </div>
      )}

      {step === 2 && role === "student" && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2 text-start">
            <h2 className="text-start md:text-3xl font-bold">
              Student Details
            </h2>
            <p className="text-iridium md:text-sm">
              Provide your student information
            </p>
          </div>
          <div className="grid gap-2 text-start">
            <Label htmlFor="student-name">Student Name</Label>
            <Input
              id="student-name"
              type="text"
              name="name"
              placeholder="Student Name"
              value={studentData.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="grid gap-2 text-start">
            <Label htmlFor="student-year">Current Year</Label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center justify-between">
                  {studentYear ? yearOptions[studentYear] : "Select Year"}
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                <DropdownMenuLabel>Current Year</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuRadioGroup
                  value={studentYear}
                  onValueChange={(value: string) =>
                    setStudentYear(value as "" | "first" | "second" | "third" | "fourth")
                  }
                >
                  <DropdownMenuRadioItem value="first">First Year</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="second">Second Year</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="third">Third Year</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="fourth">Fourth Year</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="grid gap-2 text-start">
            <Label htmlFor="student-division">Current Division</Label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center justify-between">
                  {studentDivision ? studentDivision : "Select Division"}
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                <DropdownMenuLabel>Current Division</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuRadioGroup
                  value={studentDivision}
                  onValueChange={setStudentDivision}
                >
                  <DropdownMenuRadioItem value="A">A</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="B">B</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="grid gap-2 text-start">
            <Label htmlFor="student-id">Student ID</Label>
            <Input
              id="student-id"
              type="text"
              name="studentId"
              placeholder="Student ID"
              value={studentData.studentId}
              onChange={handleChange}
              required
            />
          </div>
          <div className="grid gap-2 text-start">
            <Label htmlFor="student-email">Email</Label>
            <Input
              id="student-email"
              type="email"
              name="email"
              placeholder="m@pvppcoe.ac.in"
              value={studentData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="grid gap-2 text-start">
            <Label htmlFor="student-password">Password</Label>
            <Input
              id="student-password"
              type="password"
              name="password"
              placeholder="Password"
              value={studentData.password}
              onChange={handleChange}
              required
            />
          </div>
          <div className="flex justify-between">
            <Button type="button" variant="outline" onClick={handleBack}>
              Back
            </Button>
            <Button type="button" onClick={handleRegistration}>
              Next
            </Button>
          </div>
        </div>
      )}

      {step === 2 && role === "teacher" && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2 text-start">
            <h2 className="text-start md:text-3xl font-bold">
              Teacher Details
            </h2>
            <p className="text-iridium md:text-sm">
              Provide your teacher information
            </p>
          </div>
          <div className="grid gap-2 text-start">
            <Label htmlFor="teacher-name">Teacher Name</Label>
            <Input
              id="teacher-name"
              type="text"
              name="name"
              placeholder="Teacher Name"
              value={teacherData.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="grid gap-2 text-start">
            <Label htmlFor="department">Department</Label>
            <Input
              id="department"
              type="text"
              name="department"
              placeholder="Department"
              value={teacherData.department}
              onChange={handleChange}
              required
            />
          </div>
          <div className="grid gap-2 text-start">
            <Label htmlFor="teacher-id">Email ID</Label>
            <Input
              id="teacher-id"
              type="text"
              name="teacherId"
              placeholder="Teacher ID"
              value={teacherData.teacherId}
              onChange={handleChange}
              required
            />
          </div>
          <div className="grid gap-2 text-start">
            <Label htmlFor="teacher-password">Password</Label>
            <Input
              id="teacher-password"
              type="password"
              name="password"
              placeholder="Password"
              value={teacherData.password}
              onChange={handleChange}
              required
            />
          </div>
          <div className="flex justify-between">
            <Button type="button" variant="outline" onClick={handleBack}>
              Back
            </Button>
            <Button type="button" onClick={handleRegistration}>
              Next
            </Button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2 text-start">
            <h1 className="text-2xl font-bold">Verify Your Account</h1>
            <p className="text-sm text-muted-foreground">
              Enter the one-time password sent to your email to verify your account details.
            </p>
          </div>
          <div className="space-y-2 flex flex-col items-start gap-2">
            <InputOTP maxLength={6} value={value} onChange={(value: string) => setValue(value)}>
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
            <div className="text-start text-sm">
              {value === "" ? (
                <>Enter your one-time password.</>
              ) : (
                <>You entered: {value}</>
              )}
            </div>
          </div>
          <div className="flex justify-between">
            <Button type="button" variant="outline" onClick={handleBack}>
              Back
            </Button>
            <Button type="submit">Submit</Button>
          </div>
        </div>
      )}

      <div className="mt-4 text-center text-sm">
        Already have an account?{" "}
        {onSwitchForm && (
          <span
            onClick={onSwitchForm}
            className="text-blue-500 underline underline-offset-4 cursor-pointer hover:text-blue-600"
          >
            Login
          </span>
        )}
      </div>
    </form>
  );
};

export { SignUpForm };