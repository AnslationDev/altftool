"use client";

import { useState, useEffect } from "react";
import { Cookie, Plus, Trash2, Edit2, RotateCcw, Save, X } from "lucide-react";
import { Button } from "@altftool/ui";
import { toast } from "react-hot-toast";

// A cookie's `path` attribute is never exposed to document.cookie, but the
// browser only ever surfaces cookies here whose path is a prefix of the
// current page's path — so every cookie this tool can see necessarily lives
// on one of the current URL's ancestor paths. Writing/expiring across all of
// them is therefore guaranteed to reach the cookie's real path, not a guess.
const getAncestorPaths = () => {
  if (typeof window === "undefined") return ["/"];
  const segments = window.location.pathname.split("/").filter(Boolean);
  const paths = ["/"];
  let acc = "";
  for (const segment of segments) {
    acc += `/${segment}`;
    paths.push(acc);
  }
  return paths;
};

const safeDecode = (value) => {
  try {
    return decodeURIComponent(value);
  } catch {
    // A stray "%" that isn't a valid escape sequence (e.g. "50%off") makes
    // decodeURIComponent throw. Fall back to the raw value instead of
    // crashing the whole page.
    return value;
  }
};

const cookieNames = () => {
  if (typeof document === "undefined" || !document.cookie) return [];
  return document.cookie.split("; ").filter(Boolean).map((pair) => {
    const eq = pair.indexOf("=");
    return eq === -1 ? pair : pair.slice(0, eq);
  });
};

export default function CookieViewer() {
  const [cookies, setCookies] = useState([]);
  const [isEditing, setIsEditing] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", value: "", days: 7 });

  const loadCookies = () => {
    const cookieString = document.cookie;
    if (!cookieString) {
      setCookies([]);
      return;
    }

    const parsed = cookieString.split("; ").map(c => {
      const [name, ...rest] = c.split("=");
      return { name, value: safeDecode(rest.join("=")) };
    });
    setCookies(parsed);
  };

  useEffect(() => {
    loadCookies();
  }, []);

  const handleSaveCookie = (e) => {
    e.preventDefault();
    if (!editForm.name.trim()) return;

    let expires = "";
    if (editForm.days) {
      const date = new Date();
      date.setTime(date.getTime() + (editForm.days * 24 * 60 * 60 * 1000));
      expires = `; expires=${date.toUTCString()}`;
    }

    const isNew = isEditing === "new";
    // A brand-new cookie is created at the root path (the sensible default).
    // An edit targets every ancestor path so it actually reaches whichever
    // path the original cookie lives on, instead of silently creating an
    // unrelated root-path copy while the real cookie survives untouched.
    const targetPaths = isNew ? ["/"] : getAncestorPaths();
    targetPaths.forEach((path) => {
      document.cookie = `${editForm.name}=${encodeURIComponent(editForm.value)}${expires}; path=${path}`;
    });

    toast.success(isNew ? "Cookie added!" : "Cookie updated!");
    setIsEditing(null);
    loadCookies();
  };

  const handleDelete = (name) => {
    if (!window.confirm(`Delete the cookie "${name}"? This cannot be undone.`)) {
      return;
    }
    getAncestorPaths().forEach((path) => {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path};`;
    });
    if (cookieNames().includes(name)) {
      toast.error(`Could not fully delete "${name}" — it may be set on a path this tool can't reach.`);
    } else {
      toast.success("Cookie deleted");
    }
    loadCookies();
  };

  const handleClearAll = () => {
    if (window.confirm("Are you sure you want to delete all cookies?")) {
      const paths = getAncestorPaths();
      cookies.forEach(c => {
        paths.forEach((path) => {
          document.cookie = `${c.name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path};`;
        });
      });
      const remaining = cookieNames().length;
      if (remaining > 0) {
        toast.error(`${remaining} cookie${remaining === 1 ? "" : "s"} could not be fully deleted.`);
      } else {
        toast.success("All cookies deleted");
      }
      loadCookies();
    }
  }

  const startEdit = (cookie) => {
    setIsEditing(cookie.name);
    setEditForm({ name: cookie.name, value: cookie.value, days: 7 });
  };

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6">
      <div className="mx-auto max-w-5xl space-y-6">
        {/* Header */}
        <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)] 2xl:p-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase text-[var(--primary)]">
            <Cookie className="h-4 w-4" />
            Developer Tools
          </div>
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--muted)] shadow-sm">
            <Cookie className="h-7 w-7 text-[var(--primary)]" />
          </div>
          <h1 className="tool-heading-accent text-3xl font-semibold leading-tight sm:text-4xl">
            Cookie Viewer
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
            Inspect, create, edit, and delete browser cookies for this domain in real-time.
          </p>
        </section>

        {/* Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex gap-2">
            <Button onClick={() => { setIsEditing("new"); setEditForm({ name: "", value: "", days: 7 }); }} className="gap-2">
              <Plus className="h-4 w-4" /> Add Cookie
            </Button>
            <Button variant="outline" onClick={loadCookies} className="gap-2">
              <RotateCcw className="h-4 w-4" /> Refresh
            </Button>
          </div>
          {cookies.length > 0 && (
             <Button variant="destructive" onClick={handleClearAll} className="gap-2">
                 <Trash2 className="h-4 w-4" /> Clear All
             </Button>
          )}
        </div>

        {/* Editor Modal / Inline Form */}
        {isEditing && (
          <form onSubmit={handleSaveCookie} className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-lg relative animate-in fade-in zoom-in-95 duration-200">
            <button type="button" onClick={() => setIsEditing(null)} aria-label="Close" className="absolute top-4 right-4 text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
              <X className="h-5 w-5" />
            </button>
            <h3 className="text-lg font-semibold mb-4">{isEditing === "new" ? "Add New Cookie" : "Edit Cookie"}</h3>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  required
                  disabled={isEditing !== "new"}
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 disabled:opacity-50"
                  placeholder="cookie_name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Expires (Days)</label>
                <input
                  type="number"
                  min="1"
                  value={editForm.days}
                  onChange={(e) => setEditForm({ ...editForm, days: +e.target.value })}
                  className="w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2"
                />
                {isEditing !== "new" && (
                  <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                    Saving resets this cookie&apos;s expiry to the value above — its original expiry can&apos;t be read from the browser.
                  </p>
                )}
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium mb-1">Value</label>
                <textarea
                  required
                  value={editForm.value}
                  onChange={(e) => setEditForm({ ...editForm, value: e.target.value })}
                  className="w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 min-h-[100px]"
                  placeholder="cookie_value"
                />
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsEditing(null)}>Cancel</Button>
              <Button type="submit" className="gap-2"><Save className="h-4 w-4" /> Save</Button>
            </div>
          </form>
        )}

        {/* Cookie List */}
        <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] shadow-[var(--anslation-ds-shadow-sm)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[var(--muted)]/50 text-[var(--muted-foreground)]">
                <tr>
                  <th className="px-4 py-3 font-semibold">Name</th>
                  <th className="px-4 py-3 font-semibold">Value</th>
                  <th className="px-4 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {cookies.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-4 py-12 text-center text-[var(--muted-foreground)]">
                      <Cookie className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No cookies found for this domain.</p>
                    </td>
                  </tr>
                ) : (
                  cookies.map((cookie, index) => (
                    <tr key={`${cookie.name}-${index}`} className="hover:bg-[var(--muted)]/20 transition-colors">
                      <td className="px-4 py-3 font-medium align-top max-w-[200px] truncate" title={cookie.name}>
                        {cookie.name}
                      </td>
                      <td className="px-4 py-3 align-top max-w-[400px]">
                        <div className="break-all font-mono text-xs text-[var(--muted-foreground)]">
                          {cookie.value}
                        </div>
                      </td>
                      <td className="px-4 py-3 align-top text-right whitespace-nowrap">
                        <Button variant="ghost" size="icon" onClick={() => startEdit(cookie)} aria-label={`Edit cookie "${cookie.name}"`} className="h-8 w-8">
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(cookie.name)} aria-label={`Delete cookie "${cookie.name}"`} className="h-8 w-8 text-(--danger) hover:text-(--danger) hover:bg-(--danger-soft)">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}
