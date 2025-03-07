import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import UserTypeCard from "@/components/user-type-card";
import { useSignUp, useClerk } from "@clerk/clerk-react";

const SignUpForm = () => {
  const [step, setStep] = useState(1);
  const [role, setRole] = useState("");
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

  // Get the underlying signUp and clerk resources.
  const { signUp } = useSignUp();
  const clerk = useClerk();

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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!signUp) {
      console.error("SignUp resource is not ready");
      return;
    }
    // For teachers the teacherId field is treated as the email.
    const email = role === "student" ? studentData.email : teacherData.teacherId;
    const password =
      role === "student" ? studentData.password : teacherData.password;

    try {
      // Call signUp.create with only emailAddress and password.
      const result = await signUp.create({
        emailAddress: email,
        password: password,
      });
      await clerk.setActive({ session: result.createdSessionId });
      console.log("User signed up:", result);
      alert("Signed up successfully!");
    } catch (error) {
      console.error("Sign up error", error);
      alert("There was an error during sign up. Please try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className={cn("flex flex-col gap-6")}>
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
            <Button type="button" onClick={handleNext}>
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
            <Button type="button" onClick={handleNext}>
              Next
            </Button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col items-center gap-2 text-center">
            <h1 className="text-2xl font-bold">Review and Submit</h1>
            <p className="text-sm text-muted-foreground">
              Verify your details before submission
            </p>
          </div>
          <div>
            <pre className="bg-muted p-3 rounded">
              {JSON.stringify(
                role === "student"
                  ? { role, ...studentData }
                  : { role, ...teacherData },
                null,
                2
              )}
            </pre>
          </div>
          <div className="flex justify-between">
            <Button type="button" variant="outline" onClick={handleBack}>
              Back
            </Button>
            <Button type="submit">Submit</Button>
          </div>
        </div>
      )}
    </form>
  );
};

export { SignUpForm };
