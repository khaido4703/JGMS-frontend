import { useEffect, useMemo, useState } from "react";
import {
  CalendarOutlined,
  FileAddOutlined,
  FileTextOutlined,
  ReadOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  Col,
  Descriptions,
  Empty,
  Form,
  Grid,
  Input,
  Modal,
  Result,
  Row,
  Select,
  Spin,
  Statistic,
  Table,
  Tag,
  Typography,
} from "antd";
import { toast } from "react-toastify";
import { useAuth } from "../../contexts/AuthContext";
import { StudentService } from "../../services/student.service";

const { Paragraph, Text, Title } = Typography;
const { TextArea } = Input;

const GREEN_BUTTON_STYLE = {
  backgroundColor: "#10b981",
  borderColor: "#10b981",
};

const DEFAULT_REPORT_TYPES = [
  "weekly",
  "sprint",
  "task_assignment",
  "task_completion",
];

const formatDate = (value) => {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatDateTime = (value) => {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const toTableRow = (report) => ({
  ...report,
  key: report.reportId,
  reportTypeLabel: report.reportType || "-",
  periodLabel: `${formatDate(report.reportPeriodStart)} - ${formatDate(report.reportPeriodEnd)}`,
  generatedAtLabel: formatDateTime(report.generatedAt),
  createdAtLabel: formatDateTime(report.createdAt),
});

const isExternalLink = (value) =>
  /^https?:\/\//i.test(String(value || "").trim());

const buildReportDataPayload = (values, template) => ({
  schemaVersion:
    template?.reportDataTemplate?.schemaVersion ||
    template?.schemaVersion ||
    "1.0",
  title: String(values.reportTitle || "").trim(),
  notes: String(values.reportNotes || "").trim(),
  keyHighlights: String(values.keyHighlights || "")
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean),
});

const formatReportData = (value) => {
  if (!value) return "-";

  if (typeof value === "string") return value;

  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
};

const parseReportData = (value) => {
  if (!value) return null;

  if (typeof value === "object") {
    return value;
  }

  if (typeof value === "string") {
    try {
      return JSON.parse(value);
    } catch {
      return null;
    }
  }

  return null;
};

function ReportDataPreview({ value }) {
  const parsed = parseReportData(value);

  if (!parsed) {
    return (
      <Paragraph
        className="!mb-0"
        ellipsis={{ rows: 3, expandable: true }}
        style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}
      >
        {formatReportData(value)}
      </Paragraph>
    );
  }

  const highlights = Array.isArray(parsed.keyHighlights)
    ? parsed.keyHighlights.filter(Boolean)
    : [];
  const taskProgress = parsed.autoTaskProgress || null;
  const commitStats = parsed.autoCommitStatistics || null;

  return (
    <div className="space-y-2 text-sm">
      <div>
        <span className="font-semibold text-slate-900">Title:</span>{" "}
        <span className="text-slate-700">{parsed.title || "-"}</span>
      </div>

      <div>
        <span className="font-semibold text-slate-900">Notes:</span>{" "}
        <span className="text-slate-700">{parsed.notes || "-"}</span>
      </div>

      <div>
        <span className="font-semibold text-slate-900">Highlights:</span>{" "}
        {highlights.length ? (
          <div className="mt-1 flex flex-wrap gap-1">
            {highlights.map((item, index) => (
              <Tag key={`${item}-${index}`} style={{ marginInlineEnd: 0 }}>
                {item}
              </Tag>
            ))}
          </div>
        ) : (
          <span className="text-slate-500">-</span>
        )}
      </div>

      {taskProgress ? (
        <div className="rounded-xl bg-slate-50 p-2 text-xs text-slate-600">
          <div className="font-semibold text-slate-800">Task Progress</div>
          <div>
            Done: {taskProgress.done ?? 0} | In Progress:{" "}
            {taskProgress.inProgress ?? 0} | To Do: {taskProgress.todo ?? 0} |
            Total: {taskProgress.total ?? 0}
          </div>
          <div>Completion Rate: {taskProgress.completionRate ?? 0}%</div>
        </div>
      ) : null}

      {commitStats ? (
        <div className="rounded-xl bg-slate-50 p-2 text-xs text-slate-600">
          <div className="font-semibold text-slate-800">Commit Statistics</div>
          <div>
            Commits: {commitStats.commitCount ?? 0} | Contributors:{" "}
            {commitStats.contributors ?? 0}
          </div>
          <div>
            Additions: {commitStats.totalAdditions ?? 0} | Deletions:{" "}
            {commitStats.totalDeletions ?? 0} | Files:{" "}
            {commitStats.totalChangedFiles ?? 0}
          </div>
        </div>
      ) : null}
    </div>
  );
}

const formatJsonBlock = (value) => {
  if (!value) return "{}";

  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
};

function ProgressReportFormModal({
  open,
  saving = false,
  allowedReportTypes = DEFAULT_REPORT_TYPES,
  onCancel,
  onSubmit,
}) {
  const screens = Grid.useBreakpoint();
  const [form] = Form.useForm();

  useEffect(() => {
    if (!open) return;

    form.resetFields();
    form.setFieldsValue({
      reportType: allowedReportTypes[0],
      reportPeriodStart: undefined,
      reportPeriodEnd: undefined,
      summary: "",
      filePath: null,
      reportTitle: "",
      reportNotes: "",
      keyHighlights: "",
    });
  }, [allowedReportTypes, form, open]);

  const handleOk = async () => {
    const values = await form.validateFields();
    await onSubmit(values);
  };

  return (
    <Modal
      title="Create Progress Report"
      open={open}
      onCancel={onCancel}
      onOk={handleOk}
      okText="Create"
      confirmLoading={saving}
      destroyOnClose
      centered
      width={screens.md ? 860 : "calc(100vw - 24px)"}
      styles={{
        body: {
          maxHeight: screens.md ? "70vh" : "74vh",
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
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item
              label="Report Type"
              name="reportType"
              rules={[{ required: true, message: "Report type is required" }]}
            >
              <Select
                options={allowedReportTypes.map((type) => ({
                  value: type,
                  label: type,
                }))}
                placeholder="Select report type"
              />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item label="File Path" name="filePath">
              <Input placeholder="Optional link or file path" />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item
              label="Period Start"
              name="reportPeriodStart"
              rules={[{ required: true, message: "Start date is required" }]}
            >
              <Input type="date" />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item
              label="Period End"
              name="reportPeriodEnd"
              dependencies={["reportPeriodStart"]}
              rules={[
                { required: true, message: "End date is required" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    const start = getFieldValue("reportPeriodStart");
                    if (!start || !value || value >= start) {
                      return Promise.resolve();
                    }

                    return Promise.reject(
                      new Error("End date must be on or after start date"),
                    );
                  },
                }),
              ]}
            >
              <Input type="date" />
            </Form.Item>
          </Col>

          <Col span={24}>
            <Form.Item
              label="Summary"
              name="summary"
              rules={[{ required: true, message: "Summary is required" }]}
            >
              <TextArea
                rows={4}
                autoSize={{ minRows: 4, maxRows: 6 }}
                placeholder="Write a concise summary of this reporting period"
              />
            </Form.Item>
          </Col>

          <Col span={24}>
            <Form.Item
              label="Report Title"
              name="reportTitle"
              rules={[{ required: true, message: "Report title is required" }]}
            >
              <Input placeholder="Project_V2 progress report" />
            </Form.Item>
          </Col>

          <Col span={24}>
            <Form.Item
              label="Notes"
              name="reportNotes"
              rules={[{ required: true, message: "Report notes is required" }]}
            >
              <TextArea
                rows={4}
                autoSize={{ minRows: 4, maxRows: 6 }}
                placeholder="This is a weekly report of week 1"
              />
            </Form.Item>
          </Col>

          <Col span={24}>
            <Form.Item
              label="Key Highlights"
              name="keyHighlights"
              rules={[
                { required: true, message: "Report keyhighlights is required" },
              ]}
            >
              <TextArea
                rows={5}
                autoSize={{ minRows: 5, maxRows: 8 }}
                placeholder={
                  "added login screen\nremove bugs\nupdate user guide"
                }
              />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
}

function ProgressReportTemplateModal({
  open,
  loading = false,
  template,
  onCancel,
}) {
  const fieldRows = Array.isArray(template?.fields)
    ? template.fields.map((field) => ({
        ...field,
        key: field.key,
        requiredLabel: field.required ? "Required" : "Optional",
      }))
    : [];

  return (
    <Modal
      title="Progress Report Template"
      open={open}
      onCancel={onCancel}
      footer={null}
      destroyOnClose
      centered
      width={960}
      styles={{
        body: {
          maxHeight: "76vh",
          overflowY: "auto",
          paddingRight: 8,
        },
      }}
    >
      {loading ? (
        <div className="flex min-h-48 items-center justify-center">
          <Spin tip="Loading template..." />
        </div>
      ) : template ? (
        <div className="space-y-6">
          <Descriptions
            bordered
            size="small"
            column={1}
            items={[
              {
                key: "schemaVersion",
                label: "Schema Version",
                children: template.schemaVersion || "-",
              },
              {
                key: "allowedReportTypes",
                label: "Allowed Report Types",
                children: Array.isArray(template.allowedReportTypes) ? (
                  <div className="flex flex-wrap gap-2">
                    {template.allowedReportTypes.map((type) => (
                      <Tag key={type} color="blue">
                        {type}
                      </Tag>
                    ))}
                  </div>
                ) : (
                  "-"
                ),
              },
              {
                key: "autoGeneratedFields",
                label: "Auto Generated Fields",
                children: Array.isArray(template.autoGeneratedFields) ? (
                  <div className="flex flex-wrap gap-2">
                    {template.autoGeneratedFields.map((field) => (
                      <Tag key={field}>{field}</Tag>
                    ))}
                  </div>
                ) : (
                  "-"
                ),
              },
            ]}
          />

          <div>
            <Title level={5}>Field Definitions</Title>
            <Table
              columns={[
                {
                  title: "KEY",
                  dataIndex: "key",
                  key: "key",
                  width: 150,
                },
                {
                  title: "LABEL",
                  dataIndex: "label",
                  key: "label",
                  width: 180,
                },
                {
                  title: "TYPE",
                  dataIndex: "inputType",
                  key: "inputType",
                  width: 120,
                },
                {
                  title: "REQUIRED",
                  dataIndex: "requiredLabel",
                  key: "requiredLabel",
                  width: 120,
                },
                {
                  title: "PLACEHOLDER",
                  dataIndex: "placeholder",
                  key: "placeholder",
                  width: 220,
                  render: (value) => value || "-",
                },
                {
                  title: "DESCRIPTION",
                  dataIndex: "description",
                  key: "description",
                  render: (value) => (
                    <Paragraph className="!mb-0">{value || "-"}</Paragraph>
                  ),
                },
              ]}
              dataSource={fieldRows}
              rowKey="key"
              pagination={false}
              scroll={{ x: 1100 }}
            />
          </div>

          <div>
            <Title level={5}>reportDataTemplate</Title>
            <pre className="overflow-x-auto rounded-2xl bg-slate-950 p-4 text-xs text-slate-100">
              {formatJsonBlock(template.reportDataTemplate)}
            </pre>
          </div>
        </div>
      ) : (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="No template data found"
        />
      )}
    </Modal>
  );
}

export default function ProgressReports() {
  const { user } = useAuth();
  const screens = Grid.useBreakpoint();
  const [group, setGroup] = useState(null);
  const [groupLoading, setGroupLoading] = useState(true);
  const [reports, setReports] = useState([]);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [templateLoading, setTemplateLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [templateOpen, setTemplateOpen] = useState(false);
  const [templateData, setTemplateData] = useState(null);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    const fetchGroup = async () => {
      try {
        setGroupLoading(true);
        const response = await StudentService.getMyGroup();
        setGroup(response?.data ?? null);
        setLoadError(false);
      } catch (error) {
        if (error?.response?.status !== 404) {
          setLoadError(true);
        }
        setGroup(null);
      } finally {
        setGroupLoading(false);
      }
    };

    fetchGroup();
  }, []);

  const isLeader = useMemo(() => {
    const currentEmail = user?.email?.toLowerCase();
    if (!currentEmail || !Array.isArray(group?.members)) return false;

    return group.members.some(
      (member) =>
        member?.isLeader && member?.email?.toLowerCase() === currentEmail,
    );
  }, [group?.members, user?.email]);

  const rows = useMemo(
    () =>
      Array.isArray(reports)
        ? [...reports]
            .sort((left, right) => {
              const leftTime = new Date(
                left?.generatedAt || left?.createdAt || 0,
              ).getTime();
              const rightTime = new Date(
                right?.generatedAt || right?.createdAt || 0,
              ).getTime();

              return rightTime - leftTime;
            })
            .map(toTableRow)
        : [],
    [reports],
  );

  const latestReport = rows[0];

  const loadReports = async (groupCode) => {
    if (!groupCode) return;

    try {
      setReportsLoading(true);
      const response = await StudentService.getGroupProgressReports(groupCode);
      const data = response?.data ?? [];
      setReports(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to load progress reports",
      );
      setReports([]);
    } finally {
      setReportsLoading(false);
    }
  };

  useEffect(() => {
    if (!group?.groupCode || !isLeader) {
      setReports([]);
      return;
    }

    loadReports(group.groupCode);
  }, [group?.groupCode, isLeader]);

  const handleCreate = async (values) => {
    if (!group?.groupCode || !isLeader) {
      toast.error("Only group leaders can create progress reports");
      return;
    }

    try {
      setSaving(true);
      await StudentService.createGroupProgressReport(group.groupCode, {
        reportType: values.reportType,
        reportPeriodStart: values.reportPeriodStart,
        reportPeriodEnd: values.reportPeriodEnd,
        reportData: buildReportDataPayload(values, templateData),
        summary: values.summary,
        filePath: values.filePath || null,
      });
      toast.success("Progress report created successfully");
      setModalOpen(false);
      await loadReports(group.groupCode);
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to create progress report",
      );
    } finally {
      setSaving(false);
    }
  };

  const loadTemplate = async () => {
    if (!group?.groupCode || !isLeader) {
      toast.error("Only group leaders can load progress report templates");
      return null;
    }

    try {
      setTemplateLoading(true);
      const response = await StudentService.getGroupProgressReportTemplate(
        group.groupCode,
      );
      const template = response?.data ?? response;
      if (!template) {
        toast.error("Template response is empty");
        return null;
      }

      setTemplateData(template);
      return template;
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          "Failed to load progress report template",
      );
      return null;
    } finally {
      setTemplateLoading(false);
    }
  };

  const handleOpenTemplate = async () => {
    setTemplateOpen(true);

    if (templateData) return;

    const template = await loadTemplate();
    if (template) {
      toast.success("Progress report template loaded");
    }
  };

  const columns = [
    {
      title: "TYPE",
      dataIndex: "reportTypeLabel",
      key: "reportType",
      width: 180,
      render: (value) => <Tag color="blue">{value}</Tag>,
    },
    {
      title: "PERIOD",
      dataIndex: "periodLabel",
      key: "period",
      width: 220,
    },
    {
      title: "SUMMARY",
      dataIndex: "summary",
      key: "summary",
      width: 320,
      render: (value) => (
        <Paragraph className="!mb-0" ellipsis={{ rows: 2, expandable: true }}>
          {value || "-"}
        </Paragraph>
      ),
    },
    {
      title: "DETAILS",
      dataIndex: "reportData",
      key: "reportData",
      width: 360,
      render: (value) => <ReportDataPreview value={value} />,
    },
    {
      title: "GENERATED BY",
      dataIndex: "generatedByName",
      key: "generatedByName",
      width: 180,
      render: (value) => value || "-",
    },
    {
      title: "GENERATED AT",
      dataIndex: "generatedAtLabel",
      key: "generatedAt",
      width: 180,
    },
    {
      title: "FILE",
      dataIndex: "filePath",
      key: "filePath",
      width: 220,
      render: (value) =>
        isExternalLink(value) ? (
          <a
            href={value}
            target="_blank"
            rel="noreferrer"
            className="text-emerald-600 hover:text-emerald-700"
          >
            Open file
          </a>
        ) : value ? (
          <Text ellipsis={{ tooltip: value }}>{value}</Text>
        ) : (
          "-"
        ),
    },
  ];

  if (groupLoading) {
    return (
      <div className="flex min-h-64 items-center justify-center p-8">
        <Spin size="large" tip="Loading progress reports..." />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="p-4 md:p-6 xl:p-8">
        <Card className="rounded-3xl shadow-sm">
          <Result
            status="error"
            title="Unable to load progress reports"
            subTitle="The system could not fetch your current group details. Please try again later."
          />
        </Card>
      </div>
    );
  }

  if (!group?.groupCode) {
    return (
      <div className="p-4 md:p-6 xl:p-8">
        <Card className="rounded-3xl shadow-sm">
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="You need to be assigned to a group before using progress reports."
          />
        </Card>
      </div>
    );
  }

  if (!isLeader) {
    return (
      <div className="p-4 md:p-6 xl:p-8">
        <Card className="rounded-3xl shadow-sm">
          <Result
            status="403"
            title="Leader access only"
            subTitle="Only the group leader can view and create progress reports for this project."
          />
        </Card>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6 p-4 md:p-6 xl:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <Title level={2} className="!mb-1">
              Progress Reports
            </Title>
            <Text type="secondary">
              Track and submit project progress for group {group.groupCode}.
            </Text>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              icon={<ReadOutlined />}
              onClick={handleOpenTemplate}
              loading={templateLoading}
            >
              Template
            </Button>
            <Button
              type="primary"
              icon={<FileAddOutlined />}
              onClick={() => setModalOpen(true)}
              style={GREEN_BUTTON_STYLE}
              className="text-white hover:!border-emerald-600 hover:!bg-emerald-600"
            >
              New Report
            </Button>
          </div>
        </div>

        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} xl={6}>
            <Card className="rounded-2xl shadow-sm">
              <Statistic
                title="Group"
                value={group.groupCode || "-"}
                prefix={<TeamOutlined />}
                valueStyle={{ fontSize: screens.md ? 20 : 16 }}
              />
            </Card>
          </Col>

          <Col xs={24} sm={12} xl={6}>
            <Card className="rounded-2xl shadow-sm">
              <Statistic
                title="Project"
                value={group.projectName || "-"}
                prefix={<FileTextOutlined />}
                valueStyle={{ fontSize: screens.md ? 20 : 16 }}
              />
            </Card>
          </Col>

          <Col xs={24} sm={12} xl={6}>
            <Card className="rounded-2xl shadow-sm">
              <Statistic
                title="Total Reports"
                value={rows.length}
                prefix={<FileAddOutlined />}
                valueStyle={{ fontSize: screens.md ? 20 : 16 }}
              />
            </Card>
          </Col>

          <Col xs={24} sm={12} xl={6}>
            <Card className="rounded-2xl shadow-sm">
              <Statistic
                title="Latest Generated"
                value={latestReport?.generatedAtLabel || "-"}
                prefix={<CalendarOutlined />}
                valueStyle={{ fontSize: screens.md ? 16 : 14 }}
              />
            </Card>
          </Col>
        </Row>

        <Card className="rounded-3xl border border-slate-200 shadow-sm">
          <Table
            loading={reportsLoading}
            columns={columns}
            dataSource={rows}
            rowKey="key"
            pagination={{ pageSize: 6, showSizeChanger: false }}
            locale={{ emptyText: "No progress reports found" }}
            scroll={{ x: 1660 }}
          />
        </Card>
      </div>

      <ProgressReportFormModal
        open={modalOpen}
        saving={saving}
        allowedReportTypes={
          templateData?.allowedReportTypes?.length
            ? templateData.allowedReportTypes
            : DEFAULT_REPORT_TYPES
        }
        onCancel={() => setModalOpen(false)}
        onSubmit={handleCreate}
      />

      <ProgressReportTemplateModal
        open={templateOpen}
        loading={templateLoading}
        template={templateData}
        onCancel={() => setTemplateOpen(false)}
      />
    </>
  );
}
