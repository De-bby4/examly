import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Clock, Target, RotateCcw, Save, Flag, AlertTriangle } from "lucide-react";
import { getExamById } from "../../services/examService";
import { startAttempt } from "../../services/attemptService";

const instructionItems = (exam) => [
  {
    icon: Clock,
    text: (
      <>
        You have <strong className="font-semibold text-text-primary">{exam.durationMinutes} minutes</strong> to complete this exam.
      </>
    ),
  },
  {
    icon: Target,
    text: (
      <>
        You need <strong className="font-semibold text-text-primary">{exam.passMark}%</strong> or higher to pass.
      </>
    ),
  },
  {
    icon: RotateCcw,
    text: (
      <>
        Maximum of <strong className="font-semibold text-text-primary">{exam.maxAttempts}</strong> attempt(s) allowed.
      </>
    ),
  },
  { icon: Save, text: "Your answers are saved automatically as you go." },
  { icon: Flag, text: "You can flag questions to review before submitting." },
  { icon: AlertTriangle, text: "Once submitted, you cannot change your answers." },
];

function ExamInstructions() {
  const { examId } = useParams();
  const [exam, setExam] = useState(null);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    getExamById(examId).then(setExam);
  }, [examId]);

  const handleStart = async () => {
    setStarting(true);
    setError("");

    try {
      const attempt = await startAttempt(examId);
      sessionStorage.setItem(`examly_attempt_${attempt.id}`, JSON.stringify(attempt));
      navigate(`/student/attempts/${attempt.id}/take`);
    } catch (err) {
      setError(err.response?.data?.error || "Could not start this exam");
      setStarting(false);
    }
  };

  if (!exam) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-app-bg">
        <p className="text-sm text-text-secondary">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-app-bg text-text-primary">
      <main className="mx-auto max-w-3xl px-6 py-12">
        {/* Exam heading */}
        <div className="mb-5">
          <p className="mb-1  text-xs font-semibold uppercase tracking-wide text-primary">
            Examination
          </p>
          <h1 className="text-2xl font-extrabold text-text-primary">{exam.title}</h1>
          {exam.description && (
            <p className="mt-1 max-w-2xl text-sm leading-6 text-text-secondary">
              {exam.description}
            </p>
          )}
        </div>

        {/* Instructions */}
        <section className="overflow-hidden rounded-2xl bg-surface shadow-sm">
          <div className="border-b border-border px-6 py-4">
            <h2 className="font-bold text-text-primary">Before you begin</h2>
          </div>

          <div className="space-y-1 px-6">
  {instructionItems(exam).map(({ icon: Icon, text }, i) => (
    <div key={i} className="flex items-start gap-3 py-3">
      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-lavender text-primary">
        <Icon size={14} />
      </span>
      <p className="text-sm leading-6 text-text-secondary">{text}</p>
    </div>
  ))}
</div>

          {error && (
            <div className="mx-6 mb-5 rounded-lg bg-error/10 px-4 py-3 text-sm text-error">
              {error}
            </div>
          )}

          <div className="flex justify-end border-t border-border px-6 py-5">
            <button
              onClick={handleStart}
              disabled={starting}
              className="min-w-[150px] rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-white transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
            >
              {starting ? "Starting..." : "Start Exam"}
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}

export default ExamInstructions;