"use client";

import { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";
import { CollectionManager, HEX, PreviewShell } from "../_shared/AdminSectionShared";
import {
  createFaq,
  deleteFaq,
  subscribeFaqs,
  toggleFaqStatus,
  updateFaq,
} from "./service/faq.service";

export default function SnapageeFaqPage() {
  const [items, setItems] = useState([]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto flex max-w-7xl flex-col gap-5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-900 text-white shadow-sm">
            <HelpCircle className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Snapagee FAQ</h1>
            <p className="text-sm text-gray-500">Manage the sitewide questions shown on /contact and /services. Section headings live in their own modules.</p>
          </div>
        </div>

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <CollectionManager
            eyebrow="FAQ"
            title="Questions"
            itemNoun="question"
            subscribe={subscribeFaqs}
            create={createFaq}
            update={updateFaq}
            remove={deleteFaq}
            toggle={toggleFaqStatus}
            onItems={setItems}
            fields={[
              { key: "question", label: "Question", type: "text", required: true },
              { key: "answer", label: "Answer", type: "textarea", rows: 3, required: true },
            ]}
            columns={[
              { key: "question", label: "Question" },
              { key: "answer", label: "Answer", render: (item) => item.answer },
            ]}
            itemLabel={(item) => item.question}
          />

          <div className="flex flex-col gap-3">
            <p className="text-sm font-bold text-gray-700">Live preview</p>
            <div className="xl:sticky xl:top-6">
              <FaqPreview items={items} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FaqPreview({ items }) {
  const active = (items || []).filter((item) => item.active !== false);

  return (
    <PreviewShell>
      <div className="flex flex-col gap-2 p-6">
        {active.length ? (
          active.map((item, index) => (
            <div key={item.id} className="rounded-xl border px-4 py-3" style={{ borderColor: HEX.border, background: HEX.raised }}>
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-semibold" style={{ color: HEX.fg }}>{item.question}</p>
                <ChevronDown className="h-3.5 w-3.5 shrink-0" style={{ color: HEX.accent }} />
              </div>
              {index === 0 ? (
                <p className="mt-2 text-[11px] leading-relaxed" style={{ color: HEX.dim }}>{item.answer}</p>
              ) : null}
            </div>
          ))
        ) : (
          <p className="text-xs" style={{ color: HEX.dim }}>No active questions yet.</p>
        )}
      </div>
    </PreviewShell>
  );
}
