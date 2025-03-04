import React, { useState } from "react";

const SignUpForm = () => {
  const [step, setStep] = useState(1);
  const [role, setRole] = useState("");
  const [studentData, setStudentData] = useState({
    name: "",
    studentId: "",
    email: "",
  });
  const [teacherData, setTeacherData] = useState({
    name: "",
    department: "",
    teacherId: "",
  });

  const handleRoleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRole(e.target.value);
  };

  const handleNext = () => {
    setStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setStep((prev) => prev - 1);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (role === "student") {
      setStudentData({ ...studentData, [name]: value });
    } else if (role === "teacher") {
      setTeacherData({ ...teacherData, [name]: value });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = role === "student" ? studentData : teacherData;
    console.log("Submitted:", { role, ...data });
    // Implement further submission logic here
    alert("Form submitted!");
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {step === 1 && (
        <div>
          <h2 className="text-xl font-bold mb-4">Select Account Type</h2>
          <label className="flex items-center gap-2 mb-2">
            <input
              type="radio"
              name="role"
              value="student"
              checked={role === "student"}
              onChange={handleRoleChange}
            />
            Student
          </label>
          <label className="flex items-center gap-2 mb-4">
            <input
              type="radio"
              name="role"
              value="teacher"
              checked={role === "teacher"}
              onChange={handleRoleChange}
            />
            Teacher
          </label>
          <button
            type="button"
            onClick={handleNext}
            disabled={!role}
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            Next
          </button>
        </div>
      )}

      {step === 2 && role === "student" && (
        <div>
          <h2 className="text-xl font-bold mb-4">Student Details</h2>
          <input
            type="text"
            name="name"
            placeholder="Student Name"
            value={studentData.name}
            onChange={handleChange}
            className="border px-2 py-1 mb-3 w-full"
          />
          <input
            type="text"
            name="studentId"
            placeholder="Student ID"
            value={studentData.studentId}
            onChange={handleChange}
            className="border px-2 py-1 mb-3 w-full"
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={studentData.email}
            onChange={handleChange}
            className="border px-2 py-1 mb-3 w-full"
          />
          <div className="flex gap-4">
            <button
              type="button"
              onClick={handleBack}
              className="px-4 py-2 bg-gray-500 text-white rounded"
            >
              Back
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="px-4 py-2 bg-blue-500 text-white rounded"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {step === 2 && role === "teacher" && (
        <div>
          <h2 className="text-xl font-bold mb-4">Teacher Details</h2>
          <input
            type="text"
            name="name"
            placeholder="Teacher Name"
            value={teacherData.name}
            onChange={handleChange}
            className="border px-2 py-1 mb-3 w-full"
          />
          <input
            type="text"
            name="department"
            placeholder="Department"
            value={teacherData.department}
            onChange={handleChange}
            className="border px-2 py-1 mb-3 w-full"
          />
          <input
            type="text"
            name="teacherId"
            placeholder="Teacher ID"
            value={teacherData.teacherId}
            onChange={handleChange}
            className="border px-2 py-1 mb-3 w-full"
          />
          <div className="flex gap-4">
            <button
              type="button"
              onClick={handleBack}
              className="px-4 py-2 bg-gray-500 text-white rounded"
            >
              Back
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="px-4 py-2 bg-blue-500 text-white rounded"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div>
          <h2 className="text-xl font-bold mb-4">Review and Submit</h2>
          <div className="mb-4">
            <pre className="bg-gray-100 p-3 rounded">
{JSON.stringify(
  role === "student"
    ? { role, ...studentData }
    : { role, ...teacherData },
  null,
  2
)}
            </pre>
          </div>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={handleBack}
              className="px-4 py-2 bg-gray-500 text-white rounded"
            >
              Back
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-500 text-white rounded"
            >
              Submit
            </button>
          </div>
        </div>
      )}
    </form>
  );
};

export { SignUpForm };