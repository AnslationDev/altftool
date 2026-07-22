import React from "react";
import { AlertTriangle, X } from "lucide-react";

const CustomConfirmModal = ({ message, onConfirm, onCancel }) => {
  // Prevent clicks inside the modal from closing the app canvas
  const handleModalClick = (e) => e.stopPropagation();

  return (
    // Overlay
    <div
      className="fixed inset-0 bg-background bg-opacity-50 z-50 flex items-center justify-center transition-opacity"
      onClick={onCancel} // Close on outside click
    >
      {/* Modal Container */}
      <div
        className="bg-(--card) dark:bg-(--card) p-6 rounded-xl shadow-2xl max-w-sm w-full animate-zoom-in"
        onClick={handleModalClick}
      >
        <div className="flex justify-between items-start border-b border-(--border) dark:border-(--border) pb-3 mb-4">
          <h3 className="text-lg font-semibold text-(--foreground) flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            Confirmation Required
          </h3>
          <button
            onClick={onCancel}
            className="text-(--muted-foreground) hover:text-(--foreground) transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message Content */}
        <p className="text-(--muted-foreground) mb-6">{message}</p>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3">
          <button
            onClick={onCancel}
            className="py-2 px-4 rounded-lg text-sm font-medium bg-muted  text-(--foreground) hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="py-2 px-4 rounded-lg text-sm font-medium text-foreground bg-red-600 hover:bg-red-700 transition-all shadow-md"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomConfirmModal;
