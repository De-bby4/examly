import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Flag, LayoutGrid } from "lucide-react";

import {
  getQuestionsForAttempt,
  submitAnswer,
  submitExam,
  recordTabSwitch,
} from "../../services/attemptService";

function TakeExam() {
  const { attemptId } = useParams();
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [flagged, setFlagged] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [navigatorOpen, setNavigatorOpen] = useState(false);

  const hasWarnedRef = useRef(false);
  const autoSubmittedRef = useRef(false);

  const attemptInfo = useMemo(() => {
    const stored = sessionStorage.getItem(`examly_attempt_${attemptId}`);
    return stored ? JSON.parse(stored) : null;
  }, [attemptId]);

  const [secondsLeft, setSecondsLeft] = useState(() => {
    if (!attemptInfo) return null;

    const elapsed =
      (Date.now() - new Date(attemptInfo.startTime).getTime()) / 1000;

    const totalSeconds = attemptInfo.durationMinutes * 60;

    return Math.max(0, Math.round(totalSeconds - elapsed));
  });

  // Get questions
  useEffect(() => {
    getQuestionsForAttempt(attemptId).then((data) => {
      setQuestions(data);
      setLoading(false);
    });
  }, [attemptId]);

  // Detect tab switching
  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) {
        recordTabSwitch(attemptId).catch(() => {});
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);

    return () =>
      document.removeEventListener("visibilitychange", handleVisibility);
  }, [attemptId]);

  const currentQuestion = questions[currentIndex];

  // Select answer
  const handleSelectOption = async (optionId) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: optionId,
    }));

    try {
      await submitAnswer(attemptId, currentQuestion.id, optionId);
    } catch (err) {
      console.error("Failed to save answer", err);
    }
  };

  // Flag question
  const toggleFlag = () => {
    setFlagged((prev) => ({
      ...prev,
      [currentQuestion.id]: !prev[currentQuestion.id],
    }));
  };

  // Navigate question
  const goTo = (index) => {
    setCurrentIndex(index);
    setNavigatorOpen(false);
  };

  // Submit exam
  const handleSubmit = useCallback(
    async (auto = false) => {
      if (!auto) {
        const unanswered = questions.filter(
          (q) => answers[q.id] === undefined
        ).length;

        if (unanswered > 0 && !hasWarnedRef.current) {
          hasWarnedRef.current = true;

          const confirmed = window.confirm(
            `You have ${unanswered} unanswered question(s). Submit anyway?`
          );

          if (!confirmed) {
            hasWarnedRef.current = false;
            return;
          }
        }
      }

      setSubmitting(true);

      try {
        await submitExam(attemptId);

        sessionStorage.removeItem(`examly_attempt_${attemptId}`);

        navigate(`/student/attempts/${attemptId}/result`);
      } catch (err) {
        if (!auto) {
          alert(err.response?.data?.error || "Failed to submit exam");
        }

        setSubmitting(false);
      }
    },
    [attemptId, answers, questions, navigate]
  );

  // Countdown
  useEffect(() => {
    if (secondsLeft === null) return;

    if (secondsLeft <= 0) {
      if (!autoSubmittedRef.current) {
        autoSubmittedRef.current = true;
        handleSubmit(true);
      }

      return;
    }

    const timer = setTimeout(() => {
      setSecondsLeft((s) => s - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [secondsLeft, handleSubmit]);

  // Question status
  const getQuestionStatus = (q, index) => {
    if (index === currentIndex) return "current";
    if (answers[q.id] !== undefined) return "answered";
    if (flagged[q.id]) return "flagged";

    return "unanswered";
  };

  // Format timer
  const formatTime = (totalSeconds) => {
    if (totalSeconds === null) {
      return {
        h: "--",
        m: "--",
        s: "--",
      };
    }

    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;

    return {
      h: String(h).padStart(2, "0"),
      m: String(m).padStart(2, "0"),
      s: String(s).padStart(2, "0"),
    };
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-app-bg">
        <p className="text-sm text-text-secondary">Loading exam...</p>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-app-bg">
        <p className="text-sm text-text-secondary">No questions found.</p>
      </div>
    );
  }

  const time = formatTime(secondsLeft);

  const examTitle = attemptInfo?.examTitle || "Online Test - CAT Preparation";

  const isFlagged = flagged[currentQuestion.id];

  return (
    <div className="flex min-h-screen flex-col bg-app-bg text-text-primary">
      {/* ================= TOP HEADER ================= */}
      <header className="flex h-14 shrink-0 items-center border-b border-border bg-surface">
  {/* Opens the question navigator - the sidebar is hidden on mobile */}
  <button
    type="button"
    onClick={() => setNavigatorOpen(true)}
    className="flex h-full shrink-0 items-center gap-1.5 border-r border-border bg-app-bg px-4 text-sm font-semibold text-text-primary md:hidden"
  >
    <LayoutGrid size={16} />
    Questions
  </button>

  <div className="hidden w-[220px] shrink-0 md:block" />

  <div className="flex flex-1 items-center justify-center px-3">
    <h1 className="hidden truncate text-sm font-semibold text-text-primary md:block">
      Online Examination - {examTitle}
    </h1>
  </div>

  <div className="flex h-full w-auto shrink-0 items-center justify-center gap-2 border-l border-border bg-app-bg px-4 text-sm font-semibold text-text-primary md:w-[220px]">
    <span className="text-text-secondary">Time Left</span>
    <span className="tabular-nums">
      {time.h}:{time.m}:{time.s}
    </span>
  </div>
</header>

      {/* ================= MAIN CONTENT ================= */}
      <div className="flex flex-1">
        {/* ================= QUESTION AREA ================= */}
        <main className="min-w-0 flex-1 bg-app-bg pb-32">
          <div className="px-8 py-7">
            {/* Question title */}

            <div className="border-b border-border mb-5">
            <div className="mb-5 flex items-center gap-3 pl-7">
                
              <h2 className="text-[15px] font-semibold text-text-primary">
                {getQuestionCategory(currentQuestion)} - Question{" "}
                {currentIndex + 1}
              </h2>

              {isFlagged && (
                <span className="flex items-center gap-1 rounded-full bg-error/10 px-2.5 py-1 text-[11px] font-semibold text-error">
                  <Flag size={11} />
                  Marked for Review
                </span>
              )}
            </div>
            </div>

            {/* Question */}
            <div className="pl-7">
              <p className="max-w-[760px] text-[14px] leading-6 text-text-primary">
                {currentQuestion.questionText}
              </p>

              {currentQuestion.imageUrl && (
                <img
                  src={currentQuestion.imageUrl}
                  alt="Question"
                  className="mt-5 max-h-64 rounded-md object-contain"
                />
              )}
            </div>

            {/* Options */}
            <div className="mt-6 space-y-4">
              {currentQuestion.options.map((option, index) => {
                const isSelected =
                  answers[currentQuestion.id] === option.id;

                const letter = String.fromCharCode(65 + index);

                return (
                  <button
                    key={option.id}
                    onClick={() => handleSelectOption(option.id)}
                    className="flex w-full items-center gap-3 text-left"
                  >
                    {/* Checkbox */}
                    <span
                      className={`flex h-4 w-4 shrink-0 items-center justify-center border ${
                        isSelected
                          ? "border-success bg-success"
                          : "border-border bg-surface"
                      }`}
                    >
                      {isSelected && (
                        <svg
                          viewBox="0 0 12 12"
                          className="h-3 w-3 fill-none stroke-white stroke-[2.5]"
                        >
                          <path
                            d="M2 6l2.5 2.5L10 3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                    </span>

                    <span
                      className={`text-[14px] ${
                        isSelected
                          ? "font-medium text-text-primary"
                          : "text-text-secondary"
                      }`}
                    >
                      {letter}. {option.optionText}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </main>

        {/* ================= DESKTOP SIDEBAR ================= */}
        <aside className="hidden w-[250px] shrink-0 border-l border-border bg-surface md:block">
          <SidebarContent
            time={time}
            questions={questions}
            currentIndex={currentIndex}
            answers={answers}
            flagged={flagged}
            getQuestionStatus={getQuestionStatus}
            goTo={goTo}
          />
        </aside>
      </div>

      {/* ================= BOTTOM BAR ================= */}
<div className="fixed bottom-0 left-0 right-0 z-30 border-t border-border bg-surface px-4 pt-3 pb-3 md:px-12">
  {/* Buttons — one line. The flag label collapses below sm so all four fit
      without the submit wrapping onto its own row. */}
  <div className="flex items-center gap-2 border-b border-border pb-3">
    <button
      onClick={toggleFlag}
      aria-label="Mark for review"
      className={`flex items-center gap-1.5 rounded-md px-3 py-2 text-xs font-semibold text-white md:px-4 ${
        isFlagged
          ? "bg-error/80"
          : "bg-error hover:opacity-90"
      }`}
    >
      <Flag size={13} />
      <span className="hidden sm:inline">Mark for review</span>
    </button>

    <button
      onClick={() =>
        goTo(Math.max(0, currentIndex - 1))
      }
      disabled={currentIndex === 0}
      className="rounded-md bg-primary px-4 py-2 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50 md:px-5"
    >
      Previous
    </button>

    {currentIndex < questions.length - 1 && (
      <button
        onClick={() => goTo(currentIndex + 1)}
        className="rounded-md bg-primary px-4 py-2 text-xs font-semibold text-white hover:bg-primary-dark md:px-5"
      >
        Next
      </button>
    )}

    <button
      onClick={() => handleSubmit(false)}
      disabled={submitting}
      className="ml-auto rounded-md bg-success px-4 py-2 text-xs font-semibold text-white hover:opacity-90 disabled:opacity-60 md:px-6"
    >
      {submitting ? "Submitting..." : "Submit Exam"}
    </button>
  </div>
      </div>

      {/* ================= MOBILE DRAWER ================= */}
      {navigatorOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm md:hidden">
          <div className="h-full w-72 overflow-y-auto bg-surface p-5">
            <div className="mb-5 flex justify-end">
              <button
                onClick={() => setNavigatorOpen(false)}
                className="text-xl text-text-secondary"
              >
                ✕
              </button>
            </div>

            <SidebarContent
              time={time}
              questions={questions}
              currentIndex={currentIndex}
              answers={answers}
              flagged={flagged}
              getQuestionStatus={getQuestionStatus}
              goTo={goTo}
            />
          </div>
        </div>
      )}
    </div>
  );
}

/* =========================================================
   SIDEBAR
========================================================= */

function SidebarContent({
  time,
  questions,
  currentIndex,
  answers,
  flagged,
  getQuestionStatus,
  goTo,
}) {
  /*
    If your backend already has a category/section field,
    this will automatically separate Quant and Verbal.
  */
  const quantQuestions = questions.filter((q) => {
    const category = getQuestionCategory(q).toLowerCase();
    return category.includes("quant");
  });

  const verbalQuestions = questions.filter((q) => {
    const category = getQuestionCategory(q).toLowerCase();
    return category.includes("verbal");
  });

  /*
    If there is no category information, show all questions
    under Quant so the navigator still works.
  */
  const hasCategories =
    quantQuestions.length > 0 || verbalQuestions.length > 0;

  return (
    <div className="h-full">
      {/* Time */}
      <div className="border-b border-border px-5 py-4">
        <div className="grid grid-cols-3 text-center">
          <TimeUnit value={time.h} label="hours" />
          <TimeUnit value={time.m} label="minutes" />
          <TimeUnit value={time.s} label="seconds" />
        </div>
      </div>

      {/* Quant */}
      {hasCategories ? (
        <>
          {quantQuestions.length > 0 && (
            <QuestionGroup
              title="Quant"
              questions={quantQuestions}
              allQuestions={questions}
              currentIndex={currentIndex}
              answers={answers}
              flagged={flagged}
              getQuestionStatus={getQuestionStatus}
              goTo={goTo}
            />
          )}

          {verbalQuestions.length > 0 && (
            <QuestionGroup
              title="Verbal"
              questions={verbalQuestions}
              allQuestions={questions}
              currentIndex={currentIndex}
              answers={answers}
              flagged={flagged}
              getQuestionStatus={getQuestionStatus}
              goTo={goTo}
            />
          )}
        </>
      ) : (
        <QuestionGroup
          title="Questions"
          questions={questions}
          allQuestions={questions}
          currentIndex={currentIndex}
          answers={answers}
          flagged={flagged}
          getQuestionStatus={getQuestionStatus}
          goTo={goTo}
        />
      )}

      {/* Legend — what the palette colours mean */}
      <div className="border-b border-border px-5 py-4">
        <div className="flex flex-col gap-2.5 text-[11px] text-text-secondary">
          <LegendDot type="current" label="Current" />
          <LegendDot type="unanswered" label="Not Attempted" />
          <LegendDot type="answered" label="Answered" />
          <LegendDot type="flagged" label="Not Answered" />
          <LegendDot type="review" label="Review" />
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   QUESTION GROUP
========================================================= */

function QuestionGroup({
  title,
  questions,
  allQuestions,
  currentIndex,
  answers,
  flagged,
  getQuestionStatus,
  goTo,
}) {
  return (
    <div className="border-b border-border px-5 py-4">
      <p className="mb-4 text-sm font-semibold text-text-primary">
        {title}
      </p>

      <div className="grid grid-cols-6 gap-2">
        {questions.map((question) => {
          const actualIndex = allQuestions.findIndex(
            (q) => q.id === question.id
          );

          const status = getQuestionStatus(
            question,
            actualIndex
          );

          return (
            <button
              key={question.id}
              onClick={() => goTo(actualIndex)}
              className={`
                flex aspect-square w-full items-center justify-center
                rounded-sm text-[11px] font-semibold
                transition
                ${getStatusClasses(status)}
              `}
            >
              {actualIndex + 1}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* =========================================================
   STATUS COLORS
========================================================= */

function getStatusClasses(status) {
  switch (status) {
    case "current":
      return "bg-primary text-white";

    case "answered":
      return "bg-success text-white";

    case "flagged":
      return "bg-warning text-white";

    case "unanswered":
    default:
      return "border border-border bg-app-bg text-text-secondary";
  }
}

/* =========================================================
   TIME UNIT
========================================================= */

function TimeUnit({ value, label }) {
  return (
    <div>
      <p className="text-[16px] font-semibold text-text-primary">
        {value}
      </p>

      <p className="mt-1 text-[9px] text-text-secondary">
        {label}
      </p>
    </div>
  );
}

/* =========================================================
   LEGEND
========================================================= */

function LegendDot({ type, label }) {
  const classes = {
    current: "bg-primary",
    unanswered: "border border-border bg-transparent",
    answered: "bg-success",
    flagged: "bg-warning",
  };

  return (
    <div className="flex items-center gap-1.5">
      <span
        className={`h-2.5 w-2.5 rounded-full ${classes[type]}`}
      />

      <span>{label}</span>
    </div>
  );
}

/* =========================================================
   QUESTION CATEGORY
========================================================= */

function getQuestionCategory(question) {
  return (
    question.category ||
    question.section ||
    question.subject ||
    question.type ||
    "Quant"
  );
}

export default TakeExam;