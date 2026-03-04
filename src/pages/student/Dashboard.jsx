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

export default function Dashboard() {
  const completionData = [
    { name: "Completed", value: 38 },
    { name: "In Progress", value: 25 },
    { name: "To Do", value: 37 },
  ];

  const COLORS = {
    Completed: "#10b981",
    "In Progress": "#3b82f6",
    "To Do": "#f59e0b",
  };

  const weeklyData = [
    { day: "Mon", Done: 8, "In Progress": 5, "To Do": 3 },
    { day: "Tue", Done: 10, "In Progress": 10, "To Do": 4 },
    { day: "Wed", Done: 12, "In Progress": 3, "To Do": 6 },
    { day: "Thu", Done: 6, "In Progress": 13, "To Do": 2 },
    { day: "Fri", Done: 15, "In Progress": 4, "To Do": 5 },
    { day: "Sat", Done: 4, "In Progress": 4, "To Do": 1 },
    { day: "Sun", Done: 1, "In Progress": 1, "To Do": 1 },
  ];

  const recentTasks = [
    { name: "Design system setup", status: "Done" },
    { name: "API integration", status: "In Progress" },
    { name: "User authentication", status: "In Progress" },
    { name: "Dashboard layout", status: "Done" },
    { name: "Unit tests", status: "To Do" },
    { name: "Performance audit", status: "To Do" },
    { name: "Documentation", status: "To Do" },
    { name: "Database schema", status: "Done" },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case "Done":
        return "bg-emerald-100 text-emerald-800";
      case "In Progress":
        return "bg-blue-100 text-blue-800";
      case "To Do":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-slate-100 text-slate-800";
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Student Dashboard</h1>
        <p className="text-slate-600 mt-2">
          Welcome back! Here's an overview of your activities.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
                <svg
                  className="h-5 w-5 text-orange-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <span className="text-sm font-medium text-slate-700">To Do</span>
            </div>
            <span className="text-2xl font-bold text-slate-900">3</span>
          </div>
          <div className="relative">
            <div className="h-2 bg-orange-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-orange-500 rounded-full"
                style={{ width: "38%" }}
              ></div>
            </div>
            <p className="text-xs text-slate-500 mt-1">38% of total</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                <svg
                  className="h-5 w-5 text-blue-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              </div>
              <span className="text-sm font-medium text-slate-700">
                In Progress
              </span>
            </div>
            <span className="text-2xl font-bold text-slate-900">2</span>
          </div>
          <div className="relative">
            <div className="h-2 bg-blue-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full"
                style={{ width: "25%" }}
              ></div>
            </div>
            <p className="text-xs text-slate-500 mt-1">25% of total</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
                <svg
                  className="h-5 w-5 text-emerald-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <span className="text-sm font-medium text-slate-700">Done</span>
            </div>
            <span className="text-2xl font-bold text-slate-900">3</span>
          </div>
          <div className="relative">
            <div className="h-2 bg-emerald-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full"
                style={{ width: "38%" }}
              ></div>
            </div>
            <p className="text-xs text-slate-500 mt-1">38% of total</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">
            Completion Rate
          </h2>
          <div className="relative">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={completionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {completionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[entry.name]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-3xl font-bold text-slate-900">38%</div>
                <div className="text-xs text-slate-600">Completed</div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 lg:col-span-2">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">
            Weekly Overview
          </h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend iconType="circle" wrapperStyle={{ fontSize: "12px" }} />
              <Bar dataKey="Done" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="In Progress" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="To Do" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200">
        <div className="px-6 py-4 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">Recent Tasks</h2>
        </div>
        <div className="p-6">
          <div className="space-y-3">
            {recentTasks.map((task, index) => (
              <div
                key={index}
                className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`h-2 w-2 rounded-full ${
                      task.status === "Done"
                        ? "bg-emerald-500"
                        : task.status === "In Progress"
                          ? "bg-blue-500"
                          : "bg-orange-500"
                    }`}
                  ></div>
                  <span className="text-sm text-slate-900">{task.name}</span>
                </div>
                <span
                  className={`text-xs font-medium px-3 py-1 rounded-full ${getStatusColor(
                    task.status,
                  )}`}
                >
                  {task.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
