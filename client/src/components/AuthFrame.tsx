import { Outlet } from "react-router-dom";
import { AuthTransition } from "@/components/AuthTransition";

export function AuthFrame() {
  return (
    <>
      <AuthTransition />
      <Outlet />
    </>
  );
}
