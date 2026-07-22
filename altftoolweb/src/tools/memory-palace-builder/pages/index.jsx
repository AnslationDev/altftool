"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Building2,
  Plus,
  Download,
  Upload,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Trash2,
  Pencil,
  Eye,
  DoorOpen,
  Lightbulb,
  FileText,
  AlertCircle,
  Check,
  X,
  RotateCcw,
  BookOpen,
  ListChecks,
} from "lucide-react";

const STORAGE_KEY = "altf-memory-palace-data";
const MODE = { VIEW: "view", REVIEW: "review" };

let idCounter = Date.now();
function uid() {
  return (++idCounter).toString(36);
}

function createPalace(name = "") {
  return { id: uid(), name: name || "New Palace", rooms: [] };
}
function createRoom(name = "") {
  return { id: uid(), name: name || "New Room", items: [] };
}
function createItem(name = "") {
  return {
    id: uid(),
    name: name || "New Object",
    association: "",
    notes: "",
  };
}

function deepClone(data) {
  return JSON.parse(JSON.stringify(data));
}

function Toast({ message, tone, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [onClose]);

  const bg =
    tone === "success"
      ? "border-emerald-500/30 bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200"
      : tone === "error"
        ? "border-red-500/30 bg-red-50 text-red-800 dark:bg-red-950 dark:text-red-200"
        : "border-[var(--border)] bg-[var(--card)] text-[var(--foreground)]";

  return (
    <div
      role="alert"
      className={`flex items-center gap-2 rounded-lg border px-4 py-3 text-sm font-medium shadow-lg ${bg}`}
    >
      <span className="flex-1">{message}</span>
      <button onClick={onClose} className="shrink-0 hover:opacity-70" aria-label="Dismiss">
        <X size={14} />
      </button>
    </div>
  );
}

function EmptyState({ icon: Icon, title, description, action, onAction }) {
  return (
    <div className="flex min-h-[280px] flex-col items-center justify-center rounded-xl border border-dashed border-[var(--border)] bg-[var(--card)]/50 p-8 text-center">
      <div className="rounded-full bg-[var(--muted)] p-4">
        <Icon size={32} className="text-[var(--muted-foreground)]" />
      </div>
      <h3 className="mt-4 text-lg font-medium text-[var(--foreground)]">{title}</h3>
      {description && (
        <p className="mt-2 max-w-md text-sm text-[var(--muted-foreground)]">{description}</p>
      )}
      {action && onAction && (
        <button
          onClick={onAction}
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-[var(--primary-foreground)] hover:opacity-90 transition-colors"
        >
          <Plus size={16} /> {action}
        </button>
      )}
    </div>
  );
}

function Modal({ open, onClose, title, children }) {
  useEffect(() => {
    if (open) {
      const handler = (e) => {
        if (e.key === "Escape") onClose();
      };
      window.addEventListener("keydown", handler);
      return () => window.removeEventListener("keydown", handler);
    }
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-[var(--foreground)]">{title}</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export default function MemoryPalaceBuilder() {
  const [data, setData] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(null);
  const [toasts, setToasts] = useState([]);

  const [selectedPalaceId, setSelectedPalaceId] = useState(null);
  const [mode, setMode] = useState(MODE.VIEW);

  const [palaceModal, setPalaceModal] = useState({ open: false, editing: null });
  const [roomModal, setRoomModal] = useState({ open: false, palaceId: null, editing: null });
  const [itemModal, setItemModal] = useState({ open: false, palaceId: null, roomId: null, editing: null });
  const [expandedRooms, setExpandedRooms] = useState({});

  const [reviewStep, setReviewStep] = useState(0);
  const [reviewRevealed, setReviewRevealed] = useState(false);

  const [palaceNameEdit, setPalaceNameEdit] = useState("");
  const [roomNameEdit, setRoomNameEdit] = useState("");
  const [itemNameEdit, setItemNameEdit] = useState("");
  const [itemAssociationEdit, setItemAssociationEdit] = useState("");
  const [itemNotesEdit, setItemNotesEdit] = useState("");

  const addToast = useCallback((message, tone = "info") => {
    const id = uid();
    setToasts((prev) => [...prev, { id, message, tone }]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && Array.isArray(parsed.palaces)) {
          setData(parsed);
        } else {
          setData({ palaces: [] });
        }
      } else {
        setData({ palaces: [] });
      }
    } catch {
      setData({ palaces: [] });
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded && data) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      } catch {
        setError("Could not save to localStorage. Storage may be full.");
      }
    }
  }, [data, loaded]);

  const palaces = useMemo(() => (data ? data.palaces : []), [data]);
  const selectedPalace = useMemo(
    () => palaces.find((p) => p.id === selectedPalaceId) || null,
    [palaces, selectedPalaceId]
  );

  const reviewItems = useMemo(() => {
    if (!selectedPalace) return [];
    const items = [];
    selectedPalace.rooms.forEach((room) => {
      room.items.forEach((item) => {
        items.push({ ...item, roomName: room.name });
      });
    });
    return items;
  }, [selectedPalace]);

  function persist(updater) {
    setData((prev) => {
      const next = deepClone(prev);
      updater(next);
      return next;
    });
  }

  function handleCreatePalace() {
    persist((d) => {
      d.palaces.push(createPalace(""));
    });
    addToast("Palace created", "success");
  }

  function handleSavePalace() {
    const name = palaceNameEdit.trim();
    if (!name) return;
    persist((d) => {
      const p = d.palaces.find((x) => x.id === palaceModal.editing?.id);
      if (p) p.name = name;
    });
    setPalaceModal({ open: false, editing: null });
    addToast("Palace renamed", "success");
  }

  function handleDeletePalace(id) {
    persist((d) => {
      d.palaces = d.palaces.filter((p) => p.id !== id);
    });
    if (selectedPalaceId === id) {
      setSelectedPalaceId(null);
      setMode(MODE.VIEW);
    }
    addToast("Palace deleted", "success");
  }

  function handleReorderPalace(index, direction) {
    persist((d) => {
      const target = direction === "up" ? index - 1 : index + 1;
      if (target < 0 || target >= d.palaces.length) return;
      [d.palaces[index], d.palaces[target]] = [d.palaces[target], d.palaces[index]];
    });
  }

  function handleAddRoom() {
    if (!selectedPalace) return;
    persist((d) => {
      const p = d.palaces.find((x) => x.id === selectedPalaceId);
      if (p) p.rooms.push(createRoom(""));
    });
    addToast("Room added", "success");
  }

  function handleSaveRoom() {
    const name = roomNameEdit.trim();
    if (!name) return;
    persist((d) => {
      const p = d.palaces.find((x) => x.id === roomModal.palaceId);
      if (!p) return;
      const r = p.rooms.find((x) => x.id === roomModal.editing?.id);
      if (r) r.name = name;
    });
    setRoomModal({ open: false, palaceId: null, editing: null });
  }

  function handleDeleteRoom(palaceId, roomId) {
    persist((d) => {
      const p = d.palaces.find((x) => x.id === palaceId);
      if (p) p.rooms = p.rooms.filter((r) => r.id !== roomId);
    });
    setExpandedRooms((prev) => {
      const next = { ...prev };
      delete next[roomId];
      return next;
    });
    addToast("Room deleted", "success");
  }

  function handleReorderRoom(palaceId, index, direction) {
    persist((d) => {
      const p = d.palaces.find((x) => x.id === palaceId);
      if (!p) return;
      const target = direction === "up" ? index - 1 : index + 1;
      if (target < 0 || target >= p.rooms.length) return;
      [p.rooms[index], p.rooms[target]] = [p.rooms[target], p.rooms[index]];
    });
  }

  function handleAddItem(palaceId, roomId) {
    persist((d) => {
      const p = d.palaces.find((x) => x.id === palaceId);
      if (!p) return;
      const r = p.rooms.find((x) => x.id === roomId);
      if (r) r.items.push(createItem(""));
    });
    addToast("Item added", "success");
  }

  function handleSaveItem() {
    const name = itemNameEdit.trim();
    if (!name) return;
    persist((d) => {
      const p = d.palaces.find((x) => x.id === itemModal.palaceId);
      if (!p) return;
      const r = p.rooms.find((x) => x.id === itemModal.roomId);
      if (!r) return;
      const item = r.items.find((x) => x.id === itemModal.editing?.id);
      if (item) {
        item.name = name;
        item.association = itemAssociationEdit;
        item.notes = itemNotesEdit;
      }
    });
    setItemModal({ open: false, palaceId: null, roomId: null, editing: null });
    addToast("Item saved", "success");
  }

  function handleDeleteItem(palaceId, roomId, itemId) {
    persist((d) => {
      const p = d.palaces.find((x) => x.id === palaceId);
      if (!p) return;
      const r = p.rooms.find((x) => x.id === roomId);
      if (r) r.items = r.items.filter((x) => x.id !== itemId);
    });
    addToast("Item deleted", "success");
  }

  function handleReorderItem(palaceId, roomId, index, direction) {
    persist((d) => {
      const p = d.palaces.find((x) => x.id === palaceId);
      if (!p) return;
      const r = p.rooms.find((x) => x.id === roomId);
      if (!r) return;
      const target = direction === "up" ? index - 1 : index + 1;
      if (target < 0 || target >= r.items.length) return;
      [r.items[index], r.items[target]] = [r.items[target], r.items[index]];
    });
  }

  function toggleRoomExpand(roomId) {
    setExpandedRooms((prev) => ({ ...prev, [roomId]: !prev[roomId] }));
  }

  function startReview() {
    if (reviewItems.length === 0) return;
    setMode(MODE.REVIEW);
    setReviewStep(0);
    setReviewRevealed(false);
  }

  function stopReview() {
    setMode(MODE.VIEW);
    setReviewRevealed(false);
  }

  function nextReviewItem() {
    if (reviewStep < reviewItems.length - 1) {
      setReviewStep((s) => s + 1);
      setReviewRevealed(false);
    }
  }

  function prevReviewItem() {
    if (reviewStep > 0) {
      setReviewStep((s) => s - 1);
      setReviewRevealed(false);
    }
  }

  function handleExport() {
    try {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `memory-palace-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      addToast("Exported successfully", "success");
    } catch {
      addToast("Export failed", "error");
    }
  }

  function handleImport(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target.result);
        if (!imported.palaces || !Array.isArray(imported.palaces)) {
          addToast("Invalid file format", "error");
          return;
        }
        setData(imported);
        setSelectedPalaceId(null);
        setMode(MODE.VIEW);
        addToast(`Imported ${imported.palaces.length} palace(s)`, "success");
      } catch {
        addToast("Invalid JSON file", "error");
      }
    };
    reader.readAsText(file);
    e.target.value = null;
  }

  function openPalaceModal(palace) {
    setPalaceNameEdit(palace?.name || "");
    setPalaceModal({ open: true, editing: palace || null });
  }

  function openRoomModal(palaceId, room) {
    setRoomNameEdit(room?.name || "");
    setRoomModal({ open: true, palaceId, editing: room || null });
  }

  function openItemModal(palaceId, roomId, item) {
    setItemNameEdit(item?.name || "");
    setItemAssociationEdit(item?.association || "");
    setItemNotesEdit(item?.notes || "");
    setItemModal({ open: true, palaceId, roomId, editing: item || null });
  }

  if (!loaded) {
    return (
      <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6 pb-20">
        <div className="mx-auto max-w-5xl flex items-center justify-center min-h-[60vh]">
          <div className="flex items-center gap-3 text-[var(--muted-foreground)]">
            <Building2 className="h-6 w-6 animate-pulse" />
            <span className="text-sm font-medium">Loading...</span>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6 pb-20">
      <div className="mx-auto max-w-5xl space-y-6">
        {mode === MODE.REVIEW && selectedPalace ? (
          <ReviewView
            palace={selectedPalace}
            items={reviewItems}
            step={reviewStep}
            revealed={reviewRevealed}
            onReveal={() => setReviewRevealed(true)}
            onPrev={prevReviewItem}
            onNext={nextReviewItem}
            onExit={stopReview}
          />
        ) : (
          <>
            <Header
              palace={selectedPalace}
              onBack={() => {
                setSelectedPalaceId(null);
                setMode(MODE.VIEW);
              }}
              onExport={handleExport}
              onImport={handleImport}
              onNewPalace={handleCreatePalace}
              onEditPalace={selectedPalace ? () => openPalaceModal(selectedPalace) : null}
              onDeletePalace={selectedPalace ? () => handleDeletePalace(selectedPalace.id) : null}
              onReview={selectedPalace && reviewItems.length > 0 ? startReview : null}
              onAddRoom={selectedPalace ? handleAddRoom : null}
            />

            {error && (
              <div className="flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-50 p-4 text-sm text-amber-800 dark:bg-amber-950 dark:text-amber-200">
                <AlertCircle size={16} />
                <span>{error}</span>
                <button onClick={() => setError(null)} className="ml-auto hover:opacity-70" aria-label="Dismiss error">
                  <X size={14} />
                </button>
              </div>
            )}

            {!selectedPalace ? (
              <PalaceListView
                palaces={palaces}
                onSelect={(id) => setSelectedPalaceId(id)}
                onEdit={openPalaceModal}
                onDelete={handleDeletePalace}
                onReorder={handleReorderPalace}
                onNewPalace={handleCreatePalace}
              />
            ) : (
              <PalaceView
                palace={selectedPalace}
                expandedRooms={expandedRooms}
                onToggleRoom={toggleRoomExpand}
                onEditRoom={(room) => openRoomModal(selectedPalace.id, room)}
                onDeleteRoom={(roomId) => handleDeleteRoom(selectedPalace.id, roomId)}
                onReorderRoom={(index, dir) => handleReorderRoom(selectedPalace.id, index, dir)}
                onAddRoom={handleAddRoom}
                onAddItem={(roomId) => handleAddItem(selectedPalace.id, roomId)}
                onEditItem={(roomId, item) => openItemModal(selectedPalace.id, roomId, item)}
                onDeleteItem={(roomId, itemId) => handleDeleteItem(selectedPalace.id, roomId, itemId)}
                onReorderItem={(roomId, index, dir) => handleReorderItem(selectedPalace.id, roomId, index, dir)}
              />
            )}
          </>
        )}
      </div>

      <Modal
        open={palaceModal.open}
        onClose={() => setPalaceModal({ open: false, editing: null })}
        title={palaceModal.editing ? "Rename Palace" : "New Palace"}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSavePalace();
          }}
        >
          <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">Palace Name</label>
          <input
            type="text"
            value={palaceNameEdit}
            onChange={(e) => setPalaceNameEdit(e.target.value)}
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:border-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20"
            placeholder="e.g. Roman Forum"
            autoFocus
            required
          />
          <div className="mt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setPalaceModal({ open: false, editing: null })}
              className="rounded-lg border border-[var(--border)] px-4 py-2 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-[var(--primary-foreground)] hover:opacity-90 transition-colors"
            >
              Save
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        open={roomModal.open}
        onClose={() => setRoomModal({ open: false, palaceId: null, editing: null })}
        title={roomModal.editing ? "Rename Room" : "New Room"}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSaveRoom();
          }}
        >
          <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">Room Name</label>
          <input
            type="text"
            value={roomNameEdit}
            onChange={(e) => setRoomNameEdit(e.target.value)}
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:border-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20"
            placeholder="e.g. Entrance Hall"
            autoFocus
            required
          />
          <div className="mt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setRoomModal({ open: false, palaceId: null, editing: null })}
              className="rounded-lg border border-[var(--border)] px-4 py-2 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-[var(--primary-foreground)] hover:opacity-90 transition-colors"
            >
              Save
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        open={itemModal.open}
        onClose={() => setItemModal({ open: false, palaceId: null, roomId: null, editing: null })}
        title={itemModal.editing ? "Edit Item" : "New Item"}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSaveItem();
          }}
          className="space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">Object Name</label>
            <input
              type="text"
              value={itemNameEdit}
              onChange={(e) => setItemNameEdit(e.target.value)}
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:border-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20"
              placeholder="e.g. Marble Column"
              autoFocus
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">Association</label>
            <textarea
              value={itemAssociationEdit}
              onChange={(e) => setItemAssociationEdit(e.target.value)}
              rows={2}
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:border-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 resize-none"
              placeholder="What do you want to remember with this object?"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">Notes</label>
            <textarea
              value={itemNotesEdit}
              onChange={(e) => setItemNotesEdit(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:border-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 resize-none"
              placeholder="Additional notes or memory cues..."
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setItemModal({ open: false, palaceId: null, roomId: null, editing: null })}
              className="rounded-lg border border-[var(--border)] px-4 py-2 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-[var(--primary-foreground)] hover:opacity-90 transition-colors"
            >
              Save
            </button>
          </div>
        </form>
      </Modal>

      <div className="fixed bottom-4 right-4 z-50 space-y-2">
        {toasts.map((t) => (
          <Toast key={t.id} message={t.message} tone={t.tone} onClose={() => removeToast(t.id)} />
        ))}
      </div>
    </main>
  );
}

function Header({
  palace,
  onBack,
  onExport,
  onImport,
  onNewPalace,
  onEditPalace,
  onDeletePalace,
  onReview,
  onAddRoom,
}) {
  return (
    <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 shadow-sm sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3 min-w-0">
          {palace && (
            <button
              onClick={onBack}
              className="mt-1 shrink-0 rounded-lg p-1.5 text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
              aria-label="Back to palaces"
            >
              <ChevronLeft size={20} />
            </button>
          )}
          <div className="min-w-0">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase text-[var(--primary)]">
              {palace ? <DoorOpen className="h-3.5 w-3.5" /> : <Building2 className="h-3.5 w-3.5" />}
              {palace ? "Memory Palace" : "Memory Palace Builder"}
            </div>
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--muted)] shadow-sm">
              {palace ? (
                <DoorOpen className="h-6 w-6 text-[var(--primary)]" />
              ) : (
                <Building2 className="h-6 w-6 text-[var(--primary)]" />
              )}
            </div>
            <h1 className="tool-heading-accent text-2xl font-bold leading-tight sm:text-3xl truncate">
              {palace ? palace.name : "Memory Palace Builder"}
            </h1>
            {!palace && (
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted-foreground)]">
                Use the method of loci — build virtual palaces with rooms and objects to memorise anything.
              </p>
            )}
            {palace && (
              <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                {palace.rooms.length} room{palace.rooms.length !== 1 && "s"} &middot;{" "}
                {palace.rooms.reduce((s, r) => s + r.items.length, 0)} item
                {palace.rooms.reduce((s, r) => s + r.items.length, 0) !== 1 && "s"}
              </p>
            )}
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap gap-2">
          {palace ? (
            <>
              {onReview && (
                <button
                  onClick={onReview}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--primary)] px-3 py-2 text-sm font-semibold text-[var(--primary-foreground)] hover:opacity-90 transition-colors"
                >
                  <Eye size={15} /> Review
                </button>
              )}
              {onAddRoom && (
                <button
                  onClick={onAddRoom}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm font-semibold text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors"
                >
                  <Plus size={15} /> Room
                </button>
              )}
              {onEditPalace && (
                <button
                  onClick={onEditPalace}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm font-semibold text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors"
                  aria-label="Rename palace"
                >
                  <Pencil size={15} />
                </button>
              )}
              {onDeletePalace && (
                <button
                  onClick={onDeletePalace}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-100 transition-colors dark:border-red-800 dark:bg-red-950 dark:text-red-300 dark:hover:bg-red-900"
                  aria-label="Delete palace"
                >
                  <Trash2 size={15} />
                </button>
              )}
            </>
          ) : (
            <>
              <button
                onClick={onNewPalace}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--primary)] px-3 py-2 text-sm font-semibold text-[var(--primary-foreground)] hover:opacity-90 transition-colors"
              >
                <Plus size={15} /> New Palace
              </button>
            </>
          )}
          <button
            onClick={onExport}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm font-semibold text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors"
            aria-label="Export data"
          >
            <Download size={15} />
          </button>
          <div className="relative overflow-hidden inline-block">
            <button className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm font-semibold text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors">
              <Upload size={15} /> Import
            </button>
            <input
              type="file"
              accept=".json"
              onChange={onImport}
              className="absolute inset-0 cursor-pointer opacity-0"
              aria-label="Import JSON file"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function PalaceListView({ palaces, onSelect, onEdit, onDelete, onReorder, onNewPalace }) {
  if (palaces.length === 0) {
    return (
      <EmptyState
        icon={Building2}
        title="No palaces yet"
        description="Create your first memory palace to start using the method of loci."
        action="Create Palace"
        onAction={onNewPalace}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {palaces.map((palace, idx) => {
        const itemCount = palace.rooms.reduce((s, r) => s + r.items.length, 0);
        return (
          <button
            key={palace.id}
            onClick={() => onSelect(palace.id)}
            className="group relative rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 text-left shadow-sm hover:border-[var(--primary)]/40 hover:shadow-md transition-all"
          >
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--muted)]">
              <DoorOpen className="h-5 w-5 text-[var(--primary)]" />
            </div>
            <h3 className="font-bold text-[var(--foreground)] truncate">{palace.name}</h3>
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              {palace.rooms.length} room{palace.rooms.length !== 1 && "s"} &middot; {itemCount} item
              {itemCount !== 1 && "s"}
            </p>

            <div
              onClick={(e) => e.stopPropagation()}
              className="absolute right-2 top-2 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              {idx > 0 && (
                <button
                  onClick={() => onReorder(idx, "up")}
                  className="rounded p-1 text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]"
                  aria-label="Move palace up"
                >
                  <ChevronUp size={14} />
                </button>
              )}
              {idx < palaces.length - 1 && (
                <button
                  onClick={() => onReorder(idx, "down")}
                  className="rounded p-1 text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]"
                  aria-label="Move palace down"
                >
                  <ChevronDown size={14} />
                </button>
              )}
              <button
                onClick={() => onEdit(palace)}
                className="rounded p-1 text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]"
                aria-label="Rename palace"
              >
                <Pencil size={14} />
              </button>
              <button
                onClick={() => onDelete(palace.id)}
                className="rounded p-1 text-[var(--muted-foreground)] hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/30"
                aria-label="Delete palace"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </button>
        );
      })}
    </div>
  );
}

function PalaceView({
  palace,
  expandedRooms,
  onToggleRoom,
  onEditRoom,
  onDeleteRoom,
  onReorderRoom,
  onAddRoom,
  onAddItem,
  onEditItem,
  onDeleteItem,
  onReorderItem,
}) {
  if (palace.rooms.length === 0) {
    return (
      <EmptyState
        icon={DoorOpen}
        title="No rooms in this palace"
        description="Add rooms to organise your memory objects. Think of each room as a distinct location."
        action="Add Room"
        onAction={onAddRoom}
      />
    );
  }

  return (
    <div className="space-y-4">
      {palace.rooms.map((room, roomIdx) => {
        const expanded = expandedRooms[room.id] !== false;
        return (
          <div
            key={room.id}
            className="rounded-lg border border-[var(--border)] bg-[var(--card)] shadow-sm overflow-hidden"
          >
            <div
              className="flex items-center gap-2 px-4 py-3 cursor-pointer hover:bg-[var(--muted)]/50 transition-colors"
              onClick={() => onToggleRoom(room.id)}
              role="button"
              tabIndex={0}
              aria-expanded={expanded}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onToggleRoom(room.id);
                }
              }}
            >
              <ChevronRight
                size={16}
                className={`shrink-0 text-[var(--muted-foreground)] transition-transform ${expanded ? "rotate-90" : ""}`}
              />

              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--muted)]">
                <DoorOpen size={14} className="text-[var(--primary)]" />
              </div>

              <span className="flex-1 font-semibold text-[var(--foreground)] truncate">{room.name}</span>
              <span className="mr-2 text-xs text-[var(--muted-foreground)]">
                {room.items.length} item{room.items.length !== 1 && "s"}
              </span>

              <div className="flex gap-0.5" onClick={(e) => e.stopPropagation()}>
                {roomIdx > 0 && (
                  <button
                    onClick={() => onReorderRoom(roomIdx, "up")}
                    className="rounded p-1 text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]"
                    aria-label="Move room up"
                  >
                    <ChevronUp size={14} />
                  </button>
                )}
                {roomIdx < palace.rooms.length - 1 && (
                  <button
                    onClick={() => onReorderRoom(roomIdx, "down")}
                    className="rounded p-1 text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]"
                    aria-label="Move room down"
                  >
                    <ChevronDown size={14} />
                  </button>
                )}
                <button
                  onClick={() => onEditRoom(room)}
                  className="rounded p-1 text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]"
                  aria-label="Rename room"
                >
                  <Pencil size={14} />
                </button>
                <button
                  onClick={() => onDeleteRoom(room.id)}
                  className="rounded p-1 text-[var(--muted-foreground)] hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/30"
                  aria-label="Delete room"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            {expanded && (
              <div className="border-t border-[var(--border)] px-4 py-3 space-y-2">
                {room.items.length === 0 ? (
                  <p className="py-4 text-center text-sm text-[var(--muted-foreground)]">
                    No items yet. Add objects to this room.
                  </p>
                ) : (
                  room.items.map((item, itemIdx) => (
                    <div
                      key={item.id}
                      className="flex items-start gap-3 rounded-lg border border-[var(--border)] bg-[var(--background)] p-3"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--muted)]">
                        <Lightbulb size={15} className="text-[var(--primary)]" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-[var(--foreground)] truncate">
                              {item.name}
                            </p>
                            {item.association && (
                              <p className="mt-0.5 text-xs text-[var(--primary)] truncate">
                                &rarr; {item.association}
                              </p>
                            )}
                          </div>
                          <div className="flex shrink-0 gap-0.5">
                            {itemIdx > 0 && (
                              <button
                                onClick={() => onReorderItem(room.id, itemIdx, "up")}
                                className="rounded p-1 text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]"
                                aria-label="Move item up"
                              >
                                <ChevronUp size={13} />
                              </button>
                            )}
                            {itemIdx < room.items.length - 1 && (
                              <button
                                onClick={() => onReorderItem(room.id, itemIdx, "down")}
                                className="rounded p-1 text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]"
                                aria-label="Move item down"
                              >
                                <ChevronDown size={13} />
                              </button>
                            )}
                            <button
                              onClick={() => onEditItem(room.id, item)}
                              className="rounded p-1 text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]"
                              aria-label="Edit item"
                            >
                              <Pencil size={13} />
                            </button>
                            <button
                              onClick={() => onDeleteItem(room.id, item.id)}
                              className="rounded p-1 text-[var(--muted-foreground)] hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/30"
                              aria-label="Delete item"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                        {item.notes && (
                          <div className="mt-1.5 flex items-start gap-1.5">
                            <FileText size={12} className="mt-0.5 shrink-0 text-[var(--muted-foreground)]" />
                            <p className="text-xs text-[var(--muted-foreground)] line-clamp-2">{item.notes}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
                <button
                  onClick={() => onAddItem(room.id)}
                  className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-[var(--border)] px-3 py-2 text-xs font-semibold text-[var(--muted-foreground)] hover:border-[var(--primary)]/40 hover:text-[var(--primary)] transition-colors"
                >
                  <Plus size={13} /> Add Object
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function ReviewView({ palace, items, step, revealed, onReveal, onPrev, onNext, onExit }) {
  const item = items[step];
  const progress = items.length > 0 ? ((step + 1) / items.length) * 100 : 0;

  return (
    <div className="space-y-4">
      <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 shadow-sm sm:p-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={onExit}
              className="rounded-lg p-1.5 text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
              aria-label="Exit review"
            >
              <X size={18} />
            </button>
            <div>
              <h2 className="text-lg font-bold text-[var(--foreground)]">
                <Eye className="inline h-4 w-4 mr-1.5 -mt-0.5" />
                Review: {palace.name}
              </h2>
              <p className="text-xs text-[var(--muted-foreground)]">
                {items.length} item{items.length !== 1 && "s"} &middot; Step {step + 1} of {items.length}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onPrev}
              disabled={step === 0}
              className="inline-flex items-center gap-1 rounded-lg border border-[var(--border)] px-3 py-2 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors disabled:opacity-40 disabled:pointer-events-none"
              aria-label="Previous item"
            >
              <ChevronLeft size={15} /> Prev
            </button>
            <button
              onClick={onNext}
              disabled={step >= items.length - 1}
              className="inline-flex items-center gap-1 rounded-lg border border-[var(--border)] px-3 py-2 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors disabled:opacity-40 disabled:pointer-events-none"
              aria-label="Next item"
            >
              Next <ChevronRight size={15} />
            </button>
          </div>
        </div>

        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-[var(--muted)]">
          <div
            className="h-full rounded-full bg-[var(--primary)] transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </section>

      {item ? (
        <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm sm:p-8">
          <div className="mb-2 flex items-center gap-2">
            <span className="rounded-full bg-[var(--muted)] px-2.5 py-0.5 text-xs font-semibold text-[var(--primary)]">
              {item.roomName}
            </span>
            <span className="text-xs text-[var(--muted-foreground)]">
              Object {step + 1}
            </span>
          </div>

          <div className="mt-4 flex flex-col items-center text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-[var(--muted)] mb-4">
              <Lightbulb className="h-9 w-9 text-[var(--primary)]" />
            </div>
            <h3 className="text-2xl font-bold text-[var(--foreground)]">{item.name}</h3>
          </div>

          <div className="mt-8 flex justify-center">
            {revealed ? (
              <div className="w-full max-w-lg space-y-4 animate-in fade-in">
                <div className="rounded-xl border border-[var(--primary)]/30 bg-[var(--primary)]/5 p-5 text-center">
                  <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)] mb-2">
                    Association
                  </p>
                  <p className="text-lg font-medium text-[var(--foreground)]">
                    {item.association || <span className="italic text-[var(--muted-foreground)]">No association set</span>}
                  </p>
                </div>
                {item.notes && (
                  <div className="rounded-xl border border-[var(--border)] bg-[var(--background)] p-4">
                    <div className="flex items-start gap-2">
                      <FileText size={14} className="mt-0.5 shrink-0 text-[var(--muted-foreground)]" />
                      <p className="text-sm text-[var(--muted-foreground)] whitespace-pre-wrap">{item.notes}</p>
                    </div>
                  </div>
                )}
                <div className="flex justify-center gap-2">
                  <button
                    onClick={onReveal}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border)] px-4 py-2 text-sm font-medium text-[var(--muted-foreground)] hover:bg-[var(--muted)] transition-colors"
                  >
                    <RotateCcw size={14} /> Hide
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4">
                <p className="text-sm text-[var(--muted-foreground)]">Try to recall the association...</p>
                <button
                  onClick={onReveal}
                  className="inline-flex items-center gap-2 rounded-xl bg-[var(--primary)] px-6 py-3 text-base font-bold text-[var(--primary-foreground)] hover:opacity-90 transition-colors shadow-lg"
                >
                  <Eye size={18} /> Reveal Association
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-[var(--muted)] p-4">
              <Check size={32} className="text-emerald-500" />
            </div>
          </div>
          <h3 className="text-xl font-bold text-[var(--foreground)]">Review Complete!</h3>
          <p className="mt-2 text-sm text-[var(--muted-foreground)]">
            You have reviewed all {items.length} item{items.length !== 1 && "s"} in {palace.name}.
          </p>
          <button
            onClick={onExit}
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-5 py-2.5 text-sm font-semibold text-[var(--primary-foreground)] hover:opacity-90 transition-colors"
          >
            <BookOpen size={16} /> Back to Palace
          </button>
        </div>
      )}

      {items.length > 0 && (
        <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <ListChecks size={14} className="text-[var(--primary)]" />
            <span className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">
              All Items
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {items.map((i, idx) => (
              <button
                key={idx}
                onClick={() => {
                  // allow jumping directly — but we keep it simple: step click
                  // handled below via simulation
                }}
                className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-colors ${
                  idx === step
                    ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                    : idx < step
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                      : "bg-[var(--muted)] text-[var(--muted-foreground)]"
                }`}
              >
                {idx < step ? <Check size={10} /> : `${idx + 1}`}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
