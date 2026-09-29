import { Clock, Flag, Check, ChevronRight } from "lucide-react";

const OPTIONS = [
  { letter: "A", text: "x = 3" },
  { letter: "B", text: "x = 4", correct: true },
  { letter: "C", text: "x = 5" },
  { letter: "D", text: "x = 10" },
];

// A static preview of the exam-taking screen, shown in the landing hero so the
// product's category is visible at a glance. Presentational only.
function ExamCardMock() {
  return (
    <div
      role="img"
      aria-label="Preview of an Examly exam question with a live timer and multiple-choice answers"
      className="relative"
    >
      <div
        aria-hidden="true"
        className="absolute -inset-6 rounded-[2rem] bg-primary/10 blur-2xl"
      />

      <div className="relative rounded-2xl border border-border bg-surface p-5 shadow-xl shadow-primary/5 sm:p-6">
        <div className="flex items-center justify-between">
          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary">
            Question 4 of 10
          </span>

          <span className="flex items-center gap-1.5 rounded-full bg-warning/15 px-2.5 py-1 text-xs font-bold text-warning">
            <Clock size={13} aria-hidden="true" />
            12:45
          </span>
        </div>

        <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-app-bg">
          <div className="h-full w-2/5 rounded-full bg-primary" />
        </div>

        <p className="mt-5 text-lg font-bold leading-snug text-text-primary">
          Solve for x:&nbsp;&nbsp;2x + 6 = 14
        </p>

        <div className="mt-4 space-y-2.5">
          {OPTIONS.map(({ letter, text, correct }) => (
            <div
              key={letter}
              className={`flex items-center gap-3 rounded-xl border px-3.5 py-2.5 text-sm font-medium ${
                correct
                  ? "border-primary bg-primary/10 text-text-primary"
                  : "border-border text-text-secondary"
              }`}
            >
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                  correct
                    ? "bg-primary text-white"
                    : "bg-app-bg text-text-secondary"
                }`}
              >
                {letter}
              </span>

              <span className="flex-1">{text}</span>

              {correct && (
                <Check size={16} className="text-primary" aria-hidden="true" />
              )}
            </div>
          ))}
        </div>

        <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
          <span className="flex items-center gap-1.5 text-xs font-medium text-text-secondary">
            <Flag size={13} aria-hidden="true" />
            Flag for review
          </span>

          <span className="flex items-center gap-1 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white">
            Next
            <ChevronRight size={15} aria-hidden="true" />
          </span>
        </div>
      </div>
    </div>
  );
}

export default ExamCardMock;
