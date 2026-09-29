import { useEffect, useState } from "react";
import { getStudentHistory } from "../../services/attemptService";

function ExamHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getStudentHistory().then((data) => {
      setHistory(data);
      setLoading(false);
    });
  }, []);

  if (loading) return <p className="text-text-secondary">Loading history...</p>;

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-text-primary">Exam History</h1>
      <p className="mt-1 text-text-secondary">Your past exam attempts.</p>

      {history.length === 0 ? (
        <p className="mt-6 text-text-secondary">You haven't taken any exams yet.</p>
      ) : (
        <div className="mt-6 overflow-hidden rounded-2xl bg-surface shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-app-bg text-text-secondary">
              <tr>
                <th className="px-5 py-3 font-semibold">Exam</th>
                <th className="px-5 py-3 font-semibold">Date</th>
                <th className="px-5 py-3 font-semibold">Attempt</th>
                <th className="px-5 py-3 font-semibold">Score</th>
                <th className="px-5 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {history.map((h) => (
                <tr key={h.attemptId} className="border-b border-border last:border-0">
                  <td className="px-5 py-4 font-semibold text-text-primary">{h.examTitle}</td>
                  <td className="px-5 py-4 text-text-secondary">
                    {new Date(h.submissionTime).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-4 text-text-secondary">#{h.attemptNumber}</td>
                  <td className="px-5 py-4 font-semibold text-text-primary">
                    {Math.round(h.percentage)}%
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        h.status === "PASSED"
                          ? "bg-success/10 text-success"
                          : "bg-error/10 text-error"
                      }`}
                    >
                      {h.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default ExamHistory;