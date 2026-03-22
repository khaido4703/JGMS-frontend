import { BaseService } from "../../config/basic.service";

export const AdminGroupService = {
  getAllGroups() {
    return BaseService.get({
      url: "/api/admin/groups",
    });
  },

  createGroup(payload) {
    return BaseService.post({
      url: "/api/admin/groups",
      payload,
    });
  },

  updateGroup(groupCode, payload) {
    return BaseService.put({
      url: `/api/admin/groups/${groupCode}`,
      payload,
    });
  },

  deleteGroup(groupCode) {
    return BaseService.remove({
      url: `/api/admin/groups/${groupCode}`,
    });
  },

  getGroupDetail(groupCode){
    return BaseService.get({
      url: `/api/admin/groups/${groupCode}`
    })
  },

  getLecturers() {
    return BaseService.get({
      url: "/api/admin/lecturers",
    });
  },

  getStudents() {
    return BaseService.get({
      url: "/api/admin/students/available",
    });
  },

  addMembers(groupCode, payload) {
    return BaseService.post({
      url: `/api/admin/groups/${groupCode}/members`,
      payload,
    });
  },

  removeMember(groupCode, studentId) {
    return BaseService.remove({
      url: `/api/admin/groups/${groupCode}/members/${studentId}`,
    });
  },
}

 

  