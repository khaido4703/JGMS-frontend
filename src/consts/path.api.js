export const API = {
  COMMON: {
    PUBLIC: "/api/client",
  },
  JIRA: {
    GROUP_ISSUES: "/api/jira/groups",
    ISSUES: "/api/jira/issues",
  },
  AUTH: {
    LOGIN: "/api/auth/login",
    REGISTER: "/api/auth/register",
    REGISTER_LECTURER: "/api/auth/register/lecturer",
    ME: "/api/auth/me",
  },
  ADMIN: {
    USERS: "/api/admin",
  },
  STUDENT: {
    PROFILE: "/api/students/profile",
    MY_GROUP: "/api/students/my-group",
    TASKS: "/api/students/tasks",
    GROUP_REQUIREMENTS: "/api/students/groups",
    GROUP_TASKS: "/api/students/groups",
    GROUP_PROGRESS_REPORTS: "/api/students/groups",
    STATISTICS: "/api/students/statistics",
    STATISTICS_TASKS_BY_STATUS: "/api/students/statistics/tasks-by-status",
    STATISTICS_TASKS: "/api/students/statistics/tasks",
    STATISTICS_COMMITS: "/api/students/statistics/commits",
  },
};
