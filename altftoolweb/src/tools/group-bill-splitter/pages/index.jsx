"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Copy,
  Pencil,
  Plus,
  Trash2,
  UserPlus,
  Users,
  Wallet,
  X,
} from "lucide-react";
import { safeCopyText } from "@/shared/utils/clipboard";

const STORAGE_KEY = "altf:group-bill-splitter:state";

const seedMembers = [
  { id: "m1", name: "Aarav" },
  { id: "m2", name: "Diya" },
  { id: "m3", name: "Kabir" },
];

const seedExpenses = [
  { id: "e1", description: "Hotel (2 nights)", amount: 4500, paidBy: "m1", splitAmong: ["m1", "m2", "m3"] },
  { id: "e2", description: "Airport cab", amount: 900, paidBy: "m2", splitAmong: ["m1", "m2", "m3"] },
  { id: "e3", description: "Dinner day 1", amount: 1800, paidBy: "m3", splitAmong: ["m1", "m2", "m3"] },
  { id: "e4", description: "Snacks", amount: 300, paidBy: "m2", splitAmong: ["m2", "m3"] },
];

const makeId = () => Math.random().toString(36).slice(2, 10);

const inrWhole = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const inrExact = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const formatINR = (value) => {
  const safe = Number.isFinite(value) ? value : 0;
  return Math.abs(safe - Math.round(safe)) < 0.005
    ? inrWhole.format(Math.round(safe))
    : inrExact.format(safe);
};

function settleUp(balances) {
  const debtors = [];
  const creditors = [];
  balances.forEach((entry) => {
    if (entry.amount < -0.005) debtors.push({ id: entry.id, amount: -entry.amount });
    else if (entry.amount > 0.005) creditors.push({ id: entry.id, amount: entry.amount });
  });
  const plan = [];
  let guard = 0;
  while (debtors.length && creditors.length && guard < 500) {
    guard += 1;
    debtors.sort((a, b) => b.amount - a.amount);
    creditors.sort((a, b) => b.amount - a.amount);
    const debtor = debtors[0];
    const creditor = creditors[0];
    const amount = Math.min(debtor.amount, creditor.amount);
    plan.push({ from: debtor.id, to: creditor.id, amount });
    debtor.amount -= amount;
    creditor.amount -= amount;
    if (debtor.amount <= 0.005) debtors.shift();
    if (creditor.amount <= 0.005) creditors.shift();
  }
  return plan;
}

function sanitizeState(parsed) {
  if (!parsed || !Array.isArray(parsed.members) || !Array.isArray(parsed.expenses)) return null;
  const members = parsed.members
    .filter((member) => member && typeof member.id === "string" && typeof member.name === "string")
    .map((member) => ({ id: member.id, name: member.name }));
  const memberIds = new Set(members.map((member) => member.id));
  const expenses = parsed.expenses
    .filter(
      (expense) =>
        expense &&
        typeof expense.id === "string" &&
        Number(expense.amount) > 0 &&
        memberIds.has(expense.paidBy)
    )
    .map((expense) => {
      const filteredSplit = Array.isArray(expense.splitAmong)
        ? expense.splitAmong.filter((id) => memberIds.has(id))
        : [];
      // Legacy/blank splits meant "everyone" dynamically, which silently rewrote past
      // expenses whenever membership changed. Freeze them to the current member set on
      // load so the split (and the member-lock guarantee) stays fixed going forward.
      return {
        id: expense.id,
        description: typeof expense.description === "string" ? expense.description : "Expense",
        amount: Number(expense.amount),
        paidBy: expense.paidBy,
        splitAmong: filteredSplit.length ? filteredSplit : members.map((member) => member.id),
      };
    });
  return { members, expenses };
}

export default function ToolHome() {
  const [members, setMembers] = useState(seedMembers);
  const [expenses, setExpenses] = useState(seedExpenses);
  const [hydrated, setHydrated] = useState(false);
  const [memberName, setMemberName] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [paidBy, setPaidBy] = useState("m1");
  const [splitIds, setSplitIds] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [confirmClear, setConfirmClear] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const restored = sanitizeState(JSON.parse(raw));
        if (restored) {
          setMembers(restored.members);
          setExpenses(restored.expenses);
        }
      }
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ members, expenses }));
    } catch {}
  }, [expenses, hydrated, members]);

  useEffect(() => {
    if (!confirmClear) return undefined;
    const timer = setTimeout(() => setConfirmClear(false), 4000);
    return () => clearTimeout(timer);
  }, [confirmClear]);

  const paidBySafe = members.some((member) => member.id === paidBy)
    ? paidBy
    : members[0]?.id || "";

  const lockedMemberIds = useMemo(() => {
    const locked = new Set();
    expenses.forEach((expense) => {
      locked.add(expense.paidBy);
      expense.splitAmong.forEach((id) => locked.add(id));
    });
    return locked;
  }, [expenses]);

  const stats = useMemo(() => {
    const balance = new Map(members.map((member) => [member.id, 0]));
    let total = 0;
    expenses.forEach((expense) => {
      const value = Math.max(0, Number(expense.amount) || 0);
      if (!value || !balance.has(expense.paidBy)) return;
      // splitAmong is frozen at save time (see saveExpense) — an "Everyone" expense
      // stores the concrete member ids it applied to, so it never silently re-splits
      // against a membership list that has since changed.
      const shareIds = expense.splitAmong.filter((id) => balance.has(id));
      if (!shareIds.length) return;
      total += value;
      balance.set(expense.paidBy, balance.get(expense.paidBy) + value);
      const share = value / shareIds.length;
      shareIds.forEach((id) => balance.set(id, balance.get(id) - share));
    });
    const plan = settleUp(members.map((member) => ({ id: member.id, amount: balance.get(member.id) })));
    return {
      balance,
      total,
      perHead: members.length ? total / members.length : 0,
      plan,
    };
  }, [expenses, members]);

  const nameOf = (id) => members.find((member) => member.id === id)?.name || "?";

  const plainSummary = useMemo(() => {
    const nameById = new Map(members.map((member) => [member.id, member.name]));
    const label = (id) => nameById.get(id) || "?";
    const lines = [
      "Group Expense Settle-up",
      `Members: ${members.map((member) => member.name).join(", ") || "none"}`,
      `Trip total: ${formatINR(stats.total)} · Per-head share: ${formatINR(stats.perHead)}`,
      "",
      "Balances:",
    ];
    members.forEach((member) => {
      const value = stats.balance.get(member.id) || 0;
      if (value > 0.005) lines.push(`${member.name} is owed ${formatINR(value)}`);
      else if (value < -0.005) lines.push(`${member.name} owes ${formatINR(-value)}`);
      else lines.push(`${member.name} is settled`);
    });
    lines.push("", `Settle up (${stats.plan.length} ${stats.plan.length === 1 ? "payment" : "payments"}):`);
    if (stats.plan.length === 0) lines.push("Nothing pending — all settled.");
    stats.plan.forEach((txn, index) => {
      lines.push(`${index + 1}. ${label(txn.from)} pays ${label(txn.to)} ${formatINR(txn.amount)}`);
    });
    lines.push(`Generated: ${new Date().toLocaleString()}`);
    return lines.join("\n");
  }, [members, stats]);

  const addMember = () => {
    const name = memberName.trim();
    if (!name) return;
    setMembers((current) => [...current, { id: makeId(), name }]);
    setMemberName("");
  };

  const removeMember = (memberId) => {
    if (lockedMemberIds.has(memberId)) return;
    setMembers((current) => current.filter((member) => member.id !== memberId));
    setSplitIds((current) => current.filter((id) => id !== memberId));
    if (paidBy === memberId) setPaidBy("");
  };

  const toggleSplit = (memberId) => {
    setSplitIds((current) =>
      current.includes(memberId)
        ? current.filter((id) => id !== memberId)
        : [...current, memberId]
    );
  };

  const resetExpenseForm = () => {
    setDescription("");
    setAmount("");
    setSplitIds([]);
    setEditingId(null);
  };

  const canSaveExpense = Number(amount) > 0 && Boolean(paidBySafe);

  const saveExpense = () => {
    if (!canSaveExpense) return;
    // "Everyone" (an empty selection) is resolved to the concrete member list right now,
    // at save time, so the split is frozen and won't silently change if members are added
    // or removed later.
    const explicitSplit = splitIds.filter((id) => members.some((member) => member.id === id));
    const resolvedSplit = explicitSplit.length ? explicitSplit : members.map((member) => member.id);
    const entry = {
      id: editingId || makeId(),
      description: description.trim() || `Expense ${expenses.length + 1}`,
      amount: Number(amount),
      paidBy: paidBySafe,
      splitAmong: resolvedSplit,
    };
    setExpenses((current) =>
      editingId
        ? current.map((expense) => (expense.id === editingId ? entry : expense))
        : [...current, entry]
    );
    resetExpenseForm();
  };

  const startEdit = (expense) => {
    setEditingId(expense.id);
    setDescription(expense.description);
    setAmount(String(expense.amount));
    setPaidBy(expense.paidBy);
    setSplitIds(expense.splitAmong);
  };

  const removeExpense = (expenseId) => {
    setExpenses((current) => current.filter((expense) => expense.id !== expenseId));
    if (editingId === expenseId) resetExpenseForm();
  };

  const clearAll = () => {
    setMembers([]);
    setExpenses([]);
    resetExpenseForm();
    setPaidBy("");
    setConfirmClear(false);
  };

  const copyPlan = async () => {
    const success = await safeCopyText(plainSummary);
    if (!success) return;
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  const splitLabel = (expense) => {
    const ids = expense.splitAmong;
    // Still labelled "Everyone" only while the frozen split happens to match every
    // current member — once membership changes, the true (now partial) list is shown.
    const isEveryone =
      ids.length > 0 && ids.length === members.length && members.every((member) => ids.includes(member.id));
    if (isEveryone) return "Everyone";
    return ids.map((id) => nameOf(id)).join(", ") || "Everyone";
  };

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6">
      <div className="mx-auto max-w-6xl">
        <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)] 2xl:p-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase text-[var(--primary)]">
            <Users className="h-4 w-4" />
            Trips &amp; flatmates
          </div>
          <h1 className="text-4xl font-semibold leading-tight">Group Expense Splitter</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
            Log who paid for what on a trip or in a flat, see everyone&apos;s balance at a glance,
            and settle up with a lean, low-transfer plan. Everything is saved in your browser.
          </p>
        </section>

        <section className="mt-6 grid gap-6 2xl:grid-cols-[420px_1fr]">
          <div className="grid content-start gap-6">
            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
              <label htmlFor="ges-member" className="text-sm font-semibold">
                Add member
              </label>
              <div className="mt-2 flex gap-2">
                <input
                  id="ges-member"
                  type="text"
                  value={memberName}
                  onChange={(event) => setMemberName(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") addMember();
                  }}
                  placeholder="e.g. Riya"
                  className="h-12 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                />
                <button
                  type="button"
                  onClick={addMember}
                  className="inline-flex h-12 shrink-0 items-center gap-1.5 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)]"
                >
                  <UserPlus className="h-4 w-4" />
                  Add
                </button>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {members.map((member) => {
                  const locked = lockedMemberIds.has(member.id);
                  return (
                    <span
                      key={member.id}
                      className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--muted)] px-3 py-1.5 text-sm font-semibold"
                    >
                      {member.name}
                      <button
                        type="button"
                        aria-label={
                          locked
                            ? `${member.name} is used in expenses and cannot be removed`
                            : `Remove ${member.name}`
                        }
                        title={locked ? "Referenced in expenses — remove those first" : undefined}
                        disabled={locked}
                        onClick={() => removeMember(member.id)}
                        className="text-[var(--muted-foreground)] transition enabled:hover:text-[var(--anslation-ds-danger)] disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </span>
                  );
                })}
                {members.length === 0 && (
                  <p className="text-sm text-[var(--muted-foreground)]">
                    Add members to start tracking expenses.
                  </p>
                )}
              </div>
              <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">
                Members named in an expense can&apos;t be removed until those expenses are deleted
                or edited.
              </p>
            </div>

            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
              <p className="text-sm font-semibold">
                {editingId ? "Edit expense" : "Add expense"}
              </p>
              <div className="mt-3 grid gap-4">
                <label className="block">
                  <span className="text-xs font-semibold text-[var(--muted-foreground)]">
                    Description
                  </span>
                  <input
                    type="text"
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    placeholder="e.g. Groceries"
                    className="mt-1 h-12 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                  />
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label className="block">
                    <span className="text-xs font-semibold text-[var(--muted-foreground)]">
                      Amount (₹)
                    </span>
                    <input
                      type="number"
                      min="0"
                      inputMode="decimal"
                      value={amount}
                      onChange={(event) => setAmount(event.target.value)}
                      className="mt-1 h-12 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                    />
                  </label>
                  <label className="block">
                    <span className="text-xs font-semibold text-[var(--muted-foreground)]">
                      Paid by
                    </span>
                    <select
                      value={paidBySafe}
                      onChange={(event) => setPaidBy(event.target.value)}
                      disabled={!members.length}
                      className="mt-1 h-12 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {members.map((member) => (
                        <option key={member.id} value={member.id}>
                          {member.name}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
                <div>
                  <p className="text-xs font-semibold text-[var(--muted-foreground)]">
                    Split among
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setSplitIds([])}
                      aria-pressed={splitIds.length === 0}
                      className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                        splitIds.length === 0
                          ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                          : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:border-[var(--primary)]"
                      }`}
                    >
                      Everyone
                    </button>
                    {members.map((member) => (
                      <button
                        key={member.id}
                        type="button"
                        onClick={() => toggleSplit(member.id)}
                        aria-pressed={splitIds.includes(member.id)}
                        className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                          splitIds.includes(member.id)
                            ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                            : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:border-[var(--primary)]"
                        }`}
                      >
                        {member.name}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={saveExpense}
                    disabled={!canSaveExpense}
                    className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-[var(--primary)] text-sm font-semibold text-[var(--primary-foreground)] transition disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Plus className="h-4 w-4" />
                    {editingId ? "Update expense" : "Add expense"}
                  </button>
                  {editingId && (
                    <button
                      type="button"
                      onClick={resetExpenseForm}
                      className="btn-secondary h-11 shrink-0 px-4 text-sm"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>

              {expenses.length > 0 && (
                <ul className="mt-5 grid gap-2 border-t border-[var(--border)] pt-4">
                  {expenses.map((expense) => (
                    <li
                      key={expense.id}
                      className="flex items-center justify-between gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">{expense.description}</p>
                        <p className="truncate text-xs text-[var(--muted-foreground)]">
                          Paid by {nameOf(expense.paidBy)} · Split: {splitLabel(expense)}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <span className="text-sm font-semibold">{formatINR(expense.amount)}</span>
                        <button
                          type="button"
                          aria-label={`Edit ${expense.description}`}
                          onClick={() => startEdit(expense)}
                          className="text-[var(--muted-foreground)] transition hover:text-[var(--primary)]"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          aria-label={`Delete ${expense.description}`}
                          onClick={() => removeExpense(expense.id)}
                          className="text-[var(--muted-foreground)] transition hover:text-[var(--anslation-ds-danger)]"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}

              <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-[var(--border)] pt-4">
                {confirmClear ? (
                  <>
                    <button
                      type="button"
                      onClick={clearAll}
                      className="inline-flex h-10 items-center gap-2 rounded-md bg-[var(--anslation-ds-danger)] px-4 text-sm font-semibold text-[var(--primary-foreground)]"
                    >
                      <Trash2 className="h-4 w-4" />
                      Yes, clear everything
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmClear(false)}
                      className="btn-secondary h-10 px-4 text-sm"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmClear(true)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--anslation-ds-danger)]"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Clear all members &amp; expenses
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="grid content-start gap-6">
            <div
              className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]"
              aria-live="polite"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">
                  Totals
                </p>
                <button
                  type="button"
                  onClick={copyPlan}
                  className="btn-secondary min-h-9 px-3 py-1.5 text-sm"
                >
                  <Copy className="h-4 w-4" />
                  {copied ? "Copied" : "Copy settle-up plan"}
                </button>
              </div>
              <div className="tool-compact-grid mt-4">
                <div className="rounded-md bg-[var(--muted)] p-3">
                  <p className="text-xs text-[var(--muted-foreground)]">Trip total</p>
                  <p className="mt-1 text-xl font-semibold text-[var(--primary)]">
                    {formatINR(stats.total)}
                  </p>
                </div>
                <div className="rounded-md border border-[var(--border)] bg-[var(--background)] p-3">
                  <p className="text-xs text-[var(--muted-foreground)]">Per-head fair share</p>
                  <p className="mt-1 text-xl font-semibold">{formatINR(stats.perHead)}</p>
                </div>
                <div className="rounded-md border border-[var(--border)] bg-[var(--background)] p-3">
                  <p className="text-xs text-[var(--muted-foreground)]">Members</p>
                  <p className="mt-1 text-xl font-semibold">{members.length}</p>
                </div>
                <div className="rounded-md border border-[var(--border)] bg-[var(--background)] p-3">
                  <p className="text-xs text-[var(--muted-foreground)]">Expenses</p>
                  <p className="mt-1 text-xl font-semibold">{expenses.length}</p>
                </div>
              </div>
              <p className="mt-4 text-sm leading-6 text-[var(--muted-foreground)]">
                Per-head fair share = trip total / members. Balances compare what each person paid
                against their share of every expense they were part of.
              </p>
            </div>

            <div
              className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]"
              aria-live="polite"
            >
              <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">
                Balances
              </p>
              {members.length === 0 ? (
                <p className="mt-3 text-sm text-[var(--muted-foreground)]">
                  Add members and expenses to see balances.
                </p>
              ) : (
                <ul className="mt-4 grid gap-2">
                  {members.map((member) => {
                    const value = stats.balance.get(member.id) || 0;
                    const settled = Math.abs(value) <= 0.005;
                    return (
                      <li
                        key={member.id}
                        className="flex items-center justify-between gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2.5"
                      >
                        <span className="flex items-center gap-2 text-sm font-semibold">
                          <Wallet className="h-4 w-4 text-[var(--muted-foreground)]" />
                          {member.name}
                        </span>
                        {settled ? (
                          <span className="text-sm font-semibold text-[var(--muted-foreground)]">
                            Settled
                          </span>
                        ) : value > 0 ? (
                          <span className="text-sm font-semibold text-[var(--anslation-ds-success)]">
                            is owed {formatINR(value)}
                          </span>
                        ) : (
                          <span className="text-sm font-semibold text-[var(--anslation-ds-danger)]">
                            owes {formatINR(-value)}
                          </span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            <div
              className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]"
              aria-live="polite"
            >
              <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">
                Settle up ({stats.plan.length}{" "}
                {stats.plan.length === 1 ? "payment" : "payments"})
              </p>
              {stats.plan.length === 0 ? (
                <p className="mt-3 text-sm text-[var(--muted-foreground)]">
                  Nothing pending — everyone is square.
                </p>
              ) : (
                <ol className="mt-4 grid gap-2">
                  {stats.plan.map((txn, index) => (
                    <li
                      key={`${txn.from}-${txn.to}-${index}`}
                      className="flex items-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm"
                    >
                      <span className="font-semibold">{nameOf(txn.from)}</span>
                      <ArrowRight className="h-4 w-4 shrink-0 text-[var(--muted-foreground)]" />
                      <span className="font-semibold">{nameOf(txn.to)}</span>
                      <span className="ml-auto font-semibold text-[var(--primary)]">
                        {formatINR(txn.amount)}
                      </span>
                    </li>
                  ))}
                </ol>
              )}
              <p className="mt-4 text-sm leading-6 text-[var(--muted-foreground)]">
                The plan greedily matches the biggest debtor with the biggest creditor, settling
                the group in at most one transfer fewer than the number of members.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
