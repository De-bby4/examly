import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { getAnswerReview } from "../../services/attemptService";

const FILTERS = ["All", "Correct", "Wrong", "Unanswered"];

function AnswerReview() {
  const { attemptId } = useParams();
  const [review, setReview] = useState(null);
  const [filter, setFilter] = useState("All");
  const navigate = useNavigate();

  useEffect(() => {
    getAnswerReview(attemptId).then(setReview);
  }, [attemptId]);

  if (!review) return <p className="p-6 text-text-secondary">Loading review...</p>;

  const filteredItems = review.items.filter((item) => {
    if (filter === "All") return true;
    if (filter === "Correct") return item.isCorrect;
    if (filter === "Wrong") return !item.isCorrect && item.selectedOptionId != null;
    if (filter === "Unanswered") return item.selectedOptionId == null;
    return true;
  });

  return (
    <div className="min-h-screen bg-app-bg">
      {/* Header — full width */}
      <div className="border-b border-border bg-surface px-6 py-6 lg:px-10">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm font-semibold text-text-secondary transition hover:text-primary"
        >
          <ArrowLeft size={16} />
          Back
        </button>

        <div className="mt-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-text-primary">
              Answer Review
            </h1>
            <p className="mt-1 text-sm text-text-secondary">{review.examTitle}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
                  filter === f
                    ? "bg-primary text-white"
                    : "border border-border text-text-secondary hover:border-primary hover:text-primary"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="px-6 py-8 lg:px-10">
        {filteredItems.length === 0 ? (
          <p className="text-text-secondary">No questions in this category.</p>
        ) : (
          <div className="grid gap-5 xl:grid-cols-2">
            {filteredItems.map((item, idx) => (
              <div
                key={item.questionId}
                className="rounded-2xl border border-border bg-surface p-6"
              >
                <div className="flex items-center justify-between gap-3 border-b border-border pb-3">
                  <h2 className="pl-7 text-[15px] font-semibold text-text-primary">
                    Question {idx + 1}
                  </h2>

                  <span
                    className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
                      item.isCorrect
                        ? "bg-success/10 text-success"
                        : item.selectedOptionId == null
                        ? "bg-app-bg text-text-secondary"
                        : "bg-error/10 text-error"
                    }`}
                  >
                    {item.isCorrect
                      ? "Correct"
                      : item.selectedOptionId == null
                      ? "Unanswered"
                      : "Wrong"}
                  </span>
                </div>

                <p className="mt-4 max-w-[760px] pl-7 text-[14px] leading-6 text-text-primary">
                  {item.questionText}
                </p>

                <div className="mt-5 space-y-4">
                  {item.options.map((option, optionIndex) => {
                    const letter = String.fromCharCode(65 + optionIndex);
                    const isSelected = option.id === item.selectedOptionId;
                    const isCorrectOption = option.id === item.correctOptionId;

                    return (
                      <div key={option.id} className="flex items-center gap-3">
                        <span
                          className={`flex h-4 w-4 shrink-0 items-center justify-center border ${
                            isCorrectOption
                              ? "border-success bg-success"
                              : isSelected
                              ? "border-error bg-error"
                              : "border-border bg-surface"
                          }`}
                        >
                          {(isCorrectOption || isSelected) && (
                            <svg
                              viewBox="0 0 12 12"
                              className="h-3 w-3 fill-none stroke-white stroke-[2.5]"
                            >
                              {isCorrectOption ? (
                                <path
                                  d="M2 6l2.5 2.5L10 3"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              ) : (
                                <path
                                  d="M3 3l6 6M9 3l-6 6"
                                  strokeLinecap="round"
                                />
                              )}
                            </svg>
                          )}
                        </span>

                        <span
                          className={`text-[14px] ${
                            isCorrectOption
                              ? "font-medium text-success"
                              : isSelected
                              ? "font-medium text-error"
                              : "text-text-secondary"
                          }`}
                        >
                          {letter}. {option.optionText}
                        </span>

                        {(isSelected || isCorrectOption) && (
                          <span
                            className={`shrink-0 text-[11px] font-semibold ${
                              isCorrectOption ? "text-success" : "text-error"
                            }`}
                          >
                            {isCorrectOption && !isSelected
                              ? "Correct answer"
                              : isCorrectOption
                              ? "Your answer — correct"
                              : "Your answer"}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {item.explanation && (
                  <div className="ml-7 mt-4 rounded-xl bg-lavender px-4 py-3 text-sm text-text-primary">
                    <span className="font-semibold">Explanation: </span>
                    {item.explanation}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AnswerReview;
