import { useEffect, useMemo, useState } from "react";
import {
  AppstoreOutlined,
  FileTextOutlined,
  ProfileOutlined,
} from "@ant-design/icons";
import { Card, Empty, Spin } from "antd";
import { toast } from "react-toastify";
import { useAuth } from "../../contexts/AuthContext";
import IssuesBoard from "../../components/student/IssuesBoard";
import RequirementsBoard from "../../components/student/RequirementsBoard";
import TasksBoard from "../../components/student/TasksBoard";
import { StudentService } from "../../services/student.service";

const BOARD_TABS = [
  { key: "issues", label: "Issues", icon: <ProfileOutlined /> },
  { key: "requirement", label: "Requirement", icon: <FileTextOutlined /> },
  { key: "task", label: "Task", icon: <AppstoreOutlined /> },
];

export default function KanbanPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("issues");
  const [group, setGroup] = useState(null);
  const [groupLoading, setGroupLoading] = useState(true);

  const loadGroup = async () => {
    try {
      setGroupLoading(true);
      const response = await StudentService.getMyGroup();
      setGroup(response?.data ?? null);
    } catch (error) {
      if (error?.response?.status !== 404) {
        toast.error(
          error?.response?.data?.message || "Failed to load group information",
        );
      }
      setGroup(null);
    } finally {
      setGroupLoading(false);
    }
  };

  useEffect(() => {
    loadGroup();
  }, []);

  const isLeader = useMemo(() => {
    const currentEmail = user?.email?.toLowerCase();
    if (!currentEmail || !Array.isArray(group?.members)) return false;

    return group.members.some(
      (member) =>
        member?.isLeader && member?.email?.toLowerCase() === currentEmail,
    );
  }, [group?.members, user?.email]);

  const visibleTabs = useMemo(
    () => BOARD_TABS.filter((tab) => (tab.key === "task" ? isLeader : true)),
    [isLeader],
  );

  useEffect(() => {
    if (!visibleTabs.some((tab) => tab.key === activeTab)) {
      setActiveTab("issues");
    }
  }, [activeTab, visibleTabs]);

  const renderContent = () => {
    if (groupLoading) {
      return (
        <div className="flex min-h-64 items-center justify-center rounded-3xl bg-white">
          <Spin size="large" tip="Loading board..." />
        </div>
      );
    }

    if (!group?.groupCode) {
      return (
        <Card className="rounded-3xl shadow-sm">
          <Empty description="You need to be assigned to a group before using the board." />
        </Card>
      );
    }

    if (activeTab === "issues") {
      return <IssuesBoard groupCode={group.groupCode} isLeader={isLeader} />;
    }

    if (activeTab === "requirement") {
      return (
        <RequirementsBoard groupCode={group.groupCode} isLeader={isLeader} />
      );
    }

    if (activeTab === "task" && isLeader) {
      return (
        <TasksBoard
          groupCode={group.groupCode}
          isLeader={isLeader}
          members={group.members ?? []}
        />
      );
    }

    return null;
  };

  return (
    <div className="p-4 md:p-2 xl:p-4">
      <div className="mb-6 overflow-x-auto border-b border-slate-200">
        <div className="flex min-w-max items-center gap-1">
          {visibleTabs.map((tab) => {
            const active = activeTab === tab.key;

            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                  active
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-slate-500 hover:text-slate-900"
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {renderContent()}
    </div>
  );
}
