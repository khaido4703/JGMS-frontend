import { useEffect, useMemo, useState } from "react";
import {
  AppstoreOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  SearchOutlined,
  SendOutlined,
  UnorderedListOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  Empty,
  Input,
  Popover,
  Select,
  Space,
  Table,
  Tag,
} from "antd";
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
  { value: "High", label: "High" },
  { value: "Medium", label: "Medium" },
  { value: "Low", label: "Low" },
];

const STATUS_COLORS = {
  DONE: "success",
  "IN PROGRESS": "processing",
  "TO DO": "default",
};

const PRIORITY_COLORS = {
  High: "red",
  Medium: "orange",
  Low: "blue",
};

const GREEN_BUTTON_STYLE = {
  backgroundColor: "#10b981",
  borderColor: "#10b981",
};

const VIEW_OPTIONS = [
  { value: "list", label: "List", icon: <UnorderedListOutlined /> },
  { value: "board", label: "Board", icon: <AppstoreOutlined /> },
];

const BOARD_COLUMNS = ["TO DO", "IN PROGRESS", "DONE"];

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

const normalizePriority = (priority) => {
  const value = String(priority || "")
    .trim()
    .toLowerCase();

  if (value === "high") return "High";
  if (value === "medium") return "Medium";
  if (value === "low") return "Low";
  return priority || "-";
};

const toStatusPayload = (status) => {
  if (status === "TO DO") return "To Do";
  if (status === "IN PROGRESS") return "In Progress";
  if (status === "DONE") return "Done";
  return status;
};

const parseDateValue = (value) => {
  if (!value) return null;

  if (typeof value === "string") {
    const trimmedValue = value.trim();

    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmedValue)) {
      const [year, month, day] = trimmedValue.split("-").map(Number);
      return new Date(year, month - 1, day);
    }

    const normalizedValue = trimmedValue.replace(/\.(\d{3})\d+/, ".$1");
    const date = new Date(normalizedValue);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const formatDate = (value) => {
  if (!value) return "-";

  const date = parseDateValue(value);
  if (!date) return value;

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatDateTime = (value) => {
  if (!value) return "-";

  const date = parseDateValue(value);
  if (!date) return value;

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
  taskCode: String(task.taskCode || task.taskId || "-"),
  jiraIssueKey: task.jiraIssueKey || "-",
  requirementCode:
    task.requirementCode ||
    (task.requirementId ? `REQ-${task.requirementId}` : "-"),
  title: task.title || "-",
  description: task.description || "",
  assigneeName: task.assignedToName || task.assignedTo || "-",
  status: normalizeStatus(task.status),
  priority: normalizePriority(task.priority),
  dueDateLabel: formatDate(task.dueDate),
  createdAtLabel: formatDateTime(task.createdAt),
  completedAtLabel: formatDateTime(task.completedAt),
  updatedAtLabel: formatDateTime(task.updatedAt),
  sprintLabel: task.sprintName || task.sprintId || "-",
  workHoursLabel:
    task.workHours === 0 || task.workHours ? `${task.workHours}h` : "-",
});

const loadTasksData = async (groupCode, isLeader) => {
  const response = isLeader
    ? await StudentService.getGroupTasks(groupCode)
    : await StudentService.getMyTasks();
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

const renderHoverPopover = (title, content, node, placement = "top") => (
  <Popover
    title={title}
    content={content}
    trigger="hover"
    placement={placement}
  >
    {node}
  </Popover>
);

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
  const [viewMode, setViewMode] = useState("list");
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
      const nextTasks = await loadTasksData(groupCode, isLeader);
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
        const nextTasks = await loadTasksData(groupCode, isLeader);
        setTasks(nextTasks);
      } catch (error) {
        toast.error(error?.response?.data?.message || "Failed to load tasks");
        setTasks([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [groupCode, isLeader]);

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
        String(item.taskCode).toLowerCase().includes(keyword) ||
        String(item.title).toLowerCase().includes(keyword) ||
        String(item.assigneeName).toLowerCase().includes(keyword) ||
        String(item.requirementCode).toLowerCase().includes(keyword);

      return matchesStatus && matchesPriority && matchesSearch;
    });
  }, [priorityFilter, searchValue, statusFilter, tasks]);

  const boardColumns = useMemo(
    () =>
      BOARD_COLUMNS.map((status) => ({
        status,
        label: STATUS_LABELS[status] || status,
        tasks: rows.filter((task) => task.status === status),
      })),
    [rows],
  );

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
      title: "JIRA KEY",
      dataIndex: "jiraIssueKey",
      key: "jiraIssueKey",
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
    {
      title: "COMPLETED",
      dataIndex: "completedAtLabel",
      key: "completedAtLabel",
      width: 180,
    },
  ];

  if (isLeader) {
    columns.push({
      title: "ACTIONS",
      key: "actions",
      width: 100,
      fixed: "right",
      render: (_, record) => (
        <Space size="small">
          {renderHoverPopover(
            "Edit",
            "Update this task",
            <Button
              size="small"
              icon={<EditOutlined />}
              onClick={() => openEditModal(record)}
              className="text-whit"
            />,
            "left",
          )}
          {renderHoverPopover(
            "Delete",
            "Remove this task",
            <Button
              size="small"
              danger
              icon={<DeleteOutlined />}
              onClick={() => {
                setDeletingTask(record);
                setDeleteModalOpen(true);
              }}
            />,
            "left",
          )}
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

          <div className="ml-auto flex flex-wrap items-center gap-2">
            <div className="inline-flex rounded-xl border border-slate-200 bg-slate-50 p-1">
              {VIEW_OPTIONS.map((option) => {
                const active = viewMode === option.value;

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setViewMode(option.value)}
                    className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                      active
                        ? "bg-white text-slate-900 shadow-sm"
                        : "text-slate-500 hover:text-slate-900"
                    }`}
                  >
                    {option.icon}
                    <span>{option.label}</span>
                  </button>
                );
              })}
            </div>

            {isLeader ? (
              <>
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
              </>
            ) : null}
          </div>
        </div>

        {viewMode === "list" ? (
          <Table
            loading={loading}
            columns={columns}
            dataSource={rows}
            rowKey="key"
            pagination={{ pageSize: 8, showSizeChanger: false }}
            locale={{ emptyText: "No data found" }}
            scroll={{ x: 1680 }}
          />
        ) : loading ? (
          <div className="flex min-h-80 items-center justify-center">
            <span className="text-sm text-slate-500">Loading tasks...</span>
          </div>
        ) : rows.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 py-16">
            <Empty description="No tasks found" />
          </div>
        ) : (
          <div className="overflow-x-auto pb-2">
            <div className="grid min-w-[960px] grid-cols-3 gap-4">
              {boardColumns.map((column) => (
                <div
                  key={column.status}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                >
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div>
                      <h3 className="text-base font-semibold text-slate-900">
                        {column.label}
                      </h3>
                      <p className="text-xs text-slate-500">
                        {column.tasks.length} task
                        {column.tasks.length === 1 ? "" : "s"}
                      </p>
                    </div>
                    <Tag color={STATUS_COLORS[column.status] || "default"}>
                      {column.tasks.length}
                    </Tag>
                  </div>

                  <div className="flex max-h-[70vh] flex-col gap-3 overflow-y-auto pr-1">
                    {column.tasks.length === 0 ? (
                      <div className="rounded-xl border border-dashed border-slate-200 bg-white px-4 py-8 text-center text-sm text-slate-400">
                        No tasks
                      </div>
                    ) : (
                      column.tasks.map((task) => (
                        <div
                          key={task.key}
                          className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
                        >
                          <div className="mb-3 flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <div className="mb-1 font-mono text-[11px] font-bold uppercase tracking-wide text-slate-400">
                                {task.taskCode}
                              </div>
                              <h4 className="text-sm font-semibold text-slate-900">
                                {task.title}
                              </h4>
                            </div>
                            <Tag
                              color={
                                PRIORITY_COLORS[task.priority] || "default"
                              }
                            >
                              {task.priority}
                            </Tag>
                          </div>

                          <div className="space-y-2 text-sm text-slate-600">
                            <div className="flex items-center justify-between gap-3">
                              <span className="text-slate-400">Assignee</span>
                              <span className="text-right font-medium text-slate-700">
                                {task.assigneeName}
                              </span>
                            </div>
                            <div className="flex items-center justify-between gap-3">
                              <span className="text-slate-400">
                                Requirement
                              </span>
                              <span className="text-right font-medium text-slate-700">
                                {task.requirementCode}
                              </span>
                            </div>
                            <div className="flex items-center justify-between gap-3">
                              <span className="text-slate-400">Sprint</span>
                              <span className="text-right font-medium text-slate-700">
                                {task.sprintLabel}
                              </span>
                            </div>
                            <div className="flex items-center justify-between gap-3">
                              <span className="text-slate-400">Due date</span>
                              <span className="text-right font-medium text-slate-700">
                                {task.dueDateLabel}
                              </span>
                            </div>
                            <div className="flex items-center justify-between gap-3">
                              <span className="text-slate-400">Work hours</span>
                              <span className="text-right font-medium text-slate-700">
                                {task.workHoursLabel}
                              </span>
                            </div>
                            <div className="flex items-center justify-between gap-3">
                              <span className="text-slate-400">Created</span>
                              <span className="text-right font-medium text-slate-700">
                                {task.createdAtLabel}
                              </span>
                            </div>
                            <div className="flex items-center justify-between gap-3">
                              <span className="text-slate-400">
                                {task.completedAtLabel !== "-"
                                  ? "Completed"
                                  : "Updated"}
                              </span>
                              <span className="text-right font-medium text-slate-700">
                                {task.completedAtLabel !== "-"
                                  ? task.completedAtLabel
                                  : task.updatedAtLabel}
                              </span>
                            </div>
                          </div>

                          {task.description ? (
                            <p className="mt-3 border-t border-slate-100 pt-3 text-sm leading-6 text-slate-500">
                              {task.description}
                            </p>
                          ) : null}

                          {isLeader ? (
                            <div className="mt-4 flex items-center justify-end gap-2 border-t border-slate-100 pt-4">
                              {renderHoverPopover(
                                "Edit",
                                "Update this task",
                                <Button
                                  size="small"
                                  icon={<EditOutlined />}
                                  onClick={() => openEditModal(task)}
                                  className="text-white"
                                />,
                                "top",
                              )}
                              {renderHoverPopover(
                                "Delete",
                                "Remove this task",
                                <Button
                                  size="small"
                                  danger
                                  icon={<DeleteOutlined />}
                                  onClick={() => {
                                    setDeletingTask(task);
                                    setDeleteModalOpen(true);
                                  }}
                                />,
                                "top",
                              )}
                            </div>
                          ) : null}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
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
