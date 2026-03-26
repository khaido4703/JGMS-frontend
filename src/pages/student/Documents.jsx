import { useEffect, useMemo, useState } from "react";
import {
  FileTextOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  Col,
  Empty,
  Grid,
  Result,
  Row,
  Spin,
  Statistic,
  Typography,
} from "antd";
import { toast } from "react-toastify";
import { useAuth } from "../../contexts/AuthContext";
import SrsDocumentDetailModal from "../../components/student/SrsDocumentDetailModal";
import SrsDocumentFormModal from "../../components/student/SrsDocumentFormModal";
import SrsDocumentsTable from "../../components/student/SrsDocumentsTable";
import { StudentService } from "../../services/student.service";

const { Text, Title } = Typography;

const GREEN_BUTTON_STYLE = {
  backgroundColor: "#10b981",
  borderColor: "#10b981",
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

const mapRequirementOption = (item) => ({
  value: Number(item.requirementId),
  label: `${item.sectionNumber ? `${item.sectionNumber} - ` : ""}${item.requirementCode || `REQ-${item.requirementId}`} - ${item.title || "Untitled requirement"}`,
});

const mapDocument = (item) => ({
  ...item,
  key: item.documentId,
  documentTitle: item.documentTitle || "-",
  version: item.version || "-",
  status: item.status || "draft",
  generatedByName: item.generatedByName || "-",
  requirementsCount: Array.isArray(item.requirements)
    ? item.requirements.length
    : 0,
  generatedAtLabel: formatDateTime(item.generatedAt),
  updatedAtLabel: formatDateTime(item.updatedAt),
});

const isLeaderInGroup = (group, email) => {
  const currentEmail = email?.toLowerCase();
  if (!currentEmail || !Array.isArray(group?.members)) return false;

  return group.members.some(
    (member) =>
      member?.isLeader && member?.email?.toLowerCase() === currentEmail,
  );
};

const triggerDownload = (blob, fileName) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

export default function Documents() {
  const { user } = useAuth();
  const screens = Grid.useBreakpoint();
  const [group, setGroup] = useState(null);
  const [groupLoading, setGroupLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [documentsLoading, setDocumentsLoading] = useState(false);
  const [requirementOptions, setRequirementOptions] = useState([]);
  const [generateOpen, setGenerateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [regenerateOpen, setRegenerateOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [detailDocument, setDetailDocument] = useState(null);

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

  const isLeader = useMemo(
    () => isLeaderInGroup(group, user?.email),
    [group, user?.email],
  );

  const rows = useMemo(
    () =>
      Array.isArray(documents)
        ? [...documents]
            .sort((left, right) => {
              const leftTime = new Date(
                left?.updatedAt || left?.generatedAt || 0,
              ).getTime();
              const rightTime = new Date(
                right?.updatedAt || right?.generatedAt || 0,
              ).getTime();

              return rightTime - leftTime;
            })
            .map(mapDocument)
        : [],
    [documents],
  );

  const latestDocument = rows[0];

  const loadDocuments = async (groupCode) => {
    if (!groupCode) return;

    try {
      setDocumentsLoading(true);
      const response = await StudentService.getGroupSrsDocuments(groupCode);
      const data = response?.data ?? [];
      setDocuments(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to load SRS documents",
      );
      setDocuments([]);
    } finally {
      setDocumentsLoading(false);
    }
  };

  const loadRequirements = async (groupCode) => {
    if (!groupCode) return;

    try {
      const response = await StudentService.getGroupRequirements(groupCode);
      const data = response?.data ?? [];
      setRequirementOptions(
        Array.isArray(data) ? data.map(mapRequirementOption) : [],
      );
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to load requirements",
      );
      setRequirementOptions([]);
    }
  };

  useEffect(() => {
    if (!group?.groupCode || !isLeader) {
      setDocuments([]);
      setRequirementOptions([]);
      return;
    }

    loadDocuments(group.groupCode);
    loadRequirements(group.groupCode);
  }, [group?.groupCode, isLeader]);

  const handleGenerate = async (values) => {
    if (!group?.groupCode || !isLeader) {
      toast.error("Only group leaders can generate SRS documents");
      return;
    }

    try {
      setSaving(true);
      await StudentService.generateSrsDocument(group.groupCode, {
        documentTitle: values.documentTitle,
        version: values.version,
        introduction: values.introduction || "",
        scope: values.scope || "",
        productPerspective: values.productPerspective || "",
        userClasses: values.userClasses || "",
        operatingEnvironment: values.operatingEnvironment || "",
        assumptionsDependencies: values.assumptionsDependencies || "",
        requirementIds: values.requirementIds.map(Number),
        importFromJira: Boolean(values.importFromJira),
      });
      toast.success("SRS document generated successfully");
      setGenerateOpen(false);
      await loadDocuments(group.groupCode);
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to generate SRS document",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (values) => {
    if (!group?.groupCode || !selectedDocument?.documentId) return;

    try {
      setSaving(true);
      await StudentService.updateSrsDocument(
        group.groupCode,
        selectedDocument.documentId,
        {
          documentTitle: values.documentTitle,
          version: values.version,
          introduction: values.introduction || "",
          scope: values.scope || "",
          productPerspective: values.productPerspective || "",
          userClasses: values.userClasses || "",
          operatingEnvironment: values.operatingEnvironment || "",
          assumptionsDependencies: values.assumptionsDependencies || "",
          status: values.status || "draft",
        },
      );
      toast.success("SRS document updated successfully");
      setEditOpen(false);
      await loadDocuments(group.groupCode);
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to update SRS document",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleRegenerate = async (values) => {
    if (!group?.groupCode || !selectedDocument?.documentId) return;

    try {
      setSaving(true);
      await StudentService.regenerateSrsDocument(
        group.groupCode,
        selectedDocument.documentId,
        {
          requirementIds: values.requirementIds.map(Number),
          importFromJira: Boolean(values.importFromJira),
        },
      );
      toast.success("SRS document regenerated successfully");
      setRegenerateOpen(false);
      await loadDocuments(group.groupCode);
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to regenerate SRS document",
      );
    } finally {
      setSaving(false);
    }
  };

  const openDetail = async (record) => {
    if (!group?.groupCode) return;

    try {
      setSelectedDocument(record);
      setDetailDocument(null);
      setDetailOpen(true);
      setDetailLoading(true);
      const response = await StudentService.getSrsDocumentById(
        group.groupCode,
        record.documentId,
      );
      setDetailDocument(response?.data ?? null);
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to load document detail",
      );
      setDetailOpen(false);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleDownloadHtml = async (record) => {
    if (!group?.groupCode) return;

    try {
      const response = await StudentService.downloadSrsDocumentHtml(
        group.groupCode,
        record.documentId,
      );
      triggerDownload(
        new Blob([response?.data || ""], { type: "text/html;charset=utf-8" }),
        `${record.documentTitle || `srs-${record.documentId}`}.html`,
      );
      toast.success("HTML document downloaded");
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to download HTML document",
      );
    }
  };

  const handleDownloadDoc = async (record) => {
    if (!group?.groupCode) return;

    try {
      const response = await StudentService.downloadSrsDocumentDoc(
        group.groupCode,
        record.documentId,
      );
      triggerDownload(
        response?.data,
        `${record.documentTitle || `srs-${record.documentId}`}.doc`,
      );
      toast.success("Word document downloaded");
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to download Word document",
      );
    }
  };

  if (groupLoading) {
    return (
      <div className="flex min-h-64 items-center justify-center p-8">
        <Spin size="large" tip="Loading documents..." />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="p-4 md:p-6 xl:p-8">
        <Card className="rounded-3xl shadow-sm">
          <Result
            status="error"
            title="Unable to load SRS documents"
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
            description="You need to be assigned to a group before using documents."
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
            subTitle="Only the group leader can manage SRS documents for this project."
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
              SRS Documents
            </Title>
            <Text type="secondary">
              Generate, edit and download SRS documents for group{" "}
              {group.groupCode}.
            </Text>
          </div>

          <Button
            type="primary"
            icon={<FileTextOutlined />}
            onClick={() => setGenerateOpen(true)}
            style={GREEN_BUTTON_STYLE}
            className="text-white hover:!border-emerald-600 hover:!bg-emerald-600"
          >
            Generate Document
          </Button>
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
                title="Total Documents"
                value={rows.length}
                prefix={<FileTextOutlined />}
                valueStyle={{ fontSize: screens.md ? 20 : 16 }}
              />
            </Card>
          </Col>

          <Col xs={24} sm={12} xl={6}>
            <Card className="rounded-2xl shadow-sm">
              <Statistic
                title="Latest Updated"
                value={latestDocument?.updatedAtLabel || "-"}
                valueStyle={{ fontSize: screens.md ? 16 : 14 }}
              />
            </Card>
          </Col>
        </Row>

        <Card className="rounded-3xl border border-slate-200 shadow-sm">
          <SrsDocumentsTable
            loading={documentsLoading}
            rows={rows}
            onView={openDetail}
            onEdit={(record) => {
              setSelectedDocument(record);
              setEditOpen(true);
            }}
            onRegenerate={(record) => {
              setSelectedDocument(record);
              setRegenerateOpen(true);
            }}
            onDownloadHtml={handleDownloadHtml}
            onDownloadDoc={handleDownloadDoc}
          />
        </Card>
      </div>

      <SrsDocumentFormModal
        open={generateOpen}
        title="Generate SRS Document"
        okText="Generate"
        saving={saving}
        initialValues={{
          documentTitle: "Software Requirements Specification",
          version: "1.0",
          introduction: "",
          scope: "",
          productPerspective: "",
          userClasses: "",
          operatingEnvironment: "",
          assumptionsDependencies: "",
          requirementIds: [],
          importFromJira: true,
        }}
        requirementOptions={requirementOptions}
        includeRequirements
        onCancel={() => setGenerateOpen(false)}
        onSubmit={handleGenerate}
      />

      <SrsDocumentFormModal
        open={editOpen}
        title="Edit SRS Document"
        okText="Update"
        saving={saving}
        initialValues={{
          documentTitle: selectedDocument?.documentTitle,
          version: selectedDocument?.version,
          introduction: selectedDocument?.introduction,
          scope: selectedDocument?.scope,
          productPerspective: selectedDocument?.productPerspective,
          userClasses: selectedDocument?.userClasses,
          operatingEnvironment: selectedDocument?.operatingEnvironment,
          assumptionsDependencies: selectedDocument?.assumptionsDependencies,
          status: selectedDocument?.status || "draft",
        }}
        includeStatus
        onCancel={() => setEditOpen(false)}
        onSubmit={handleUpdate}
      />

      <SrsDocumentFormModal
        open={regenerateOpen}
        title="Regenerate SRS Document"
        okText="Regenerate"
        saving={saving}
        initialValues={{
          documentTitle: selectedDocument?.documentTitle,
          version: selectedDocument?.version,
          introduction: selectedDocument?.introduction,
          scope: selectedDocument?.scope,
          productPerspective: selectedDocument?.productPerspective,
          userClasses: selectedDocument?.userClasses,
          operatingEnvironment: selectedDocument?.operatingEnvironment,
          assumptionsDependencies: selectedDocument?.assumptionsDependencies,
          requirementIds: Array.isArray(selectedDocument?.requirements)
            ? selectedDocument.requirements.map((item) =>
                Number(item.requirementId),
              )
            : [],
          importFromJira: true,
        }}
        requirementOptions={requirementOptions}
        includeRequirements
        onCancel={() => setRegenerateOpen(false)}
        onSubmit={handleRegenerate}
      />

      <SrsDocumentDetailModal
        open={detailOpen}
        loading={detailLoading}
        document={detailDocument}
        onCancel={() => {
          setDetailOpen(false);
          setDetailDocument(null);
        }}
      />
    </>
  );
}
