"use client";

import { useState } from "react";
import { ChevronDown, Eye, LayoutPanelTop } from "lucide-react";
import { CollectionManager, HEX, PreviewShell } from "../_shared/AdminSectionShared";
import {
  createNavItem,
  deleteNavItem,
  subscribeNavItems,
  toggleNavItemStatus,
  updateNavItem,
} from "./service/navbar.service";

/**
 * `AdminSectionShared`'s `CollectionModal` only auto-renders text/textarea/
 * number/image field types, so `megaMenu` is edited as a plain text field
 * ("true" / "false") and coerced to a real boolean here — before it ever
 * reaches `navbar.service.js`'s `normalize`, which expects an actual
 * boolean (`Boolean(payload.megaMenu)`).
 */
function toMegaMenuBoolean(value) {
  if (typeof value === "boolean") return value;
  return String(value ?? "").trim().toLowerCase() === "true";
}

function createNavItemChecked(form) {
  return createNavItem({ ...form, megaMenu: toMegaMenuBoolean(form.megaMenu) });
}

function updateNavItemChecked(id, form) {
  return updateNavItem(id, { ...form, megaMenu: toMegaMenuBoolean(form.megaMenu) });
}

export default function SnapageeNavbarPage() {
  const [items, setItems] = useState([]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto flex max-w-7xl flex-col gap-5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-900 text-white shadow-sm">
            <LayoutPanelTop className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Snapagee Navbar</h1>
            <p className="text-sm text-gray-500">
              Manage primary navigation links. The CTA button reads the site settings&apos; primary CTA label directly.
            </p>
          </div>
        </div>

        <div className="grid gap-5 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
          <section className="space-y-5">
            <CollectionManager
              eyebrow="Navbar"
              title="Primary links"
              itemNoun="link"
              subscribe={subscribeNavItems}
              create={createNavItemChecked}
              update={updateNavItemChecked}
              remove={deleteNavItem}
              toggle={toggleNavItemStatus}
              onItems={setItems}
              fields={[
                { key: "label", label: "Label", type: "text", required: true, half: true, placeholder: "Services" },
                { key: "href", label: "Href", type: "text", required: true, half: true, placeholder: "/services" },
                {
                  key: "megaMenu",
                  label: "Mega Menu",
                  type: "text",
                  placeholder: "true or false",
                  hint: "Type true to show the services mega-menu dropdown under this item.",
                },
              ]}
              columns={[
                { key: "label", label: "Link" },
                { key: "href", label: "Href", render: (item) => item.href },
                { key: "megaMenu", label: "Mega Menu", render: (item) => (item.megaMenu ? "Mega menu" : "Simple link") },
              ]}
              itemLabel={(item) => item.label}
            />
            <p className="text-xs text-gray-400">
              Falls back to the bundled 6-item navigation (with mega-menu flags) when empty.
            </p>
          </section>

          <section className="space-y-5">
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <Eye className="h-4 w-4 text-gray-400" />
                <h2 className="text-base font-bold text-gray-900">Live preview</h2>
              </div>
              <NavbarPreview items={items} />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

/* ---------------------- Snapagee front-end live preview ------------------ */

function NavbarPreview({ items }) {
  const active = [...(items || [])]
    .filter((item) => item.active !== false)
    .sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0));

  return (
    <PreviewShell>
      <div className="flex items-center justify-between gap-4 border-b px-5 py-4" style={{ borderColor: HEX.border }}>
        <span
          className="text-lg font-bold tracking-tight"
          style={{
            background: `linear-gradient(90deg, ${HEX.accentAlt}, ${HEX.violet}, ${HEX.accent})`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Snapagee
        </span>
        <div className="hidden items-center gap-5 md:flex">
          {active.length ? (
            active.map((item) => (
              <span
                key={item.id}
                className="inline-flex items-center gap-1 text-[11px] font-medium uppercase tracking-[0.12em]"
                style={{ color: HEX.dim }}
              >
                {item.label}
                {item.megaMenu ? <ChevronDown className="h-3 w-3" /> : null}
              </span>
            ))
          ) : (
            <span className="text-[11px] font-medium uppercase tracking-[0.12em]" style={{ color: HEX.dim }}>
              No active links
            </span>
          )}
        </div>
        <span className="rounded-full px-3 py-1.5 text-[11px] font-semibold" style={{ background: HEX.accent, color: "#ffffff" }}>
          Book a Call
        </span>
      </div>
    </PreviewShell>
  );
}
