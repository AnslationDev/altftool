"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Building2,
  CheckCircle2,
  Copy,
  Eye,
  Globe2,
  Inbox,
  Loader2,
  Mail,
  MessageSquare,
  Phone,
  Search,
  Trash2,
  UserRound,
  UsersRound,
} from "lucide-react";
import DeleteConfirmModal from "@/components/ui/DeleteConfirmModal";
import { emitAlert } from "@/lib/alertBus";
import {
  CLIENT_TYPES,
  deleteClientRequest,
  subscribeAllClientRequests,
  updateClientRequestStatus,
} from "../service/clientRequests.service";

const STATUS_STYLES = {
  new: "bg-amber-50 text-amber-700 ring-amber-100",
  read: "bg-blue-50 text-blue-700 ring-blue-100",
  contacted: "bg-emerald-50 text-emerald-700 ring-emerald-100",
};

const FILTERS = [
  { key: "all", label: "All" },
  { key: "new", label: "New" },
  { key: "read", label: "Read" },
  { key: "contacted", label: "Contacted" },
];

export default function ClientRequestsDashboard({ initialTab = "advertiser" }) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [requests, setRequests] = useState({ advertiser: [], publisher: [], all: [] });
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selected, setSelected] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeAllClientRequests(
      (data) => {
        setRequests(data);
        setSelected((current) => {
          if (!current) return null;
          return data[current.type]?.find((item) => item.id === current.id) || null;
        });
        setLoading(false);
      },
      () => {
        emitAlert({ type: "error", message: "Failed to load client requests." });
        setLoading(false);
      },
    );
    return () => unsubscribe();
  }, []);

  const activeItems = activeTab === "all" ? requests.all : requests[activeTab] || [];
  const filteredItems = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return activeItems.filter((item) => {
      const matchesStatus = statusFilter === "all" || item.status === statusFilter;
      const matchesQuery =
        !needle ||
        [
          item.fullName,
          item.companyName,
          item.email,
          item.phoneNumber,
          item.country,
          item.message,
          item.role,
          item.advertisingSpaceUrl,
          item.offersRegions,
        ]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(needle));
      return matchesStatus && matchesQuery;
    });
  }, [activeItems, query, statusFilter]);

  const stats = useMemo(() => {
    const all = requests.all;
    return {
      total: all.length,
      advertiser: requests.advertiser.length,
      publisher: requests.publisher.length,
      newCount: all.filter((item) => item.status === "new").length,
    };
  }, [requests]);

  async function setStatus(item, status) {
    try {
      await updateClientRequestStatus(item.type, item.id, status);
      emitAlert({ type: "success", message: `Marked ${status}.` });
    } catch {
      emitAlert({ type: "error", message: "Could not update client request." });
    }
  }

  async function copyText(value, label = "Value") {
    try {
      await navigator.clipboard.writeText(value || "");
      emitAlert({ type: "success", message: `${label} copied.` });
    } catch {
      emitAlert({ type: "error", message: "Copy failed." });
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await deleteClientRequest(deleteTarget.type, deleteTarget.id);
      if (selected?.id === deleteTarget.id) setSelected(null);
      emitAlert({ type: "success", message: "Client request deleted." });
      setDeleteTarget(null);
    } catch {
      emitAlert({ type: "error", message: "Could not delete client request." });
    } finally {
      setDeleteLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f5f7fb] p-6 text-slate-900">
      <div className="mx-auto flex max-w-[1700px] flex-col gap-5">
        <Header stats={stats} />

        <div className="grid gap-3 md:grid-cols-4">
          <Metric label="Total Requests" value={stats.total} icon={Inbox} />
          <Metric label="Advertisers" value={stats.advertiser} icon={Building2} />
          <Metric label="Publishers" value={stats.publisher} icon={UsersRound} />
          <Metric label="New Requests" value={stats.newCount} icon={MessageSquare} tone="amber" />
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              {[
                { key: "advertiser", label: "Advertiser Requests" },
                { key: "publisher", label: "Publisher Requests" },
                { key: "all", label: "All Clients" },
              ].map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => {
                    setActiveTab(tab.key);
                    setSelected(null);
                  }}
                  className={`rounded-xl px-4 py-2 text-sm font-bold transition ${
                    activeTab === tab.key
                      ? "bg-[#079684] text-white shadow-sm"
                      : "border border-slate-200 bg-white text-slate-600 hover:border-[#079684]/30 hover:text-[#079684]"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              {FILTERS.map((filter) => (
                <button
                  key={filter.key}
                  type="button"
                  onClick={() => setStatusFilter(filter.key)}
                  className={`rounded-xl px-3 py-2 text-xs font-bold transition ${
                    statusFilter === filter.key ? "bg-slate-900 text-white" : "border border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
            <div className="relative min-w-[280px] flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-[#079684] focus:ring-2 focus:ring-[#079684]/10"
                placeholder="Search name, company, email, country..."
              />
            </div>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">{filteredItems.length} records</p>
          </div>
        </div>

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_430px]">
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <ClientTable
              items={filteredItems}
              loading={loading}
              selected={selected}
              setSelected={setSelected}
              setStatus={setStatus}
              setDeleteTarget={setDeleteTarget}
            />
          </section>

          <ClientDetail
            item={selected}
            setStatus={setStatus}
            copyText={copyText}
            setDeleteTarget={setDeleteTarget}
          />
        </div>
      </div>

      {deleteTarget ? (
        <DeleteConfirmModal
          title="Delete client request"
          message={`Delete request from "${deleteTarget.fullName || deleteTarget.email || deleteTarget.id}"? This cannot be undone.`}
          loading={deleteLoading}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      ) : null}
    </div>
  );
}

function Header({ stats }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#111111] shadow-sm">
      <div className="relative p-6 text-white">
        <div className="pointer-events-none absolute inset-0 opacity-10 [background-image:linear-gradient(rgba(255,255,255,.28)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.28)_1px,transparent_1px)] [background-size:68px_68px]" />
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-[#ffbd17]">CareerBook Client Requests</p>
            <h1 className="mt-2 text-2xl font-black">Advertiser & Publisher Form Submissions</h1>
            <p className="mt-2 max-w-3xl text-sm font-semibold leading-6 text-white/72">
              Read every client request stored in Firebase, review full form details, and contact advertisers or publishers quickly.
            </p>
          </div>
          <div className="rounded-2xl border border-[#ffbd17]/30 bg-[#ffbd17]/10 px-5 py-4">
            <p className="text-xs font-bold uppercase tracking-widest text-[#ffbd17]">Live Firebase</p>
            <p className="mt-1 text-2xl font-black">{stats.total}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value, icon: Icon, tone = "teal" }) {
  const color = tone === "amber" ? "bg-amber-50 text-amber-700" : "bg-teal-50 text-[#079684]";
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{label}</p>
          <p className="mt-2 text-2xl font-black text-slate-900">{value}</p>
        </div>
        <span className={`grid h-11 w-11 place-items-center rounded-xl ${color}`}>
          <Icon className="h-5 w-5" />
        </span>
      </div>
    </div>
  );
}

function ClientTable({ items, loading, selected, setSelected, setStatus, setDeleteTarget }) {
  if (loading) {
    return (
      <div className="grid min-h-[420px] place-items-center">
        <Loader2 className="h-7 w-7 animate-spin text-[#079684]" />
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="grid min-h-[420px] place-items-center text-center">
        <div>
          <Inbox className="mx-auto h-11 w-11 text-slate-300" />
          <p className="mt-3 text-sm font-bold text-slate-500">No client requests found</p>
          <p className="mt-1 text-xs text-slate-400">New advertiser and publisher forms will appear here automatically.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-[1080px] w-full text-left">
        <thead className="bg-slate-50 text-[11px] font-black uppercase tracking-widest text-slate-500">
          <tr>
            <th className="px-4 py-3">Client</th>
            <th className="px-4 py-3">Company</th>
            <th className="px-4 py-3">Contact</th>
            <th className="px-4 py-3">Country</th>
            <th className="px-4 py-3">Submitted</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {items.map((item) => (
            <tr key={`${item.type}-${item.id}`} className={selected?.id === item.id ? "bg-teal-50/50" : "bg-white hover:bg-slate-50"}>
              <td className="px-4 py-3">
                <button type="button" onClick={() => setSelected(item)} className="text-left">
                  <p className="font-bold text-slate-900">{item.fullName || "No name"}</p>
                  <p className="mt-1 text-xs font-semibold capitalize text-slate-500">{item.role || item.type}</p>
                </button>
              </td>
              <td className="px-4 py-3 text-sm font-semibold text-slate-700">{item.companyName || "-"}</td>
              <td className="px-4 py-3">
                <div className="space-y-1 text-xs font-semibold text-slate-500">
                  {item.email ? <a href={`mailto:${item.email}`} className="flex items-center gap-1.5 hover:text-[#079684]"><Mail className="h-3.5 w-3.5" />{item.email}</a> : null}
                  {item.phoneNumber ? <a href={`tel:${item.phoneNumber}`} className="flex items-center gap-1.5 hover:text-[#079684]"><Phone className="h-3.5 w-3.5" />{item.phoneNumber}</a> : null}
                </div>
              </td>
              <td className="px-4 py-3 text-sm font-semibold text-slate-600">{item.country || "-"}</td>
              <td className="px-4 py-3 text-xs font-semibold text-slate-500">{formatDate(item.createdAt)}</td>
              <td className="px-4 py-3"><StatusBadge status={item.status} /></td>
              <td className="px-4 py-3">
                <div className="flex justify-end gap-2">
                  <button type="button" onClick={() => setSelected(item)} className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:border-[#079684]/30 hover:text-[#079684]"><Eye className="h-4 w-4" /></button>
                  <button type="button" onClick={() => setStatus(item, "contacted")} className="rounded-lg border border-emerald-100 bg-emerald-50 p-2 text-emerald-600 hover:bg-emerald-100"><CheckCircle2 className="h-4 w-4" /></button>
                  <button type="button" onClick={() => setDeleteTarget(item)} className="rounded-lg border border-red-100 bg-red-50 p-2 text-red-500 hover:bg-red-100"><Trash2 className="h-4 w-4" /></button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ClientDetail({ item, setStatus, copyText, setDeleteTarget }) {
  if (!item) {
    return (
      <aside className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-center shadow-sm">
        <UserRound className="mx-auto h-11 w-11 text-slate-300" />
        <p className="mt-3 text-sm font-bold text-slate-500">Select a request</p>
        <p className="mt-1 text-xs text-slate-400">Full advertiser or publisher details will show here.</p>
      </aside>
    );
  }

  const detailRows = buildDetailRows(item);

  return (
    <aside className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-[#079684]">{CLIENT_TYPES[item.type]?.singular || item.role}</p>
          <h2 className="mt-1 text-xl font-black text-slate-900">{item.fullName || "No name"}</h2>
          <p className="mt-1 text-sm font-semibold text-slate-500">{item.companyName || "No company"}</p>
        </div>
        <StatusBadge status={item.status} />
      </div>

      <div className="mt-5 grid gap-2 sm:grid-cols-2">
        {item.email ? <ContactButton href={`mailto:${item.email}`} icon={Mail} label="Email" /> : null}
        {item.phoneNumber ? <ContactButton href={`tel:${item.phoneNumber}`} icon={Phone} label="Call" /> : null}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {["new", "read", "contacted"].map((status) => (
          <button key={status} type="button" onClick={() => setStatus(item, status)} className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold capitalize text-slate-600 hover:bg-slate-50">
            Mark {status}
          </button>
        ))}
      </div>

      <div className="mt-5 space-y-3">
        {detailRows.map((row) => (
          <DetailRow key={row.label} {...row} copyText={copyText} />
        ))}
      </div>

      <button type="button" onClick={() => setDeleteTarget(item)} className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-100">
        <Trash2 className="h-4 w-4" /> Delete Request
      </button>
    </aside>
  );
}

function DetailRow({ label, value, copyText }) {
  if (value === undefined || value === null || value === "") return null;
  const display = Array.isArray(value) ? value.join(", ") : isTimestamp(value) ? formatDateTime(value) : String(value);
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</p>
          <p className="mt-1 break-words text-sm font-semibold leading-6 text-slate-800">{display}</p>
        </div>
        <button type="button" onClick={() => copyText(display, label)} className="shrink-0 rounded-lg p-1.5 text-slate-400 hover:bg-white hover:text-[#079684]">
          <Copy className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

function ContactButton({ href, icon: Icon, label }) {
  return (
    <a href={href} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#079684] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#087e70]">
      <Icon className="h-4 w-4" /> {label}
    </a>
  );
}

function StatusBadge({ status = "new" }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wide ring-1 ${STATUS_STYLES[status] || STATUS_STYLES.new}`}>
      {status}
    </span>
  );
}

function buildDetailRows(item) {
  const common = [
    ["UID", item.uid],
    ["Full Name", item.fullName],
    ["Company Name", item.companyName],
    ["Email", item.email],
    ["Phone Number", item.phoneNumber],
    ["Country", item.country],
    ["Skype ID", item.skypeId || item.imSkypeId],
    ["Telegram / IM", item.imTelegramId],
    ["Advertising Space URL", item.advertisingSpaceUrl],
    ["Offers / Regions", item.offersRegions],
    ["Promotion Categories", item.promotionCategories],
    ["Industries", item.industries],
    ["Description", item.description],
    ["Message", item.message],
    ["Created At", item.createdAt],
    ["Updated At", item.updatedAt],
  ];
  return common.map(([label, value]) => ({ label, value }));
}

function formatDate(value) {
  if (!value) return "-";
  const date = toDate(value);
  return date ? date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "-";
}

function formatDateTime(value) {
  const date = toDate(value);
  return date
    ? date.toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
    : "-";
}

function toDate(value) {
  if (!value) return null;
  if (typeof value?.toDate === "function") return value.toDate();
  if (typeof value?.seconds === "number") return new Date(value.seconds * 1000);
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function isTimestamp(value) {
  return typeof value?.toDate === "function" || typeof value?.seconds === "number" || value instanceof Date;
}
