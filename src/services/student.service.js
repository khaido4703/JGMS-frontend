import { BaseService } from "../config/basic.service";
import { API } from "../consts/path.api";

export const StudentService = {
  getProfile() {
    return BaseService.get({
      url: API.STUDENT.PROFILE,
      isLoading: true,
    });
  },

  getMyGroup(options = {}) {
    return BaseService.get({
      url: API.STUDENT.MY_GROUP,
      isLoading: options.isLoading ?? true,
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

  getMyTasks() {
    return BaseService.get({
      url: API.STUDENT.TASKS,
      isLoading: true,
    });
  },

  getMyTaskById(taskId) {
    return BaseService.get({
      url: `${API.STUDENT.TASKS}/${taskId}`,
      isLoading: true,
    });
  },

  updateMyTaskStatus(taskId, payload) {
    return BaseService.put({
      url: `${API.STUDENT.TASKS}/${taskId}/status`,
      payload,
      isLoading: true,
    });
  },

  completeMyTask(taskId) {
    return BaseService.post({
      url: `${API.STUDENT.TASKS}/${taskId}/complete`,
      isLoading: true,
    });
  },

  getGroupIssues(groupCode) {
    return BaseService.get({
      url: `${API.JIRA.GROUP_ISSUES}/${groupCode}/issues`,
      isLoading: true,
    });
  },

  syncGroupIssues(groupCode) {
    return BaseService.post({
      url: `${API.JIRA.GROUP_ISSUES}/${groupCode}/sync`,
      isLoading: true,
    });
  },

  getGroupIssueSyncStatus(groupCode) {
    return BaseService.get({
      url: `${API.JIRA.GROUP_ISSUES}/${groupCode}/sync-status`,
      isLoading: false,
    });
  },

  getIssueByKey(issueKey) {
    return BaseService.get({
      url: `${API.JIRA.ISSUES}/${encodeURIComponent(issueKey)}`,
      isLoading: false,
    });
  },

  getGroupRequirements(groupCode) {
    return BaseService.get({
      url: `${API.STUDENT.GROUP_REQUIREMENTS}/${groupCode}/requirements`,
      isLoading: true,
    });
  },

  getGroupTasks(groupCode) {
    return BaseService.get({
      url: `${API.STUDENT.GROUP_TASKS}/${groupCode}/tasks`,
      isLoading: true,
    });
  },

  createGroupTask(groupCode, payload) {
    return BaseService.post({
      url: `${API.STUDENT.GROUP_TASKS}/${groupCode}/tasks`,
      payload,
      isLoading: true,
    });
  },

  createGroupTaskFromJira(groupCode, payload) {
    return BaseService.post({
      url: `${API.STUDENT.GROUP_TASKS}/${groupCode}/tasks/from-jira`,
      payload,
      isLoading: true,
    });
  },

  updateGroupTask(groupCode, taskId, payload) {
    return BaseService.put({
      url: `${API.STUDENT.GROUP_TASKS}/${groupCode}/tasks/${taskId}`,
      payload,
      isLoading: true,
    });
  },

  deleteGroupTask(groupCode, taskId) {
    return BaseService.remove({
      url: `${API.STUDENT.GROUP_TASKS}/${groupCode}/tasks/${taskId}`,
      isLoading: true,
    });
  },

  createGroupRequirement(groupCode, payload) {
    return BaseService.post({
      url: `${API.STUDENT.GROUP_REQUIREMENTS}/${groupCode}/requirements`,
      payload,
      isLoading: true,
    });
  },

  importGroupRequirementsFromJira(groupCode) {
    return BaseService.post({
      url: `${API.STUDENT.GROUP_REQUIREMENTS}/${groupCode}/requirements/import-from-jira`,
      isLoading: true,
    });
  },

  updateGroupRequirement(groupCode, requirementId, payload) {
    return BaseService.put({
      url: `${API.STUDENT.GROUP_REQUIREMENTS}/${groupCode}/requirements/${requirementId}`,
      payload,
      isLoading: true,
    });
  },

  deleteGroupRequirement(groupCode, requirementId) {
    return BaseService.remove({
      url: `${API.STUDENT.GROUP_REQUIREMENTS}/${groupCode}/requirements/${requirementId}`,
      isLoading: true,
    });
  },

  getGroupProgressReports(groupCode) {
    return BaseService.get({
      url: `${API.STUDENT.GROUP_PROGRESS_REPORTS}/${groupCode}/progress-reports`,
      isLoading: true,
    });
  },

  getGroupProgressReportTemplate(groupCode) {
    return BaseService.get({
      url: `${API.STUDENT.GROUP_PROGRESS_REPORTS}/${groupCode}/progress-reports/template`,
      isLoading: true,
    });
  },

  createGroupProgressReport(groupCode, payload) {
    return BaseService.post({
      url: `${API.STUDENT.GROUP_PROGRESS_REPORTS}/${groupCode}/progress-reports`,
      payload,
      isLoading: true,
    });
  },

  getGroupSrsDocuments(groupCode) {
    return BaseService.get({
      url: `${API.STUDENT.GROUP_REQUIREMENTS}/${groupCode}/srs-documents`,
      isLoading: true,
    });
  },

  getSrsDocumentById(groupCode, documentId) {
    return BaseService.get({
      url: `${API.STUDENT.GROUP_REQUIREMENTS}/${groupCode}/srs-documents/${documentId}`,
      isLoading: true,
    });
  },

  generateSrsDocument(groupCode, payload) {
    return BaseService.post({
      url: `${API.STUDENT.GROUP_REQUIREMENTS}/${groupCode}/srs-documents/generate`,
      payload,
      isLoading: true,
    });
  },

  updateSrsDocument(groupCode, documentId, payload) {
    return BaseService.put({
      url: `${API.STUDENT.GROUP_REQUIREMENTS}/${groupCode}/srs-documents/${documentId}`,
      payload,
      isLoading: true,
    });
  },

  regenerateSrsDocument(groupCode, documentId, payload) {
    return BaseService.post({
      url: `${API.STUDENT.GROUP_REQUIREMENTS}/${groupCode}/srs-documents/${documentId}/regenerate`,
      payload,
      isLoading: true,
    });
  },

  downloadSrsDocumentHtml(groupCode, documentId) {
    return BaseService.get({
      url: `${API.STUDENT.GROUP_REQUIREMENTS}/${groupCode}/srs-documents/${documentId}/download`,
      isLoading: true,
      responseType: "text",
      headers: {
        Accept: "text/html",
      },
    });
  },

  downloadSrsDocumentDoc(groupCode, documentId) {
    return BaseService.get({
      url: `${API.STUDENT.GROUP_REQUIREMENTS}/${groupCode}/srs-documents/${documentId}/download/doc`,
      isLoading: true,
      responseType: "blob",
      headers: {
        Accept: "application/msword",
      },
    });
  },
};
