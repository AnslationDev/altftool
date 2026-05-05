"use client";

export default function DeleteConfirmModal({
  title = "Confirm Delete",
  message = "This action cannot be undone.",
  confirmText = "Delete",
  cancelText = "Cancel",
  loading = false,
  onConfirm,
  onCancel,
}) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[10000]">
      <div className="bg-white w-[420px] rounded-xl p-6 space-y-5">

        <h3 className="text-lg font-semibold text-danger">
          {title}
        </h3>

        <p className="text-sm text-muted">
          {message}
        </p>

        <div className="flex justify-end gap-3 pt-4">
          <button
            className="btn"
            onClick={onCancel}
            disabled={loading}
          >
            {cancelText}
          </button>

          <button
            className="btn btn-danger"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? "Deleting..." : confirmText}
          </button>
        </div>

      </div>
    </div>
  );
}