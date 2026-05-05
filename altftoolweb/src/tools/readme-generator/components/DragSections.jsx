"use client";

import {
  DragDropContext,
  Droppable,
  Draggable,
} from "@hello-pangea/dnd";
import { GripVertical, List } from "lucide-react";

export default function DragSections({ sectionsOrder, setSectionsOrder }) {
  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(sectionsOrder);
    const [moved] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, moved);

    setSectionsOrder(items);
  };

  if (!sectionsOrder.length) return null;

  return (
    <div className="bg-(--muted) border border-(--border) rounded-lg p-3 mb-4">
      
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <List className="text-(--primary)" />
        <p className="text-sm font-semibold text-(--foreground)">
          Reorder Sections
        </p>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="sections">
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className="flex flex-col gap-2 max-h-40 overflow-y-auto no-scrollbar"
            >
              {sectionsOrder.map((section, index) => (
                <Draggable
                  key={section}
                  draggableId={section}
                  index={index}
                >
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className="
                        flex items-center gap-3
                        bg-(--background)
                        border border-(--border)
                        px-3 py-2 rounded-lg
                        cursor-grab active:cursor-grabbing
                        hover:bg-(--card-hover-bg)
                      "
                    >
                      <GripVertical className="text-(--primary)" />
                      <span className="text-sm">{section}</span>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}