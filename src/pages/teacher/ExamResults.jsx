import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Users, TrendingUp, Award, Target } from "lucide-react";
import { getExamById } from "../../services/examService";
import { getExamResults, getExamAnalytics } from "../../services/attemptService";
import CircularProgress from "../../components/CircularProgress";

function ExamResults() {
  const { examId } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);
  const [results, setResults] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);

  const loadResults = (status) => {
    getExamResults(examId, status ? { status } : {}).then(setResults);
  };

  useEffect(() => {
    Promise.all([
      getExamById(examId),
      getExamResults(examId),
      getExamAnalytics(examId),
    ]).then(([examData, resultsData, analyticsData]) => {
      setExam(examData);
      setResults(resultsData);
      setAnalytics(analyticsData);
      setLoading(false);
    });
  }, [examId]);

  const handleFilterChange = (status) => {
    setStatusFilter(status);
    loadResults(status);
  };

  if (loading) return <p className="text-text-secondary">Loading results...</p>;

  return (
    <div>
      <button
        onClick={() => navigate("/teacher/exams")}
        className="flex items-center gap-1.5 text-sm font-semibold text-text-secondary hover:text-primary"
      >
        <ArrowLeft size={15} />
        Back to Manage Exams
      </button>

      <h1 className="mt-3 text-2xl font-extrabold text-text-primary">{exam?.title}</h1>
      <p className="mt-1 text-text-secondary">Results and analytics for this exam.</p>

      {/* Analytics stats */}
      <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="rounded-2xl bg-surface p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm text-text-secondary">Total Attempts</p>
            <Users size={16} className="text-primary" />
          </div>
          <p className="mt-2 text-2xl font-extrabold text-text-primary">{analytics.totalAttempts}</p>
        </div>
        <div className="rounded-2xl bg-surface p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm text-text-secondary">Completed</p>
            <Target size={16} className="text-primary" />
          </div>
          <p className="mt-2 text-2xl font-extrabold text-text-primary">{analytics.completedAttempts}</p>
        </div>
        <div className="rounded-2xl bg-surface p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm text-text-secondary">Avg. Score</p>
            <TrendingUp size={16} className="text-primary" />
          </div>
          <p className="mt-2 text-2xl font-extrabold text-text-primary">
            {Math.round(analytics.averagePercentage)}%
          </p>
        </div>
        <div className="rounded-2xl bg-surface p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm text-text-secondary">Pass Rate</p>
            <Award size={16} className="text-success" />
          </div>
          <p className="mt-2 text-2xl font-extrabold text-text-primary">
            {Math.round(analytics.passRate)}%
          </p>
        </div>
      </div>

      {/* Score range summary */}
      <div className="mt-6 flex items-center gap-6 rounded-2xl bg-surface p-6 shadow-sm">
        <CircularProgress value={analytics.passRate} color="var(--color-success)" />
        <div>
          <p className="text-sm text-text-secondary">
            Highest score: <span className="font-semibold text-text-primary">{Math.round(analytics.highestPercentage)}%</span>
          </p>
          <p className="mt-1 text-sm text-text-secondary">
            Lowest score: <span className="font-semibold text-text-primary">{Math.round(analytics.lowestPercentage)}%</span>
          </p>
        </div>
      </div>

      {/* Results table */}
      <div className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-text-primary">Student Results</h2>
          <div className="flex gap-2">
            {["", "PASSED", "FAILED"].map((status) => (
              <button
                key={status || "all"}
                onClick={() => handleFilterChange(status)}
                className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
                  statusFilter === status
                    ? "bg-primary text-white"
                    : "bg-surface text-text-secondary hover:bg-app-bg"
                }`}
              >
                {status === "" ? "All" : status === "PASSED" ? "Passed" : "Failed"}
              </button>
            ))}
          </div>
        </div>

        {results.length === 0 ? (
          <p className="mt-4 text-sm text-text-secondary">No results match this filter.</p>
        ) : (
          <div className="mt-4 overflow-hidden rounded-2xl bg-surface shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-app-bg text-text-secondary">
                <tr>
                  <th className="px-5 py-3 font-semibold">Student</th>
                  <th className="px-5 py-3 font-semibold">Score</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 font-semibold">Attempt</th>
                  <th className="px-5 py-3 font-semibold">Submitted</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r) => (
                  <tr key={r.attemptId} className="border-b border-border last:border-0">
                    <td className="px-5 py-4">
                      <p className="font-semibold text-text-primary">{r.studentName}</p>
                      <p className="text-xs text-text-secondary">{r.studentEmail}</p>
                    </td>
                    <td className="px-5 py-4 font-semibold text-text-primary">
                      {Math.round(r.percentage)}%
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          r.status === "PASSED"
                            ? "bg-success/10 text-success"
                            : "bg-error/10 text-error"
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-text-secondary">#{r.attemptNumber}</td>
                    <td className="px-5 py-4 text-text-secondary">
                      {r.submissionTime ? new Date(r.submissionTime).toLocaleDateString() : "—"}
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

export default ExamResults;