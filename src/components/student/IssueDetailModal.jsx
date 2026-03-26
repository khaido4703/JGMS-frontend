import { Grid, Modal, Spin, Space, Tag, Typography } from "antd";

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

const normalizePriority = (priority) => {
  const value = String(priority || "")
    .trim()
    .toLowerCase();

  if (value === "highest") return "Highest";
  if (value === "high") return "High";
  if (value === "medium") return "Medium";
  if (value === "low") return "Low";
  if (value === "lowest") return "Lowest";
  return priority || "-";
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

const formatIssueType = (issueType) => {
  const value = String(issueType || "").trim();
  if (!value) return "-";
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
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

const renderValue = (value) => {
  if (value === 0) return "0";
  return value || "-";
};

const renderDetailItem = (label, value) => (
  <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
    <div className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
      {label}
    </div>
    <div className="text-sm font-medium text-slate-700">{value}</div>
  </div>
);

export default function IssueDetailModal({
  open,
  issue,
  loading = false,
  onClose,
}) {
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.md;
  const normalizedStatus = normalizeStatus(issue?.status);
  const normalizedPriority = normalizePriority(issue?.priority);
  const issueTypeLabel = formatIssueType(issue?.issueType);

  return (
    <Modal
      title="Issue Details"
      open={open}
      onCancel={onClose}
      footer={null}
      width={isMobile ? "calc(100vw - 24px)" : 920}
      destroyOnClose
      centered
      styles={{
        body: {
          maxHeight: isMobile ? "74vh" : "70vh",
          overflowY: "auto",
          paddingRight: 8,
        },
      }}
    >
      {loading ? (
        <div className="flex min-h-40 items-center justify-center">
          <Spin />
        </div>
      ) : issue ? (
        <Space direction="vertical" size={16} style={{ width: "100%" }}>
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white">
            <div className="border-b border-slate-200 bg-gradient-to-r from-slate-50 via-white to-slate-50 px-5 py-4">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="min-w-0">
                  <div className="mb-2 font-mono text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                    {renderValue(issue.issueKey)}
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900">
                    {renderValue(issue.summary)}
                  </h3>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Tag
                    color={
                      ISSUE_TYPE_COLORS[String(issueTypeLabel).toLowerCase()] ||
                      "blue"
                    }
                    style={{ marginInlineEnd: 0 }}
                  >
                    {issueTypeLabel}
                  </Tag>
                  <Tag
                    color={PRIORITY_COLORS[normalizedPriority] || "default"}
                    style={{ marginInlineEnd: 0 }}
                  >
                    {renderValue(normalizedPriority)}
                  </Tag>
                  <Tag
                    color={STATUS_COLORS[normalizedStatus] || "default"}
                    style={{ marginInlineEnd: 0 }}
                  >
                    {STATUS_LABELS[normalizedStatus] ||
                      renderValue(normalizedStatus)}
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
                  {renderDetailItem("Issue Key", renderValue(issue.issueKey))}
                  {renderDetailItem(
                    "Jira Issue ID",
                    renderValue(issue.jiraIssueId),
                  )}
                  {renderDetailItem("Jira ID", renderValue(issue.jiraId))}
                  {renderDetailItem("Type", issueTypeLabel)}
                  {renderDetailItem(
                    "Priority",
                    renderValue(normalizedPriority),
                  )}
                  {renderDetailItem(
                    "Status",
                    STATUS_LABELS[normalizedStatus] ||
                      renderValue(normalizedStatus),
                  )}
                </div>
              </div>

              <div>
                <div className="mb-3 text-sm font-semibold text-slate-900">
                  People & Sprint
                </div>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  {renderDetailItem(
                    "Assignee",
                    renderValue(issue.assigneeName),
                  )}
                  {renderDetailItem(
                    "Assignee Jira ID",
                    renderValue(issue.assigneeJiraId),
                  )}
                  {renderDetailItem("Sprint ID", renderValue(issue.sprintId))}
                  {renderDetailItem(
                    "Sprint Name",
                    renderValue(issue.sprintName),
                  )}
                  {renderDetailItem(
                    "Sprint State",
                    renderValue(issue.sprintState),
                  )}
                </div>
              </div>

              <div>
                <div className="mb-3 text-sm font-semibold text-slate-900">
                  Timeline
                </div>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  {renderDetailItem(
                    "Created At",
                    formatDateTime(issue.createdDate || issue.createdAt),
                  )}
                  {renderDetailItem(
                    "Updated At",
                    formatDateTime(issue.updatedDate || issue.updatedAt),
                  )}
                  {renderDetailItem(
                    "Last Synced",
                    formatDateTime(issue.lastSynced),
                  )}
                </div>
              </div>

              <div>
                <div className="mb-3 text-sm font-semibold text-slate-900">
                  Description
                </div>
                <div className="space-y-3">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
                    <div className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                      Summary
                    </div>
                    <Typography.Paragraph
                      style={{ marginBottom: 0, whiteSpace: "pre-wrap" }}
                    >
                      {renderValue(issue.summary)}
                    </Typography.Paragraph>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
                    <div className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                      Details
                    </div>
                    <Typography.Paragraph
                      style={{ marginBottom: 0, whiteSpace: "pre-wrap" }}
                    >
                      {renderValue(issue.description)}
                    </Typography.Paragraph>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Space>
      ) : (
        <div className="py-6 text-center text-sm text-slate-500">
          No issue details available
        </div>
      )}
    </Modal>
  );
}
