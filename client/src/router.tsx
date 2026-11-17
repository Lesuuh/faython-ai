import { createBrowserRouter } from "react-router-dom";
import { AppShell } from "@/components/AppShell";
import { AuthFrame } from "@/components/AuthFrame";
import { Home } from "@/pages/Home";
import { NewProject } from "@/pages/NewProject";
import { ProjectDetail } from "@/pages/ProjectDetail";
import { Projects } from "@/pages/Projects";
import { Files } from "@/pages/Files";
import { Settings } from "@/pages/Settings";
import { Billing } from "@/pages/Billing";
import { Login } from "@/pages/Login";
import { NotFound } from "@/pages/NotFound";
import { ProtectedRoute, PublicOnlyRoute } from "@/components/ProtectedRoute";

const protectedPage = (element: React.ReactNode) => <ProtectedRoute>{element}</ProtectedRoute>;

export const router = createBrowserRouter([
  {
    element: <AuthFrame />,
    children: [
      {
        element: <AppShell />,
        children: [
          { index: true, element: <Home /> },
          { path: "new", element: protectedPage(<NewProject />) },
          { path: "projects", element: protectedPage(<Projects />) },
          { path: "projects/:projectId", element: protectedPage(<ProjectDetail />) },
          { path: "files", element: protectedPage(<Files />) },
          { path: "billing", element: protectedPage(<Billing />) },
          { path: "settings", element: protectedPage(<Settings />) },
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
