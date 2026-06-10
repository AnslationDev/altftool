"use client";

import { BulkActionBar as SharedBulkActionBar } from "@altftool/ui";

export default function BulkActionBar({
  count,
  onDelete,
  onClear,
  deleteLabel = "Delete selected",
  cancelLabel = "Cancel",
}) {
  if (!count) return null;

  return (
    <SharedBulkActionBar
      count={count}
      actions={[
        {
          key: "delete",
          label: deleteLabel,
          tone: "danger",
          onClick: onDelete,
        },
      ]}
      onCancel={onClear}
      cancelLabel={cancelLabel}
    />
  );
}
