"use client";

import { ConfirmModal } from "@altftool/ui";

export default function DeleteConfirmModal({
  title = "Confirm delete",
  message,
  description,
  confirmText = "Delete",
  cancelText = "Cancel",
  loading = false,
  onConfirm,
  onCancel,
}) {
  return (
    <ConfirmModal
      open
      title={title}
      description={description}
      message={message ?? (description ? undefined : "This action cannot be undone.")}
      confirmText={confirmText}
      cancelText={cancelText}
      loading={loading}
      variant="danger"
      onConfirm={onConfirm}
      onCancel={onCancel}
    />
  );
}
