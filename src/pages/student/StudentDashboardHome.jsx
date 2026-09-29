import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, TrendingUp, Trophy, Inbox, CalendarClock } from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { useAuth } from "../../context/AuthContext";
import { getPublishedExams } from "../../services/examService";
import { getStudentHistory } from "../../services/attemptService";
import CircularProgress from "../../components/CircularProgress";
import { PieChart, Pie, Cell } from "recharts";

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function StudentDashboardHome() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getPublishedExams(), getStudentHistory()])
      .then(([examsData, historyData]) => {
        setExams(examsData);
        setHistory(historyData);
      })
      .finally(() => setLoading(false));
  }, []);

  const availableExams = exams.filter((e) => e.status === "AVAILABLE");
  const upcomingExams = exams.filter((e) => e.status === "UPCOMING");

  const completedCount = history.length;
  const averageScore = completedCount
    ? Math.round(history.reduce((sum, h) => sum + (h.percentage || 0), 0) / completedCount)
    : 0;
  const bestScore = completedCount
    ? Math.round(Math.max(...history.map((h) => h.percentage || 0)))
    : 0;

  const recentResults = [...history]
    .sort((a, b) => new Date(b.submissionTime) - new Date(a.submissionTime))
    .slice(0, 5);

  const chartData = [...history]
    .sort((a, b) => new Date(a.submissionTime) - new Date(b.submissionTime))
    .map((h, i) => ({
      name: `#${i + 1}`,
      score: Math.round(h.percentage || 0),
      exam: h.examTitle,
    }));

  if (loading) {
    return <p className="text-text-secondary">Loading your dashboard...</p>;
  }
  const passedCount = history.filter((h) => h.status === "PASSED").length;
const failedCount = history.filter((h) => h.status === "FAILED").length;
const pieData = [
  { name: "Passed", value: passedCount },
  { name: "Failed", value: failedCount },
];
const pieColors = ["var(--color-success)", "var(--color-error)"];

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-text-primary">
        {getGreeting()}, {user?.name} 👋
      </h1>
      <p className="mt-1 text-text-secondary">Here's what's happening with your exams.</p>

      {/* Stats */}
      <div className="mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:grid md:grid-cols-3 md:overflow-visible md:pb-0">
        <div className="flex w-[78%] shrink-0 snap-start flex-col items-center rounded-2xl bg-surface p-6 shadow-sm md:w-auto">
          <div className="flex w-full items-center justify-between">
            <p className="text-sm text-text-secondary">Exams Completed</p>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-lavender text-primary">
              <CheckCircle2 size={16} />
            </span>
          </div>
          <div className="flex flex-1 items-center justify-center">
            <p className="text-4xl font-extrabold text-text-primary">{completedCount}</p>
          </div>
        </div>

        <div className="flex w-[78%] shrink-0 snap-start flex-col items-center rounded-2xl bg-surface p-6 shadow-sm md:w-auto">
          <div className="flex w-full items-center justify-between">
            <p className="text-sm text-text-secondary">Average Score</p>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-lavender text-primary">
              <TrendingUp size={16} />
            </span>
          </div>
          <div className="mt-2">
            <CircularProgress value={averageScore} color="var(--color-primary)" />
          </div>
        </div>

        <div className="flex w-[78%] shrink-0 snap-start flex-col items-center rounded-2xl bg-surface p-6 shadow-sm md:w-auto">
          <div className="flex w-full items-center justify-between">
            <p className="text-sm text-text-secondary">Best Score</p>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-success/10 text-success">
              <Trophy size={16} />
            </span>
          </div>
          <div className="mt-2">
            <CircularProgress value={bestScore} color="var(--color-success)" />
          </div>
        </div>
      </div>

      {/* Progress over time */}
      {chartData.length > 1 && (
        <div className="mt-6 rounded-2xl bg-surface p-6 shadow-sm">
          <h2 className="text-lg font-bold text-text-primary">Progress Over Time</h2>
          <p className="text-sm text-text-secondary">Your score across recent attempts.</p>

          <div className="mt-4 h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="name" stroke="var(--color-text-secondary)" fontSize={12} />
                <YAxis
                  domain={[0, 100]}
                  stroke="var(--color-text-secondary)"
                  fontSize={12}
                  tickFormatter={(v) => `${v}%`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--color-surface)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "8px",
                    fontSize: "13px",
                  }}
                  labelStyle={{ color: "var(--color-text-primary)" }}
                  formatter={(value, _name, item) => [`${value}%`, item.payload.exam]}
                />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="var(--color-primary)"
                  strokeWidth={2.5}
                  dot={{ fill: "var(--color-primary)", r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
      {completedCount > 0 && (
  <div className="mt-6 rounded-2xl bg-surface p-6 shadow-sm">
    <h2 className="text-lg font-bold text-text-primary">Pass / Fail Split</h2>
    <p className="text-sm text-text-secondary">How your attempts have gone overall.</p>

    <div className="mt-4 flex items-center gap-8">
      <div className="relative h-40 w-40 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <defs>
              <linearGradient id="passGradient" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="var(--color-success)" stopOpacity={1} />
                <stop offset="100%" stopColor="var(--color-success)" stopOpacity={0.7} />
              </linearGradient>
              <linearGradient id="failGradient" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="var(--color-error)" stopOpacity={1} />
                <stop offset="100%" stopColor="var(--color-error)" stopOpacity={0.7} />
              </linearGradient>
            </defs>
            <Pie
              data={pieData}
              dataKey="value"
              nameKey="name"
              innerRadius={50}
              outerRadius={78}
              cornerRadius={8}
              paddingAngle={pieData[0].value && pieData[1].value ? 6 : 0}
              stroke="none"
              animationDuration={800}
            >
              <Cell fill="url(#passGradient)" />
              <Cell fill="url(#failGradient)" />
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--color-app-bg)",
                border: "1px solid var(--color-border)",
                borderRadius: "8px",
                fontSize: "13px",
              }}
              labelStyle={{ color: "var(--color-text-primary)" }}
              formatter={(value, name) => [value, name]}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-extrabold text-text-primary">
            {Math.round((passedCount / completedCount) * 100)}%
          </span>
          <span className="text-xs text-text-secondary">Pass rate</span>
        </div>
      </div>

      <div className="flex-1 space-y-4">
        <div className="flex items-center justify-between rounded-xl bg-app-bg px-4 py-3 transition hover:bg-lavender/40">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-success" />
            <span className="text-sm text-text-secondary">Passed</span>
          </div>
          <span className="text-lg font-bold text-text-primary">{passedCount}</span>
        </div>
        <div className="flex items-center justify-between rounded-xl bg-app-bg px-4 py-3 transition hover:bg-error/10">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-error" />
            <span className="text-sm text-text-secondary">Failed</span>
          </div>
          <span className="text-lg font-bold text-text-primary">{failedCount}</span>
        </div>
      </div>
    </div>
  </div>
)}

      {/* Available Exams */}
      <div className="mt-10">
        <h2 className="text-lg font-bold text-text-primary">Available Exams</h2>
        {availableExams.length === 0 ? (
          <EmptyState icon={Inbox} text="No exams available right now." />
        ) : (
          <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {availableExams.map((exam) => (
              <div key={exam.id} className="rounded-2xl bg-surface p-5 shadow-sm">
                <h3 className="font-bold text-text-primary">{exam.title}</h3>
                <p className="mt-1 text-sm text-text-secondary">
                  {exam.durationMinutes} mins · Pass mark {exam.passMark}%
                </p>
                <button
                  onClick={() => navigate(`/student/exams/${exam.id}/instructions`)}
                  className="mt-4 w-full rounded-lg bg-primary py-2 text-sm font-semibold text-white hover:bg-primary-dark"
                >
                  Start Exam
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upcoming Exams */}
      {upcomingExams.length > 0 && (
        <div className="mt-10">
          <h2 className="text-lg font-bold text-text-primary">Upcoming Exams</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {upcomingExams.map((exam) => (
              <div key={exam.id} className="rounded-2xl border border-dashed border-border bg-surface p-5">
                <h3 className="font-bold text-text-primary">{exam.title}</h3>
                <p className="mt-1 text-sm text-text-secondary">
                  Opens {new Date(exam.startDate).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Results */}
      <div className="mt-10">
        <h2 className="text-lg font-bold text-text-primary">Recent Results</h2>
        {recentResults.length === 0 ? (
          <EmptyState icon={CalendarClock} text="You haven't completed any exams yet." />
        ) : (
          <div className="mt-4 overflow-hidden rounded-2xl bg-surface shadow-sm">
            {recentResults.map((r) => (
              <div
                key={r.attemptId}
                className="flex items-center justify-between border-b border-border px-5 py-4 last:border-0"
              >
                <div>
                  <p className="font-semibold text-text-primary">{r.examTitle}</p>
                  <p className="text-sm text-text-secondary">
                    {new Date(r.submissionTime).toLocaleDateString()}
                  </p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-sm font-semibold ${
                    r.status === "PASSED"
                      ? "bg-success/10 text-success"
                      : "bg-error/10 text-error"
                  }`}
                >
                  {Math.round(r.percentage)}%
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function EmptyState({ icon: Icon, text }) {
  return (
    <div className="mt-4 flex flex-col items-center justify-center rounded-2xl bg-surface py-10 text-center shadow-sm">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-lavender text-primary">
        <Icon size={20} />
      </span>
      <p className="mt-3 text-sm text-text-secondary">{text}</p>
    </div>
  );
}

export default StudentDashboardHome;