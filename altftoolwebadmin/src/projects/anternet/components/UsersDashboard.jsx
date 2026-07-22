"use client";

/**
 * UsersDashboard — read-only view of the Anternet app's users.
 *
 * Users are managed the same way as every other module's data: in the
 * ALTFTool central Firestore under `projects/anternet/users`. The app
 * mirrors each user's basic profile there on login (see the app's
 * src/api/cms.js → syncUserToCms). No cross-project access needed —
 * this pattern scales to every future app added under ALTFTool.
 */

import { useEffect, useState } from "react";
import { listDocs } from "../lib/firebase";

export default function UsersDashboard() {
  const [users, setUsers] = useState(null);
  const [error, setError] = useState(null);

  const load = async () => {
    setError(null);
    try {
      const rows = await listDocs("users");
      rows.sort((a, b) => (b.lastLogin?.seconds || 0) - (a.lastLogin?.seconds || 0));
      setUsers(rows);
    } catch (e) {
      setError(e?.message || String(e));
      setUsers([]);
    }
  };
  // eslint-disable-next-line react-hooks/set-state-in-effect -- async fetch
  useEffect(() => { load(); }, []);

  if (users === null) return (
    <div>
      <header className="mla-pagehead">
        <div>
          <h1>App Users</h1>
          <p>Review user activity and wallet totals.</p>
        </div>
      </header>
      <div className="mla-panelcard"><p className="mla-muted" role="status">Loading…</p></div>
    </div>
  );

  const totalCoins = users.reduce((a, u) => a + (Number(u.coins) || 0), 0);
  const fmtDate = (ts) => (ts?.seconds ? new Date(ts.seconds * 1000).toLocaleString() : "—");

  return (
    <div>
      <header className="mla-pagehead">
        <div>
          <h1>App Users</h1>
          <p>Review user activity and wallet totals.</p>
        </div>
      </header>
      <div className="mla-panelcard" style={{ marginBottom: 12 }}>
        {error ? (
          <p className="mla-muted">Could not load users: <code>{error}</code></p>
        ) : users.length === 0 ? (
          <p className="mla-muted">
            No users mirrored yet. Users appear here automatically the first time
            they log in to the app (the app writes to <code>projects/anternet/users</code>).
          </p>
        ) : (
          <p className="mla-muted">
            {users.length} users · {totalCoins.toLocaleString()} total coins in wallets
          </p>
        )}
        <button className="mla-btn" onClick={load} style={{ marginTop: 8 }}>Refresh</button>
      </div>

      {users.length > 0 && (
        <div className="mla-panelcard">
          <table className="mla-table">
            <thead>
              <tr><th>Name</th><th>Email</th><th>Phone</th><th>Coins</th><th>Last Login</th><th>ID</th></tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>{u.username || u.name || "—"}</td>
                  <td>{u.email || "—"}</td>
                  <td>{u.phoneNumber || "—"}</td>
                  <td>{Number(u.coins) || 0}</td>
                  <td>{fmtDate(u.lastLogin)}</td>
                  <td className="mla-mono">{u.id.slice(0, 8)}…</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
