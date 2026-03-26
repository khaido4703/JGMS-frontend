import { useEffect, useState } from "react";
import {
  Card,
  Col,
  List,
  Progress,
  Row,
  Space,
  Spin,
  Statistic,
  Tag,
  Typography,
} from "antd";
import {
  BarChartOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  DashboardOutlined,
  FireOutlined,
  FundOutlined,
} from "@ant-design/icons";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { StudentService } from "../../services/student.service";

const { Title, Text } = Typography;

const COLORS = {
  Done: "#10b981",
  "In Progress": "#3b82f6",
  "To Do": "#f59e0b",
};

const EMPTY_OVERVIEW = {
  totalTasks: 0,
  completedTasks: 0,
  inProgressTasks: 0,
  overdueTasks: 0,
  completionRate: 0,
  totalCommits: 0,
  lastCommitDate: null,
};

const EMPTY_TASKS_BY_STATUS = {
  todoTasks: 0,
  inProgressTasks: 0,
  doneTasks: 0,
  totalTasks: 0,
};

const EMPTY_TASK_STATS = {
  tasksAssigned: 0,
  tasksCompleted: 0,
  tasksPending: 0,
  completionPercentage: 0,
};

const EMPTY_COMMIT_STATS = {
  statisticId: 0,
  userId: 0,
  userName: "",
  projectId: 0,
  totalCommits: 0,
  commitsThisWeek: 0,
  commitsThisMonth: 0,
  averageCommitsPerDay: 0,
  lastCommitDate: null,
  updatedAt: null,
};

export default function Dashboard() {
  const [overview, setOverview] = useState(EMPTY_OVERVIEW);
  const [tasksByStatus, setTasksByStatus] = useState(EMPTY_TASKS_BY_STATUS);
  const [taskStats, setTaskStats] = useState(EMPTY_TASK_STATS);
  const [commitStats, setCommitStats] = useState(EMPTY_COMMIT_STATS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [res1, res2, res3, res4] = await Promise.all([
          StudentService.getStatistics(),
          StudentService.getStatisticsTasksByStatus(),
          StudentService.getStatisticsTasks(),
          StudentService.getStatisticsCommits(),
        ]);
        const d1 = res1?.data ?? res1;
        const d2 = res2?.data ?? res2;
        const d3 = res3?.data ?? res3;
        const d4 = res4?.data ?? res4;
        setOverview(d1 ?? EMPTY_OVERVIEW);
        setTasksByStatus(d2 ?? EMPTY_TASKS_BY_STATUS);
        setTaskStats(d3 ?? EMPTY_TASK_STATS);
        setCommitStats(d4 ?? EMPTY_COMMIT_STATS);
      } catch (err) {
        console.error("Failed to load dashboard data", err);
        setOverview(EMPTY_OVERVIEW);
        setTasksByStatus(EMPTY_TASKS_BY_STATUS);
        setTaskStats(EMPTY_TASK_STATS);
        setCommitStats(EMPTY_COMMIT_STATS);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const totalTasks = tasksByStatus
    ? (tasksByStatus.todoTasks ?? 0) +
      (tasksByStatus.inProgressTasks ?? 0) +
      (tasksByStatus.doneTasks ?? 0)
    : 0;
  const doneTasks = tasksByStatus?.doneTasks ?? 0;

  const pct = (val) =>
    totalTasks > 0 ? Math.round(((val ?? 0) / totalTasks) * 100) : 0;

  const pieData = tasksByStatus
    ? [
        { name: "Done", value: tasksByStatus.doneTasks ?? 0 },
        { name: "In Progress", value: tasksByStatus.inProgressTasks ?? 0 },
        { name: "To Do", value: tasksByStatus.todoTasks ?? 0 },
      ]
    : [];

  const commitChartData = commitStats
    ? [
        { label: "This Week", Commits: commitStats.commitsThisWeek ?? 0 },
        { label: "This Month", Commits: commitStats.commitsThisMonth ?? 0 },
        { label: "Total", Commits: commitStats.totalCommits ?? 0 },
      ]
    : [];

  const completionRate =
    totalTasks > 0
      ? pct(doneTasks)
      : (taskStats?.completionPercentage ?? overview?.completionRate ?? 0);

  const formatDate = (iso) => {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex min-h-64 items-center justify-center p-8">
        <Spin size="large" tip="Loading dashboard..." />
      </div>
    );
  }

  const taskStatusCards = [
    {
      title: "To Do",
      value: tasksByStatus?.todoTasks ?? 0,
      percent: pct(tasksByStatus?.todoTasks),
      color: "#f59e0b",
      trailColor: "#fef3c7",
      icon: <ClockCircleOutlined style={{ color: "#d97706" }} />,
    },
    {
      title: "In Progress",
      value: tasksByStatus?.inProgressTasks ?? 0,
      percent: pct(tasksByStatus?.inProgressTasks),
      color: "#3b82f6",
      trailColor: "#dbeafe",
      icon: <DashboardOutlined style={{ color: "#2563eb" }} />,
    },
    {
      title: "Done",
      value: tasksByStatus?.doneTasks ?? 0,
      percent: pct(tasksByStatus?.doneTasks),
      color: "#10b981",
      trailColor: "#d1fae5",
      icon: <CheckCircleOutlined style={{ color: "#059669" }} />,
    },
  ];

  const overviewStats = [
    {
      title: "Total Tasks",
      value: tasksByStatus?.totalTasks ?? totalTasks ?? 0,
      prefix: <BarChartOutlined />,
    },
    {
      title: "Overdue",
      value: overview?.overdueTasks ?? 0,
      prefix: <FireOutlined />,
      valueStyle: { color: "#dc2626" },
    },
    {
      title: "Total Commits",
      value: commitStats?.totalCommits ?? 0,
      prefix: <FundOutlined />,
    },
    {
      title: "Last Commit",
      value: formatDate(commitStats?.lastCommitDate),
      prefix: <CalendarOutlined />,
      valueStyle: { fontSize: 18 },
    },
  ];

  const commitDetails = [
    {
      label: "Avg. Commits / Day",
      value: commitStats?.averageCommitsPerDay?.toFixed(2) ?? "-",
      color: "#0f172a",
    },
    {
      label: "Commits This Week",
      value: commitStats?.commitsThisWeek ?? 0,
      color: "#4f46e5",
    },
    {
      label: "Commits This Month",
      value: commitStats?.commitsThisMonth ?? 0,
      color: "#4f46e5",
    },
    {
      label: "Last Commit Date",
      value: formatDate(commitStats?.lastCommitDate),
      color: "#0f172a",
    },
    {
      label: "Updated At",
      value: formatDate(commitStats?.updatedAt),
      color: "#0f172a",
    },
  ];

  const taskSummary = [
    {
      label: "Tasks Assigned",
      value: taskStats?.tasksAssigned ?? 0,
      color: "#0f172a",
    },
    {
      label: "Tasks Completed",
      value: taskStats?.tasksCompleted ?? 0,
      color: "#059669",
    },
    {
      label: "Tasks Pending",
      value: taskStats?.tasksPending ?? 0,
      color: "#f59e0b",
    },
    {
      label: "In Progress",
      value: tasksByStatus?.inProgressTasks ?? 0,
      color: "#2563eb",
    },
    {
      label: "Overdue",
      value: overview?.overdueTasks ?? 0,
      color: "#dc2626",
    },
    {
      label: "Completion %",
      value: `${Math.round(taskStats?.completionPercentage ?? 0)}%`,
      color: "#7c3aed",
    },
  ];

  return (
    <div className="p-4 md:p-2 xl:p-4">
      <Row gutter={[16, 16]} className="mb-6">
        {taskStatusCards.map((item) => (
          <Col xs={24} md={12} xl={8} key={item.title}>
            <Card className="h-full rounded-3xl shadow-sm">
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <Text type="secondary">{item.title}</Text>
                  <Title level={3} style={{ margin: "8px 0 0" }}>
                    {item.value}
                  </Title>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-50 text-lg">
                  {item.icon}
                </div>
              </div>
              <Progress
                percent={item.percent}
                strokeColor={item.color}
                trailColor={item.trailColor}
                showInfo={false}
              />
              <Text type="secondary">{item.percent}% of total tasks</Text>
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={[16, 16]} className="mb-6">
        {overviewStats.map((item) => (
          <Col xs={24} sm={12} xl={6} key={item.title}>
            <Card className="rounded-2xl shadow-sm">
              <Statistic
                title={item.title}
                value={item.value}
                prefix={item.prefix}
                valueStyle={item.valueStyle}
              />
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} xl={8}>
          <Card
            title="Completion Rate"
            className="h-full rounded-3xl shadow-sm"
          >
            <div
              className="relative mx-auto"
              style={{ width: "100%", maxWidth: 320 }}
            >
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={62}
                    outerRadius={86}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[entry.name]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-3xl font-bold text-slate-900">
                    {Math.round(completionRate)}%
                  </div>
                  <div className="text-xs text-slate-500">Completed</div>
                </div>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap justify-center gap-3">
              {pieData.map((item) => (
                <Tag
                  key={item.name}
                  color="default"
                  style={{ borderColor: "#e2e8f0", marginInlineEnd: 0 }}
                >
                  <span
                    className="mr-2 inline-block h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: COLORS[item.name] }}
                  />
                  {item.name}
                </Tag>
              ))}
            </div>
          </Card>
        </Col>

        <Col xs={24} xl={16}>
          <Card
            title="Commit Activity"
            className="h-full rounded-3xl shadow-sm"
          >
            <div style={{ width: "100%", height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={commitChartData}
                  margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                  <Tooltip />
                  <Legend
                    iconType="circle"
                    wrapperStyle={{ fontSize: "12px" }}
                  />
                  <Bar dataKey="Commits" fill="#4f46e5" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} xl={12}>
          <Card title="Commit Details" className="rounded-3xl shadow-sm">
            <List
              dataSource={commitDetails}
              renderItem={(item) => (
                <List.Item>
                  <Text type="secondary">{item.label}</Text>
                  <Text strong style={{ color: item.color }}>
                    {item.value}
                  </Text>
                </List.Item>
              )}
            />
          </Card>
        </Col>

        <Col xs={24} xl={12}>
          <Space direction="vertical" size={16} style={{ width: "100%" }}>
            <Card title="Task Summary" className="rounded-3xl shadow-sm">
              <List
                dataSource={taskSummary}
                renderItem={(item) => (
                  <List.Item>
                    <Text type="secondary">{item.label}</Text>
                    <Text strong style={{ color: item.color }}>
                      {item.value}
                    </Text>
                  </List.Item>
                )}
              />
            </Card>
          </Space>
        </Col>
      </Row>
    </div>
  );
}
