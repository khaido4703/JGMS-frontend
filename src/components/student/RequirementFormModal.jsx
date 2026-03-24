import { useEffect, useState } from "react";
import { Col, Form, Grid, Input, Modal, Row, Select } from "antd";
import { toast } from "react-toastify";
import { StudentService } from "../../services/student.service";

const { TextArea } = Input;

const PRIORITY_OPTIONS = [
  { value: "High", label: "High" },
  { value: "Medium", label: "Medium" },
  { value: "Low", label: "Low" },
];

const REQUIREMENT_TYPE_OPTIONS = [
  { value: "Functional", label: "Functional" },
  { value: "Non-functional", label: "Non-functional" },
];

const ISSUE_TYPE_OPTIONS = [
  { value: "Story", label: "Story" },
  { value: "Task", label: "Task" },
  { value: "Epic", label: "Epic" },
];

const GREEN_BUTTON_STYLE = {
  backgroundColor: "#10b981",
  borderColor: "#10b981",
};

const getInitialFormValues = (requirement) => ({
  requirementCode: requirement?.requirementCode,
  title: requirement?.title,
  description: requirement?.description,
  requirementType: requirement?.requirementType || "Functional",
  issueType: requirement?.issueType,
  priority: requirement?.priority || "Medium",
  jiraIssueId: requirement?.jiraIssueId ?? 0,
});

const mapIssueOption = (issue) => ({
  value: Number(issue.jiraIssueId),
  label: `${issue.issueKey || `Issue #${issue.jiraIssueId}`} - ${issue.summary || "No summary"}`,
});

export default function RequirementFormModal({
  open,
  groupCode,
  requirement,
  saving = false,
  onCancel,
  onSubmit,
}) {
  const screens = Grid.useBreakpoint();
  const [form] = Form.useForm();
  const [issueOptions, setIssueOptions] = useState([]);
  const [issuesLoading, setIssuesLoading] = useState(false);
  const isEditing = Boolean(requirement);
  const isDesktop = Boolean(screens.md);

  useEffect(() => {
    if (!open) return;
    form.resetFields();
    form.setFieldsValue(getInitialFormValues(requirement));
  }, [form, open, requirement]);

  useEffect(() => {
    const loadIssues = async () => {
      if (!open || !groupCode) {
        setIssueOptions([]);
        return;
      }

      try {
        setIssuesLoading(true);
        const response = await StudentService.getGroupIssues(groupCode);
        const data = response?.data ?? [];
        const options = Array.isArray(data)
          ? data
              .filter((item) => item?.jiraIssueId)
              .map(mapIssueOption)
          : [];

        const currentIssueId = Number(requirement?.jiraIssueId || 0);
        const hasCurrentOption = options.some(
          (option) => option.value === currentIssueId,
        );

        if (currentIssueId > 0 && !hasCurrentOption) {
          options.push({
            value: currentIssueId,
            label: requirement?.issueKey
              ? `${requirement.issueKey} - ${requirement.title || "Current linked issue"}`
              : `Current linked issue - ${currentIssueId}`,
          });
        }

        setIssueOptions(options);
      } catch (error) {
        toast.error(
          error?.response?.data?.message || "Failed to load group issues",
        );
        setIssueOptions([]);
      } finally {
        setIssuesLoading(false);
      }
    };

    loadIssues();
  }, [groupCode, open, requirement?.issueKey, requirement?.jiraIssueId, requirement?.title]);

  const handleOk = async () => {
    const values = await form.validateFields();
    await onSubmit(values);
  };

  return (
    <Modal
      title={isEditing ? "Edit Requirement" : "Create Requirement"}
      open={open}
      onCancel={onCancel}
      onOk={handleOk}
      okText={isEditing ? "Update" : "Create"}
      confirmLoading={saving}
      destroyOnClose
      width={isDesktop ? 760 : "calc(100vw - 24px)"}
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
          {!isEditing ? (
            <Col xs={24} md={12}>
              <Form.Item
                label="Requirement Code"
                name="requirementCode"
                rules={[
                  {
                    required: true,
                    message: "Requirement code is required",
                  },
                ]}
              >
                <Input placeholder="REQ-001" />
              </Form.Item>
            </Col>
          ) : null}

          <Col xs={24} md={isEditing ? 24 : 12}>
            <Form.Item
              label="Title"
              name="title"
              rules={[{ required: true, message: "Title is required" }]}
            >
              <Input placeholder="Enter requirement title" />
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
                placeholder="Enter requirement description"
              />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item
              label="Requirement Type"
              name="requirementType"
              rules={[
                { required: true, message: "Requirement type is required" },
              ]}
            >
              <Select
                options={REQUIREMENT_TYPE_OPTIONS}
                placeholder="Select requirement type"
              />
            </Form.Item>
          </Col>

          {!isEditing ? (
            <Col xs={24} md={12}>
              <Form.Item
                label="Issue Type"
                name="issueType"
                rules={[{ required: true, message: "Issue type is required" }]}
              >
                <Select
                  options={ISSUE_TYPE_OPTIONS}
                  placeholder="Select issue type"
                />
              </Form.Item>
            </Col>
          ) : null}

          <Col xs={24} md={isEditing ? 12 : 12}>
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
              label="Jira Issue ID"
              name="jiraIssueId"
              rules={[{ required: true, message: "Jira Issue ID is required" }]}
            >
              <Select
                showSearch
                loading={issuesLoading}
                options={issueOptions}
                placeholder="Select Jira issue"
                optionFilterProp="label"
                disabled={!issueOptions.length && !issuesLoading}
              />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
}
