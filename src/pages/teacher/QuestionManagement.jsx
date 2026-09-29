import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Plus, Pencil, Trash2, Upload, ArrowLeft, HelpCircle } from "lucide-react";
import { getExamById } from "../../services/examService";
import {
  getQuestions,
  addQuestion,
  updateQuestion,
  deleteQuestion,
  importQuestionsCsv,
} from "../../services/questionService";
import ConfirmDialog from "../../components/ConfirmDialog";

const emptyOption = () => ({ optionText: "", isCorrect: false });
const emptyForm = () => ({
  questionText: "",
  explanation: "",
  imageUrl: "",
  options: [emptyOption(), emptyOption(), emptyOption(), emptyOption()],
});

function QuestionManagement() {
  const { examId } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [importing, setImporting] = useState(false);
  const [importMessage, setImportMessage] = useState("");

  const loadQuestions = () => {
    getQuestions(examId).then((data) => {
      setQuestions(data);
      setLoading(false);
    });
  };

  useEffect(() => {
    getExamById(examId).then(setExam);
    loadQuestions();
  }, [examId]);

  const openNewForm = () => {
    setForm(emptyForm());
    setEditingId(null);
    setError("");
    setFormOpen(true);
  };

  const openEditForm = (question) => {
    setForm({
      questionText: question.questionText,
      explanation: question.explanation || "",
      imageUrl: question.imageUrl || "",
      options: question.options.map((o) => ({ optionText: o.optionText, isCorrect: o.isCorrect })),
    });
    setEditingId(question.id);
    setError("");
    setFormOpen(true);
  };

  const handleOptionChange = (index, field, value) => {
    setForm((prev) => {
      const options = [...prev.options];
      if (field === "isCorrect") {
        options.forEach((o, i) => (o.isCorrect = i === index));
      } else {
        options[index] = { ...options[index], [field]: value };
      }
      return { ...prev, options };
    });
  };

  const addOption = () => {
    setForm((prev) => ({ ...prev, options: [...prev.options, emptyOption()] }));
  };

  const removeOption = (index) => {
    setForm((prev) => ({ ...prev, options: prev.options.filter((_, i) => i !== index) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (form.options.length < 2) {
      setError("A question needs at least 2 options.");
      return;
    }
    if (!form.options.some((o) => o.isCorrect)) {
      setError("Mark one option as the correct answer.");
      return;
    }
    if (form.options.some((o) => !o.optionText.trim())) {
      setError("All options need text.");
      return;
    }

    setSaving(true);
    try {
      if (editingId) {
        await updateQuestion(editingId, form);
      } else {
        await addQuestion(examId, form);
      }
      setFormOpen(false);
      loadQuestions();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to save question");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    await deleteQuestion(deleteTarget.id);
    setQuestions((prev) => prev.filter((q) => q.id !== deleteTarget.id));
    setDeleteTarget(null);
  };

  const handleCsvUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImporting(true);
    setImportMessage("");
    try {
      const result = await importQuestionsCsv(examId, file);
      setImportMessage(`Imported ${result.imported} question(s).`);
      loadQuestions();
    } catch (err) {
      setImportMessage(err.response?.data?.error || "Import failed.");
    } finally {
      setImporting(false);
      e.target.value = "";
    }
  };

  if (loading) return <p className="text-text-secondary">Loading questions...</p>;

  return (
    <div className="mx-auto max-w-3xl">
      <button
        onClick={() => navigate("/teacher/exams")}
        className="flex items-center gap-1.5 text-sm font-semibold text-text-secondary hover:text-primary"
      >
        <ArrowLeft size={15} />
        Back to Manage Exams
      </button>

      <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* pl-5 lines the title up with the "Back to Manage Exams" label -
            the back link's icon+gap occupies the same 20px on its left */}
        <div className="pl-5">
          <h1 className="text-2xl font-extrabold tracking-tight text-text-primary">
            {exam?.title}
          </h1>

          <span className="mt-2 inline-block rounded-full bg-app-bg px-2.5 py-0.5 text-xs font-semibold text-text-secondary">
            {questions.length} question(s)
          </span>
        </div>

        <div className="flex gap-2 sm:shrink-0">
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={importing}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-semibold text-text-secondary transition hover:bg-app-bg disabled:opacity-60 sm:flex-none"
          >
            <Upload size={16} />
            {importing ? "Importing..." : "Import CSV"}
          </button>
          <input ref={fileInputRef} type="file" accept=".csv" onChange={handleCsvUpload} className="hidden" />
          <button
            onClick={openNewForm}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-dark sm:flex-none"
          >
            <Plus size={16} />
            Add Question
          </button>
        </div>
      </div>

      {importMessage && (
        <p className="mt-3 text-sm font-semibold text-primary">{importMessage}</p>
      )}

      {questions.length === 0 ? (
        <div className="mt-6 flex flex-col items-center justify-center rounded-2xl border border-border bg-surface px-6 py-12 text-center shadow-sm">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-lavender text-primary">
            <HelpCircle size={20} />
          </span>

          <p className="mt-3 text-sm text-text-secondary">
            No questions yet. Use “Add Question” to create your first one.
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {questions.map((q, i) => (
            <div key={q.id} className="rounded-2xl bg-surface p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <p className="font-semibold text-text-primary">
                  {i + 1}. {q.questionText}
                </p>
                <div className="flex shrink-0 gap-1">
                  <button
                    onClick={() => openEditForm(q)}
                    className="rounded-lg p-2 text-text-secondary hover:bg-app-bg hover:text-primary"
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(q)}
                    className="rounded-lg p-2 text-text-secondary hover:bg-error/10 hover:text-error"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
              <div className="mt-3 space-y-1.5">
                {q.options.map((o) => (
                  <div
                    key={o.id}
                    className={`rounded-lg px-3 py-1.5 text-sm ${
                      o.isCorrect ? "bg-success/10 text-success" : "text-text-secondary"
                    }`}
                  >
                    {o.optionText} {o.isCorrect && "✓"}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {questions.length > 0 && (
        <button
          onClick={() => navigate("/teacher/exams")}
          className="mt-8 w-full rounded-lg bg-primary py-3 font-semibold text-white transition hover:bg-primary-dark"
        >
          Done — Back to Manage Exams
        </button>
      )}

      {/* Question form modal */}
      {formOpen && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/30 px-6 py-10 backdrop-blur-sm">
          <div className="max-h-full w-full max-w-xl overflow-y-auto rounded-2xl bg-surface p-6 shadow-lg">
            <h2 className="text-lg font-bold text-text-primary">
              {editingId ? "Edit Question" : "Add Question"}
            </h2>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              {error && (
                <div className="rounded-lg bg-error/10 px-4 py-3 text-sm text-error">{error}</div>
              )}

              <div>
                <label className="block text-sm font-medium text-text-primary">Question Text</label>
                <textarea
                  required
                  rows={2}
                  value={form.questionText}
                  onChange={(e) => setForm((p) => ({ ...p, questionText: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-border bg-app-bg px-4 py-2.5 text-text-primary outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary">Explanation (optional)</label>
                <textarea
                  rows={2}
                  value={form.explanation}
                  onChange={(e) => setForm((p) => ({ ...p, explanation: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-border bg-app-bg px-4 py-2.5 text-text-primary outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary">Image URL (optional)</label>
                <input
                  type="text"
                  value={form.imageUrl}
                  onChange={(e) => setForm((p) => ({ ...p, imageUrl: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-border bg-app-bg px-4 py-2.5 text-text-primary outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-text-primary">Options</label>
                  <button
                    type="button"
                    onClick={addOption}
                    className="text-sm font-semibold text-primary hover:underline"
                  >
                    + Add option
                  </button>
                </div>

                <div className="mt-2 space-y-2">
                  {form.options.map((option, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="correctOption"
                        checked={option.isCorrect}
                        onChange={() => handleOptionChange(i, "isCorrect", true)}
                        className="h-4 w-4 accent-success"
                        title="Mark as correct"
                      />
                      <input
                        type="text"
                        required
                        value={option.optionText}
                        onChange={(e) => handleOptionChange(i, "optionText", e.target.value)}
                        placeholder={`Option ${i + 1}`}
                        className="flex-1 rounded-lg border border-border bg-app-bg px-3 py-2 text-sm text-text-primary outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                      />
                      {form.options.length > 2 && (
                        <button
                          type="button"
                          onClick={() => removeOption(i)}
                          className="rounded-lg p-2 text-text-secondary hover:bg-error/10 hover:text-error"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 border-t border-border pt-4">
                <button
                  type="button"
                  onClick={() => setFormOpen(false)}
                  className="flex-1 rounded-lg border border-border py-2.5 font-semibold text-text-secondary hover:bg-app-bg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 rounded-lg bg-primary py-2.5 font-semibold text-white hover:bg-primary-dark disabled:opacity-60"
                >
                  {saving ? "Saving..." : "Save Question"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete this question?"
        message="This question and its options will be permanently deleted."
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

export default QuestionManagement;