import { useMemo } from "react";
import useStore from "@/store/store";

interface CourseAccess {
  role: "teacher" | "student" | string;
  isTeacher: boolean;
  isStudent: boolean;
  rawData: any;
}

export const useCourseAccess = (): CourseAccess => {
  const userData = useStore((state) => state.userData);
  const role = userData?.role ?? "student";
  const rawData = userData?.data;

  return useMemo(() => {
    return {
      role,
      isTeacher: role === "teacher",
      isStudent: role === "student",
      rawData,
    };
  }, [role, rawData]);
};

export default useCourseAccess;
