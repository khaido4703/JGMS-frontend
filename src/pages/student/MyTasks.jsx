import { useEffect, useMemo, useState } from "react";
import {
  Button,
  Descriptions,
  Input,
  Modal,
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

const mapTask = (task) => ({
  ...task,
  key: task.taskId,
  id: task.jiraIssueKey || `TASK-${task.taskId}`,
  title: task.title || "-",
  priority: task.priority || "-",
  status: normalizeStatus(task.status),
  dueDateLabel: formatDate(task.dueDate),
});

export default function MyTasks() {
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
      render: (_, record) => (
        <Space wrap size="small">
          <Button
            icon={<EyeOutlined />}
            onClick={() => openTaskDetail(record.taskId)}
          >
            View
          </Button>
          <Select
            value={record.status}
            onChange={(value) => handleUpdateStatus(record, value)}
            options={STATUS_OPTIONS.filter((item) => item.value !== "All")}
            style={{ width: 150 }}
            loading={actionTaskId === record.taskId}
          />
          <Button
            type="primary"
            icon={<CheckCircleOutlined />}
            disabled={record.status === "DONE"}
            loading={actionTaskId === record.taskId}
            onClick={() => handleCompleteTask(record.taskId)}
          >
            Complete
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-4 md:p-2 xl:p-4">
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-slate-700">
            Priority:
          </label>
          <Select
            value={priorityFilter}
            onChange={(value) => {
              setPriorityFilter(value);
              setCurrentPage(1);
            }}
            style={{ width: 140 }}
            options={PRIORITY_OPTIONS}
          />
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-slate-700">Status:</label>
          <Select
            value={statusFilter}
            onChange={(value) => {
              setStatusFilter(value);
              setCurrentPage(1);
            }}
            style={{ width: 160 }}
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
          style={{ maxWidth: 280 }}
        />
      </div>

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
        />
      </div>

      <Modal
        title="Task Details"
        open={detailOpen}
        onCancel={() => {
          setDetailOpen(false);
          setSelectedTask(null);
        }}
        footer={null}
        width={820}
      >
        {detailLoading ? (
          <div className="flex min-h-40 items-center justify-center">
            <Spin />
          </div>
        ) : selectedTask ? (
          <Space direction="vertical" size={16} style={{ width: "100%" }}>
            <Descriptions bordered column={2} size="middle">
              <Descriptions.Item label="Task ID">
                {selectedTask.taskId}
              </Descriptions.Item>
              <Descriptions.Item label="Jira Key">
                {selectedTask.jiraIssueKey || "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Title" span={2}>
                {selectedTask.title}
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                <Tag color={STATUS_COLORS[selectedTask.status] || "default"}>
                  {STATUS_LABELS[selectedTask.status] || selectedTask.status}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Priority">
                <Tag
                  color={PRIORITY_COLORS[selectedTask.priority] || "default"}
                >
                  {selectedTask.priority}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Due Date">
                {formatDate(selectedTask.dueDate)}
              </Descriptions.Item>
              <Descriptions.Item label="Completed At">
                {formatDate(selectedTask.completedAt)}
              </Descriptions.Item>
              <Descriptions.Item label="Assigned To">
                {selectedTask.assignedToName || selectedTask.assignedTo || "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Requirement ID">
                {selectedTask.requirementId ?? "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Jira Issue ID">
                {selectedTask.jiraIssueId ?? "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Jira Status">
                {selectedTask.jiraStatus || "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Created At">
                {formatDate(selectedTask.createdAt)}
              </Descriptions.Item>
              <Descriptions.Item label="Updated At">
                {formatDate(selectedTask.updatedAt)}
              </Descriptions.Item>
              <Descriptions.Item label="Description" span={2}>
                <Typography.Paragraph style={{ marginBottom: 0 }}>
                  {selectedTask.description || "-"}
                </Typography.Paragraph>
              </Descriptions.Item>
            </Descriptions>

            <Space wrap>
              <Select
                value={selectedTask.status}
                onChange={(value) => handleUpdateStatus(selectedTask, value)}
                options={STATUS_OPTIONS.filter((item) => item.value !== "All")}
                style={{ width: 180 }}
                loading={actionTaskId === selectedTask.taskId}
              />
              <Button
                type="primary"
                icon={<CheckCircleOutlined />}
                disabled={selectedTask.status === "DONE"}
                loading={actionTaskId === selectedTask.taskId}
                onClick={() => handleCompleteTask(selectedTask.taskId)}
              >
                Mark Complete
              </Button>
            </Space>
          </Space>
        ) : null}
      </Modal>
    </div>
  );
}
