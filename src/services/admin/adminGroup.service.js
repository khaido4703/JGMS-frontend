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
  }
};