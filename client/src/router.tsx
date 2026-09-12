import { createBrowserRouter } from "react-router-dom";
import { Landing } from "@/pages/Landing";
import { Login } from "@/pages/Login";
import { Register } from "@/pages/Register";
import { ForgotPassword } from "@/pages/ForgotPassword";
import { ResetPassword } from "@/pages/ResetPassword";
import { VerifyEmail } from "@/pages/VerifyEmail";
import { GenerateTopics } from "@/pages/GenerateTopics";
import { Pricing } from "@/pages/Pricing";
import { Project } from "@/pages/Project";
import { ProjectChapter } from "@/pages/ProjectChapter";
import { NotFound } from "@/pages/NotFound";
import { DashboardLayout } from "@/pages/dashboard/DashboardLayout";
import { DashboardHome } from "@/pages/dashboard/DashboardHome";
import { DashboardHistory } from "@/pages/dashboard/DashboardHistory";
import { DashboardSaved } from "@/pages/dashboard/DashboardSaved";
import { DashboardPayments } from "@/pages/dashboard/DashboardPayments";
import { DashboardProfile } from "@/pages/dashboard/DashboardProfile";
import { DashboardSettings } from "@/pages/dashboard/DashboardSettings";
import { ProtectedRoute, PublicOnlyRoute } from "@/components/ProtectedRoute";

export const router = createBrowserRouter([
  { path: "/", element: <Landing /> },
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
  { path: "/pricing", element: <Pricing /> },
  {
    element: (
      <ProtectedRoute>
        <GenerateTopics />
      </ProtectedRoute>
    ),
    path: "/generate-topics",
  },
  {
    element: (
      <ProtectedRoute>
        <Project />
      </ProtectedRoute>
    ),
    path: "/project/:id",
  },
  {
    element: (
      <ProtectedRoute>
        <ProjectChapter />
      </ProtectedRoute>
    ),
    path: "/project/:id/chapter/:chapterNum",
  },
  {
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    path: "/dashboard",
    children: [
      { index: true, element: <DashboardHome /> },
      { path: "history", element: <DashboardHistory /> },
      { path: "saved", element: <DashboardSaved /> },
      { path: "payments", element: <DashboardPayments /> },
      { path: "profile", element: <DashboardProfile /> },
      { path: "settings", element: <DashboardSettings /> },
    ],
  },
  { path: "*", element: <NotFound /> },
]);