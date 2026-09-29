import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { TrendingUp, Users, Award, FileText } from "lucide-react";
import { getMyExams } from "../../services/examService";
import { getExamAnalytics } from "../../services/attemptService";
import CircularProgress from "../../components/CircularProgress";

function TeacherAnalytics() {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyExams().then(async (exams) => {
      const results = await Promise.all(
        exams.map(async (exam) => {
          try {
            const analytics = await getExamAnalytics(exam.id);
            return { exam, analytics };
          } catch {
            return null;
          }
        })
      );
      setRows(results.filter(Boolean));
      setLoading(false);
    });
  }, []);

  const totalAttempts = rows.reduce((sum, r) => sum + r.analytics.totalAttempts, 0);
  const totalCompleted = rows.reduce((sum, r) => sum + r.analytics.completedAttempts, 0);
  const overallAverage = rows.length
    ? Math.round(
        rows.reduce((sum, r) => sum + (r.analytics.averagePercentage || 0), 0) / rows.length
      )
    : 0;
  const overallPassRate = rows.length
    ? Math.round(rows.reduce((sum, r) => sum + (r.analytics.passRate || 0), 0) / rows.length)
    : 0;

  if (loading) return <p className="text-text-secondary">Loading analytics...</p>;

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-text-primary">Analytics</h1>
      <p className="mt-1 text-text-secondary">Performance overview across all your exams.</p>

      <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="rounded-2xl bg-surface p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm text-text-secondary">Total Attempts</p>
            <Users size={16} className="text-primary" />
          </div>
          <p className="mt-2 text-2xl font-extrabold text-text-primary">{totalAttempts}</p>
        </div>
        <div className="rounded-2xl bg-surface p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm text-text-secondary">Completed</p>
            <FileText size={16} className="text-primary" />
          </div>
          <p className="mt-2 text-2xl font-extrabold text-text-primary">{totalCompleted}</p>
        </div>
        <div className="rounded-2xl bg-surface p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm text-text-secondary">Avg. Score (all exams)</p>
            <TrendingUp size={16} className="text-primary" />
          </div>
          <p className="mt-2 text-2xl font-extrabold text-text-primary">{overallAverage}%</p>
        </div>
        <div className="rounded-2xl bg-surface p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm text-text-secondary">Avg. Pass Rate</p>
            <Award size={16} className="text-success" />
          </div>
          <p className="mt-2 text-2xl font-extrabold text-text-primary">{overallPassRate}%</p>
        </div>
      </div>

      <div className="mt-10">
        <h2 className="text-lg font-bold text-text-primary">Per-Exam Breakdown</h2>

        {rows.length === 0 ? (
          <p className="mt-4 text-sm text-text-secondary">You haven't created any exams yet.</p>
        ) : (
          <div className="mt-4 overflow-hidden rounded-2xl bg-surface shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-app-bg text-text-secondary">
                <tr>
                  <th className="px-5 py-3 font-semibold">Exam</th>
                  <th className="px-5 py-3 font-semibold">Attempts</th>
                  <th className="px-5 py-3 font-semibold">Avg. Score</th>
                  <th className="px-5 py-3 font-semibold">Pass Rate</th>
                  <th className="px-5 py-3 font-semibold">Highest</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(({ exam, analytics }) => (
                  <tr
                    key={exam.id}
                    onClick={() => navigate(`/teacher/exams/${exam.id}/results`)}
                    className="cursor-pointer border-b border-border last:border-0 hover:bg-app-bg"
                  >
                    <td className="px-5 py-4 font-semibold text-text-primary">{exam.title}</td>
                    <td className="px-5 py-4 text-text-secondary">{analytics.completedAttempts}</td>
                    <td className="px-5 py-4 text-text-secondary">
                      {Math.round(analytics.averagePercentage)}%
                    </td>
                    <td className="px-5 py-4 text-text-secondary">
                      {Math.round(analytics.passRate)}%
                    </td>
                    <td className="px-5 py-4 text-text-secondary">
                      {Math.round(analytics.highestPercentage)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default TeacherAnalytics;