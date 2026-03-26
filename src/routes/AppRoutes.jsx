import { useRoutes } from "react-router-dom";
import { ROUTER_URL } from "../consts/router.const";
import { ROLE } from "../consts/const";
import AdminLayout from "../layouts/AdminLayout";
import MainLayout from "../layouts/MainLayout";
import Project from "../pages/Admin/Project";
import ManageGroups from "../pages/Admin/ManageGroups";
import ManageLectures from "../pages/Admin/ManageLecture";
import StudentDashboard from "../pages/student/Dashboard";
import StudentMyGroup from "../pages/student/MyGroup";
import StudentProfile from "../pages/student/Profile";
import MyTasks from "../pages/student/MyTasks";
import KanbanPage from "../pages/student/KanbanPage";
import StudentProgressReports from "../pages/student/ProgressReports";
import StudentDocuments from "../pages/student/Documents";
import ProgressReports from "../pages/lecturer/ProgressReports";
import LecturerDashboard from "../pages/lecturer/Dashboard";
import GithubReport from "../pages/lecturer/GithubReport";
import LecturerProfile from "../pages/lecturer/Profile"; 
import LoginPage from "../pages/auth/Login";
import RegisterPage from "../pages/auth/Register";
import HomePage from "../pages/common/Home";
import ProtectedRoute from "./ProtectedRoute";

const AppRoutes = () =>
  useRoutes([
    {
      element: <MainLayout />,
      children: [
        { path: ROUTER_URL.COMMON.HOME, element: <HomePage /> },
        { path: ROUTER_URL.COMMON.LOGIN, element: <LoginPage /> },
        { path: ROUTER_URL.COMMON.REGISTER, element: <RegisterPage /> },
      ],
    },
    {
      element: <ProtectedRoute allowedRoles={[ROLE.ADMIN]} />,
      children: [
        {
          path: ROUTER_URL.ADMIN.PROJECT,
          element: <AdminLayout />,
          children: [
            { index: true, element: <Project /> },
            { path: "groups", element: <ManageGroups /> },
            { path: "lectures", element: <ManageLectures /> },
          ],
        },
      ],
    },
    {
      element: <ProtectedRoute allowedRoles={[ROLE.LECTURER]} />,
      children: [
        {
          path: ROUTER_URL.LECTURER.DASHBOARD,
          element: <AdminLayout />,
          children: [
            { index: true, element: <LecturerDashboard /> },
            { path: "profile", element: <LecturerProfile /> },
            { path: "reports", element: <ProgressReports /> },
            { path: "github", element: <GithubReport /> }
          ],
        },
      ],
    },
    {
      element: <ProtectedRoute allowedRoles={[ROLE.STUDENT]} />,
      children: [
        {
          path: ROUTER_URL.STUDENT.DASHBOARD,
          element: <AdminLayout />,
          children: [
            {
              index: true,
              element: <StudentDashboard />,
            },
            { path: "profile", element: <StudentProfile /> },
            {
              path: "my-group",
              element: <StudentMyGroup />,
            },
            {
              path: "tasks",
              element: <MyTasks />,
            },
            {
              path: "kanban",
              element: <KanbanPage />,
            },
            {
              path: "reports",
              element: <StudentProgressReports />,
            },
            {
              path: "documents",
              element: <StudentDocuments />,
            },
          ],
        },
      ],
    },
  ]);

export default AppRoutes;
