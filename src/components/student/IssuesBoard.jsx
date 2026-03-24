import { useEffect, useMemo, useState } from "react";
import { EyeOutlined, SearchOutlined, SyncOutlined } from "@ant-design/icons";
import { Button, Card, Input, Select, Table, Tag, Tooltip } from "antd";
import { toast } from "react-toastify";
import { StudentService } from "../../services/student.service";
import IssueDetailModal from "./IssueDetailModal";

const STATUS_COLORS = {
  DONE: "success",
  "IN PROGRESS": "processing",
  "TO DO": "default",
};

const PRIORITY_COLORS = {
  Highest: "magenta",
  High: "red",
  Medium: "orange",
  Low: "blue",
  Lowest: "cyan",
};

const ISSUE_TYPE_COLORS = {
  story: "blue",
  task: "geekblue",
  bug: "red",
  epic: "purple",
};

const STATUS_OPTIONS = [
  { value: "All", label: "All" },
  { value: "TO DO", label: "To Do" },
  { value: "IN PROGRESS", label: "In Progress" },
  { value: "DONE", label: "Done" },
];

const STATUS_LABELS = {
  DONE: "Done",
  "IN PROGRESS": "In Progress",
  "TO DO": "To Do",
};

const SYNC_ACTIVE_STATUSES = new Set([
  "RUNNING",
  "IN_PROGRESS",
  "PROCESSING",
  "PENDING",
  "SYNCING",
]);

const SYNC_SUCCESS_STATUSES = new Set([
  "COMPLETED",
  "SUCCESS",
  "SUCCEEDED",
  "DONE",
  "IDLE",
]);

const normalizeStatus = (status) => {
  const value = String(status || "")
    .trim()
    .toLowerCase()
    .replace(/[_-]/g, " ");

  if (value === "done") return "DONE";
  if (value === "to do" || value === "todo") return "TO DO";
  if (value === "in progress" || value === "inprogress") return "IN PROGRESS";
  return status || "-";
};

const formatDateTime = (value) => {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const normalizeSyncStatus = (payload) => {
  if (!payload || typeof payload !== "object") return null;

  const rawStatus = String(
    payload.status ?? payload.syncStatus ?? payload.state ?? payload.jobStatus ?? "",
  ).trim();
  const normalizedStatus = rawStatus.toUpperCase().replace(/[\s-]/g, "_");
  const syncingFlag = [
    payload.isSyncing,
    payload.syncing,
    payload.inProgress,
    payload.isRunning,
  ].find((value) => typeof value === "boolean");
  const failed =
    payload.success === false ||
    normalizedStatus === "FAILED" ||
    normalizedStatus === "ERROR";
  const isSyncing =
    typeof syncingFlag === "boolean"
      ? syncingFlag
      : SYNC_ACTIVE_STATUSES.has(normalizedStatus);
  const completed =
    !failed &&
    !isSyncing &&
    (SYNC_SUCCESS_STATUSES.has(normalizedStatus) ||
      Boolean(
        payload.lastSynced ||
          payload.lastSyncAt ||
          payload.syncedAt ||
          payload.updatedAt,
      ));

  return {
    label:
      rawStatus || (isSyncing ? "SYNCING" : failed ? "FAILED" : "COMPLETED"),
    isSyncing,
    failed,
    completed,
    message: payload.message || payload.detail || payload.description || "",
    lastSynced:
      payload.lastSynced ||
      payload.lastSyncAt ||
      payload.syncedAt ||
      payload.updatedAt ||
      null,
  };
};

const mapIssue = (item) => ({
  ...item,
  key: item.jiraIssueId ?? item.issueKey,
  issueKey: item.issueKey || "-",
  summary: item.summary || "-",
  issueType: item.issueType || item.issuetype || "-",
  priority: item.priority || "-",
  status: normalizeStatus(item.status),
  assigneeName: item.assigneeName || "-",
  updatedAtLabel: formatDateTime(item.updatedDate || item.updatedAt),
});

const getSyncTagColor = (syncStatus) => {
  if (!syncStatus) return "default";
  if (syncStatus.failed) return "error";
  if (syncStatus.isSyncing) return "processing";
  if (syncStatus.completed) return "success";
  return "default";
};

const loadIssuesData = async (groupCode) => {
  const response = await StudentService.getGroupIssues(groupCode);
  const data = response?.data ?? [];
  return Array.isArray(data) ? data.map(mapIssue) : [];
};

const loadSyncStatusData = async (groupCode) => {
  const response = await StudentService.getGroupIssueSyncStatus(groupCode);
  return normalizeSyncStatus(response?.data ?? response ?? null);
};

export default function IssuesBoard({ groupCode, isLeader = false }) {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState(null);

  useEffect(() => {
    const fetchBoardData = async () => {
      if (!groupCode) return;

      try {
        setLoading(true);
        const nextIssues = await loadIssuesData(groupCode);
        setIssues(nextIssues);
      } catch (error) {
        toast.error(error?.response?.data?.message || "Failed to load issues");
        setIssues([]);
      } finally {
        setLoading(false);
      }

      try {
        const nextSyncStatus = await loadSyncStatusData(groupCode);
        setSyncStatus(nextSyncStatus);
      } catch (error) {
        if (![401, 403, 404].includes(error?.response?.status)) {
          toast.error(
            error?.response?.data?.message || "Failed to load sync status",
          );
        }
        setSyncStatus(null);
      }
    };

    fetchBoardData();
  }, [groupCode]);

  const refreshIssues = async () => {
    if (!groupCode) return;

    try {
      setLoading(true);
      const nextIssues = await loadIssuesData(groupCode);
      setIssues(nextIssues);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to load issues");
      setIssues([]);
    } finally {
      setLoading(false);
    }
  };

  const refreshSyncStatus = async () => {
    if (!groupCode) return null;

    try {
      const nextSyncStatus = await loadSyncStatusData(groupCode);
      setSyncStatus(nextSyncStatus);
      return nextSyncStatus;
    } catch (error) {
      if (![401, 403, 404].includes(error?.response?.status)) {
        toast.error(
          error?.response?.data?.message || "Failed to load sync status",
        );
      }
      setSyncStatus(null);
      return null;
    }
  };

  const handleSync = async () => {
    if (!groupCode || syncing) return;

    try {
      setSyncing(true);
      await StudentService.syncGroupIssues(groupCode);
      toast.success("Sync started successfully");

      let latestStatus = null;
      for (let attempt = 0; attempt < 20; attempt += 1) {
        await new Promise((resolve) => {
          window.setTimeout(resolve, attempt === 0 ? 1200 : 2500);
        });

        latestStatus = await refreshSyncStatus();
        if (!latestStatus?.isSyncing) {
          break;
        }
      }

      await refreshIssues();

      if (latestStatus?.failed) {
        toast.error(latestStatus.message || "Sync failed");
      } else if (latestStatus?.completed) {
        toast.success("Issues synced successfully");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to sync issues");
    } finally {
      setSyncing(false);
    }
  };

  const handleViewIssue = async (record) => {
    if (!record?.issueKey) {
      setSelectedIssue(record);
      setDetailOpen(true);
      return;
    }

    try {
      setDetailOpen(true);
      setDetailLoading(true);
      setSelectedIssue(null);

      const response = await StudentService.getIssueByKey(record.issueKey);
      const data = response?.data ?? null;
      setSelectedIssue(data ? mapIssue(data) : record);
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to load issue details",
      );
      setSelectedIssue(record);
    } finally {
      setDetailLoading(false);
    }
  };

  const rows = useMemo(() => {
    const keyword = searchValue.trim().toLowerCase();

    return issues.filter((item) => {
      const matchesStatus =
        statusFilter === "All" || item.status === statusFilter;
      const matchesSearch =
        !keyword ||
        item.issueKey.toLowerCase().includes(keyword) ||
        item.summary.toLowerCase().includes(keyword) ||
        item.assigneeName.toLowerCase().includes(keyword);

      return matchesStatus && matchesSearch;
    });
  }, [issues, searchValue, statusFilter]);

  const columns = [
    {
      title: "ISSUE KEY",
      dataIndex: "issueKey",
      key: "issueKey",
      width: 130,
      render: (value) => (
        <span className="font-mono text-xs font-bold text-slate-400">
          {value}
        </span>
      ),
    },
    {
      title: "SUMMARY",
      dataIndex: "summary",
      key: "summary",
      width: 320,
      render: (value) => (
        <span className="text-sm font-semibold text-slate-900">{value}</span>
      ),
    },
    {
      title: "TYPE",
      dataIndex: "issueType",
      key: "issueType",
      width: 120,
      render: (value) => (
        <Tag color={ISSUE_TYPE_COLORS[String(value).toLowerCase()] || "blue"}>
          {value}
        </Tag>
      ),
    },
    {
      title: "PRIORITY",
      dataIndex: "priority",
      key: "priority",
      width: 120,
      render: (value) => (
        <Tag color={PRIORITY_COLORS[value] || "default"}>{value}</Tag>
      ),
    },
    {
      title: "STATUS",
      dataIndex: "status",
      key: "status",
      width: 150,
      render: (value) => (
        <Tag color={STATUS_COLORS[value] || "default"}>
          {STATUS_LABELS[value] || value}
        </Tag>
      ),
    },
    {
      title: "ASSIGNEE",
      dataIndex: "assigneeName",
      key: "assigneeName",
      width: 180,
    },
    {
      title: "UPDATED",
      dataIndex: "updatedAtLabel",
      key: "updatedAtLabel",
      width: 180,
    },
    {
      title: "ACTIONS",
      key: "actions",
      width: 100,
      align: "center",
      render: (_, record) => (
        <Tooltip title="View issue details">
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => handleViewIssue(record)}
          />
        </Tooltip>
      ),
    },
  ];

  return (
    <>
      <Card className="rounded-3xl border border-slate-200 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <Input
            placeholder="Search board"
            prefix={<SearchOutlined />}
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            style={{ maxWidth: 280 }}
          />

          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-slate-700">
              Status:
            </label>
            <Select
              value={statusFilter}
              onChange={setStatusFilter}
              options={STATUS_OPTIONS}
              style={{ width: 170 }}
            />
          </div>

          <div className="ml-auto flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-slate-700">
                Sync:
              </span>
              <Tag color={getSyncTagColor(syncStatus)}>
                {syncStatus?.label || "UNKNOWN"}
              </Tag>
              {syncStatus?.lastSynced ? (
                <span className="text-xs text-slate-500">
                  Last synced: {formatDateTime(syncStatus.lastSynced)}
                </span>
              ) : null}
            </div>

            {isLeader ? (
              <Button
                type="primary"
                icon={<SyncOutlined spin={syncing || syncStatus?.isSyncing} />}
                loading={syncing}
                onClick={handleSync}
                disabled={syncing || syncStatus?.isSyncing}
              >
                Sync
              </Button>
            ) : null}
          </div>
        </div>

        <Table
          loading={loading}
          columns={columns}
          dataSource={rows}
          rowKey="key"
          pagination={{ pageSize: 8, showSizeChanger: false }}
          locale={{ emptyText: "No data found" }}
          scroll={{ x: 1060 }}
        />
      </Card>

      <IssueDetailModal
        open={detailOpen}
        issue={selectedIssue}
        loading={detailLoading}
        onClose={() => {
          setDetailOpen(false);
          setSelectedIssue(null);
          setDetailLoading(false);
        }}
      />
    </>
  );
}
