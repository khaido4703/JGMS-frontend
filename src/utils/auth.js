import { LOCAL_STORAGE, ROLE } from "../consts/const";
import { ROUTER_URL } from "../consts/router.const";

export const decodeJWT = (token) => {
  try {
    if (!token) return null;
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
};

export const normalizeRole = (rawRole) => {
  if (!rawRole) return null;
  const value = String(rawRole).trim().toUpperCase();
  const cleaned = value.replace(/\s+/g, "_");

  if (cleaned === "ADMIN") return ROLE.ADMIN;
  if (cleaned === "LECTURER") return ROLE.LECTURER;
  if (cleaned === "STUDENT" || cleaned === "MEMBER" || cleaned === "TEAM_MEMBER") return ROLE.STUDENT;

  return cleaned;
};

export const getStoredUser = () => {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE.AUTH_USER);
    if (raw) return JSON.parse(raw);
  } catch {
    // Ignore malformed data and fall back to other keys.
  }

  try {
    const rawAdmin = localStorage.getItem(LOCAL_STORAGE.ACCOUNT_ADMIN);
    if (rawAdmin) {
      const adminUser = JSON.parse(rawAdmin);
      if (!adminUser?.role && !adminUser?.userRole) {
        return { ...adminUser, role: ROLE.ADMIN };
      }
      return adminUser;
    }
  } catch {
    return null;
  }

  return null;
};

export const clearStoredUser = () => {
  localStorage.removeItem(LOCAL_STORAGE.AUTH_USER);
  localStorage.removeItem(LOCAL_STORAGE.ACCOUNT_ADMIN);
};

export const getUserRole = (user) => {
  if (!user) return null;
  const rawRole =
    user.role ||
    user.userRole ||
    user?.account?.role ||
    user?.account?.userRole;
  return normalizeRole(rawRole);
};

export const getDashboardPathByRole = (role) => {
  switch (normalizeRole(role)) {
    case ROLE.ADMIN:
      return ROUTER_URL.ADMIN.PROJECT;
    case ROLE.LECTURER:
      return ROUTER_URL.LECTURER.DASHBOARD;
    case ROLE.STUDENT:
      return ROUTER_URL.COMMON.HOME;
    default:
      return ROUTER_URL.COMMON.LOGIN;
  }
};
