"use client";

import { useState } from "react";
import { MessageSquareQuote, Star } from "lucide-react";
import { CollectionManager, HEX, PreviewShell } from "../_shared/AdminSectionShared";
import {
  createTestimonial,
  deleteTestimonial,
  subscribeTestimonials,
  toggleTestimonialStatus,
  updateTestimonial,
} from "./service/testimonials.service";

export default function ShophobiaTestimonialsPage() {
  const [items, setItems] = useState([]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto flex max-w-7xl flex-col gap-5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-900 text-white shadow-sm">
            <MessageSquareQuote className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Shophobia Testimonials</h1>
            <p className="text-sm text-gray-500">Manage the quotes in the home-page slider. The section heading lives in the Home module.</p>
          </div>
        </div>

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <CollectionManager
            eyebrow="Testimonials"
            title="Quotes"
            itemNoun="testimonial"
            subscribe={subscribeTestimonials}
            create={createTestimonial}
            update={updateTestimonial}
            remove={deleteTestimonial}
            toggle={toggleTestimonialStatus}
            onItems={setItems}
            fields={[
              { key: "quote", label: "Quote", type: "textarea", rows: 3, required: true },
              { key: "name", label: "Name", type: "text", required: true, half: true },
              { key: "role", label: "Role / Company", type: "text", half: true, placeholder: "Founder, Neonfox" },
              { key: "rating", label: "Rating (1-5)", type: "number", half: true, placeholder: "5" },
            ]}
            columns={[
              { key: "name", label: "Testimonial" },
              { key: "quote", label: "Quote", render: (item) => item.quote },
            ]}
            itemLabel={(item) => item.name}
          />

          <div className="flex flex-col gap-3">
            <p className="text-sm font-bold text-gray-700">Live preview</p>
            <div className="xl:sticky xl:top-6">
              <TestimonialsPreview items={items} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TestimonialsPreview({ items }) {
  const active = (items || []).filter((item) => item.active !== false);
  const first = active[0];

  return (
    <PreviewShell>
      <div className="flex flex-col items-center gap-3 px-6 py-8 text-center">
        {first ? (
          <>
            <div className="flex gap-1" style={{ color: HEX.accent }}>
              {Array.from({ length: Math.min(5, Math.max(1, Number(first.rating) || 5)) }).map((_, index) => (
                <Star key={index} className="h-3.5 w-3.5 fill-current" />
              ))}
            </div>
            <p className="max-w-md text-sm leading-relaxed" style={{ color: HEX.fg }}>
              &ldquo;{first.quote}&rdquo;
            </p>
            <p className="text-xs font-semibold" style={{ color: HEX.fg }}>{first.name}</p>
            <p className="text-[10px] uppercase tracking-wide" style={{ color: HEX.dim }}>{first.role}</p>
            <div className="mt-1 flex gap-1.5">
              {active.map((item, index) => (
                <span
                  key={item.id}
                  className="h-1.5 rounded-full"
                  style={{
                    width: index === 0 ? 18 : 6,
                    background: index === 0 ? `linear-gradient(90deg, ${HEX.accentAlt}, ${HEX.accent})` : HEX.border,
                  }}
                />
              ))}
            </div>
          </>
        ) : (
          <p className="text-xs" style={{ color: HEX.dim }}>No active testimonials yet.</p>
        )}
      </div>
    </PreviewShell>
  );
}
