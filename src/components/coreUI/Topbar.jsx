import { useState, useRef, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import "./Topbar.css";
import { BaseService } from "../../config/basic.service.js";

export default function Topbar() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    setOpen(false);
    logout();
  };

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const delay = setTimeout(async () => {
      try {
        setLoading(true);

       const res = await BaseService.get({
          url: `/api/admin/users/search?q=${query}`,
        });
        setResults(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(delay);
  }, [query]);
  const avatarLetter = user?.email?.charAt(0).toUpperCase() || "U";
  const displayName = user?.email?.split("@")[0] || "User";

  return (
    <div className="topbar">
      <input
        className="topbar-search"
        placeholder="Search user gmail."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      {query && (
        <div className="search-dropdown">
          {loading && <div className="p-2">Loading...</div>}

          {!loading && results.length === 0 && (
            <div className="p-2 text-gray-400">No results</div>
          )}

          {results.map((u) => (
            <div
              key={u.id}
              className="search-item"
              onClick={() => {
                setSelectedUser(u);
                setQuery("");
              }}
            >
              <div>{u.email}</div>
              <div className="text-xs text-gray-400">
                {u.role}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="topbar-user" ref={menuRef}>
        <div className="user-trigger" onClick={() => setOpen(!open)}>
          <div className="user-info">
            <strong>{displayName}</strong>
          </div>
          <div className="avatar">{avatarLetter}</div>
        </div>

        {open && (
          <div className="dropdown">
            <button>View Profile</button>
            <button>Settings</button>
            <hr />
            <button className="danger" onClick={handleLogout}>
              Logout
            </button>
          </div>
        )}
      </div>

      {selectedUser && (
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
          
          <div className="bg-white w-[400px] rounded-xl shadow-xl p-6 border pointer-events-auto">

            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">
                User Detail
              </h2>

              <button onClick={() => setSelectedUser(null)}>
                ✕
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <div>
                <div className="text-gray-400">Email</div>
                <div className="font-medium">
                  {selectedUser.email}
                </div>
              </div>

              <div>
                <div className="text-gray-400">Role</div>
                <span className="px-2 py-1 rounded bg-green-50 text-green-600 text-xs">
                  {selectedUser.role}
                </span>
              </div>

              <div>
                <div className="text-gray-400">User ID</div>
                <div>{selectedUser.id}</div>
              </div>
            </div>

            <div className="mt-5 flex gap-2">
              <button className="flex-1 bg-blue-50 text-blue-600 py-2 rounded-lg">
                View Profile
              </button>

              <button className="flex-1 bg-gray-100 py-2 rounded-lg">
                Close
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
