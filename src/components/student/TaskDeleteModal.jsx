import { Modal, Typography } from "antd";

const { Paragraph, Text } = Typography;

export default function TaskDeleteModal({
  open,
  task,
  loading = false,
  onCancel,
  onConfirm,
}) {
  return (
    <Modal
      title="Delete Task"
      open={open}
      onCancel={onCancel}
      onOk={onConfirm}
      okText="Delete"
      cancelText="Cancel"
      confirmLoading={loading}
      okButtonProps={{ danger: true }}
      destroyOnClose
    >
      <Paragraph>
        This will delete the task{" "}
        <Text strong>{task?.title || task?.jiraIssueKey || "selected task"}</Text>.
      </Paragraph>
      <Paragraph style={{ marginBottom: 0 }}>
        The linked Jira issue may also be removed if integration is configured.
      </Paragraph>
    </Modal>
  );
}
