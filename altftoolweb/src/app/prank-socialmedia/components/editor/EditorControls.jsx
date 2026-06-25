"use client";
import { Plus, Trash2, ChevronUp, ChevronDown, Upload } from "lucide-react";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Switch } from "../ui/switch";
import { Button } from "../ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { useEditor } from "../../lib/editor-store";

// ── Primitives ───────────────────────────────────────────────────────────────
function Field({ label, children }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

function NumberField({ label, storeKey }) {
  const value = useEditor((s) => s[storeKey]);
  const set = useEditor((s) => s.set);
  return (
    <Field label={label}>
      <Input
        type="number"
        value={value}
        onChange={(e) => set(storeKey, Number(e.target.value))}
        className="rounded-xl"
      />
    </Field>
  );
}

function AvatarUpload({ valueKey = "avatar", label = "Avatar" }) {
  const value = useEditor((s) => s[valueKey]);
  const set = useEditor((s) => s.set);
  const onChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => set(valueKey, reader.result);
    reader.readAsDataURL(f);
  };
  return (
    <Field label={label}>
      <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-border bg-card/60 p-2 transition hover:bg-card">
        <div className="grid h-12 w-12 place-items-center overflow-hidden rounded-xl bg-secondary text-muted-foreground">
          {value ? <img src={value} alt="" className="h-full w-full object-cover" /> : <Upload className="h-4 w-4" />}
        </div>
        <span className="text-xs text-muted-foreground">{value ? "Change image" : "Click to upload"}</span>
        <input type="file" accept="image/*" className="hidden" onChange={onChange} />
      </label>
    </Field>
  );
}

// ── Shared Profile Fields ────────────────────────────────────────────────────
function CommonProfileFields() {
  const { username, handle, verified, time, theme, device, set } = useEditor();
  return (
    <>
      <AvatarUpload />
      <Field label="Display name">
        <Input value={username} onChange={(e) => set("username", e.target.value)} className="rounded-xl" />
      </Field>
      <Field label="Handle / username">
        <Input value={handle} onChange={(e) => set("handle", e.target.value)} className="rounded-xl" />
      </Field>
      <Field label="Time">
        <Input value={time} onChange={(e) => set("time", e.target.value)} className="rounded-xl" />
      </Field>
      <div className="flex items-center justify-between rounded-xl border border-border bg-card/60 px-3 py-2">
        <Label className="text-xs">Verified badge</Label>
        <Switch checked={verified} onCheckedChange={(v) => set("verified", v)} />
      </div>
      <Field label="Theme">
        <Select value={theme} onValueChange={(v) => set("theme", v)}>
          <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="light">Light</SelectItem>
            <SelectItem value="dark">Dark</SelectItem>
            <SelectItem value="amoled">AMOLED</SelectItem>
          </SelectContent>
        </Select>
      </Field>
      <Field label="Device">
        <Select value={device} onValueChange={(v) => set("device", v)}>
          <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="iphone">iPhone</SelectItem>
            <SelectItem value="android">Android</SelectItem>
          </SelectContent>
        </Select>
      </Field>
    </>
  );
}

// ── Chat Builder (WhatsApp / IG DM / Messenger / Telegram / Snapchat) ────────
function ChatBuilder() {
  const { messages, addMessage, updateMessage, removeMessage, moveMessage } = useEditor();
  return (
    <Field label="Chat messages">
      <div className="space-y-2">
        {messages.map((m, i) => (
          <div key={m.id} className="rounded-xl border border-border bg-card/60 p-2">
            <div className="flex items-center gap-1">
              <Select value={m.side} onValueChange={(v) => updateMessage(m.id, { side: v })}>
                <SelectTrigger className="h-7 w-20 rounded-lg text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="me">Me</SelectItem>
                  <SelectItem value="them">Them</SelectItem>
                </SelectContent>
              </Select>
              <Input
                value={m.time}
                onChange={(e) => updateMessage(m.id, { time: e.target.value })}
                className="h-7 w-16 rounded-lg text-xs"
                placeholder="time"
              />
              <Select value={m.status ?? "read"} onValueChange={(v) => updateMessage(m.id, { status: v })}>
                <SelectTrigger className="h-7 flex-1 rounded-lg text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="read">Read</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Textarea
              value={m.text}
              onChange={(e) => updateMessage(m.id, { text: e.target.value })}
              rows={2}
              className="mt-1.5 resize-none rounded-lg text-sm"
            />
            <div className="mt-1 flex items-center justify-end gap-1">
              <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => moveMessage(m.id, -1)} disabled={i === 0}>
                <ChevronUp className="h-3.5 w-3.5" />
              </Button>
              <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => moveMessage(m.id, 1)} disabled={i === messages.length - 1}>
                <ChevronDown className="h-3.5 w-3.5" />
              </Button>
              <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => removeMessage(m.id)}>
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        ))}
        <Button onClick={() => addMessage()} variant="outline" size="sm" className="w-full rounded-xl">
          <Plus className="mr-1 h-3.5 w-3.5" />Add message
        </Button>
      </div>
    </Field>
  );
}

// ── Comments Builder (Facebook / YouTube) ────────────────────────────────────
function CommentsBuilder() {
  const { comments, addComment, updateComment, removeComment } = useEditor();
  return (
    <Field label="Comments">
      <div className="space-y-2">
        {comments.map((c) => (
          <div key={c.id} className="rounded-xl border border-border bg-card/60 p-2 space-y-1.5">
            <div className="flex gap-1">
              <Input
                value={c.username}
                onChange={(e) => updateComment(c.id, { username: e.target.value })}
                placeholder="Username"
                className="h-7 rounded-lg text-xs"
              />
              <Input
                value={c.time}
                onChange={(e) => updateComment(c.id, { time: e.target.value })}
                placeholder="time"
                className="h-7 w-24 rounded-lg text-xs"
              />
            </div>
            <Textarea
              value={c.text}
              onChange={(e) => updateComment(c.id, { text: e.target.value })}
              rows={2}
              className="resize-none rounded-lg text-xs"
            />
            <div className="flex items-center gap-1">
              <Input
                type="number"
                value={c.likes}
                onChange={(e) => updateComment(c.id, { likes: Number(e.target.value) })}
                placeholder="Likes"
                className="h-7 rounded-lg text-xs"
              />
              <Button size="icon" variant="ghost" className="h-7 w-7 ml-auto text-destructive hover:text-destructive" onClick={() => removeComment(c.id)}>
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        ))}
        <Button onClick={() => addComment()} variant="outline" size="sm" className="w-full rounded-xl">
          <Plus className="mr-1 h-3.5 w-3.5" />Add comment
        </Button>
      </div>
    </Field>
  );
}

// ── Search Results Builder ───────────────────────────────────────────────────
function SearchResultsBuilder() {
  const { searchResults, addSearchResult, updateSearchResult, removeSearchResult } = useEditor();
  return (
    <Field label="Search results">
      <div className="space-y-2">
        {searchResults.map((r) => (
          <div key={r.id} className="rounded-xl border border-border bg-card/60 p-2 space-y-1.5">
            <Input
              value={r.title}
              onChange={(e) => updateSearchResult(r.id, { title: e.target.value })}
              placeholder="Result title"
              className="rounded-lg text-xs"
            />
            <Input
              value={r.url}
              onChange={(e) => updateSearchResult(r.id, { url: e.target.value })}
              placeholder="URL path"
              className="rounded-lg text-xs"
            />
            <Textarea
              value={r.snippet}
              onChange={(e) => updateSearchResult(r.id, { snippet: e.target.value })}
              rows={2}
              placeholder="Description snippet"
              className="resize-none rounded-lg text-xs"
            />
            <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => removeSearchResult(r.id)}>
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        ))}
        <Button onClick={() => addSearchResult()} variant="outline" size="sm" className="w-full rounded-xl">
          <Plus className="mr-1 h-3.5 w-3.5" />Add result
        </Button>
      </div>
    </Field>
  );
}

export {
  AvatarUpload,
  ChatBuilder,
  CommentsBuilder,
  CommonProfileFields,
  Field,
  NumberField,
  SearchResultsBuilder,
};


