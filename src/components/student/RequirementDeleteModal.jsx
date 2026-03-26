import { Modal, Typography } from "antd";

const { Paragraph, Text } = Typography;

export default function RequirementDeleteModal({
  open,
  requirement,
  loading = false,
  onCancel,
  onConfirm,
}) {
  return (
    <Modal
      title="Delete Requirement"
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
        This will delete the requirement
        {requirement?.requirementCode ? (
          <>
            {" "}
            <Text strong>{requirement.requirementCode}</Text>
          </>
        ) : null}
        {" "}and remove the linked Jira issue.
      </Paragraph>
      <Paragraph style={{ marginBottom: 0 }}>
        This action cannot be undone.
      </Paragraph>
    </Modal>
  );
}
