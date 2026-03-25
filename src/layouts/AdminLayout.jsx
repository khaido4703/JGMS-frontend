import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/coreUI/Sidebar";
import Topbar from "../components/coreUI/Topbar";
import "./AdminLayout.css";

export default function AdminLayout() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }

    return window.localStorage.getItem("jgms-sidebar-collapsed") === "true";
  });

  const handleSidebarToggle = () => {
    setIsSidebarCollapsed((previous) => {
      const nextValue = !previous;

      if (typeof window !== "undefined") {
        window.localStorage.setItem(
          "jgms-sidebar-collapsed",
          String(nextValue),
        );
      }

      return nextValue;
    });
  };

  return (
    <div className="admin-layout">
      <Sidebar isCollapsed={isSidebarCollapsed} />

      <div className="admin-main">
        <Topbar
          isSidebarCollapsed={isSidebarCollapsed}
          onSidebarToggle={handleSidebarToggle}
        />
        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
