import { useEffect, useMemo, useState } from "react";
import {
  DeleteOutlined,
  DownloadOutlined,
  EditOutlined,
  PlusOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { Button, Card, Input, Select, Space, Table, Tag, Tooltip } from "antd";
import { toast } from "react-toastify";
import { StudentService } from "../../services/student.service";
import RequirementDeleteModal from "./RequirementDeleteModal";
import RequirementFormModal from "./RequirementFormModal";

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

const ISSUE_TYPE_COLORS = {
  story: "blue",
  task: "geekblue",
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

const mapRequirement = (item) => ({
  ...item,
  key: item.requirementId,
  requirementCode: item.requirementCode || "-",
  title: item.title || "-",
  description: item.description || "",
  requirementType: item.requirementType || item.requirementtype || "-",
  issueType: item.issueType || "-",
  priority: item.priority || "-",
  jiraIssueId: item.jiraIssueId ?? 0,
  jiraStatus: normalizeStatus(item.jiraStatus),
  createdByName: item.createdByName || "-",
  updatedAtLabel: formatDateTime(item.updatedAt),
});

const loadRequirementsData = async (groupCode) => {
  const response = await StudentService.getGroupRequirements(groupCode);
  const data = response?.data ?? [];
  return Array.isArray(data) ? data.map(mapRequirement) : [];
};

export default function RequirementsBoard({ groupCode, isLeader = false }) {
  const [requirements, setRequirements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [editingRequirement, setEditingRequirement] = useState(null);
  const [deletingRequirement, setDeletingRequirement] = useState(null);

  const loadRequirements = async () => {
    if (!groupCode) return;

    try {
      setLoading(true);
      const nextRequirements = await loadRequirementsData(groupCode);
      setRequirements(nextRequirements);
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to load requirements",
      );
      setRequirements([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchRequirements = async () => {
      if (!groupCode) return;

      try {
        setLoading(true);
        const nextRequirements = await loadRequirementsData(groupCode);
        setRequirements(nextRequirements);
      } catch (error) {
        toast.error(
          error?.response?.data?.message || "Failed to load requirements",
        );
        setRequirements([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRequirements();
  }, [groupCode]);

  const rows = useMemo(() => {
    const keyword = searchValue.trim().toLowerCase();

    return requirements.filter((item) => {
      const matchesStatus =
        statusFilter === "All" || item.jiraStatus === statusFilter;
      const matchesSearch =
        !keyword ||
        item.requirementCode.toLowerCase().includes(keyword) ||
        item.title.toLowerCase().includes(keyword) ||
        item.createdByName.toLowerCase().includes(keyword);

      return matchesStatus && matchesSearch;
    });
  }, [requirements, searchValue, statusFilter]);

  const openCreateModal = () => {
    if (!isLeader) {
      toast.error("Only group leaders can create requirements");
      return;
    }

    setEditingRequirement(null);
    setModalOpen(true);
  };

  const openEditModal = (requirement) => {
    if (!isLeader) {
      toast.error("Only group leaders can edit requirements");
      return;
    }

    setEditingRequirement(requirement);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingRequirement(null);
  };

  const handleSubmit = async (values) => {
    if (!isLeader) {
      toast.error("Only group leaders can manage requirements");
      return;
    }

    try {
      setSaving(true);

      if (editingRequirement) {
        await StudentService.updateGroupRequirement(
          groupCode,
          editingRequirement.requirementId,
          {
            title: values.title,
            description: values.description,
            requirementType: values.requirementType,
            priority: values.priority,
            jiraIssueId: Number(values.jiraIssueId || 0),
          },
        );
        toast.success("Requirement updated successfully");
      } else {
        await StudentService.createGroupRequirement(groupCode, {
          requirementCode: values.requirementCode,
          title: values.title,
          description: values.description,
          requirementType: values.requirementType,
          issueType: values.issueType,
          priority: values.priority,
          jiraIssueId: Number(values.jiraIssueId || 0),
        });
        toast.success("Requirement created successfully");
      }

      closeModal();
      await loadRequirements();
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to save requirement",
      );
    } finally {
      setSaving(false);
    }
  };

  const openDeleteModal = (requirement) => {
    if (!isLeader) {
      toast.error("Only group leaders can delete requirements");
      return;
    }

    setDeletingRequirement(requirement);
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
    setDeletingRequirement(null);
  };

  const handleDelete = async () => {
    if (!isLeader) {
      toast.error("Only group leaders can delete requirements");
      return;
    }

    try {
      setDeleteLoading(true);
      await StudentService.deleteGroupRequirement(
        groupCode,
        deletingRequirement?.requirementId,
      );
      toast.success("Requirement deleted successfully");
      closeDeleteModal();
      await loadRequirements();
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to delete requirement",
      );
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleImportFromJira = async () => {
    if (!isLeader) {
      toast.error("Only group leaders can import requirements from Jira");
      return;
    }

    if (!groupCode) return;

    try {
      setImportLoading(true);
      const response =
        await StudentService.importGroupRequirementsFromJira(groupCode);
      toast.success(
        response?.data?.message ||
          response?.message ||
          "Requirements imported from Jira successfully",
      );
      await loadRequirements();
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          "Failed to import requirements from Jira",
      );
    } finally {
      setImportLoading(false);
    }
  };

  const columns = [
    {
      title: "REQ CODE",
      dataIndex: "requirementCode",
      key: "requirementCode",
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
      width: 320,
      render: (value) => (
        <span className="text-sm font-semibold text-slate-900">{value}</span>
      ),
    },
    {
      title: "TYPE",
      dataIndex: "requirementType",
      key: "requirementType",
      width: 150,
    },
    {
      title: "ISSUE TYPE",
      dataIndex: "issueType",
      key: "issueType",
      width: 130,
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
      dataIndex: "jiraStatus",
      key: "jiraStatus",
      width: 150,
      render: (value) => (
        <Tag color={STATUS_COLORS[value] || "default"}>
          {STATUS_LABELS[value] || value}
        </Tag>
      ),
    },
    {
      title: "CREATED BY",
      dataIndex: "createdByName",
      key: "createdByName",
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
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => openEditModal(record)}
            className="text-white"
          />
          <Button
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => openDeleteModal(record)}
          />
        </Space>
      ),
    });
  }

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

          {isLeader ? (
            <div className="ml-auto flex flex-wrap items-center gap-2">
              <Tooltip title="Bulk-import synced Jira issues into requirements. Sync issues first to get the latest data.">
                <Button
                  icon={<DownloadOutlined />}
                  loading={importLoading}
                  onClick={handleImportFromJira}
                >
                  Import From Jira
                </Button>
              </Tooltip>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={openCreateModal}
                style={GREEN_BUTTON_STYLE}
                className="text-white hover:!border-emerald-600 hover:!bg-emerald-600"
              >
                New Requirement
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
          scroll={{ x: 1120 }}
        />
      </Card>

      <RequirementFormModal
        open={modalOpen}
        groupCode={groupCode}
        requirement={editingRequirement}
        saving={saving}
        onCancel={closeModal}
        onSubmit={handleSubmit}
      />

      <RequirementDeleteModal
        open={deleteModalOpen}
        requirement={deletingRequirement}
        loading={deleteLoading}
        onCancel={closeDeleteModal}
        onConfirm={handleDelete}
      />
    </>
  );
}
