import { BaseService } from "../../config/basic.service";

export const AdminManageLectureService = {
    getAllLecture() {
        return BaseService.get({
            url : "/api/admin/lecturers",
        });
    }
}