import { BaseService } from "../config/basic.service";
import { API } from "../consts/path.api";

export const StudentService = {
  getProfile() {
    return BaseService.get({
      url: API.STUDENT.PROFILE,
      isLoading: true,
    });
  },

  getMyGroup() {
    return BaseService.get({
      url: API.STUDENT.MY_GROUP,
      isLoading: true,
    });
  },

  updateProfile(payload) {
    return BaseService.put({
      url: API.STUDENT.PROFILE,
      payload,
      isLoading: true,
    });
  },

  getStatistics(projectId) {
    const url = projectId
      ? `${API.STUDENT.STATISTICS}?projectId=${projectId}`
      : API.STUDENT.STATISTICS;
    return BaseService.get({ url, isLoading: false });
  },

  getStatisticsTasksByStatus() {
    return BaseService.get({
      url: API.STUDENT.STATISTICS_TASKS_BY_STATUS,
      isLoading: false,
    });
  },

  getStatisticsTasks() {
    return BaseService.get({
      url: API.STUDENT.STATISTICS_TASKS,
      isLoading: false,
    });
  },

  getStatisticsCommits() {
    return BaseService.get({
      url: API.STUDENT.STATISTICS_COMMITS,
      isLoading: false,
    });
  },
};
