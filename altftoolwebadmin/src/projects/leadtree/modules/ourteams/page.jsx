"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  ArrowLeft,
  PlusCircle,
  Search,
  MoreVertical,
  Users,
  UserCheck,
  UserX,
  Sparkles,
  Linkedin,
  Twitter,
  Github,
  Globe,
  Instagram,
  Youtube,
  Pencil,
  Trash2,
  ToggleLeft,
  ToggleRight,
  UserSquare2,
} from "lucide-react";
import AddOurTeamModal from "../ourteams/components/AddOurTeamModal";
import {
  fetchAllMembers,
  deleteMember,
  updateMemberStatus,
} from "../ourteams/our-team-services/OurTeamService";
import { emitAlert } from "@/lib/alertBus";

function getInitials(name = "") {
  return name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

const AVATAR_BG_COLORS = [
  { bg: "#1c1c1e", text: "#f5f5f5" },
  { bg: "#2d2d2d", text: "#e8e8e6" },
  { bg: "#3a3a3a", text: "#f0f0ee" },
  { bg: "#292929", text: "#ececec" },
];

function avatarStyle(id = "") {
  return AVATAR_BG_COLORS[id.charCodeAt(0) % AVATAR_BG_COLORS.length];
}


const SOCIAL_MAP = {
  linkedin: { icon: <Linkedin size={12} />, label: "LinkedIn" },
  twitter: { icon: <Twitter size={12} />, label: "Twitter" },
  github: { icon: <Github size={12} />, label: "GitHub" },
  instagram: { icon: <Instagram size={12} />, label: "Instagram" },
  youtube: { icon: <Youtube size={12} />, label: "YouTube" },
  website: { icon: <Globe size={12} />, label: "Website" },
};

function getSocialMeta(type = "") {
  const key = type.toLowerCase().trim();
  return SOCIAL_MAP[key] ?? { icon: <Globe size={12} />, label: type };
}

function formatDate(ts) {
  if (!ts) return "";
  const d = ts?.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// ─ stat card 
function StatCard({ icon, label, value, accent }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4">
      <div
        className={`h-10 w-10 rounded-lg flex items-center justify-center ${accent}`}
      >
        {icon}
      </div>
      <div>
        <p className="text-xs text-gray-400 uppercase tracking-widest font-medium">
          {label}
        </p>
        <p className="text-2xl font-bold text-gray-900 leading-tight">
          {value}
        </p>
      </div>
    </div>
  );
}

// ─ Member card 
function MemberCard({ member, onEdit, onDelete, onToggleStatus }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const isActive = member.status === "active";
  const colors = avatarStyle(member.id);


  const validLinks = (member.socialLinks || []).filter(
    (l) => l?.type && l?.value,
  );

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 relative flex flex-col">
      {/* ─ banner ─ */}
      <div className="relative h-[88px] bg-gradient-to-br from-gray-100 to-gray-200 flex-shrink-0">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(circle, #b0b0ae 1px, transparent 1px)",
            backgroundSize: "16px 16px",
          }}
        />

        {/* 3-dot menu */}
        <div className="absolute top-3 right-3 z-10">
          <button
            onClick={() => setMenuOpen((p) => !p)}
            className="h-7 w-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-white/60 backdrop-blur-sm transition-colors"
          >
            <MoreVertical size={15} />
          </button>
          {menuOpen && (
            <div
              className="absolute right-0 top-9 z-20 bg-white border border-gray-200 rounded-xl shadow-xl py-1 w-44 text-sm"
              onMouseLeave={() => setMenuOpen(false)}
            >
             
              <button
                onClick={() => {
                  onToggleStatus(member);
                  setMenuOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors"
              >
                {isActive ? (
                  <>
                    <ToggleLeft size={13} className="text-orange-400" /> Set
                    inactive
                  </>
                ) : (
                  <>
                    <ToggleRight size={13} className="text-green-500" /> Set
                    active
                  </>
                )}
              </button>
              <div className="border-t border-gray-100 my-1" />
              <button
                onClick={() => {
                  onDelete(member);
                  setMenuOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-red-500 hover:bg-red-50 transition-colors"
              >
                <Trash2 size={13} /> Delete
              </button>
            </div>
          )}
        </div>

 
        <div className="absolute -bottom-10 left-1/2 -translate-x-1/2">
          {member.profileImageUrl ? (
            <img
              src={member.profileImageUrl}
              alt={member.name}
              className="h-20 w-20 rounded-full object-cover ring-4 ring-white shadow-md"
            />
          ) : (
            <div
              className="h-20 w-20 rounded-full ring-4 ring-white shadow-md flex items-center justify-center text-xl font-bold"
              style={{ background: colors.bg, color: colors.text }}
            >
              {getInitials(member.name)}
            </div>
          )}
        </div>
      </div>

      {/* ─ body ─ */}
      <div className="flex flex-col items-center text-center px-5 pt-14 pb-5 flex-1">
        <p className="text-[15px] font-semibold text-gray-900 leading-snug">
          {member.name}
        </p>
        <p className="text-xs text-gray-400 mt-0.5">{member.role}</p>

        {member.description && (
          <p className="text-[11px] text-gray-400 leading-relaxed mt-2.5 line-clamp-2">
            {member.description}
          </p>
        )}

        {/* status badge with padding on parent */}
        <div className="mt-4 mb-1 px-4 py-1.5 flex justify-center">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold tracking-wide ${
              isActive
                ? "bg-green-50 text-green-700 ring-1 ring-green-200"
                : "bg-orange-50 text-orange-600 ring-1 ring-orange-200"
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${isActive ? "bg-green-500" : "bg-orange-400"}`}
            />
            {isActive ? "Active" : "Inactive"}
          </span>
        </div>
      </div>

      {/* ── footer ── */}
      {(validLinks.length > 0 || member.createdAt) && (
        <div className="border-t border-gray-100 px-5 py-3.5 flex items-center justify-between">
          {/* only Firebase social links */}
          <div className="flex gap-1.5">
            {validLinks.map((link, i) => {
              const { icon, label } = getSocialMeta(link.type);
              return (
                <a
                  key={i}
                  href={link.value}
                  target="_blank"
                  rel="noreferrer"
                  title={label}
                  className="h-6 w-6 rounded-md bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-800 hover:bg-gray-100 transition-colors"
                >
                  {icon}
                </a>
              );
            })}
          </div>
          <span className="text-[11px] text-gray-300">
            {formatDate(member.createdAt)}
          </span>
        </div>
      )}
    </div>
  );
}

// ─ filter pill 
function Pill({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-150 ${
        active
          ? "bg-gray-900 text-white"
          : "bg-gray-100 text-gray-500 hover:bg-gray-200"
      }`}
    >
      {label}
    </button>
  );
}

// ─ page
export default function OurTeamPage() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editMember, setEditMember] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sort, setSort] = useState("newest");

  useEffect(() => {
    fetchAllMembers()
      .then(setMembers)
      .finally(() => setLoading(false));
  }, []);

  const totalCount = members.length;
  const activeCount = members.filter((m) => m.status === "active").length;
  const inactiveCount = members.filter((m) => m.status === "inactive").length;
  const thisMonthCount = members.filter((m) => {
    const d = m.createdAt?.toDate
      ? m.createdAt.toDate()
      : new Date(m.createdAt);
    const now = new Date();
    return (
      d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    );
  }).length;




  const displayed = useMemo(() => {
    let list = [...members];
    if (statusFilter !== "all")
      list = list.filter((m) => m.status === statusFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (m) =>
          m.name?.toLowerCase().includes(q) ||
          m.role?.toLowerCase().includes(q),
      );
    }
    list.sort((a, b) => {
      const da = a.createdAt?.toDate
        ? a.createdAt.toDate()
        : new Date(a.createdAt ?? 0);
      const db = b.createdAt?.toDate
        ? b.createdAt.toDate()
        : new Date(b.createdAt ?? 0);
      if (sort === "newest") return db - da;
      if (sort === "oldest") return da - db;
      if (sort === "az") return a.name.localeCompare(b.name);
      if (sort === "za") return b.name.localeCompare(a.name);
      return 0;
    });
    return list;
  }, [members, statusFilter, search, sort]);

  async function handleToggleStatus(member) {
    const next = member.status === "active" ? "inactive" : "active";
    await updateMemberStatus(member.id, next);
    setMembers((prev) =>
      prev.map((m) => (m.id === member.id ? { ...m, status: next } : m)),
    );
      emitAlert({ type: "success", message: `${member.name} set to ${next}.` });

  }

  async function handleDelete(member) {
    if (!confirm(`Delete "${member.name}"? This cannot be undone.`)) return;
    await deleteMember(member.id);
    setMembers((prev) => prev.filter((m) => m.id !== member.id));
    emitAlert({ type: "success", message: `${member.name} has been deleted.` });

  }



  function handleMemberSaved(saved) {
    setMembers((prev) => {
      const exists = prev.find((m) => m.id === saved.id);
      return exists
        ? prev.map((m) => (m.id === saved.id ? saved : m))
        : [saved, ...prev];
    });
    setShowAddModal(false);
    setEditMember(null);
    emitAlert({ type: "success", message: "Team member saved successfully." });

  }


  return (
    <div className="flex flex-col gap-6">
      {/* top bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
        <div className="flex items-center gap-3 justify-center h-10 w-10 rounded-lg bg-gray-100 text-gray-700">
<UserSquare2/>
        </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Members behind LeadTree group</h2>
            <p className="text-xs text-gray-400">Manage members Efficiently</p>
          </div>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-gray-900 hover:bg-gray-700 text-white text-sm font-semibold cursor-pointer px-4 py-2.5 rounded-xl transition-all duration-150 shadow-sm"
        >
          <PlusCircle size={15} />
          Add New Member
        </button>
      </div>

      {/* stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          icon={<Users size={18} className="text-gray-600" />}
          label="Total"
          value={loading ? "—" : totalCount}
          accent="bg-gray-100"
        />
        <StatCard
          icon={<UserCheck size={18} className="text-green-600" />}
          label="Active"
          value={loading ? "—" : activeCount}
          accent="bg-green-50"
        />
        <StatCard
          icon={<UserX size={18} className="text-orange-500" />}
          label="Inactive"
          value={loading ? "—" : inactiveCount}
          accent="bg-orange-50"
        />
        <StatCard
          icon={<Sparkles size={18} className="text-indigo-500" />}
          label="This month"
          value={loading ? "—" : thisMonthCount}
          accent="bg-indigo-50"
        />
      </div>

      {/* filter bar */}
      <div className="bg-white rounded-xl border border-gray-200 px-5 py-4 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">
            Status
          </span>
          <div className="flex gap-1.5">
            {["all", "active", "inactive"].map((f) => (
              <Pill
                key={f}
                label={f.charAt(0).toUpperCase() + f.slice(1)}
                active={statusFilter === f}
                onClick={() => setStatusFilter(f)}
              />
            ))}
          </div>
        </div>
        <div className="h-5 w-px bg-gray-200" />
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">
            Sort
          </span>
          <div className="flex gap-1.5">
            {[
              { key: "newest", label: "Newest" },
              { key: "oldest", label: "Oldest" },
              { key: "az", label: "A → Z" },
              { key: "za", label: "Z → A" },
            ].map((s) => (
              <Pill
                key={s.key}
                label={s.label}
                active={sort === s.key}
                onClick={() => setSort(s.key)}
              />
            ))}
          </div>
        </div>
        <div className="ml-auto flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
          <Search size={13} className="text-gray-400" />
          <input
            type="text"
            placeholder="Search members…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none w-40"
          />
        </div>
      </div>

      {/* grid */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-gray-200 h-64 animate-pulse"
            />
          ))}
        </div>
      ) : displayed.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 py-20 flex flex-col items-center gap-3 text-gray-400">
          <Users size={32} className="text-gray-200" />
          <p className="text-sm font-medium">No members found</p>
          <p className="text-xs text-gray-300">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {displayed.map((m) => (
            <MemberCard
              key={m.id}
              member={m}
              onEdit={(member) => {
                setEditMember(member);
                setShowAddModal(true);
              }}
              onDelete={handleDelete}
              onToggleStatus={handleToggleStatus}
            />
          ))}
        </div>
      )}

      {/* modal */}
      {showAddModal && (
        <AddOurTeamModal
          existingMember={editMember}
          onClose={() => {
            setShowAddModal(false);
            setEditMember(null);
          }}
          onSaved={handleMemberSaved}
        />
      )}
    </div>
  );
}
