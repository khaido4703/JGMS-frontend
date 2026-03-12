import "./Table.css";
import Pagination from "../../components/Pagination";
import Modal from "../../components/coreUI/Modal";
import { AdminManageLectureService } from "../../services/admin/adminLecturer.service";
import { useEffect,useState } from "react";

export default function ManageLectures() {
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [lecturers, setLecturers] = useState([])
  
  useEffect(() => {
    fetchLecturers();
  }, []);

  const fetchLecturers = async () => {
    try {
      setLoading(true);
      const res = await AdminManageLectureService.getAllLecture();
      setLecturers(res.data);
    } catch (error) {
      console.error("Error fetching lecturers:", error);
    } finally {
      setLoading(false);
    }
  };
  return (
    <>
      <div className="page-header">
        <h1>Manage Lecturers</h1>
        <button className="btn-primary" onClick={() => setOpen(true)}>
          + Add Lecturer
        </button>
      </div>

        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>LECTURER NAME</th>
              <th>EMAIL</th>
              <th>PHONE</th>
              <th>GROUPS</th>
              <th>ACTION</th>
            </tr>
          </thead>

          <tbody>
            {lecturers.map((lec) => (
              <tr key={lec.userId}>
                <td>{lec.userId}</td>
                <td>{lec.fullName}</td>
                <td>{lec.email}</td>
                <td>{lec.phone}</td>
                <td>-</td>
                <td>
                  <button>Edit</button>
                  <button>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <Modal
        title="Add Lecturer"
        open={open}
        onClose={() => setOpen(false)}
      >
        <input placeholder="Lecturer Name" />
        <input placeholder="Email" />
        <input placeholder="Subject" />
        <input placeholder="Phone" />
        <button className="btn-primary full">Add</button>
      </Modal>

      <Pagination
        page={page}
        totalPages={5}
        onChange={setPage}
      />
    </>
  );
}
