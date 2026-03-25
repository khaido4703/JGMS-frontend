import {
  AppstoreOutlined,
  CheckSquareOutlined,
  DashboardOutlined,
  FileTextOutlined,
  FolderOpenOutlined,
  GithubOutlined,
  SolutionOutlined,
  TeamOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Link, NavLink } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { ROUTER_URL } from "../../consts/router.const";
import { StudentService } from "../../services/student.service";
import "./Sidebar.css";

export default function Sidebar({ isCollapsed = false }) {
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

  const studentMenuItems = useMemo(() => {
    const items = [
      {
        to: ROUTER_URL.STUDENT.DASHBOARD,
        label: "Dashboard",
        icon: <DashboardOutlined />,
        end: true,
      },
      {
        to: ROUTER_URL.STUDENT.MY_GROUP,
        label: "My Group",
        icon: <TeamOutlined />,
      },
      {
        to: ROUTER_URL.STUDENT.KANBAN,
        label: "Board",
        icon: <AppstoreOutlined />,
      },
      {
        to: "/student/tasks",
        label: "My Tasks",
        icon: <CheckSquareOutlined />,
      },
    ];

    if (isStudentLeader) {
      items.push(
        {
          to: ROUTER_URL.STUDENT.REPORTS,
          label: "Progress Reports",
          icon: <FileTextOutlined />,
        },
        {
          to: ROUTER_URL.STUDENT.DOCUMENTS,
          label: "Documents",
          icon: <FolderOpenOutlined />,
        },
      );
    }

    items.push({
      to: ROUTER_URL.STUDENT.PROFILE,
      label: "Profile",
      icon: <UserOutlined />,
    });

    return items;
  }, [isStudentLeader]);

  const menuItems = useMemo(() => {
    switch (userRole) {
      case "admin":
        return [
          {
            to: ROUTER_URL.ADMIN.DASHBOARD,
            label: "Dashboard",
            icon: <DashboardOutlined />,
            end: true,
          },
          {
            to: ROUTER_URL.ADMIN.MANAGE_GROUP,
            label: "Manage Groups",
            icon: <TeamOutlined />,
          },
          {
            to: ROUTER_URL.ADMIN.MANAGE_LECTURE,
            label: "Manage Lectures",
            icon: <SolutionOutlined />,
          },
        ];
      case "lecturer":
        return [
          {
            to: ROUTER_URL.LECTURER.DASHBOARD,
            label: "Dashboard",
            icon: <DashboardOutlined />,
            end: true,
          },
          {
            to: ROUTER_URL.LECTURER.PROFILE,
            label: "Profile",
            icon: <UserOutlined />,
          },
          {
            to: ROUTER_URL.LECTURER.REPORTS,
            label: "Progress Reports",
            icon: <FileTextOutlined />,
          },
          {
            to: ROUTER_URL.LECTURER.GITHUB,
            label: "GitHub Reports",
            icon: <GithubOutlined />,
          },
        ];
      case "student":
        return studentMenuItems;
      default:
        return [];
    }
  }, [studentMenuItems, userRole]);

  return (
    <aside className={`sidebar${isCollapsed ? " collapsed" : ""}`}>
      <div className="sidebar-top">
        <Link
          to={ROUTER_URL.COMMON.HOME}
          className="logo-link"
          aria-label="SWP391 JGMS"
          title={isCollapsed ? "SWP391 JGMS" : undefined}
        >
          <div className="logo-mark" />
          <span className="logo-text">JGMS</span>
        </Link>
      </div>

      <nav className="menu" aria-label="Sidebar navigation">
        {menuItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            title={isCollapsed ? item.label : undefined}
            className={({ isActive }) => (isActive ? "active" : undefined)}
          >
            <span className="menu-icon" aria-hidden="true">
              {item.icon}
            </span>
            <span className="menu-label">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
