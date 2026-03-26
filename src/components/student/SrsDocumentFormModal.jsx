import { useEffect } from "react";
import { Col, Form, Grid, Input, Modal, Row, Select, Switch } from "antd";

const { TextArea } = Input;

const GREEN_BUTTON_STYLE = {
  backgroundColor: "#10b981",
  borderColor: "#10b981",
};

function MetadataFields({ includeStatus = false }) {
  return (
    <Row gutter={16}>
      <Col xs={24} md={12}>
        <Form.Item
          label="Document Title"
          name="documentTitle"
          rules={[{ required: true, message: "Document title is required" }]}
        >
          <Input placeholder="Software Requirements Specification" />
        </Form.Item>
      </Col>

      <Col xs={24} md={12}>
        <Form.Item
          label="Version"
          name="version"
          rules={[{ required: true, message: "Version is required" }]}
        >
          <Input placeholder="1.0" />
        </Form.Item>
      </Col>

      <Col span={24}>
        <Form.Item label="Introduction" name="introduction">
          <TextArea rows={3} placeholder="Document overview" />
        </Form.Item>
      </Col>

      <Col xs={24} md={12}>
        <Form.Item label="Scope" name="scope">
          <TextArea rows={3} placeholder="Project scope" />
        </Form.Item>
      </Col>

      <Col xs={24} md={12}>
        <Form.Item label="Product Perspective" name="productPerspective">
          <TextArea rows={3} placeholder="System context and perspective" />
        </Form.Item>
      </Col>

      <Col xs={24} md={12}>
        <Form.Item label="User Classes" name="userClasses">
          <TextArea rows={3} placeholder="Target user groups" />
        </Form.Item>
      </Col>

      <Col xs={24} md={12}>
        <Form.Item label="Operating Environment" name="operatingEnvironment">
          <TextArea rows={3} placeholder="Platforms, browsers, OS..." />
        </Form.Item>
      </Col>

      <Col span={24}>
        <Form.Item
          label="Assumptions and Dependencies"
          name="assumptionsDependencies"
        >
          <TextArea rows={3} placeholder="Known dependencies and assumptions" />
        </Form.Item>
      </Col>

      {includeStatus ? (
        <Col xs={24} md={12}>
          <Form.Item label="Status" name="status">
            <Select
              options={[
                { value: "draft", label: "Draft" },
                { value: "published", label: "Published" },
                { value: "archived", label: "Archived" },
              ]}
            />
          </Form.Item>
        </Col>
      ) : null}
    </Row>
  );
}

export default function SrsDocumentFormModal({
  open,
  title,
  okText,
  saving = false,
  initialValues,
  requirementOptions = [],
  includeRequirements = false,
  includeStatus = false,
  onCancel,
  onSubmit,
}) {
  const screens = Grid.useBreakpoint();
  const [form] = Form.useForm();

  useEffect(() => {
    if (!open) return;
    form.resetFields();
    form.setFieldsValue(initialValues);
  }, [form, initialValues, open]);

  const handleOk = async () => {
    const values = await form.validateFields();
    await onSubmit(values);
  };

  return (
    <Modal
      title={title}
      open={open}
      onCancel={onCancel}
      onOk={handleOk}
      okText={okText}
      confirmLoading={saving}
      destroyOnClose
      centered
      width={screens.md ? 920 : "calc(100vw - 24px)"}
      styles={{
        body: {
          maxHeight: screens.md ? "72vh" : "76vh",
          overflowY: "auto",
          paddingRight: 8,
        },
      }}
      okButtonProps={{
        style: GREEN_BUTTON_STYLE,
        className: "text-white hover:!border-emerald-600 hover:!bg-emerald-600",
      }}
    >
      <Form form={form} layout="vertical">
        <MetadataFields includeStatus={includeStatus} />

        {includeRequirements ? (
          <Row gutter={16}>
            <Col xs={24} md={16}>
              <Form.Item
                label="Requirements"
                name="requirementIds"
                rules={[
                  {
                    required: true,
                    type: "array",
                    min: 1,
                    message: "Select at least one requirement",
                  },
                ]}
              >
                <Select
                  mode="multiple"
                  showSearch
                  allowClear
                  options={requirementOptions}
                  placeholder="Choose included requirements"
                  optionFilterProp="label"
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={8}>
              <Form.Item
                label="Import From Jira"
                name="importFromJira"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Col>
          </Row>
        ) : null}
      </Form>
    </Modal>
  );
}
