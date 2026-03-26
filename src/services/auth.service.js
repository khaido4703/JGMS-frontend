import { BaseService } from "../config/basic.service";
import { API } from "../consts/path.api";

export const AuthService = {
  login({ email, password } = {}) {
    return BaseService.post({
      url: API.AUTH.LOGIN,
      payload: { email, password },
      isLoading: true,
    });
  },

  registerStudent({ email, password, fullName, phone, studentCode } = {}) {
    return BaseService.post({
      url: API.AUTH.REGISTER,
      payload: { email, password, fullName, phone, studentCode },
      isLoading: true,
    });
  },

  registerLecturer({ email, password, fullName, phone } = {}) {
    return BaseService.post({
      url: API.AUTH.REGISTER_LECTURER,
      payload: { email, password, fullName, phone },
      isLoading: true,
    });
  },
  register(payload = {}) {
    return this.registerStudent(payload);
  },
};