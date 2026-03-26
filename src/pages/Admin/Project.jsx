import { useEffect, useState } from "react";
import { AdminProjectService } from "../../services/admin/adminProject.service"
import { AdminGroupService } from "../../services/admin/adminGroup.service";

export default function Project() {
  const [projects, setProjects] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [githubModal, setGithubModal] = useState(false);
  const [githubData, setGithubData] = useState({
    apiToken: "",
    repoOwner: "",
    repoName: "",
    repoUrl: "",
    groupCode: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const projectRes = await AdminProjectService.getAllProjects();
      const groupRes = await AdminGroupService.getAllGroups();

      setProjects(projectRes.data || []);
      setGroups(groupRes.data || []);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const projectMap = {};
  projects.forEach((p) => {
    projectMap[p.groupCode] = p;
  });

  const openCreate = (groupCode) => {
    setEditingProject({
      groupCode,
      projectName: "",
      description: "",
      startDate: "",
      endDate: "",
    });
    setIsModalOpen(true);
  };

  const openEdit = (project) => {
    setEditingProject(project);
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    try {
      let updated;

      if (editingProject.projectId) {
        await AdminProjectService.updateProject(
          editingProject.groupCode,
          {
            projectName: editingProject.projectName,
            description: editingProject.description,
            startDate: editingProject.startDate,
            endDate: editingProject.endDate,
            status: editingProject.status || "active",
          }
        );
      } else {
        await AdminProjectService.createProject(
          editingProject.groupCode,
          {
            groupCode: editingProject.groupCode,
            projectName: editingProject.projectName,
            description: editingProject.description,
            startDate: editingProject.startDate,
            endDate: editingProject.endDate,
          }
        );
      }
      setSelectedProject(updated);

      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      console.error("Save error:", err);
      alert("Error saving project!");
    }
  };

  const handleDelete = async (groupCode) => {
    if (!window.confirm("Delete this project?")) return;

    try {
      await AdminProjectService.deleteProject(groupCode);
      fetchData();
    } catch (err) {
      console.error(err);
      alert("Delete failed!");
    }
  };

  const handleConnectGithub = async () => {
    try {
      await AdminProjectService.connectGithub(
        githubData.groupCode,
        {
          apiToken: githubData.apiToken,
          repoOwner: githubData.repoOwner,
          repoName: githubData.repoName,
          repoUrl: githubData.repoUrl,
        }
      );

      alert("Connected successfully!");
      setGithubModal(false);
    } catch (err) {
      console.error(err);
      alert("Connect failed!");
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">
        Project Management
      </h2>

      <div className="bg-white rounded-xl shadow p-4">
        <table className="w-full text-left">
          <thead className="text-green-600 text-sm">
            <tr>
              <th>GROUP ID</th>
              <th>GROUP NAME</th>
              <th>PROJECT</th>
              <th>STATUS</th>
              <th>ACTION</th>
            </tr>
          </thead>

          <tbody>
            {groups
            .filter((group) => group.memberCount > 0)
            .map((group) => {
              const project = projectMap[group.groupCode];

              return (
                <tr key={group.groupCode}
                className="hover:bg-gray-50 cursor-pointer"
                onClick={() =>project && setSelectedProject(project)}>
                  <td className="py-4">{group.groupCode}</td>

                  <td>
                    <div className="font-semibold">
                      {group.groupName}
                    </div>
                    <div className="text-sm text-gray-500">
                      {group.memberCount || 0} Members
                    </div>
                  </td>

                  <td>
                    {project
                      ? project.projectName
                      : "No project"}
                  </td>

                  <td>
                    {project ? (
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-50 text-green-600">
                        {project.status}
                      </span>
                    ) : (
                      "-"
                    )}
                  </td>

                  <td className="flex items-center gap-2">
                    {!project ? (
                      <button
                        onClick={(e) =>{
                          e.stopPropagation();
                          openCreate(group.groupCode)
                        }
                        }
                        className="px-3 py-1.5 rounded-lg bg-green-500 text-white hover:bg-green-600 transition text-sm font-medium shadow-sm"
                      >
                        Create
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openEdit(project)
                          }}
                          className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition text-sm font-medium"
                        >
                          Edit
                        </button>

                        <button
                          onClick={(e) =>{
                            e.stopPropagation();
                            handleDelete(group.groupCode)
                          }  
                          }
                          className="px-3 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition text-sm font-medium"
                        >
                          Delete
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setGithubData((prev) => ({
                              ...prev,
                              groupCode: group.groupCode,
                            }));
                            setGithubModal(true);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-black text-white hover:bg-gray-800 text-sm font-medium flex items-center gap-1"
                        >
                          GitHub
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center pointer-events-none">
          <div className="bg-white w-[400px] p-6 rounded-xl shadow-xl pointer-events-auto border">
            <h3 className="text-lg font-semibold mb-4">
              {editingProject?.projectId
                ? "Edit Project"
                : "Create Project"}
            </h3>

            <input
              className="w-full border p-2 mb-3 rounded"
              placeholder="Project Name"
              value={editingProject.projectName}
              onChange={(e) =>
                setEditingProject({
                  ...editingProject,
                  projectName: e.target.value,
                })
              }
            />

            <textarea
              className="w-full border p-2 mb-3 rounded"
              placeholder="Description"
              value={editingProject.description}
              onChange={(e) =>
                setEditingProject({
                  ...editingProject,
                  description: e.target.value,
                })
              }
            />

            <input
              type="date"
              className="w-full border p-2 mb-3 rounded"
              value={editingProject.startDate}
              onChange={(e) =>
                setEditingProject({
                  ...editingProject,
                  startDate: e.target.value,
                })
              }
            />

            <input
              type="date"
              className="w-full border p-2 mb-3 rounded"
              value={editingProject.endDate}
              onChange={(e) =>
                setEditingProject({
                  ...editingProject,
                  endDate: e.target.value,
                })
              }
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 border rounded"
              >
                Cancel
              </button>

              <button
                onClick={handleSave}
                className="px-4 py-2 bg-green-500 text-white rounded"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {githubModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">

          <div className="bg-white w-[420px] p-6 rounded-xl shadow-xl">

            <h2 className="text-lg font-semibold mb-4">
              Connect GitHub
            </h2>

            <div className="space-y-3">

              <input
                placeholder="GitHub Token"
                value={githubData.apiToken}
                onChange={(e) =>
                  setGithubData({ ...githubData, apiToken: e.target.value })
                }
                className="w-full border p-2 rounded"
              />

              <input
                placeholder="Repo Owner (username/org)"
                value={githubData.repoOwner}
                onChange={(e) =>
                  setGithubData({ ...githubData, repoOwner: e.target.value })
                }
                className="w-full border p-2 rounded"
              />

              <input
                placeholder="Repo Name"
                value={githubData.repoName}
                onChange={(e) =>
                  setGithubData({ ...githubData, repoName: e.target.value })
                }
                className="w-full border p-2 rounded"
              />

              <input
                placeholder="Repo URL"
                value={githubData.repoUrl}
                onChange={(e) =>
                  setGithubData({ ...githubData, repoUrl: e.target.value })
                }
                className="w-full border p-2 rounded"
              />

            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setGithubModal(false)}
                className="px-4 py-2 bg-gray-100 rounded"
              >
                Cancel
              </button>

              <button
                onClick={handleConnectGithub}
                className="px-4 py-2 bg-green-500 text-white rounded"
              >
                Connect
              </button>
            </div>

          </div>
        </div>
      )}

      {selectedProject && (
        <div className="fixed top-0 right-0 h-full w-[400px] bg-white shadow-xl z-50 p-6 border-l">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">
              Project Detail
            </h2>

            <button onClick={() => setSelectedProject(null)}>
              ✕
            </button>
          </div>

          <div className="space-y-4 text-sm">

            <div>
              <div className="text-gray-400">Project Name</div>
              <div className="font-medium">
                {selectedProject.projectName}
              </div>
            </div>

            <div>
              <div className="text-gray-400">Description</div>
              <div>
                {selectedProject.description || "No description"}
              </div>
            </div>

            <div>
              <div className="text-gray-400">Status</div>
              <span className="px-2 py-1 rounded bg-green-50 text-green-600 text-xs">
                {selectedProject.status}
              </span>
            </div>

            <div>
              <div className="text-gray-400">Start Date</div>
              <div>{selectedProject.startDate}</div>
            </div>

            <div>
              <div className="text-gray-400">End Date</div>
              <div>{selectedProject.endDate}</div>
            </div>

          </div>

          <div className="mt-6 flex gap-2">
            <button
              onClick={(e) =>{
                e.stopPropagation();
                openEdit(selectedProject)}}
              className="flex-1 bg-blue-50 text-blue-600 py-2 rounded-lg"
            >
              Edit
            </button>

            <button
              onClick={(e) =>{ 
                e.stopPropagation();
                handleDelete(selectedProject.groupCode)}}
              className="flex-1 bg-red-50 text-red-600 py-2 rounded-lg"
            >
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  ); 
}