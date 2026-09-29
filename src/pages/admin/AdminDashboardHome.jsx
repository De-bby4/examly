import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import { Users, FileText, UserCheck, GraduationCap, Check, ArrowRight } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import CircularProgress from "../../components/CircularProgress";
import {
  getAllUsers,
  getAllExamsAdmin,
  getPendingTeachers,
  approveTeacher,
} from "../../services/adminService";

const roleStyles = {
  STUDENT: "bg-lavender text-primary",
  TEACHER: "bg-warning/10 text-warning",
  ADMIN: "bg-error/10 text-error",
};

const statusStyles = {
  AVAILABLE: "bg-success/10 text-success",
  UPCOMING: "bg-warning/10 text-warning",
  CLOSED: "bg-gray-500/10 text-text-secondary",
  DRAFT: "bg-lavender text-primary",
};

function initials(name = "") {
  return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}

function AdminDashboardHome() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [exams, setExams] = useState([]);
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [approvingId, setApprovingId] = useState(null);

  useEffect(() => {
    Promise.all([getAllUsers(), getAllExamsAdmin(), getPendingTeachers()])
      .then(([usersData, examsData, pendingData]) => {
        setUsers(usersData);
        setExams(examsData);
        setPending(pendingData);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleApprove = async (id) => {
    setApprovingId(id);
    try {
      await approveTeacher(id);
      setPending((prev) => prev.filter((t) => t.id !== id));
    } finally {
      setApprovingId(null);
    }
  };

  if (loading) return <p className="text-text-secondary">Loading dashboard...</p>;

  const studentCount = users.filter((u) => u.role === "STUDENT").length;
  const teacherCount = users.filter((u) => u.role === "TEACHER").length;
  const adminCount = users.filter((u) => u.role === "ADMIN").length;

  const roleData = [
    { name: "Students", value: studentCount },
    { name: "Teachers", value: teacherCount },
    { name: "Admins", value: adminCount },
  ];
  const roleColors = ["var(--color-primary)", "var(--color-warning)", "var(--color-error)"];

  const publishedCount = exams.filter((e) => e.published).length;
  const draftCount = exams.length - publishedCount;
  const publishedPercent = exams.length ? Math.round((publishedCount / exams.length) * 100) : 0;

  // No created-date field exists, so the highest IDs are treated as the newest.
  const recentUsers = [...users].sort((a, b) => b.id - a.id).slice(0, 5);
  const recentExams = [...exams].sort((a, b) => b.id - a.id).slice(0, 5);

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-text-primary">Welcome back, {user?.name} 👋</h1>
      <p className="mt-1 text-text-secondary">Here's what's happening across the platform.</p>

      {/* Stat cards */}
      <div className="mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:grid md:grid-cols-4 md:overflow-visible md:pb-0">
        {[
          { label: "Total Users", value: users.length, icon: Users, tone: "bg-lavender text-primary" },
          { label: "Students", value: studentCount, icon: GraduationCap, tone: "bg-lavender text-primary" },
          { label: "Teachers", value: teacherCount, icon: Users, tone: "bg-warning/10 text-warning" },
          { label: "Total Exams", value: exams.length, icon: FileText, tone: "bg-success/10 text-success" },
        ].map(({ label, value, icon: Icon, tone }) => (
          <div key={label} className="w-[72%] shrink-0 snap-start rounded-2xl bg-surface p-5 shadow-sm md:w-auto">
            <div className="flex items-center justify-between">
              <p className="text-sm text-text-secondary">{label}</p>
              <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${tone}`}>
                <Icon size={16} />
              </span>
            </div>
            <p className="mt-3 text-3xl font-extrabold text-text-primary">{value}</p>
          </div>
        ))}
      </div>

      {/* Charts + pending */}
      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        {/* Users by role */}
        <div className="rounded-2xl bg-surface p-6 shadow-sm">
          <h2 className="font-bold text-text-primary">Users by Role</h2>
          <div className="relative mx-auto mt-4 h-40 w-40">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={roleData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={50}
                  outerRadius={72}
                  cornerRadius={6}
                  paddingAngle={4}
                  stroke="none"
                >
                  {roleData.map((entry, i) => (
                    <Cell key={entry.name} fill={roleColors[i]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--color-app-bg)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "8px",
                    fontSize: "13px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-extrabold text-text-primary">{users.length}</span>
              <span className="text-xs text-text-secondary">Users</span>
            </div>
          </div>
          <div className="mt-4 space-y-2">
            {roleData.map((r, i) => (
              <div key={r.name} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-text-secondary">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: roleColors[i] }} />
                  {r.name}
                </span>
                <span className="font-semibold text-text-primary">{r.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Published exams */}
        <div className="flex flex-col items-center rounded-2xl bg-surface p-6 shadow-sm">
          <h2 className="self-start font-bold text-text-primary">Published Exams</h2>
          <div className="my-auto py-4">
            <CircularProgress value={publishedPercent} color="var(--color-success)" />
          </div>
          <p className="text-sm text-text-secondary">
            <span className="font-semibold text-text-primary">{publishedCount}</span> published ·{" "}
            <span className="font-semibold text-text-primary">{draftCount}</span> drafts
          </p>
        </div>

        {/* Pending teachers */}
        <div className="rounded-2xl bg-surface p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-text-primary">Pending Teachers</h2>
            {pending.length > 0 && (
              <span className="rounded-full bg-warning/10 px-2.5 py-0.5 text-xs font-semibold text-warning">
                {pending.length}
              </span>
            )}
          </div>

          {pending.length === 0 ? (
            <div className="mt-6 flex flex-col items-center py-6 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-success/10 text-success">
                <UserCheck size={20} />
              </span>
              <p className="mt-3 text-sm text-text-secondary">All caught up. No one is waiting.</p>
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              {pending.slice(0, 4).map((t) => (
                <div key={t.id} className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-text-primary">{t.name}</p>
                    <p className="truncate text-xs text-text-secondary">{t.email}</p>
                  </div>
                  <button
                    onClick={() => handleApprove(t.id)}
                    disabled={approvingId === t.id}
                    className="flex shrink-0 items-center gap-1 rounded-lg bg-success px-3 py-1.5 text-xs font-semibold text-white hover:opacity-90 disabled:opacity-60"
                  >
                    <Check size={13} />
                    {approvingId === t.id ? "..." : "Approve"}
                  </button>
                </div>
              ))}
            </div>
          )}

          <button
            onClick={() => navigate("/admin/pending-teachers")}
            className="mt-5 flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
          >
            Review all
            <ArrowRight size={14} />
          </button>
        </div>
      </div>

      {/* Recent activity */}
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl bg-surface p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-text-primary">Newest Users</h2>
            <button
              onClick={() => navigate("/admin/users")}
              className="text-sm font-semibold text-primary hover:underline"
            >
              View all
            </button>
          </div>
          <div className="mt-4 space-y-3">
            {recentUsers.map((u) => (
              <div key={u.id} className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-lavender text-xs font-bold text-primary">
                    {initials(u.name)}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-text-primary">{u.name}</p>
                    <p className="truncate text-xs text-text-secondary">{u.email}</p>
                  </div>
                </div>
                <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${roleStyles[u.role]}`}>
                  {u.role}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl bg-surface p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-text-primary">Newest Exams</h2>
            <button
              onClick={() => navigate("/admin/exams")}
              className="text-sm font-semibold text-primary hover:underline"
            >
              View all
            </button>
          </div>
          {recentExams.length === 0 ? (
            <p className="mt-4 text-sm text-text-secondary">No exams have been created yet.</p>
          ) : (
            <div className="mt-4 space-y-3">
              {recentExams.map((e) => (
                <div key={e.id} className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-text-primary">{e.title}</p>
                    <p className="truncate text-xs text-text-secondary">by {e.creatorName}</p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      statusStyles[e.status] || statusStyles.DRAFT
                    }`}
                  >
                    {e.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboardHome;