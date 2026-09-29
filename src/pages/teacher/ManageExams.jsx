import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Pencil, Trash2, Eye, EyeOff, FileText, BarChart3 } from "lucide-react";
import { getMyExams, togglePublish, deleteExam } from "../../services/examService";
import ConfirmDialog from "../../components/ConfirmDialog";
import { useAuth } from "../../context/AuthContext";

function ManageExams() {
  const { user } = useAuth();
  const [exams, setExams] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const navigate = useNavigate();

  const loadExams = (query) => {
    setLoading(true);
    getMyExams(query).then((data) => {
      setExams(data);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadExams();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    loadExams(search);
  };

  const handleTogglePublish = async (exam) => {
    const updated = await togglePublish(exam.id);
    setExams((prev) => prev.map((e) => (e.id === exam.id ? updated : e)));
  };

  const handleDelete = async () => {
    await deleteExam(deleteTarget.id);
    setExams((prev) => prev.filter((e) => e.id !== deleteTarget.id));
    setDeleteTarget(null);
  };

  const statusStyles = {
    AVAILABLE: "bg-success/10 text-success",
    UPCOMING: "bg-warning/10 text-warning",
    CLOSED: "bg-gray-500/10 text-text-secondary",
    DRAFT: "bg-lavender text-primary",
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-text-primary">Manage Exams</h1>
          <p className="mt-1 text-text-secondary">Create, edit, and publish your exams.</p>
        </div>
        <button
  onClick={() => navigate("/teacher/exams/new")}
  disabled={user?.accountStatus === "PENDING"}
  title={user?.accountStatus === "PENDING" ? "Pending admin approval" : ""}
  className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-50"
>
  <Plus size={16} />
  Create Exam
</button>
      </div>

      <form onSubmit={handleSearch} className="mt-6 flex gap-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search your exams..."
          className="w-full max-w-sm rounded-lg border border-border bg-surface px-4 py-2.5 text-text-primary outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
        <button
          type="submit"
          className="rounded-lg bg-lavender px-5 py-2.5 text-sm font-semibold text-primary hover:opacity-90"
        >
          Search
        </button>
      </form>

      {loading ? (
        <p className="mt-6 text-text-secondary">Loading exams...</p>
      ) : exams.length === 0 ? (
        <div className="mt-6 flex flex-col items-center justify-center rounded-2xl bg-surface py-12 text-center shadow-sm">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-lavender text-primary">
            <FileText size={20} />
          </span>
          <p className="mt-3 text-sm text-text-secondary">No exams found.</p>
        </div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-2xl bg-surface shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-app-bg text-text-secondary">
              <tr>
                <th className="px-5 py-3 font-semibold">Title</th>
                <th className="px-5 py-3 font-semibold">Duration</th>
                <th className="px-5 py-3 font-semibold">Pass Mark</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {exams.map((exam) => (
                <tr key={exam.id} className="border-b border-border last:border-0">
                  <td className="px-5 py-4 font-semibold text-text-primary">{exam.title}</td>
                  <td className="px-5 py-4 text-text-secondary">{exam.durationMinutes} mins</td>
                  <td className="px-5 py-4 text-text-secondary">{exam.passMark}%</td>
                  <td className="px-5 py-4">
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[exam.status] || statusStyles.DRAFT}`}>
                      {exam.status}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => navigate(`/teacher/exams/${exam.id}`)}
                        title="Edit"
                        className="rounded-lg p-2 text-text-secondary hover:bg-app-bg hover:text-primary"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => handleTogglePublish(exam)}
                        title={exam.published ? "Unpublish" : "Publish"}
                        className="rounded-lg p-2 text-text-secondary hover:bg-app-bg hover:text-primary"
                      >
                        {exam.published ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                      <button
                        onClick={() => navigate(`/teacher/exams/${exam.id}/results`)}
                        title="View Results"
                        className="rounded-lg p-2 text-text-secondary hover:bg-app-bg hover:text-primary"
                      >
                        <BarChart3 size={16} />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(exam)}
                        title="Delete"
                        className="rounded-lg p-2 text-text-secondary hover:bg-error/10 hover:text-error"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete this exam?"
        message={`"${deleteTarget?.title}" and all its questions will be permanently deleted. This cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

export default ManageExams;