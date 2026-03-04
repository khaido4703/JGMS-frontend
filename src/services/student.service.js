import { BaseService } from "../config/basic.service";
import { API } from "../consts/path.api";

export const StudentService = {
  getProfile() {
    return BaseService.get({
      url: API.STUDENT.PROFILE,
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
};
