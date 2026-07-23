"use client";

import { useState } from "react";
import { Button } from "@altftool/ui";
import {
  FolderPlus, ChevronDown, ChevronRight, Pencil, Trash2, Check, X,
} from "lucide-react";
import { generateId } from "../utils/helpers";

export default function GroupManager({ tabs, groups, onGroupCreate, onGroupToggle, onGroupDelete, onGroupRename }) {
  const [groupName, setGroupName] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");

  const handleCreateGroup = () => {
    if (!groupName.trim() || tabs.length === 0) return;
    const allIds = tabs.map((t) => t.id);
    onGroupCreate(groupName, allIds);
    setGroupName("");
  };

  if (tabs.length === 0) return null;

  return (
    <div className="rounded-xl border border-(--border) overflow-hidden">
      <div className="px-3 py-2 bg-(--muted) border-b border-(--border) flex items-center gap-1.5">
        <FolderPlus size="14" className="text-(--muted-foreground)" />
        <span className="text-xs font-semibold text-(--foreground)">Groups</span>
      </div>
      <div className="p-3 space-y-2">
        <div className="flex gap-2">
          <input
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleCreateGroup(); }}
            placeholder="Group name..."
            className="flex-1 px-2.5 py-1.5 text-sm rounded-lg border border-(--border) bg-(--card) text-(--foreground) focus:outline-none focus:ring-2 focus:ring-(--primary)"
          />
          <Button variant="primary" size="sm" onClick={handleCreateGroup} disabled={!groupName.trim()}>
            <FolderPlus size="14" />
          </Button>
        </div>

        {groups.length > 0 && (
          <div className="space-y-1">
            {groups.map((g) => (
              <div key={g.id} className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-(--muted) text-sm">
                <button onClick={() => onGroupToggle(g.id)} className="p-0.5 text-(--muted-foreground)">
                  {g.collapsed ? <ChevronRight size="14" /> : <ChevronDown size="14" />}
                </button>
                {editingId === g.id ? (
                  <div className="flex-1 flex gap-1">
                    <input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") { onGroupRename(g.id, editName); setEditingId(null); } }}
                      className="flex-1 px-1.5 py-0.5 text-xs rounded border border-(--border) bg-(--card) focus:outline-none"
                      autoFocus
                    />
                    <button onClick={() => { onGroupRename(g.id, editName); setEditingId(null); }} className="p-0.5 text-(--primary)"><Check size="12" /></button>
                    <button onClick={() => setEditingId(null)} className="p-0.5 text-(--muted-foreground)"><X size="12" /></button>
                  </div>
                ) : (
                  <>
                    <span className="flex-1 text-(--foreground) truncate">{g.name}</span>
                    <span className="text-xs text-(--muted-foreground)">{g.tabIds.length}</span>
                    <button onClick={() => { setEditingId(g.id); setEditName(g.name); }} className="p-0.5 text-(--muted-foreground) hover:text-(--foreground)"><Pencil size="12" /></button>
                    <button onClick={() => onGroupDelete(g.id)} className="p-0.5 text-(--muted-foreground) hover:text-(--danger)"><Trash2 size="12" /></button>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
