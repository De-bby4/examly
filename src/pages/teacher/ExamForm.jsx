import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { createExam, updateExam, getExamById } from "../../services/examService";

const defaultForm = {
  title: "",
  description: "",
  durationMinutes: 30,
  passMark: 50,
  maxAttempts: 1,
  randomizeQuestions: false,
  randomizeOptions: false,
  showResultsImmediately: true,
  showCorrectAnswers: true,
  showExplanations: true,
  startDate: "",
  endDate: "",
};

function ExamForm() {
  const { examId } = useParams();
  const isEditing = !!examId && examId !== "new";
  const navigate = useNavigate();

  const [form, setForm] = useState(defaultForm);
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isEditing) {
      getExamById(examId).then((exam) => {
        setForm({
          title: exam.title || "",
          description: exam.description || "",
          durationMinutes: exam.durationMinutes,
          passMark: exam.passMark,
          maxAttempts: exam.maxAttempts,
          randomizeQuestions: exam.randomizeQuestions,
          randomizeOptions: exam.randomizeOptions,
          showResultsImmediately: exam.showResultsImmediately,
          showCorrectAnswers: exam.showCorrectAnswers,
          showExplanations: exam.showExplanations,
          startDate: exam.startDate ? exam.startDate.slice(0, 16) : "",
          endDate: exam.endDate ? exam.endDate.slice(0, 16) : "",
        });
        setLoading(false);
      });
    }
  }, [examId, isEditing]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    const payload = {
      ...form,
      durationMinutes: Number(form.durationMinutes),
      passMark: Number(form.passMark),
      maxAttempts: Number(form.maxAttempts),
      startDate: form.startDate || null,
      endDate: form.endDate || null,
    };

    try {
      if (isEditing) {
        await updateExam(examId, payload);
        navigate(`/teacher/exams/${examId}/questions`);
      } else {
        const created = await createExam(payload);
        navigate(`/teacher/exams/${created.id}/questions`);
      }
    } catch (err) {
      setError(err.response?.data?.error || "Failed to save exam");
      setSaving(false);
    }
  };

  if (loading) return <p className="text-text-secondary">Loading exam...</p>;

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-extrabold text-text-primary">
        {isEditing ? "Edit Exam" : "Create Exam"}
      </h1>
      <p className="mt-1 text-text-secondary">
        {isEditing ? "Update your exam settings." : "Set up a new exam. You can add questions next."}
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-6 rounded-2xl bg-surface p-6 shadow-sm">
        {error && (
          <div className="rounded-lg bg-error/10 px-4 py-3 text-sm text-error">{error}</div>
        )}

        <div>
          <label className="block text-sm font-medium text-text-primary">Title</label>
          <input
            type="text"
            required
            value={form.title}
            onChange={(e) => handleChange("title", e.target.value)}
            className="mt-1 w-full rounded-lg border border-border bg-app-bg px-4 py-2.5 text-text-primary outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            placeholder="e.g. Java Basics Quiz"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary">Description</label>
          <textarea
            value={form.description}
            onChange={(e) => handleChange("description", e.target.value)}
            rows={3}
            className="mt-1 w-full rounded-lg border border-border bg-app-bg px-4 py-2.5 text-text-primary outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            placeholder="Brief description of this exam"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-primary">Duration (minutes)</label>
            <input
              type="number"
              min={1}
              required
              value={form.durationMinutes}
              onChange={(e) => handleChange("durationMinutes", e.target.value)}
              className="mt-1 w-full rounded-lg border border-border bg-app-bg px-4 py-2.5 text-text-primary outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary">Pass Mark (%)</label>
            <input
              type="number"
              min={0}
              max={100}
              required
              value={form.passMark}
              onChange={(e) => handleChange("passMark", e.target.value)}
              className="mt-1 w-full rounded-lg border border-border bg-app-bg px-4 py-2.5 text-text-primary outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary">Max Attempts</label>
          <input
            type="number"
            min={1}
            value={form.maxAttempts}
            onChange={(e) => handleChange("maxAttempts", e.target.value)}
            className="mt-1 w-full max-w-[150px] rounded-lg border border-border bg-app-bg px-4 py-2.5 text-text-primary outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-primary">Start Date (optional)</label>
            <input
              type="datetime-local"
              value={form.startDate}
              onChange={(e) => handleChange("startDate", e.target.value)}
              className="mt-1 w-full rounded-lg border border-border bg-app-bg px-4 py-2.5 text-text-primary outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary">End Date (optional)</label>
            <input
              type="datetime-local"
              value={form.endDate}
              onChange={(e) => handleChange("endDate", e.target.value)}
              className="mt-1 w-full rounded-lg border border-border bg-app-bg px-4 py-2.5 text-text-primary outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        <div>
          <p className="text-sm font-medium text-text-primary">Exam Settings</p>
          <div className="mt-2 space-y-2">
            {[
              { key: "randomizeQuestions", label: "Randomize question order" },
              { key: "randomizeOptions", label: "Randomize answer options" },
              { key: "showResultsImmediately", label: "Show results immediately after submission" },
              { key: "showCorrectAnswers", label: "Show correct answers in review" },
              { key: "showExplanations", label: "Show explanations in review" },
            ].map((setting) => (
              <label key={setting.key} className="flex items-center gap-3 rounded-lg bg-app-bg px-4 py-3">
                <input
                  type="checkbox"
                  checked={form[setting.key]}
                  onChange={(e) => handleChange(setting.key, e.target.checked)}
                  className="h-4 w-4 rounded accent-primary"
                />
                <span className="text-sm text-text-primary">{setting.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex gap-3 border-t border-border pt-5">
          <button
            type="button"
            onClick={() => navigate("/teacher/exams")}
            className="flex-1 rounded-lg border border-border py-2.5 font-semibold text-text-secondary hover:bg-app-bg"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex-1 rounded-lg bg-primary py-2.5 font-semibold text-white hover:bg-primary-dark disabled:opacity-60"
          >
            {saving ? "Saving..." : isEditing ? "Save Changes" : "Create & Add Questions"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default ExamForm;