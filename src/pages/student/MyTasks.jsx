import { useState } from "react";
import { Table, Tag, Input, Select } from "antd";
import { SearchOutlined } from "@ant-design/icons";

export default function MyTasks() {
  const [tasks] = useState([
    {
      id: "T-101",
      title: "Setup Project Repository",
      priority: "High",
      status: "DONE",
      dueDate: "Oct 20, 2023",
    },
    {
      id: "T-102",
      title: "Design Database Schema",
      priority: "High",
      status: "IN PROGRESS",
      dueDate: "Oct 22, 2023",
    },
    {
      id: "T-103",
      title: "Implement Login API",
      priority: "Medium",
      status: "TO DO",
      dueDate: "Oct 25, 2023",
    },
    {
      id: "T-104",
      title: "Write Unit Tests",
      priority: "Low",
      status: "TO DO",
      dueDate: "Oct 28, 2023",
    },
    {
      id: "T-105",
      title: "Final Code Review",
      priority: "Medium",
      status: "TO DO",
      dueDate: "Nov 02, 2023",
    },
  ]);

  const [priorityFilter, setPriorityFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const statusColors = {
    DONE: "success",
    "IN PROGRESS": "warning",
    "TO DO": "processing",
  };

  const priorityColors = {
    High: "red",
    Medium: "orange",
    Low: "blue",
  };

  const columns = [
    {
      title: "TASK ID",
      dataIndex: "id",
      key: "id",
      width: 120,
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
        <Tag color={priorityColors[priority] || "default"}>{priority}</Tag>
      ),
    },
    {
      title: "STATUS",
      dataIndex: "status",
      key: "status",
      width: 150,
      render: (status) => (
        <Tag color={statusColors[status] || "default"}>{status}</Tag>
      ),
    },
    {
      title: "DUE DATE",
      dataIndex: "dueDate",
      key: "dueDate",
      width: 140,
      render: (date) => (
        <span className="text-sm text-slate-500 font-medium">{date}</span>
      ),
    },
  ];

  const filteredTasks = tasks.filter((task) => {
    const matchesPriority =
      priorityFilter === "All" || task.priority === priorityFilter;
    const matchesStatus =
      statusFilter === "All" || task.status === statusFilter;
    const matchesSearch =
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesPriority && matchesStatus && matchesSearch;
  });

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">My Tasks</h1>
        </div>
        <button className="rounded bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600 transition-colors">
          + New Task
        </button>
      </div>

      <div className="mb-4 flex gap-3 flex-wrap">
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
            style={{ width: 120 }}
            options={[
              { value: "All", label: "All" },
              { value: "High", label: "High" },
              { value: "Medium", label: "Medium" },
              { value: "Low", label: "Low" },
            ]}
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
            style={{ width: 150 }}
            options={[
              { value: "All", label: "All" },
              { value: "TO DO", label: "TO DO" },
              { value: "IN PROGRESS", label: "IN PROGRESS" },
              { value: "DONE", label: "DONE" },
            ]}
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

      <div className="rounded-xl overflow-hidden border border-slate-200 shadow-md bg-white">
        <Table
          columns={columns}
          dataSource={filteredTasks}
          rowKey="id"
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
    </div>
  );
}
