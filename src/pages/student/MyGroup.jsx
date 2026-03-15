import { useEffect, useState } from "react";
import {
  Avatar,
  Card,
  Col,
  Empty,
  Grid,
  Result,
  Row,
  Space,
  Spin,
  Statistic,
  Table,
  Tag,
  Typography,
} from "antd";
import {
  TeamOutlined,
  BookOutlined,
  UserOutlined,
  CalendarOutlined,
  CrownOutlined,
} from "@ant-design/icons";
import { StudentService } from "../../services/student.service";

const { Title, Paragraph, Text } = Typography;
const { useBreakpoint } = Grid;

const formatDateTime = (value) => {
  if (!value) return "-";

  return new Date(value).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const memberColumns = [
  {
    title: "Member",
    dataIndex: "fullName",
    key: "fullName",
    render: (_, member) => (
      <Space size={12}>
        <Avatar
          size={40}
          style={{ backgroundColor: member.isLeader ? "#f59e0b" : "#0f766e" }}
        >
          {(member.fullName || "?").charAt(0).toUpperCase()}
        </Avatar>
        <div>
          <div className="font-semibold text-slate-900">
            {member.fullName || "-"}
          </div>
        </div>
      </Space>
    ),
  },
  {
    title: "Email",
    dataIndex: "email",
    key: "email",
    responsive: ["md"],
    render: (email) => <Text>{email || "-"}</Text>,
  },
  {
    title: "Role",
    dataIndex: "isLeader",
    key: "isLeader",
    width: 120,
    responsive: ["sm"],
    render: (isLeader) => (
      <Tag color={isLeader ? "gold" : "default"}>
        {isLeader ? "Leader" : "Member"}
      </Tag>
    ),
  },
  {
    title: "Joined At",
    dataIndex: "joinedAt",
    key: "joinedAt",
    width: 180,
    responsive: ["lg"],
    render: (joinedAt) => (
      <Text type="secondary">{formatDateTime(joinedAt)}</Text>
    ),
  },
];

export default function MyGroup() {
  const screens = useBreakpoint();
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notAssigned, setNotAssigned] = useState(false);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    const fetchGroup = async () => {
      try {
        const response = await StudentService.getMyGroup();
        setGroup(response?.data ?? null);
        setLoadError(false);
      } catch (error) {
        if (error?.response?.status === 404) {
          setNotAssigned(true);
        } else {
          console.error("Failed to load student group", error);
          setLoadError(true);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchGroup();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-64 items-center justify-center p-8">
        <Spin size="large" tip="Loading group information..." />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="p-4 md:p-6 xl:p-8">
        <Card className="rounded-3xl shadow-sm">
          <Result
            status="error"
            title="Unable to load group information"
            subTitle="The system could not fetch your current group details. Please try again later."
          />
        </Card>
      </div>
    );
  }

  if (notAssigned || !group) {
    return (
      <div className="p-4 md:p-6 xl:p-8">
        <Card className="rounded-3xl shadow-sm">
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <div>
                <Title level={4} style={{ marginBottom: 8 }}>
                  You are not assigned to a group yet
                </Title>
                <Text type="secondary">
                  Your lecturer or administrator has not assigned you to a
                  project group. Once assigned, your team details will appear
                  here.
                </Text>
              </div>
            }
          />
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 xl:p-8">
      <Row gutter={[16, 0]} style={{ rowGap: 16 }} className="mb-8">
        <Col xs={24} sm={12} xl={6}>
          <Card className="rounded-2xl shadow-sm">
            <Statistic
              title="Group Code"
              value={group.groupCode || "-"}
              prefix={<TeamOutlined />}
              valueStyle={{ fontSize: screens.md ? 18 : 16, lineHeight: 1.25 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <Card className="rounded-2xl shadow-sm">
            <Statistic
              title="Project"
              value={group.projectName || "-"}
              prefix={<BookOutlined />}
              valueStyle={{ fontSize: screens.md ? 18 : 16, lineHeight: 1.25 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <Card className="rounded-2xl shadow-sm">
            <Statistic
              title="Lecturer"
              value={group.lecturerName || "-"}
              prefix={<UserOutlined />}
              valueStyle={{ fontSize: screens.md ? 18 : 16, lineHeight: 1.25 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <Card className="rounded-2xl shadow-sm">
            <Statistic
              title="Joined At"
              value={formatDateTime(group.joinedAt)}
              prefix={<CalendarOutlined />}
              valueStyle={{ fontSize: screens.md ? 18 : 16, lineHeight: 1.25 }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 0]} style={{ rowGap: 16 }}>
        <Col xs={24}>
          <Card
            title="Team Members"
            extra={<Tag color="blue">{group.members?.length ?? 0} members</Tag>}
            className="rounded-3xl shadow-sm"
            styles={{
              header: {
                paddingInline: screens.md ? 24 : 16,
                paddingBlock: screens.md ? 16 : 12,
              },
              body: {
                padding: screens.md ? 24 : 12,
              },
            }}
          >
            <Table
              columns={memberColumns}
              dataSource={group.members ?? []}
              rowKey="userId"
              pagination={false}
              size={screens.md ? "middle" : "small"}
              scroll={{ x: screens.md ? 720 : 420 }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
