import { useEffect } from "react";
import { Col, Form, Grid, Input, Modal, Row, Select } from "antd";

const GREEN_BUTTON_STYLE = {
  backgroundColor: "#10b981",
  borderColor: "#10b981",
};

export default function TaskFromJiraModal({
  open,
  saving = false,
  issueOptions = [],
  memberOptions = [],
  onCancel,
  onSubmit,
}) {
  const screens = Grid.useBreakpoint();
  const [form] = Form.useForm();
  const isDesktop = Boolean(screens.md);

  useEffect(() => {
    if (!open) return;
    form.resetFields();
  }, [form, open]);

  const handleOk = async () => {
    const values = await form.validateFields();
    await onSubmit(values);
  };

  return (
    <Modal
      title="Create Task From Jira"
      open={open}
      onCancel={onCancel}
      onOk={handleOk}
      okText="Create"
      confirmLoading={saving}
      destroyOnClose
      width={isDesktop ? 720 : "calc(100vw - 24px)"}
      centered
      styles={{
        body: {
          maxHeight: isDesktop ? "68vh" : "72vh",
          overflowY: "auto",
          paddingRight: 8,
        },
      }}
      okButtonProps={{
        style: GREEN_BUTTON_STYLE,
        className:
          "text-white hover:!border-emerald-600 hover:!bg-emerald-600",
      }}
    >
      <Form form={form} layout="vertical">
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              label="Jira Issue"
              name="issueKey"
              rules={[{ required: true, message: "Jira issue is required" }]}
            >
              <Select
                showSearch
                options={issueOptions}
                placeholder="Select synced Jira issue"
                optionFilterProp="label"
              />
            </Form.Item>
          </Col>

          <Col span={24}>
            <Form.Item label="Title Override" name="titleOverride">
              <Input placeholder="Optional override title" />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item
              label="Assigned To"
              name="assignedTo"
              rules={[{ required: true, message: "Assignee is required" }]}
            >
              <Select
                showSearch
                options={memberOptions}
                placeholder="Select assignee"
                optionFilterProp="label"
              />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item
              label="Due Date"
              name="dueDate"
              rules={[{ required: true, message: "Due date is required" }]}
            >
              <Input type="date" />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item label="Sprint ID" name="sprintId">
              <Input type="number" min={0} placeholder="Optional sprint ID" />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
}
