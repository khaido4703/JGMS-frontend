import { useEffect, useMemo, useState } from "react";
import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  SearchOutlined,
  SendOutlined,
} from "@ant-design/icons";
import { Button, Card, Input, Select, Space, Table, Tag } from "antd";
import { toast } from "react-toastify";
import { StudentService } from "../../services/student.service";
import TaskDeleteModal from "./TaskDeleteModal";
import TaskFormModal from "./TaskFormModal";
import TaskFromJiraModal from "./TaskFromJiraModal";

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

const PRIORITY_OPTIONS = [
  { value: "All", label: "All" },
  { value: "Highest", label: "Highest" },
  { value: "High", label: "High" },
  { value: "Medium", label: "Medium" },
  { value: "Low", label: "Low" },
  { value: "Lowest", label: "Lowest" },
];

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

const GREEN_BUTTON_STYLE = {
  backgroundColor: "#10b981",
  borderColor: "#10b981",
};

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

const toStatusPayload = (status) => {
  if (status === "TO DO") return "To Do";
  if (status === "IN PROGRESS") return "In Progress";
  if (status === "DONE") return "Done";
  return status;
};

const formatDate = (value) => {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
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

const mapTask = (task) => ({
  ...task,
  key: task.taskId,
  taskCode: task.jiraIssueKey || `TASK-${task.taskId}`,
  requirementCode: task.requirementCode || "-",
  title: task.title || "-",
  description: task.description || "",
  assigneeName: task.assignedToName || "-",
  status: normalizeStatus(task.status),
  priority: task.priority || "-",
  dueDateLabel: formatDate(task.dueDate),
  updatedAtLabel: formatDateTime(task.updatedAt),
});

const loadTasksData = async (groupCode) => {
  const response = await StudentService.getGroupTasks(groupCode);
  const data = response?.data ?? [];
  return Array.isArray(data) ? data.map(mapTask) : [];
};

const loadRequirementsOptions = async (groupCode) => {
  const response = await StudentService.getGroupRequirements(groupCode);
  const data = response?.data ?? [];

  return Array.isArray(data)
    ? data.map((item) => ({
        value: Number(item.requirementId),
        label: `${item.requirementCode || `REQ-${item.requirementId}`} - ${item.title || "Untitled requirement"}`,
      }))
    : [];
};

const loadIssueOptions = async (groupCode) => {
  const response = await StudentService.getGroupIssues(groupCode);
  const data = response?.data ?? [];

  return Array.isArray(data)
    ? data
        .filter((item) => item?.issueKey)
        .map((item) => ({
          value: item.issueKey,
          label: `${item.issueKey} - ${item.summary || "No summary"}`,
          jiraIssueId: Number(item.jiraIssueId || 0),
        }))
    : [];
};

export default function TasksBoard({
  groupCode,
  isLeader = false,
  members = [],
}) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [fromJiraModalOpen, setFromJiraModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [deletingTask, setDeletingTask] = useState(null);
  const [requirementOptions, setRequirementOptions] = useState([]);
  const [issueOptions, setIssueOptions] = useState([]);

  const memberOptions = useMemo(
    () =>
      Array.isArray(members)
        ? members.map((member) => ({
            value: Number(member.userId),
            label: member.fullName || member.email || `User ${member.userId}`,
          }))
        : [],
    [members],
  );

  const loadTasks = async () => {
    if (!groupCode) return;

    try {
      setLoading(true);
      const nextTasks = await loadTasksData(groupCode);
      setTasks(nextTasks);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to load tasks");
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchTasks = async () => {
      if (!groupCode) return;

      try {
        setLoading(true);
        const nextTasks = await loadTasksData(groupCode);
        setTasks(nextTasks);
      } catch (error) {
        toast.error(error?.response?.data?.message || "Failed to load tasks");
        setTasks([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [groupCode]);

  useEffect(() => {
    const fetchTaskResources = async () => {
      if (!groupCode || !isLeader) return;

      try {
        const [nextRequirementOptions, nextIssueOptions] = await Promise.all([
          loadRequirementsOptions(groupCode),
          loadIssueOptions(groupCode),
        ]);
        setRequirementOptions(nextRequirementOptions);
        setIssueOptions(nextIssueOptions);
      } catch (error) {
        toast.error(
          error?.response?.data?.message || "Failed to load task resources",
        );
        setRequirementOptions([]);
        setIssueOptions([]);
      }
    };

    fetchTaskResources();
  }, [groupCode, isLeader]);

  const rows = useMemo(() => {
    const keyword = searchValue.trim().toLowerCase();

    return tasks.filter((item) => {
      const matchesStatus =
        statusFilter === "All" || item.status === statusFilter;
      const matchesPriority =
        priorityFilter === "All" || item.priority === priorityFilter;
      const matchesSearch =
        !keyword ||
        item.taskCode.toLowerCase().includes(keyword) ||
        item.title.toLowerCase().includes(keyword) ||
        item.assigneeName.toLowerCase().includes(keyword) ||
        item.requirementCode.toLowerCase().includes(keyword);

      return matchesStatus && matchesPriority && matchesSearch;
    });
  }, [priorityFilter, searchValue, statusFilter, tasks]);

  const openCreateModal = () => {
    if (!isLeader) {
      toast.error("Only group leaders can create tasks");
      return;
    }

    setEditingTask(null);
    setTaskModalOpen(true);
  };

  const openEditModal = (task) => {
    if (!isLeader) {
      toast.error("Only group leaders can edit tasks");
      return;
    }

    setEditingTask(task);
    setTaskModalOpen(true);
  };

  const closeTaskModal = () => {
    setTaskModalOpen(false);
    setEditingTask(null);
  };

  const closeFromJiraModal = () => {
    setFromJiraModalOpen(false);
  };

  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
    setDeletingTask(null);
  };

  const handleSubmitTask = async (values) => {
    if (!isLeader) {
      toast.error("Only group leaders can manage tasks");
      return;
    }

    try {
      setSaving(true);

      if (editingTask) {
        await StudentService.updateGroupTask(groupCode, editingTask.taskId, {
          title: values.title,
          description: values.description,
          assignedTo: Number(values.assignedTo),
          status: toStatusPayload(values.status),
          priority: values.priority,
          dueDate: values.dueDate,
          completedAt: values.completedAt
            ? new Date(values.completedAt).toISOString()
            : null,
          requirementId: Number(values.requirementId),
        });
        toast.success("Task updated successfully");
      } else {
        await StudentService.createGroupTask(groupCode, {
          title: values.title,
          description: values.description,
          requirementId: Number(values.requirementId),
          jiraIssueId: Number(values.jiraIssueId || 0),
          assignedTo: Number(values.assignedTo),
          status: toStatusPayload(values.status),
          priority: values.priority,
          dueDate: values.dueDate,
          sprintId: Number(values.sprintId || 0),
        });
        toast.success("Task created successfully");
      }

      closeTaskModal();
      await loadTasks();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to save task");
    } finally {
      setSaving(false);
    }
  };

  const handleSubmitTaskFromJira = async (values) => {
    if (!isLeader) {
      toast.error("Only group leaders can create tasks from Jira");
      return;
    }

    try {
      setSaving(true);
      await StudentService.createGroupTaskFromJira(groupCode, {
        issueKey: values.issueKey,
        titleOverride: values.titleOverride || "",
        assignedTo: Number(values.assignedTo),
        dueDate: values.dueDate,
        sprintId: Number(values.sprintId || 0),
      });
      toast.success("Task created from Jira successfully");
      closeFromJiraModal();
      await loadTasks();
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to create task from Jira",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!isLeader) {
      toast.error("Only group leaders can delete tasks");
      return;
    }

    try {
      setDeleteLoading(true);
      await StudentService.deleteGroupTask(groupCode, deletingTask?.taskId);
      toast.success("Task deleted successfully");
      closeDeleteModal();
      await loadTasks();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to delete task");
    } finally {
      setDeleteLoading(false);
    }
  };

  const columns = [
    {
      title: "TASK ID",
      dataIndex: "taskCode",
      key: "taskCode",
      width: 140,
      render: (value) => (
        <span className="font-mono text-xs font-bold text-slate-400">
          {value}
        </span>
      ),
    },
    {
      title: "TITLE",
      dataIndex: "title",
      key: "title",
      width: 280,
      render: (value) => (
        <span className="text-sm font-semibold text-slate-900">{value}</span>
      ),
    },
    {
      title: "REQ CODE",
      dataIndex: "requirementCode",
      key: "requirementCode",
      width: 140,
    },
    {
      title: "ASSIGNEE",
      dataIndex: "assigneeName",
      key: "assigneeName",
      width: 180,
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
      title: "DUE DATE",
      dataIndex: "dueDateLabel",
      key: "dueDateLabel",
      width: 140,
    },
    {
      title: "UPDATED",
      dataIndex: "updatedAtLabel",
      key: "updatedAtLabel",
      width: 180,
    },
  ];

  if (isLeader) {
    columns.push({
      title: "ACTIONS",
      key: "actions",
      width: 160,
      fixed: "right",
      render: (_, record) => (
        <Space size="small">
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => openEditModal(record)}
            style={GREEN_BUTTON_STYLE}
            className="text-white hover:!border-emerald-600 hover:!bg-emerald-600"
          >
            Edit
          </Button>
          <Button
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => {
              setDeletingTask(record);
              setDeleteModalOpen(true);
            }}
          >
            Delete
          </Button>
        </Space>
      ),
    });
  }

  return (
    <>
      <Card className="rounded-3xl border border-slate-200 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <Input
            placeholder="Search tasks"
            prefix={<SearchOutlined />}
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            style={{ maxWidth: 280 }}
          />

          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-slate-700">Status:</label>
            <Select
              value={statusFilter}
              onChange={setStatusFilter}
              options={STATUS_OPTIONS}
              style={{ width: 170 }}
            />
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-slate-700">
              Priority:
            </label>
            <Select
              value={priorityFilter}
              onChange={setPriorityFilter}
              options={PRIORITY_OPTIONS}
              style={{ width: 170 }}
            />
          </div>

          {isLeader ? (
            <div className="ml-auto flex flex-wrap items-center gap-2">
              <Button
                icon={<SendOutlined />}
                onClick={() => setFromJiraModalOpen(true)}
              >
                From Jira
              </Button>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={openCreateModal}
                style={GREEN_BUTTON_STYLE}
                className="text-white hover:!border-emerald-600 hover:!bg-emerald-600"
              >
                New Task
              </Button>
            </div>
          ) : null}
        </div>

        <Table
          loading={loading}
          columns={columns}
          dataSource={rows}
          rowKey="key"
          pagination={{ pageSize: 8, showSizeChanger: false }}
          locale={{ emptyText: "No data found" }}
          scroll={{ x: 1320 }}
        />
      </Card>

      <TaskFormModal
        open={taskModalOpen}
        task={editingTask}
        saving={saving}
        requirementOptions={requirementOptions}
        issueOptions={issueOptions.map((item) => ({
          value: item.jiraIssueId,
          label: item.label,
        }))}
        memberOptions={memberOptions}
        onCancel={closeTaskModal}
        onSubmit={handleSubmitTask}
      />

      <TaskFromJiraModal
        open={fromJiraModalOpen}
        saving={saving}
        issueOptions={issueOptions.map((item) => ({
          value: item.value,
          label: item.label,
        }))}
        memberOptions={memberOptions}
        onCancel={closeFromJiraModal}
        onSubmit={handleSubmitTaskFromJira}
      />

      <TaskDeleteModal
        open={deleteModalOpen}
        task={deletingTask}
        loading={deleteLoading}
        onCancel={closeDeleteModal}
        onConfirm={handleDelete}
      />
    </>
  );
}
