import { Descriptions, Modal, Spin, Tag, Typography } from "antd";

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

export default function IssueDetailModal({
  open,
  issue,
  loading = false,
  onClose,
}) {
  return (
    <Modal
      title="Issue Details"
      open={open}
      onCancel={onClose}
      footer={null}
      width={900}
      destroyOnClose
    >
      {loading ? (
        <div className="flex min-h-40 items-center justify-center">
          <Spin />
        </div>
      ) : issue ? (
        <Descriptions bordered column={2} size="middle">
          <Descriptions.Item label="Issue Key">
            {renderValue(issue.issueKey)}
          </Descriptions.Item>
          <Descriptions.Item label="Jira Issue ID">
            {renderValue(issue.jiraIssueId)}
          </Descriptions.Item>
          <Descriptions.Item label="Jira ID">
            {renderValue(issue.jiraId)}
          </Descriptions.Item>
          <Descriptions.Item label="Type">
            <Tag
              color={
                ISSUE_TYPE_COLORS[String(issue.issueType).toLowerCase()] ||
                "blue"
              }
            >
              {renderValue(issue.issueType)}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Priority">
            <Tag color={PRIORITY_COLORS[issue.priority] || "default"}>
              {renderValue(issue.priority)}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Status">
            <Tag color={STATUS_COLORS[issue.status] || "default"}>
              {STATUS_LABELS[issue.status] || renderValue(issue.status)}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Assignee">
            {renderValue(issue.assigneeName)}
          </Descriptions.Item>
          <Descriptions.Item label="Assignee Jira ID">
            {renderValue(issue.assigneeJiraId)}
          </Descriptions.Item>
          <Descriptions.Item label="Sprint ID">
            {renderValue(issue.sprintId)}
          </Descriptions.Item>
          <Descriptions.Item label="Sprint Name">
            {renderValue(issue.sprintName)}
          </Descriptions.Item>
          <Descriptions.Item label="Sprint State">
            {renderValue(issue.sprintState)}
          </Descriptions.Item>
          <Descriptions.Item label="Created At">
            {formatDateTime(issue.createdDate || issue.createdAt)}
          </Descriptions.Item>
          <Descriptions.Item label="Updated At">
            {formatDateTime(issue.updatedDate || issue.updatedAt)}
          </Descriptions.Item>
          <Descriptions.Item label="Last Synced">
            {formatDateTime(issue.lastSynced)}
          </Descriptions.Item>
          <Descriptions.Item label="Summary" span={2}>
            <Typography.Paragraph style={{ marginBottom: 0 }}>
              {renderValue(issue.summary)}
            </Typography.Paragraph>
          </Descriptions.Item>
          <Descriptions.Item label="Description" span={2}>
            <Typography.Paragraph
              style={{ marginBottom: 0, whiteSpace: "pre-wrap" }}
            >
              {renderValue(issue.description)}
            </Typography.Paragraph>
          </Descriptions.Item>
        </Descriptions>
      ) : (
        <div className="py-6 text-center text-sm text-slate-500">
          No issue details available
        </div>
      )}
    </Modal>
  );
}
