import { useEffect, useState } from "react";
import { Trash2, FileText } from "lucide-react";
import { getAllExamsAdmin, deleteExamAdmin } from "../../services/adminService";
import ConfirmDialog from "../../components/ConfirmDialog";

function AdminExams() {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    getAllExamsAdmin().then((data) => {
      setExams(data);
      setLoading(false);
    });
  }, []);

  const handleDelete = async () => {
    await deleteExamAdmin(deleteTarget.id);
    setExams((prev) => prev.filter((e) => e.id !== deleteTarget.id));
    setDeleteTarget(null);
  };

  if (loading) return <p className="text-text-secondary">Loading exams...</p>;

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-text-primary">All Exams</h1>
      <p className="mt-1 text-text-secondary">Every exam created across the platform.</p>

      {exams.length === 0 ? (
        <div className="mt-6 flex flex-col items-center justify-center rounded-2xl bg-surface py-12 text-center shadow-sm">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-lavender text-primary">
            <FileText size={20} />
          </span>
          <p className="mt-3 text-sm text-text-secondary">No exams found.</p>
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-2xl bg-surface shadow-sm">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-border bg-app-bg text-text-secondary">
              <tr>
                <th className="px-5 py-3 font-semibold">Title</th>
                <th className="px-5 py-3 font-semibold">Creator</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {exams.map((e) => (
                <tr key={e.id} className="border-b border-border last:border-0">
                  <td className="px-5 py-4 font-semibold text-text-primary">{e.title}</td>
                  <td className="px-5 py-4 text-text-secondary">{e.creatorName}</td>
                  <td className="px-5 py-4">
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${e.published ? "bg-success/10 text-success" : "bg-lavender text-primary"}`}>
                      {e.status}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <button
                      onClick={() => setDeleteTarget(e)}
                      title="Delete"
                      className="rounded-lg p-2 text-text-secondary hover:bg-error/10 hover:text-error"
                    >
                      <Trash2 size={16} />
                    </button>
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
        message={`"${deleteTarget?.title}" and all its questions/results will be permanently deleted.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

export default AdminExams;