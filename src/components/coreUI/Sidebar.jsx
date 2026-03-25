import { NavLink, Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import "./Sidebar.css";

export default function Sidebar() {
  const { user } = useAuth();
  const userRole = user?.role?.toLowerCase();

  const getLogoLink = () => {
    if (userRole === "student") return "/";
    if (userRole === "admin") return "/admin";
    if (userRole === "lecturer") return "/lecturer";
    return "/";
  };

  const getMenuItems = () => {
    switch (userRole) {
      case "admin":
        return (
          <>
            <NavLink to="/admin" end>
              Project
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

          <NavLink to="profile">
            Profile
          </NavLink>

          <NavLink to="reports">
            Progress Reports
          </NavLink>

          <NavLink to="github">
            GitHub Reports
          </NavLink>
        </>
        );
      case "student":
        return (
          <>
            <NavLink to="/student" end>
              Dashboard
            </NavLink>
            <NavLink to="/student/kanban">Sprint Board</NavLink>
            <NavLink to="/student/profile">
              Profile
            </NavLink>
            <NavLink to="/student/tasks">My Tasks</NavLink>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <aside className="sidebar">
      <Link to={getLogoLink()} className="logo-link">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded bg-gradient-to-br from-emerald-400 to-emerald-600"></div>
          <span className="text-lg font-bold text-slate-900">SWP391 JGMS</span>
        </div>
      </Link>

      <nav className="menu">{getMenuItems()}</nav>
    </aside>
  );
}
