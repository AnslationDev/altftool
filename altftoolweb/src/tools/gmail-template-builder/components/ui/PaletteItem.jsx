import React from "react";

const PaletteItem = ({
  type,
  label,
  icon: Icon,
  onDragStart: onPropDragStart,
}) => {
  const handleDragStart = (e) => {
    // Execute the prop function (will close the panel and insert component on mobile)
    if (onPropDragStart) {
      onPropDragStart();
    }

    // Initiate the native drag operation (required for desktop functionality)
    e.dataTransfer.setData("componentType", type);
    e.dataTransfer.effectAllowed = "copy";
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart} // USE THE NEW LOCAL HANDLER
      className="flex flex-col items-center justify-center p-4 m-0.5 sm:m-2 bg-(--card) dark:bg-(--card) border border-(--border) dark:border-(--border) rounded-xl shadow-md cursor-grab active:cursor-grabbing hover:shadow-md hover:shadow-xl hover:border-accent transition-all animate-fade-in"
    >
      <Icon className="w-6 h-6 sm:w-8 sm:h-8 mb-1 sm:mb-2 text-accent transition-all-fast hover:scale-110" />
      <span className="text-xs sm:text-sm font-medium text-(--foreground) text-center">
        {label}
      </span>
    </div>
  );
};

export default PaletteItem;
