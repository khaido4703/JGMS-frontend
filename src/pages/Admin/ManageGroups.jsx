import "./Table.css";
import Pagination from "../../components/Pagination";
import { useState, useEffect } from "react";
import Modal from "../../components/coreUI/Modal";
import { AdminGroupService } from "../../services/admin/adminGroup.service";
import { toast } from "react-toastify";
import React from "react";

export default function ManageGroups() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [editingGroup, setEditingGroup] = useState(null);
  const [expandedGroup, setExpandedGroup] = useState(null);
  const [groupMembers, setGroupMembers] = useState({})
  const [lecturers, setLecturers] = useState([]);
  const [students, setStudents] = useState([]);

  useEffect(() => {
    fetchGroups();
    fetchLecturers();
    fetchStudents();
  }, []);

  const [formData, setFormData] = useState({
    groupCode: "",
    groupName: "",
    lecturerId: "",
    leaderId: "",
    memberIds: [],
    status: "active"
});

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const res = await AdminGroupService.getAllGroups();
      console.log("API RESPONSE:", res.data);
      setGroups(res.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch groups");
    } finally {
      setLoading(false);
    }
  };

  const fetchLecturers = async () => {
    try {
      const res = await AdminGroupService.getLecturers(); // 👈 cần API này
      setLecturers(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchStudents = async () => {
    try {
      const res = await AdminGroupService.getStudents(); // 👈 cần API này
      setStudents(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const resetForm = () => {
    setFormData({
      groupCode: "",
      groupName: "",
      lecturerId: "",
      leaderId: "",
      memberIds: [],
      status: "active",
    });
    setEditingGroup(null);
  };

  const handleOpenCreate = () => {
    resetForm();
    setOpen(true);
  };

  const handleOpenEdit = (group) => {
    setEditingGroup(group);

    setFormData({
      groupCode: group.groupCode || "",
      groupName: group.groupName || "",
      lecturerId: group.lecturerId || "",
      leaderId: group.leaderId || "",
      status: group.status || "active"
    });

    setOpen(true);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async () => {
  try {
    if (editingGroup) {
      const payload = {
        groupCode: formData.groupCode,
        groupName: formData.groupName,
        lecturerId: String(formData.lecturerId),
        leaderId: String(formData.leaderId),
        status: formData.status
      };

      await AdminGroupService.updateGroup(
        editingGroup.groupCode,
        payload
      );

      toast.success("Group updated successfully!");
    } else {
      const payload = {
        groupCode: formData.groupCode,
        groupName: formData.groupName,
        lecturerId: String(formData.lecturerId),
        leaderId: String(formData.leaderId),
        memberIds: formData.memberIds || []
      };

      await AdminGroupService.createGroup(payload);

      toast.success("Group created successfully!");
    }

    setOpen(false);
    resetForm();
    fetchGroups();

  } catch (err) {
    console.error(err);
    toast.error("Operation failed");
  }
};

  const handleDelete = async (groupCode) => {
    if (!window.confirm("Delete this group?")) return;

    try {
      await AdminGroupService.deleteGroup(groupCode);
      toast.success("Group deleted");
      fetchGroups();
    } catch (err) {
      console.error(err);
      toast.error("Delete failed");
    }
  };

  const handleExpand = async (groupCode) => {
    if(expandedGroup === groupCode){
      setExpandedGroup(null);
      return;
    }

    try {
      const res = await AdminGroupService.getGroupDetail(groupCode);

      setGroupMembers((prev) => ({
        ...prev,
        [groupCode]: res.data.members
      }));

      setExpandedGroup(groupCode);
    } catch (err) {
      console.error("Error loading group detail",err);
    }
  }

  return (
    <>
      <div className="page-header">
        <h1>Manage Student Groups</h1>

        <button
          className="btn-primary"
          onClick={handleOpenCreate}
        >
          + Create New Group
        </button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>GROUP ID</th>
              <th>GROUP NAME</th>
              <th>LEADER</th>
              <th>LECTURER</th>
              <th>PROJECT</th>
              <th>ACTION</th>
            </tr>
          </thead>

          <tbody>
            {groups.map(group => (
            <React.Fragment key={group.groupCode}>
              <tr key={group.groupCode}
              onClick={() => handleExpand(group.groupCode)}
              style={{cursor : "pointer"}}>
                <td>{group.groupCode}</td>

                <td>
                  <strong>{group.groupName}</strong>
                  <p>{group.memberCount} Members</p>
                </td>

                <td>{group.leaderName || "No leader"}</td>

                <td>{group.lecturerName}</td>

                <td>
                  <span className="badge">
                    {group.status}
                  </span>
                </td>

                <td>
                  <div className="action-buttons">
                  <button
                    className="btn-edit"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenEdit(group);
                    }}
                  >
                    Edit
                  </button>

                  <button
                    className="btn-delete"
                    onClick={(e) =>{
                      e.stopPropagation()
                      handleDelete(group.groupCode)} }
                  >
                    Delete
                  </button>
                </div>
                </td>
              </tr>

              {expandedGroup === group.groupCode && (
                <tr>
                  <td colSpan="6">
                    <table className="member-table">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Email</th>
                          <th>Leader</th>
                          <th>Joined At</th>
                        </tr>
                      </thead>

                      <tbody>
                        {groupMembers[group.groupCode]?.map((m) => (
                          <tr key = {m.memberId}>
                            <td>{m.userName}</td>
                            <td>{m.email}</td>
                            <td>{m.isLeader ? "Leader" : "-"}</td>
                            <td>{m.joinedAt}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </td>
                </tr>
              )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      )}

      <Modal
        title={
          editingGroup
            ? "Edit Group"
            : "Create New Group"
        }
        open={open}
        onClose={() => setOpen(false)}
      >
        <div className="modal-form">

          <input
            name="groupCode"
            placeholder="Group Code (SE0000)"
            value={formData.groupCode}
            onChange={handleChange}
          />

          <input
            name="groupName"
            placeholder="Group Name"
            value={formData.groupName}
            onChange={handleChange}
          />

          <select
            name="lecturerId"
            value={formData.lecturerId}
            onChange={handleChange}
          >
            <option value="">Select Lecturer</option>
            {lecturers.map(l => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </select>

          <select
            name="leaderId"
            value={formData.leaderId}
            onChange={handleChange}
          >
            <option value="">Select Leader</option>
            {students.map(s => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>

          <select
            multiple
            value={formData.memberIds}
            onChange={(e) => {
              const values = Array.from(
                e.target.selectedOptions,
                option => option.value
              );
              setFormData({ ...formData, memberIds: values });
            }}
          >
            {students.map(s => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>

          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          <button
            className="btn-primary full"
            onClick={handleSubmit}
          >
            {editingGroup ? "Update Group" : "Create Group"}
          </button>
        </div>
      </Modal>

      <Pagination
        page={page}
        totalPages={5}
        onChange={setPage}
      />
    </>
  );
}

