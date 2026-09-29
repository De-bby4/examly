function ConfirmDialog({ open, title, message, confirmLabel = "Confirm", onConfirm, onCancel }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 px-6 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl bg-surface p-6 shadow-lg">
        <h3 className="text-lg font-bold text-text-primary">{title}</h3>
        <p className="mt-2 text-sm text-text-secondary">{message}</p>
        <div className="mt-6 flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 rounded-lg border border-border py-2.5 text-sm font-semibold text-text-secondary hover:bg-app-bg"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 rounded-lg bg-error py-2.5 text-sm font-semibold text-white hover:opacity-90"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDialog;