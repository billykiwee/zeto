import Dashboard from "../views/dashboard/Dashboard";
import ProjectDetailView from "../views/dashboard/components/ProjectDetailView";

export const router = [
  {
    path: "/projects",
    component: <Dashboard />,
  },

  {
    path: "/projects/:id",
    component: <ProjectDetailView />,
  },
];
