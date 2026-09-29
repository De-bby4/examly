import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getPublishedExams } from "../../services/examService";

function MyExams() {
  const [exams, setExams] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const loadExams = (query) => {
    setLoading(true);
    getPublishedExams(query).then((data) => {
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

  const statusStyles = {
    AVAILABLE: "bg-success/10 text-success",
    UPCOMING: "bg-warning/10 text-warning",
    CLOSED: "bg-gray-500/10 text-text-secondary",
  };

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-text-primary">My Exams</h1>
      <p className="mt-1 text-text-secondary">Browse and take available exams.</p>

      <form onSubmit={handleSearch} className="mt-6 flex gap-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search exams..."
          className="w-full max-w-sm rounded-lg border border-border bg-surface px-4 py-2.5 text-text-primary outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
        <button
          type="submit"
          className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark"
        >
          Search
        </button>
      </form>

      {loading ? (
        <p className="mt-6 text-text-secondary">Loading exams...</p>
      ) : exams.length === 0 ? (
        <p className="mt-6 text-text-secondary">No exams found.</p>
      ) : (
        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {exams.map((exam) => (
            <div key={exam.id} className="rounded-2xl bg-surface p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <h3 className="font-bold text-text-primary">{exam.title}</h3>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[exam.status] || "bg-gray-500/10 text-text-secondary"}`}>
                  {exam.status}
                </span>
              </div>
              <p className="mt-2 text-sm text-text-secondary">{exam.description}</p>
              <p className="mt-3 text-sm text-text-secondary">
                {exam.durationMinutes} mins · Pass mark {exam.passMark}%
              </p>
              <button
                onClick={() => navigate(`/student/exams/${exam.id}/instructions`)}
                disabled={exam.status !== "AVAILABLE"}
                className="mt-4 w-full rounded-lg bg-primary py-2 text-sm font-semibold text-white hover:bg-primary-dark disabled:cursor-not-allowed disabled:bg-gray-500/20 disabled:text-text-secondary"
              >
                {exam.status === "AVAILABLE" ? "Start Exam" : exam.status}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyExams;