import { createBrowserRouter } from "react-router-dom";
import { AppShell } from "@/components/AppShell";
import { AuthFrame } from "@/components/AuthFrame";
import { Chat } from "@/pages/Chat";
import { Projects } from "@/pages/Projects";
import { Files } from "@/pages/Files";
import { Settings } from "@/pages/Settings";
import { Billing } from "@/pages/Billing";
import { Login } from "@/pages/Login";
import { NotFound } from "@/pages/NotFound";
import { ProtectedRoute, PublicOnlyRoute } from "@/components/ProtectedRoute";

export const router = createBrowserRouter([
  {
    element: <AuthFrame />,
    children: [
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
      { path: "*", element: <NotFound /> },
    ],
  },
]);
