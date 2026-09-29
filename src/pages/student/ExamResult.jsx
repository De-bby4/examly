import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { PartyPopper, Frown, CheckCircle2, XCircle, MinusCircle } from "lucide-react";
import { getResult } from "../../services/attemptService";
import CircularProgress from "../../components/CircularProgress";

function playSuccessChime() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6 — a bright major arpeggio

    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;

      const startTime = ctx.currentTime + i * 0.09;
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.15, startTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.5);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(startTime);
      osc.stop(startTime + 0.5);
    });
  } catch (e) {
    console.warn("Could not play sound", e);
  }
}

function ExamResult() {
  const { attemptId } = useParams();
  const [result, setResult] = useState(null);
  const [score, setScore] = useState(0);
  const navigate = useNavigate();
  const soundPlayedRef = useRef(false);

  useEffect(() => {
    getResult(attemptId).then(setResult);
  }, [attemptId]);

  useEffect(() => {
    if (result && result.passed && result.percentage >= 85 && !soundPlayedRef.current) {
      soundPlayedRef.current = true;
      playSuccessChime();
    }
  }, [result]);

  // Fills the ring and counts the number up together, once the result lands.
  useEffect(() => {
    if (!result) return;

    const target = result.percentage;
    const startedAt = performance.now();
    const duration = 900;
    let raf = 0;

    const tick = (now) => {
      const progress = Math.min((now - startedAt) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setScore(target * eased);
      if (progress < 1) raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [result]);

  if (!result) return <p className="p-6 text-text-secondary">Loading result...</p>;

  const passed = result.passed;
  // Never celebrate a fail, even if the score happens to be high.
  const showConfetti = passed && result.percentage >= 85;

  // The pass mark isn't guaranteed to be in the payload - everything below it
  // simply doesn't render when it's missing.
  const passMark =
    result.passMark ?? result.examPassMark ?? result.passPercentage ?? null;
  const gap =
    typeof passMark === "number"
      ? Math.round(result.percentage - passMark)
      : null;

  const total =
    result.correctCount + result.wrongCount + result.unansweredCount || 1;
  const share = (count) => (count / total) * 100;

  const tone = passed
    ? { ring: "var(--color-success)", soft: "bg-success/10", strong: "bg-success" }
    : { ring: "var(--color-error)", soft: "bg-error/10", strong: "bg-error" };

  return (
    <div className="min-h-screen bg-app-bg">
      {showConfetti && <Confetti />}

      {/* Result band — full width, so pass/fail reads instantly */}
      <div className={`border-b border-border ${tone.soft}`}>
        <div className="flex flex-col items-center gap-4 px-6 py-10 text-center sm:flex-row sm:text-left lg:px-10">
          <span
            className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl text-white shadow-lg ${tone.strong}`}
          >
            {passed ? <PartyPopper size={28} /> : <Frown size={28} />}
          </span>

          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-extrabold tracking-tight text-text-primary md:text-3xl">
              {passed ? "Congratulations!" : "Better luck next time"}
            </h1>
            <p className="mt-1 text-sm text-text-secondary">{result.examTitle}</p>
          </div>

          <span className="rounded-full bg-surface px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-text-secondary">
            {result.status}
          </span>
        </div>
      </div>

      <div className="px-6 py-8 lg:px-10">
        <div className="grid gap-6 lg:grid-cols-[auto_1fr]">
          {/* Score */}
          <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-border bg-surface px-10 py-8">
            <CircularProgress
              value={score}
              size={168}
              strokeWidth={14}
              color={tone.ring}
              marker={typeof passMark === "number" ? passMark : undefined}
            />

            <div className="text-center">
              <p className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
                Your score
              </p>

              {typeof passMark === "number" && (
                <p
                  className={`mt-1 text-xs font-semibold ${
                    passed ? "text-success" : "text-error"
                  }`}
                >
                  {passed
                    ? gap > 0
                      ? `${gap}% above the ${passMark}% pass mark`
                      : `Right on the ${passMark}% pass mark`
                    : `${Math.abs(gap)}% short of the ${passMark}% pass mark`}
                </p>
              )}
            </div>
          </div>

          <div className="flex min-w-0 flex-col gap-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <StatTile
                icon={CheckCircle2}
                value={result.correctCount}
                label="Correct"
                tone="text-success bg-success/10"
              />
              <StatTile
                icon={XCircle}
                value={result.wrongCount}
                label="Wrong"
                tone="text-error bg-error/10"
              />
              <StatTile
                icon={MinusCircle}
                value={result.unansweredCount}
                label="Skipped"
                tone="text-text-secondary bg-app-bg"
              />
            </div>

            {/* Composition of the paper, as a shape rather than three numbers */}
            <div className="rounded-2xl border border-border bg-surface px-6 py-5">
              <div className="flex h-2.5 overflow-hidden rounded-full bg-app-bg">
                <span
                  className="bg-success"
                  style={{ width: `${share(result.correctCount)}%` }}
                />
                <span
                  className="bg-error"
                  style={{ width: `${share(result.wrongCount)}%` }}
                />
                <span
                  className="bg-border"
                  style={{ width: `${share(result.unansweredCount)}%` }}
                />
              </div>

              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-text-secondary">
                <span>
                  {result.correctCount} of {total} questions correct
                </span>

                {!passed && result.wrongCount > 0 && (
                  <span className="font-semibold text-text-primary">
                    Review the {result.wrongCount} you missed
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <button
            onClick={() => navigate(`/student/attempts/${attemptId}/review`)}
            className="rounded-xl bg-primary px-8 py-3 font-semibold text-white transition hover:bg-primary-dark"
          >
            Review Answers
          </button>

          <button
            onClick={() => navigate("/student/dashboard")}
            className="rounded-xl border-2 border-border px-8 py-3 font-semibold text-text-primary transition hover:border-primary hover:text-primary"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}

function StatTile({ icon: Icon, value, label, tone }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-border bg-surface px-5 py-4">
      <span
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${tone}`}
      >
        <Icon size={20} />
      </span>

      <div>
        <p className="text-2xl font-extrabold leading-none text-text-primary">
          {value}
        </p>
        <p className="mt-1 text-xs text-text-secondary">{label}</p>
      </div>
    </div>
  );
}

function Confetti() {
  const pieces = Array.from({ length: 40 });
  const colors = ["var(--color-primary)", "var(--color-success)", "var(--color-warning)", "var(--color-error)", "#818CF8"];

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {pieces.map((_, i) => (
        <span
          key={i}
          className="absolute top-0 h-2 w-2 rounded-sm"
          style={{
            left: `${(i * 37) % 100}%`,
            backgroundColor: colors[i % colors.length],
            animation: `fall ${(2.6 + (i % 5) * 0.25).toFixed(2)}s ${((i % 7) * 0.07).toFixed(2)}s ease-in forwards`,
          }}
        />
      ))}
      <style>{`
        @keyframes fall {
          0% { transform: translateY(-10vh) rotate(0deg); opacity: 1; }
          100% { transform: translateY(110vh) rotate(360deg); opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}

export default ExamResult;
