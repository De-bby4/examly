import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, CheckCircle2, Users, Plus, AlertCircle } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { getMyExams } from "../../services/examService";
import { getProfile } from "../../services/profileService";

function TeacherDashboardHome() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [accountStatus, setAccountStatus] = useState(user?.accountStatus);

  useEffect(() => {
    getMyExams().then((data) => {
      setExams(data);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    getProfile()
      .then((p) => setAccountStatus(p.accountStatus))
      .catch(() => {});
  }, []);

  const publishedCount = exams.filter((e) => e.published).length;
  const draftCount = exams.filter((e) => !e.published).length;
  const canCreate = accountStatus !== "PENDING" && accountStatus !== "REJECTED";

  if (loading) return <p className="text-text-secondary">Loading your dashboard...</p>;

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-text-primary">
            Welcome back, {user?.name} 👋
          </h1>
          <p className="mt-1 text-text-secondary">Here's an overview of your exams.</p>
        </div>
        <button
          onClick={() => navigate("/teacher/exams/new")}
          disabled={!canCreate}
          title={!canCreate ? "Your account can't create exams right now" : ""}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Plus size={16} />
          Create Exam
        </button>
      </div>

      {accountStatus === "PENDING" && (
        <div className="mt-6 flex items-start gap-3 rounded-2xl border border-warning/30 bg-warning/10 p-4">
          <AlertCircle size={20} className="mt-0.5 shrink-0 text-warning" />
          <div>
            <p className="font-semibold text-text-primary">Your account is pending approval</p>
            <p className="mt-1 text-sm text-text-secondary">
              An admin needs to approve your teacher account before you can create or publish
              exams. You can still explore the dashboard in the meantime.
            </p>
          </div>
        </div>
      )}

      {accountStatus === "REJECTED" && (
        <div className="mt-6 flex items-start gap-3 rounded-2xl border border-error/30 bg-error/10 p-4">
          <AlertCircle size={20} className="mt-0.5 shrink-0 text-error" />
          <div>
            <p className="font-semibold text-text-primary">Your teacher account was not approved</p>
            <p className="mt-1 text-sm text-text-secondary">
              You can't create or publish exams. Please contact an administrator if you think
              this is a mistake.
            </p>
          </div>
        </div>
      )}

      <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3">
        <div className="rounded-2xl bg-surface p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm text-text-secondary">Total Exams</p>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-lavender text-primary">
              <FileText size={16} />
            </span>
          </div>
          <p className="mt-3 text-3xl font-extrabold text-text-primary">{exams.length}</p>
        </div>
        <div className="rounded-2xl bg-surface p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm text-text-secondary">Published</p>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-success/10 text-success">
              <CheckCircle2 size={16} />
            </span>
          </div>
          <p className="mt-3 text-3xl font-extrabold text-text-primary">{publishedCount}</p>
        </div>
        <div className="rounded-2xl bg-surface p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm text-text-secondary">Drafts</p>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-warning/10 text-warning">
              <Users size={16} />
            </span>
          </div>
          <p className="mt-3 text-3xl font-extrabold text-text-primary">{draftCount}</p>
        </div>
      </div>

      <div className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-text-primary">Your Exams</h2>
          <button
            onClick={() => navigate("/teacher/exams")}
            className="text-sm font-semibold text-primary hover:underline"
          >
            View all
          </button>
        </div>

        {exams.length === 0 ? (
          <div className="mt-4 flex flex-col items-center justify-center rounded-2xl bg-surface py-10 text-center shadow-sm">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-lavender text-primary">
              <FileText size={20} />
            </span>
            <p className="mt-3 text-sm text-text-secondary">You haven't created any exams yet.</p>
          </div>
        ) : (
          <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {exams.slice(0, 6).map((exam) => (
              <div
                key={exam.id}
                onClick={() => navigate(`/teacher/exams/${exam.id}`)}
                className="cursor-pointer rounded-2xl bg-surface p-5 shadow-sm hover:shadow-md"
              >
                <div className="flex items-start justify-between">
                  <h3 className="font-bold text-text-primary">{exam.title}</h3>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      exam.published ? "bg-success/10 text-success" : "bg-warning/10 text-warning"
                    }`}
                  >
                    {exam.published ? "Published" : "Draft"}
                  </span>
                </div>
                <p className="mt-2 text-sm text-text-secondary">
                  {exam.durationMinutes} mins · Pass mark {exam.passMark}%
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default TeacherDashboardHome;