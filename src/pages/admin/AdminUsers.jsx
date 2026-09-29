import { useEffect, useState } from "react";
import { Trash2, Users, Search, X, Ban, RotateCcw } from "lucide-react";
import { getAllUsers, deleteUser, suspendUser, unsuspendUser } from "../../services/adminService";
import ConfirmDialog from "../../components/ConfirmDialog";

const roleStyles = {
  STUDENT: "bg-lavender text-primary",
  TEACHER: "bg-warning/10 text-warning",
  ADMIN: "bg-error/10 text-error",
};

const ROLE_FILTERS = [
  { value: "ALL", label: "All" },
  { value: "STUDENT", label: "Students" },
  { value: "TEACHER", label: "Teachers" },
  { value: "ADMIN", label: "Admins" },
];

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [suspendTarget, setSuspendTarget] = useState(null);
  const [togglingId, setTogglingId] = useState(null);
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");

  useEffect(() => {
    getAllUsers().then((data) => {
      setUsers(data);
      setLoading(false);
    });
  }, []);

  const handleDelete = async () => {
    await deleteUser(deleteTarget.id);
    setUsers((prev) => prev.filter((u) => u.id !== deleteTarget.id));
    setDeleteTarget(null);
  };

  const handleToggleSuspend = async () => {
    const { id, suspended } = suspendTarget;
    setTogglingId(id);
    try {
      if (suspended) {
        await unsuspendUser(id);
      } else {
        await suspendUser(id);
      }
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, suspended: !suspended } : u))
      );
    } finally {
      setTogglingId(null);
      setSuspendTarget(null);
    }
  };

  const term = query.trim().toLowerCase();
  const filtered = users.filter((u) => {
    if (roleFilter !== "ALL" && u.role !== roleFilter) return false;
    if (!term) return true;

    return (
      u.name?.toLowerCase().includes(term) ||
      u.email?.toLowerCase().includes(term)
    );
  });

  const clearFilters = () => {
    setQuery("");
    setRoleFilter("ALL");
  };

  if (loading) return <p className="text-text-secondary">Loading users...</p>;

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-text-primary">Users</h1>
      <p className="mt-1 text-text-secondary">All accounts on the platform.</p>

      {users.length === 0 ? (
        <div className="mt-6 flex flex-col items-center justify-center rounded-2xl bg-surface py-12 text-center shadow-sm">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-lavender text-primary">
            <Users size={20} />
          </span>
          <p className="mt-3 text-sm text-text-secondary">No users found.</p>
        </div>
      ) : (
        <>
          <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full lg:max-w-xs">
              <Search
                size={17}
                aria-hidden="true"
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary"
              />

              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                aria-label="Search users by name or email"
                placeholder="Search by name or email"
                className="w-full rounded-xl border border-border bg-surface py-2 pl-10 pr-10 text-sm text-text-primary outline-none transition placeholder:text-text-secondary/60 focus:border-primary focus:ring-2 focus:ring-primary/20"
              />

              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  aria-label="Clear search"
                  className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg text-text-secondary transition hover:bg-app-bg hover:text-text-primary"
                >
                  <X size={15} aria-hidden="true" />
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {ROLE_FILTERS.map(({ value, label }) => {
                const selected = roleFilter === value;

                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setRoleFilter(value)}
                    aria-pressed={selected}
                    className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
                      selected
                        ? "border-primary bg-primary/15 text-primary"
                        : "border-border text-text-secondary hover:border-primary/40 hover:text-primary"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          <p className="mt-4 text-sm text-text-secondary">
            Showing {filtered.length} of {users.length}
          </p>

          {filtered.length === 0 ? (
            <div className="mt-4 flex flex-col items-center justify-center rounded-2xl bg-surface py-12 text-center shadow-sm">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-lavender text-primary">
                <Search size={20} aria-hidden="true" />
              </span>

              <p className="mt-3 text-sm text-text-secondary">
                {term
                  ? `No users match “${query.trim()}”.`
                  : "No users with that role."}
              </p>

              <button
                type="button"
                onClick={clearFilters}
                className="mt-4 rounded-lg border border-border px-4 py-2 text-sm font-semibold text-text-primary transition hover:bg-app-bg"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <div className="mt-4 overflow-x-auto rounded-2xl bg-surface shadow-sm">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead className="border-b border-border bg-app-bg text-text-secondary">
                  <tr>
                    <th className="px-5 py-3 font-semibold">Name</th>
                    <th className="px-5 py-3 font-semibold">Email</th>
                    <th className="px-5 py-3 font-semibold">Role</th>
                    <th className="px-5 py-3 font-semibold">Status</th>
                    <th className="px-5 py-3 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((u) => (
                    <tr key={u.id} className="border-b border-border last:border-0">
                      <td className="px-5 py-4 font-semibold text-text-primary">
                        {u.name}
                      </td>
                      <td className="px-5 py-4 text-text-secondary">{u.email}</td>
                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${roleStyles[u.role]}`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        {u.suspended ? (
                          <span className="rounded-full bg-error/10 px-3 py-1 text-xs font-semibold text-error">
                            Suspended
                          </span>
                        ) : (
                          <span className="rounded-full bg-success/10 px-3 py-1 text-xs font-semibold text-success">
                            Active
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          {u.role !== "ADMIN" && (
                            <button
                              onClick={() => setSuspendTarget(u)}
                              disabled={togglingId === u.id}
                              title={u.suspended ? "Unsuspend" : "Suspend"}
                              aria-label={`${u.suspended ? "Unsuspend" : "Suspend"} ${u.name}`}
                              className="rounded-lg p-2 text-text-secondary hover:bg-app-bg hover:text-warning disabled:opacity-50"
                            >
                              {u.suspended ? (
                                <RotateCcw size={16} aria-hidden="true" />
                              ) : (
                                <Ban size={16} aria-hidden="true" />
                              )}
                            </button>
                          )}
                          <button
                            onClick={() => setDeleteTarget(u)}
                            title="Delete"
                            aria-label={`Delete ${u.name}`}
                            className="rounded-lg p-2 text-text-secondary hover:bg-error/10 hover:text-error"
                          >
                            <Trash2 size={16} aria-hidden="true" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete this user?"
        message={`"${deleteTarget?.name}" will be permanently deleted. This cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      <ConfirmDialog
        open={!!suspendTarget}
        title={suspendTarget?.suspended ? "Unsuspend this user?" : "Suspend this user?"}
        message={
          suspendTarget?.suspended
            ? `"${suspendTarget?.name}" will be able to log in again.`
            : `"${suspendTarget?.name}" won't be able to log in until unsuspended. Their data stays intact.`
        }
        confirmLabel={suspendTarget?.suspended ? "Unsuspend" : "Suspend"}
        onConfirm={handleToggleSuspend}
        onCancel={() => setSuspendTarget(null)}
      />
    </div>
  );
}

export default AdminUsers;