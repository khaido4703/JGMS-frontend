export const API = {
  COMMON: {
    PUBLIC: "/api/client",
  },
  AUTH: {
    LOGIN: "/api/auth/login",
    LOGIN_EMAIL: "/api/auth/login/email",
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
    STATISTICS: "/api/students/statistics",
    STATISTICS_TASKS_BY_STATUS: "/api/students/statistics/tasks-by-status",
    STATISTICS_TASKS: "/api/students/statistics/tasks",
    STATISTICS_COMMITS: "/api/students/statistics/commits",
  },
};