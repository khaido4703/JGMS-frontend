import { NavLink, Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { ROUTER_URL } from "../../consts/router.const";
import "./Sidebar.css";

export default function Sidebar() {
  const { user } = useAuth();
  const userRole = user?.role?.toLowerCase();

  const getMenuItems = () => {
    switch (userRole) {
      case "admin":
        return (
          <>
            <NavLink to={ROUTER_URL.ADMIN.DASHBOARD} end>
              Dashboard
            </NavLink>
            <NavLink to="/admin/groups">Manage Groups</NavLink>
            <NavLink to="/admin/lectures">Manage Lectures</NavLink>
          </>
        );
      case "lecturer":
        return (
          <>
            <NavLink to="/lecturer" end>
              Dashboard
            </NavLink>

            <NavLink to="/profile">Profile</NavLink>

            <NavLink to="/lecturer/reports">Progress Reports</NavLink>

            <NavLink to="/lecturer/github">GitHub Reports</NavLink>
          </>
        );
      case "student":
        return (
          <>
            <NavLink to={ROUTER_URL.STUDENT.DASHBOARD} end>
              Dashboard
            </NavLink>
            <NavLink to={ROUTER_URL.STUDENT.MY_GROUP}>My Group</NavLink>
            <NavLink to={ROUTER_URL.STUDENT.KANBAN}>Sprint Board</NavLink>
            <NavLink to="/student/profile">Profile</NavLink>
            <NavLink to="/student/tasks">My Tasks</NavLink>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <aside className="sidebar">
      <Link to={ROUTER_URL.COMMON.HOME} className="logo-link">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded bg-linear-to-br from-emerald-400 to-emerald-600"></div>
          <span className="text-lg font-bold text-slate-900">SWP391 JGMS</span>
        </div>
      </Link>

      <nav className="menu">{getMenuItems()}</nav>
    </aside>
  );
}
