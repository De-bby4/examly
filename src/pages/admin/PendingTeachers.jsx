import { useEffect, useState } from "react";
import { UserCheck, Check, X } from "lucide-react";
import { getPendingTeachers, approveTeacher, rejectTeacher } from "../../services/adminService";
import ConfirmDialog from "../../components/ConfirmDialog";

function PendingTeachers() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rejectTarget, setRejectTarget] = useState(null);

  const load = () => {
    getPendingTeachers().then((data) => {
      setTeachers(data);
      setLoading(false);
    });
  };

  useEffect(() => {
    load();
  }, []);

  const handleApprove = async (id) => {
    await approveTeacher(id);
    setTeachers((prev) => prev.filter((t) => t.id !== id));
  };

  const handleReject = async () => {
    await rejectTeacher(rejectTarget.id);
    setTeachers((prev) => prev.filter((t) => t.id !== rejectTarget.id));
    setRejectTarget(null);
  };

  if (loading) return <p className="text-text-secondary">Loading pending teachers...</p>;

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-text-primary">Pending Teachers</h1>
      <p className="mt-1 text-text-secondary">Review and approve new teacher accounts.</p>

      {teachers.length === 0 ? (
        <div className="mt-6 flex flex-col items-center justify-center rounded-2xl bg-surface py-12 text-center shadow-sm">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-lavender text-primary">
            <UserCheck size={20} />
          </span>
          <p className="mt-3 text-sm text-text-secondary">No pending teacher accounts.</p>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {teachers.map((t) => (
            <div key={t.id} className="flex items-center justify-between rounded-2xl bg-surface p-5 shadow-sm">
              <div>
                <p className="font-semibold text-text-primary">{t.name}</p>
                <p className="text-sm text-text-secondary">{t.email}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleApprove(t.id)}
                  className="flex items-center gap-1.5 rounded-lg bg-success px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
                >
                  <Check size={15} />
                  Approve
                </button>
                <button
                  onClick={() => setRejectTarget(t)}
                  className="flex items-center gap-1.5 rounded-lg border border-error/40 px-4 py-2 text-sm font-semibold text-error hover:bg-error/10"
                >
                  <X size={15} />
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!rejectTarget}
        title="Reject this teacher?"
        message={`${rejectTarget?.name} will not be able to create or publish exams.`}
        confirmLabel="Reject"
        onConfirm={handleReject}
        onCancel={() => setRejectTarget(null)}
      />
    </div>
  );
}

export default PendingTeachers;