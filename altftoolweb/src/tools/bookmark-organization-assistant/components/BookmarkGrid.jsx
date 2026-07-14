"use client";

import { Droppable, Draggable } from "@hello-pangea/dnd";
import { BookmarkCard } from "./BookmarkCard";

// Draggable grid of bookmark cards inside a single Droppable list.
export function BookmarkGrid({
  bookmarks,
  selectedIds,
  onToggleSelect,
  onToggleFavorite,
  onEdit,
  onDelete,
  onOpen,
}) {
  return (
    <Droppable droppableId="bookmark-list" direction="vertical">
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.droppableProps}
          className={`grid grid-cols-1 gap-4 transition sm:grid-cols-2 lg:grid-cols-3 ${
            snapshot.isDraggingOver ? "rounded-2xl ring-2 ring-(--primary)/40" : ""
          }`}
        >
          {bookmarks.map((bookmark, index) => (
            <Draggable key={bookmark.id} draggableId={bookmark.id} index={index}>
              {(dragProvided, dragSnapshot) => (
                <div
                  ref={dragProvided.innerRef}
                  {...dragProvided.draggableProps}
                  className="h-full"
                >
                  <BookmarkCard
                    bookmark={bookmark}
                    selected={selectedIds.has(bookmark.id)}
                    onToggleSelect={onToggleSelect}
                    onToggleFavorite={onToggleFavorite}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onOpen={onOpen}
                    dragHandleProps={dragProvided.dragHandleProps}
                    isDragging={dragSnapshot.isDragging}
                  />
                </div>
              )}
            </Draggable>
          ))}
          {provided.placeholder}
        </div>
      )}
    </Droppable>
  );
}
