import { useEffect } from "react";
import { Col, Form, Grid, Input, Modal, Row, Select } from "antd";

const { TextArea } = Input;

const STATUS_OPTIONS = [
  { value: "TO DO", label: "To Do" },
  { value: "IN PROGRESS", label: "In Progress" },
  { value: "DONE", label: "Done" },
];

const PRIORITY_OPTIONS = [
  { value: "Highest", label: "Highest" },
  { value: "High", label: "High" },
  { value: "Medium", label: "Medium" },
  { value: "Low", label: "Low" },
  { value: "Lowest", label: "Lowest" },
];

const GREEN_BUTTON_STYLE = {
  backgroundColor: "#10b981",
  borderColor: "#10b981",
};

const getInitialFormValues = (task) => ({
  title: task?.title,
  description: task?.description,
  requirementId: task?.requirementId,
  jiraIssueId: task?.jiraIssueId || undefined,
  assignedTo: task?.assignedTo,
  status: task?.status || "TO DO",
  priority: task?.priority || "Medium",
  dueDate: task?.dueDate ? String(task.dueDate).slice(0, 10) : undefined,
  sprintId: task?.sprintId || undefined,
  completedAt: task?.completedAt
    ? new Date(task.completedAt).toISOString().slice(0, 16)
    : undefined,
});

export default function TaskFormModal({
  open,
  task,
  saving = false,
  requirementOptions = [],
  issueOptions = [],
  memberOptions = [],
  onCancel,
  onSubmit,
}) {
  const screens = Grid.useBreakpoint();
  const [form] = Form.useForm();
  const isEditing = Boolean(task);
  const isDesktop = Boolean(screens.md);

  useEffect(() => {
    if (!open) return;
    form.resetFields();
    form.setFieldsValue(getInitialFormValues(task));
  }, [form, open, task]);

  const handleOk = async () => {
    const values = await form.validateFields();
    await onSubmit(values);
  };

  return (
    <Modal
      title={isEditing ? "Edit Task" : "Create Task"}
      open={open}
      onCancel={onCancel}
      onOk={handleOk}
      okText={isEditing ? "Update" : "Create"}
      confirmLoading={saving}
      destroyOnClose
      width={isDesktop ? 860 : "calc(100vw - 24px)"}
      centered
      styles={{
        body: {
          maxHeight: isDesktop ? "70vh" : "74vh",
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
          <Col xs={24} md={12}>
            <Form.Item
              label="Title"
              name="title"
              rules={[{ required: true, message: "Title is required" }]}
            >
              <Input placeholder="Enter task title" />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item
              label="Requirement"
              name="requirementId"
              rules={[{ required: true, message: "Requirement is required" }]}
            >
              <Select
                showSearch
                options={requirementOptions}
                placeholder="Select requirement"
                optionFilterProp="label"
              />
            </Form.Item>
          </Col>

          <Col span={24}>
            <Form.Item
              label="Description"
              name="description"
              rules={[{ required: true, message: "Description is required" }]}
            >
              <TextArea
                rows={isDesktop ? 3 : 4}
                autoSize={{ minRows: isDesktop ? 3 : 4, maxRows: 6 }}
                placeholder="Enter task description"
              />
            </Form.Item>
          </Col>

          {!isEditing ? (
            <Col xs={24} md={12}>
              <Form.Item label="Jira Issue" name="jiraIssueId">
                <Select
                  allowClear
                  showSearch
                  options={issueOptions}
                  placeholder="Optional linked Jira issue"
                  optionFilterProp="label"
                />
              </Form.Item>
            </Col>
          ) : null}

          {!isEditing ? (
            <Col xs={24} md={12}>
              <Form.Item label="Sprint ID" name="sprintId">
                <Input type="number" min={0} placeholder="Optional sprint ID" />
              </Form.Item>
            </Col>
          ) : null}

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
              label="Status"
              name="status"
              rules={[{ required: true, message: "Status is required" }]}
            >
              <Select options={STATUS_OPTIONS} placeholder="Select status" />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item
              label="Priority"
              name="priority"
              rules={[{ required: true, message: "Priority is required" }]}
            >
              <Select options={PRIORITY_OPTIONS} placeholder="Select priority" />
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

          {isEditing ? (
            <Col xs={24} md={12}>
              <Form.Item label="Completed At" name="completedAt">
                <Input type="datetime-local" />
              </Form.Item>
            </Col>
          ) : null}
        </Row>
      </Form>
    </Modal>
  );
}
