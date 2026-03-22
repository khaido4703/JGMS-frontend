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
      setGroups((res.data || []).filter(g => g.status === "active"));
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch groups");
    } finally {
      setLoading(false);
    }
  };

  const fetchLecturers = async () => {
    try {
      const res = await AdminGroupService.getLecturers();
      setLecturers(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchStudents = async () => {
    try {
      const res = await AdminGroupService.getStudents();
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
  if (!formData.groupCode || !formData.groupName) {
    toast.error("Please fill all required fields");
    return;
  }

  if (!formData.leaderId) {
    toast.error("Please select a leader");
    return;
  }

  if (!formData.lecturerId) {
    toast.error("Please select a lecturer");
    return;
  }

  if (!editingGroup && formData.memberIds.length === 0) {
    toast.error("Please select at least 1 member");
    return;
  }

  try {
    if (editingGroup) {
      await AdminGroupService.updateGroup(
      editingGroup.groupCode,
      {
        groupCode: formData.groupCode,
        groupName: formData.groupName,
        lecturerId: String(formData.lecturerId),
        leaderId: String(formData.leaderId),
        status: formData.status
      }
  );
      if (formData.newMemberIds?.length > 0) {
        await AdminGroupService.addMembers(
          editingGroup.groupCode,
          {
            studentIdentifiers: formData.newMemberIds.map(Number)
          }
        );
  }
      toast.success("Group updated!");
    } else {
      const existing = groups.find(
        g => g.groupCode === formData.groupCode
      );

      let members = formData.memberIds.map(Number);

      if (!members.includes(Number(formData.leaderId))) {
        members.push(Number(formData.leaderId));
      }
      const uniqueMembers = [...new Set(members)];

      await AdminGroupService.addMembers(existing.groupCode, {
        studentIdentifiers: uniqueMembers
      });

      if (existing) {
        if (existing.status === "inactive") {
          await AdminGroupService.updateGroup(existing.groupCode, {
            groupCode: formData.groupCode,
            groupName: formData.groupName,
            lecturerId: String(formData.lecturerId),
            leaderId: String(formData.leaderId),
            status: "active"
          });

          await AdminGroupService.addMembers(existing.groupCode, {
            studentIdentifiers: members.map(Number)
          });

          toast.success("Group restored with members!");
        } else {
          toast.error("Group code already exists!");
          return;
        }
      } else {
        const payload = {
          groupCode: formData.groupCode,
          groupName: formData.groupName,
          lecturerId: String(formData.lecturerId),
          leaderId: String(formData.leaderId),
          memberIds: members.map(String)
        };

        await AdminGroupService.createGroup(payload);

        toast.success("Group created successfully!");
      }
    }

    setOpen(false);
    resetForm();
    fetchGroups();

  } catch (err) {
    console.error(err);
    toast.error("Operation failed");
  }
}

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

  const handleLeaderChange = (e) => {
  const leaderId = e.target.value;

  let members = [...formData.memberIds];

  if (!members.includes(leaderId)) {
    members.push(leaderId);
  }

  setFormData({
    ...formData,
    leaderId,
    memberIds: members
  });
};

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
                          <th>Action</th>
                        </tr>
                      </thead>

                      <tbody>
                        {groupMembers[group.groupCode]?.map((m) => (
                          <tr key = {m.memberId}>
                            <td>{m.userName}</td>
                            <td>{m.email}</td>
                            <td>{m.isLeader ? "Leader" : "-"}</td>
                            <td>{m.joinedAt}</td>
                            <td>
                              {!m.isLeader && (
                                <button
                                  onClick={async (e) => {
                                    e.stopPropagation();

                                    if (!window.confirm("Remove this member?")) return;

                                    await AdminGroupService.removeMember(
                                      group.groupCode,
                                      m.memberId
                                    );

                                    toast.success("Member removed!");
                                    handleExpand(group.groupCode);
                                  }}
                                >
                                  Remove
                                </button>
                            )}
                            </td>
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
              <option key={l.userId} value={l.userId}>
                {l.fullName}
              </option>
            ))}
          </select>

          <select
            name="leaderId"
            value={formData.leaderId}
            onChange={handleLeaderChange}
          >
            <option value="">Select Leader</option>
            {students.map(s => (
              <option key={s.userId} value={s.userId}>
                {s.fullName}
              </option>
            ))}
          </select>

          {!editingGroup && (
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
                <option key={s.userId} value={s.userId}>
                  {s.fullName}
                </option>
              ))}
            </select>
          )}

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

