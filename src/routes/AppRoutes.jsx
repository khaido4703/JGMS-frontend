import { useRoutes } from "react-router-dom";
import { ROUTER_URL } from "../consts/router.const";
import { ROLE } from "../consts/const";
import AdminLayout from "../layouts/AdminLayout";
import MainLayout from "../layouts/MainLayout";
import Dashboard from "../pages/Admin/Dashboard";
import ManageGroups from "../pages/Admin/ManageGroups";
import ManageLectures from "../pages/Admin/ManageLecture";
import StudentDashboard from "../pages/student/Dashboard";
import StudentProfile from "../pages/student/Profile";
import MyTasks from "../pages/student/MyTasks";
import KanbanPage from "../pages/student/KanbanPage";
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
      element: (
        <ProtectedRoute
          allowedRoles={[ROLE.STUDENT, ROLE.ADMIN, ROLE.LECTURER]}
        />
      ),
      children: [
        {
          element: <MainLayout />,
          children: [
            { path: ROUTER_URL.COMMON.PROFILE, element: <StudentProfile /> },
          ],
        },
      ],
    },
    {
      element: <ProtectedRoute allowedRoles={[ROLE.ADMIN]} />,
      children: [
        {
          path: ROUTER_URL.ADMIN.DASHBOARD,
          element: <AdminLayout />,
          children: [
            { index: true, element: <Dashboard /> },
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
            {
              index: true,
              element: (
                <div className="p-6">
                  <h1 className="text-2xl font-bold">Lecturer Dashboard</h1>
                </div>
              ),
            },
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
            {
              path: "tasks",
              element: <MyTasks />,
            },
            {
              path: "kanban",
              element: <KanbanPage />,
            },
          ],
        },
      ],
    },
  ]);

export default AppRoutes;
