import { useEffect, useMemo, useState } from "react";
import {
  Button,
  Card,
  Empty,
  Grid,
  Input,
  Modal,
  Pagination,
  Popover,
  Select,
  Space,
  Spin,
  Table,
  Tag,
  Typography,
} from "antd";
import {
  CheckCircleOutlined,
  EyeOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { toast } from "react-toastify";
import { StudentService } from "../../services/student.service";

const STATUS_OPTIONS = [
  { value: "All", label: "All" },
  { value: "TO DO", label: "To Do" },
  { value: "IN PROGRESS", label: "In Progress" },
  { value: "DONE", label: "Done" },
];

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

const STATUS_LABELS = {
  DONE: "Done",
  "IN PROGRESS": "In Progress",
  "TO DO": "To Do",
};

const PRIORITY_COLORS = {
  High: "red",
  Medium: "orange",
  Low: "blue",
};

const TASK_STATUS_OPTIONS = STATUS_OPTIONS.filter(
  (item) => item.value !== "All",
);

const STATUS_PAYLOAD_MAP = {
  "TO DO": "To Do",
  "IN PROGRESS": "In Progress",
  DONE: "Done",
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

const normalizePriority = (priority) => {
  const value = String(priority || "")
    .trim()
    .toLowerCase();

  if (value === "high") return "High";
  if (value === "medium") return "Medium";
  if (value === "low") return "Low";
  return priority || "-";
};

const parseDateValue = (value) => {
  if (!value) return null;

  if (typeof value === "string") {
    const trimmedValue = value.trim();

    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmedValue)) {
      const [year, month, day] = trimmedValue.split("-").map(Number);
      return new Date(year, month - 1, day);
    }

    const normalizedValue = trimmedValue.replace(
      /\.(\d{3})\d+/,
      ".$1",
    );
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

const mapTask = (task) => ({
  ...task,
  key: task.taskId,
  id: task.jiraIssueKey || `TASK-${task.taskId}`,
  title: task.title || "-",
  priority: normalizePriority(task.priority),
  status: normalizeStatus(task.status),
  dueDateLabel: formatDate(task.dueDate),
});

export default function MyTasks() {
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.md;
  const [tasks, setTasks] = useState([]);
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [actionTaskId, setActionTaskId] = useState(null);
  const itemsPerPage = 5;

  const loadTasks = async () => {
    try {
      setLoading(true);
      const response = await StudentService.getMyTasks();
      const data = response?.data ?? [];
      setTasks(Array.isArray(data) ? data.map(mapTask) : []);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to load tasks");
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const openTaskDetail = async (taskId) => {
    try {
      setDetailOpen(true);
      setDetailLoading(true);
      const response = await StudentService.getMyTaskById(taskId);
      const data = response?.data ?? response;
      setSelectedTask(mapTask(data));
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to load task details",
      );
      setDetailOpen(false);
      setSelectedTask(null);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleUpdateStatus = async (task, nextStatus) => {
    if (!nextStatus || nextStatus === task.status) return;

    try {
      setActionTaskId(task.taskId);
      await StudentService.updateMyTaskStatus(task.taskId, {
        status: STATUS_PAYLOAD_MAP[nextStatus] || nextStatus,
        notes: task.notes || "",
        workHours: task.workHours || 0,
      });
      toast.success("Task status updated successfully");
      await loadTasks();

      if (selectedTask?.taskId === task.taskId) {
        await openTaskDetail(task.taskId);
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to update task status",
      );
    } finally {
      setActionTaskId(null);
    }
  };

  const handleCompleteTask = async (taskId) => {
    try {
      setActionTaskId(taskId);
      await StudentService.completeMyTask(taskId);
      toast.success("Task marked as completed");
      await loadTasks();

      if (selectedTask?.taskId === taskId) {
        await openTaskDetail(taskId);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to complete task");
    } finally {
      setActionTaskId(null);
    }
  };

  const filteredTasks = useMemo(
    () =>
      tasks.filter((task) => {
        const matchesPriority =
          priorityFilter === "All" || task.priority === priorityFilter;
        const matchesStatus =
          statusFilter === "All" || task.status === statusFilter;
        const keyword = searchTerm.trim().toLowerCase();
        const matchesSearch =
          !keyword ||
          task.title.toLowerCase().includes(keyword) ||
          task.id.toLowerCase().includes(keyword);
        return matchesPriority && matchesStatus && matchesSearch;
      }),
    [tasks, priorityFilter, statusFilter, searchTerm],
  );

  const paginatedTasks = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredTasks.slice(startIndex, startIndex + itemsPerPage);
  }, [currentPage, filteredTasks, itemsPerPage]);

  useEffect(() => {
    const totalPages = Math.max(
      1,
      Math.ceil(filteredTasks.length / itemsPerPage),
    );

    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, filteredTasks.length, itemsPerPage]);

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

  const renderTaskActions = (task, compact = false) => {
    const popoverPlacement = compact ? "top" : "left";
    const controls = (
      <>
        {renderHoverPopover(
          "View",
          "Open task details",
          <Button
            icon={<EyeOutlined />}
            onClick={() => openTaskDetail(task.taskId)}
            style={compact ? { width: "100%" } : undefined}
          />,
          popoverPlacement,
        )}
        {renderHoverPopover(
          "Complete",
          task.status === "DONE"
            ? "This task is already completed"
            : "Mark this task as completed",
          <Button
            type="primary"
            icon={<CheckCircleOutlined />}
            disabled={task.status === "DONE"}
            loading={actionTaskId === task.taskId}
            onClick={() => handleCompleteTask(task.taskId)}
            style={compact ? { width: "100%" } : undefined}
          />,
          popoverPlacement,
        )}
        <Select
          value={task.status}
          onChange={(value) => handleUpdateStatus(task, value)}
          options={TASK_STATUS_OPTIONS}
          style={{ width: compact ? "100%" : 150 }}
          loading={actionTaskId === task.taskId}
        />
      </>
    );

    if (!compact) {
      return (
        <Space wrap size="small">
          {controls}
        </Space>
      );
    }

    return <div className="flex flex-col gap-2">{controls}</div>;
  };

  const renderDetailItem = (label, value) => (
    <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
      <div className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
        {label}
      </div>
      <div className="text-sm font-medium text-slate-700">{value}</div>
    </div>
  );

  const columns = [
    {
      title: "TASK ID",
      dataIndex: "id",
      key: "id",
      width: 140,
      render: (id) => (
        <span className="font-mono text-xs font-bold text-slate-400">{id}</span>
      ),
    },
    {
      title: "TITLE",
      dataIndex: "title",
      key: "title",
      render: (title) => (
        <span className="text-sm font-semibold text-slate-900">{title}</span>
      ),
    },
    {
      title: "PRIORITY",
      dataIndex: "priority",
      key: "priority",
      width: 120,
      render: (priority) => (
        <Tag color={PRIORITY_COLORS[priority] || "default"}>{priority}</Tag>
      ),
    },
    {
      title: "STATUS",
      dataIndex: "status",
      key: "status",
      width: 150,
      render: (status) => (
        <Tag color={STATUS_COLORS[status] || "default"}>
          {STATUS_LABELS[status] || status}
        </Tag>
      ),
    },
    {
      title: "DUE DATE",
      dataIndex: "dueDateLabel",
      key: "dueDate",
      width: 140,
      render: (date) => (
        <span className="text-sm font-medium text-slate-500">{date}</span>
      ),
    },
    {
      title: "ACTIONS",
      key: "actions",
      width: 300,
      render: (_, record) => renderTaskActions(record),
    },
  ];

  return (
    <div className="p-4 md:p-2 xl:p-4">
      <div className="mb-4 flex flex-wrap items-stretch gap-3">
        <div className="flex w-full flex-col gap-1 sm:w-auto sm:flex-row sm:items-center sm:gap-2">
          <label className="text-sm font-medium text-slate-700">
            Priority:
          </label>
          <Select
            value={priorityFilter}
            onChange={(value) => {
              setPriorityFilter(value);
              setCurrentPage(1);
            }}
            style={{ width: isMobile ? "100%" : 140 }}
            options={PRIORITY_OPTIONS}
          />
        </div>

        <div className="flex w-full flex-col gap-1 sm:w-auto sm:flex-row sm:items-center sm:gap-2">
          <label className="text-sm font-medium text-slate-700">Status:</label>
          <Select
            value={statusFilter}
            onChange={(value) => {
              setStatusFilter(value);
              setCurrentPage(1);
            }}
            style={{ width: isMobile ? "100%" : 160 }}
            options={STATUS_OPTIONS}
          />
        </div>

        <Input
          placeholder="Search tasks..."
          prefix={<SearchOutlined />}
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          style={{ width: isMobile ? "100%" : 280 }}
        />
      </div>

      {isMobile ? (
        <div className="space-y-3">
          {loading ? (
            <div className="flex min-h-52 items-center justify-center rounded-xl border border-slate-200 bg-white shadow-md">
              <Spin />
            </div>
          ) : paginatedTasks.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-white py-12 shadow-md">
              <Empty description="No tasks found" />
            </div>
          ) : (
            <>
              {paginatedTasks.map((task) => (
                <Card
                  key={task.taskId}
                  className="rounded-2xl border border-slate-200 shadow-sm"
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="font-mono text-xs font-bold text-slate-400">
                          {task.id}
                        </div>
                        <h3 className="mt-1 text-base font-semibold text-slate-900">
                          {task.title}
                        </h3>
                      </div>
                      <Tag color={PRIORITY_COLORS[task.priority] || "default"}>
                        {task.priority}
                      </Tag>
                    </div>

                    <div className="grid grid-cols-1 gap-3 rounded-xl bg-slate-50 p-3 text-sm sm:grid-cols-2">
                      <div>
                        <div className="text-slate-400">Status</div>
                        <div className="mt-1">
                          <Tag color={STATUS_COLORS[task.status] || "default"}>
                            {STATUS_LABELS[task.status] || task.status}
                          </Tag>
                        </div>
                      </div>
                      <div>
                        <div className="text-slate-400">Due date</div>
                        <div className="mt-1 font-medium text-slate-700">
                          {task.dueDateLabel}
                        </div>
                      </div>
                    </div>

                    {renderTaskActions(task, true)}
                  </div>
                </Card>
              ))}

              <div className="flex justify-center rounded-xl border border-slate-200 bg-white px-3 py-4 shadow-sm">
                <Pagination
                  current={currentPage}
                  pageSize={itemsPerPage}
                  total={filteredTasks.length}
                  onChange={(page) => setCurrentPage(page)}
                  showSizeChanger={false}
                  size="small"
                />
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-md">
          <Table
            loading={loading}
            columns={columns}
            dataSource={filteredTasks}
            rowKey="taskId"
            pagination={{
              current: currentPage,
              pageSize: itemsPerPage,
              total: filteredTasks.length,
              onChange: (page) => setCurrentPage(page),
              showSizeChanger: false,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} tasks`,
              style: { padding: "12px 16px" },
            }}
            bordered={false}
            size="middle"
            locale={{
              emptyText: loading ? <Spin size="small" /> : "No tasks found",
            }}
            rowClassName={(_, index) =>
              index % 2 === 0 ? "bg-white" : "bg-slate-50"
            }
            components={{
              header: {
                cell: ({ children, ...props }) => (
                  <th
                    {...props}
                    style={{
                      ...props.style,
                      background: "#f1f5f9",
                      color: "#475569",
                      fontWeight: 700,
                      fontSize: "0.75rem",
                      letterSpacing: "0.05em",
                      textTransform: "uppercase",
                      borderBottom: "2px solid #e2e8f0",
                    }}
                  >
                    {children}
                  </th>
                ),
              },
            }}
            scroll={{ x: 1060 }}
          />
        </div>
      )}

      <Modal
        title="Task Details"
        open={detailOpen}
        onCancel={() => {
          setDetailOpen(false);
          setSelectedTask(null);
        }}
        footer={null}
        width={isMobile ? "calc(100vw - 24px)" : 820}
        centered
        styles={{
          body: {
            maxHeight: isMobile ? "74vh" : "70vh",
            overflowY: "auto",
            paddingRight: 8,
          },
        }}
      >
        {detailLoading ? (
          <div className="flex min-h-40 items-center justify-center">
            <Spin />
          </div>
        ) : selectedTask ? (
          <Space direction="vertical" size={16} style={{ width: "100%" }}>
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white">
              <div className="border-b border-slate-200 bg-gradient-to-r from-slate-50 via-white to-slate-50 px-5 py-4">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="min-w-0">
                    <div className="mb-2 font-mono text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                      {selectedTask.id}
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900">
                      {selectedTask.title}
                    </h3>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <Tag
                      color={STATUS_COLORS[selectedTask.status] || "default"}
                      style={{ marginInlineEnd: 0 }}
                    >
                      {STATUS_LABELS[selectedTask.status] ||
                        selectedTask.status}
                    </Tag>
                    <Tag
                      color={
                        PRIORITY_COLORS[selectedTask.priority] || "default"
                      }
                      style={{ marginInlineEnd: 0 }}
                    >
                      {selectedTask.priority}
                    </Tag>
                  </div>
                </div>
              </div>

              <div className="space-y-5 p-5">
                <div>
                  <div className="mb-3 text-sm font-semibold text-slate-900">
                    Overview
                  </div>
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    {renderDetailItem("Task ID", selectedTask.taskId)}
                    {renderDetailItem(
                      "Jira Key",
                      selectedTask.jiraIssueKey || "-",
                    )}
                    {renderDetailItem(
                      "Assigned To",
                      selectedTask.assignedToName ||
                        selectedTask.assignedTo ||
                        "-",
                    )}
                    {renderDetailItem(
                      "Requirement ID",
                      selectedTask.requirementId ?? "-",
                    )}
                    {renderDetailItem(
                      "Due Date",
                      formatDate(selectedTask.dueDate),
                    )}
                    {renderDetailItem(
                      "Completed At",
                      formatDate(selectedTask.completedAt),
                    )}
                  </div>
                </div>

                <div>
                  <div className="mb-3 text-sm font-semibold text-slate-900">
                    Jira & Timeline
                  </div>
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    {renderDetailItem(
                      "Jira Issue ID",
                      selectedTask.jiraIssueId ?? "-",
                    )}
                    {renderDetailItem(
                      "Jira Status",
                      selectedTask.jiraStatus || "-",
                    )}
                    {renderDetailItem(
                      "Created At",
                      formatDate(selectedTask.createdAt),
                    )}
                    {renderDetailItem(
                      "Updated At",
                      formatDate(selectedTask.updatedAt),
                    )}
                  </div>
                </div>

                <div>
                  <div className="mb-3 text-sm font-semibold text-slate-900">
                    Description
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
                    <Typography.Paragraph
                      style={{ marginBottom: 0, whiteSpace: "pre-wrap" }}
                    >
                      {selectedTask.description || "-"}
                    </Typography.Paragraph>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
              <div className="mb-3 text-sm font-semibold text-slate-900">
                Quick Actions
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Select
                  value={selectedTask.status}
                  onChange={(value) => handleUpdateStatus(selectedTask, value)}
                  options={TASK_STATUS_OPTIONS}
                  style={{ width: isMobile ? "100%" : 180 }}
                  loading={actionTaskId === selectedTask.taskId}
                />
                <Button
                  type="primary"
                  icon={<CheckCircleOutlined />}
                  disabled={selectedTask.status === "DONE"}
                  loading={actionTaskId === selectedTask.taskId}
                  onClick={() => handleCompleteTask(selectedTask.taskId)}
                  style={isMobile ? { width: "100%" } : undefined}
                >
                  Mark Complete
                </Button>
              </div>
            </div>
          </Space>
        ) : null}
      </Modal>
    </div>
  );
}
