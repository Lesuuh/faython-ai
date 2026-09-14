import { createBrowserRouter } from "react-router-dom";
import { AppShell } from "@/components/AppShell";
import { Chat } from "@/pages/Chat";
import { Projects } from "@/pages/Projects";
import { Files } from "@/pages/Files";
import { Settings } from "@/pages/Settings";
import { Billing } from "@/pages/Billing";
import { Login } from "@/pages/Login";
import { Register } from "@/pages/Register";
import { ForgotPassword } from "@/pages/ForgotPassword";
import { ResetPassword } from "@/pages/ResetPassword";
import { VerifyEmail } from "@/pages/VerifyEmail";
import { NotFound } from "@/pages/NotFound";
import { ProtectedRoute, PublicOnlyRoute } from "@/components/ProtectedRoute";

export const router = createBrowserRouter([
  {
    element: <AppShell />,
    children: [
      { index: true, element: <Chat /> },
      {
        path: "projects",
        element: (
          <ProtectedRoute>
            <Projects />
          </ProtectedRoute>
        ),
      },
      {
        path: "files",
        element: (
          <ProtectedRoute>
            <Files />
          </ProtectedRoute>
        ),
      },
      {
        path: "billing",
        element: (
          <ProtectedRoute>
            <Billing />
          </ProtectedRoute>
        ),
      },
      {
        path: "settings",
        element: (
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        ),
      },
    ],
  },
  {
    element: (
      <PublicOnlyRoute>
        <Login />
      </PublicOnlyRoute>
    ),
    path: "/login",
  },
  {
    element: (
      <PublicOnlyRoute>
        <Register />
      </PublicOnlyRoute>
    ),
    path: "/register",
  },
  {
    element: (
      <PublicOnlyRoute>
        <ForgotPassword />
      </PublicOnlyRoute>
    ),
    path: "/forgot-password",
  },
  {
    element: (
      <PublicOnlyRoute>
        <ResetPassword />
      </PublicOnlyRoute>
    ),
    path: "/reset-password",
  },
  {
    element: (
      <PublicOnlyRoute>
        <VerifyEmail />
      </PublicOnlyRoute>
    ),
    path: "/verify-email",
  },
  { path: "*", element: <NotFound /> },
]);