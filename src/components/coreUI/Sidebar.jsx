import { NavLink, Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { ROUTER_URL } from "../../consts/router.const";
import { StudentService } from "../../services/student.service";
import "./Sidebar.css";

export default function Sidebar() {
  const { user } = useAuth();
  const userRole = user?.role?.toLowerCase();
  const [isStudentLeader, setIsStudentLeader] = useState(false);

  useEffect(() => {
    let ignore = false;

    const loadStudentLeaderState = async () => {
      if (userRole !== "student" || !user?.email) {
        setIsStudentLeader(false);
        return;
      }

      try {
        const response = await StudentService.getMyGroup({ isLoading: false });
        const members = response?.data?.members;
        const currentEmail = user.email.toLowerCase();

        if (ignore) return;

        const nextIsLeader = Array.isArray(members)
          ? members.some(
              (member) =>
                member?.isLeader &&
                member?.email?.toLowerCase() === currentEmail,
            )
          : false;

        setIsStudentLeader(nextIsLeader);
      } catch {
        if (!ignore) {
          setIsStudentLeader(false);
        }
      }
    };

    loadStudentLeaderState();

    return () => {
      ignore = true;
    };
  }, [user?.email, userRole]);

  const studentMenuItems = useMemo(
    () => (
      <>
        <NavLink to={ROUTER_URL.STUDENT.DASHBOARD} end>
          Dashboard
        </NavLink>
        <NavLink to={ROUTER_URL.STUDENT.MY_GROUP}>My Group</NavLink>
        <NavLink to={ROUTER_URL.STUDENT.KANBAN}>Board</NavLink>
        <NavLink to="/student/tasks">My Tasks</NavLink>
        {isStudentLeader ? (
          <>
            <NavLink to={ROUTER_URL.STUDENT.REPORTS}>Progress Reports</NavLink>
            <NavLink to={ROUTER_URL.STUDENT.DOCUMENTS}>Documents</NavLink>
          </>
        ) : null}
        <NavLink to="/student/profile">Profile</NavLink>
      </>
    ),
    [isStudentLeader],
  );

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
        return studentMenuItems;
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
