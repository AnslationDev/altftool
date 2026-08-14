import React, { useState, useEffect } from "react";
import { fetchPageData, savePageData } from "@/projects/alphobia/services/alphobiaService";
import { emitAlert } from "@/lib/alertBus";
import { Loader2, Plus, Trash2, ArrowUp, ArrowDown } from "lucide-react";
import ImagePreviewModal from "@/projects/alphobia/components/ImagePreviewModal";

export default function HomeTab() {
  const [previewImg, setPreviewImg] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const homeData = await fetchPageData("home");
        setData(homeData);
      } catch (err) {
        emitAlert({ type: "error", message: "Failed to load home page data." });
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await savePageData("home", data);
      emitAlert({ type: "success", message: "Home page configurations updated!" });
    } catch (err) {
      emitAlert({ type: "error", message: "Failed to update home page." });
    } finally {
      setSaving(false);
    }
  };

  // Helper change handlers
  const updateHero = (field, val) => {
    setData((prev) => ({
      ...prev,
      hero: { ...prev.hero, [field]: val },
    }));
  };

  const updateTrustedTitle = (val) => {
    setData((prev) => ({
      ...prev,
      trustedBy: { ...prev.trustedBy, title: val },
    }));
  };

  const updateCompany = (idx, field, val) => {
    setData((prev) => {
      const companies = [...prev.trustedBy.companies];
      companies[idx] = { ...companies[idx], [field]: val };
      return { ...prev, trustedBy: { ...prev.trustedBy, companies } };
    });
  };

  const addCompany = () => {
    setData((prev) => ({
      ...prev,
      trustedBy: {
        ...prev.trustedBy,
        companies: [
          ...prev.trustedBy.companies,
          { id: `comp-${Date.now()}`, name: "New Company", domain: "example.com" },
        ],
      },
    }));
  };

  const removeCompany = (idx) => {
    setData((prev) => {
      const companies = prev.trustedBy.companies.filter((_, i) => i !== idx);
      return { ...prev, trustedBy: { ...prev.trustedBy, companies } };
    });
  };

  const updateExecutionHeader = (field, val) => {
    setData((prev) => ({
      ...prev,
      executionProtocol: { ...prev.executionProtocol, [field]: val },
    }));
  };

  const updateExecutionStep = (idx, field, val) => {
    setData((prev) => {
      const steps = [...prev.executionProtocol.steps];
      steps[idx] = { ...steps[idx], [field]: val };
      return { ...prev, executionProtocol: { ...prev.executionProtocol, steps } };
    });
  };

  const updateWhyChooseUs = (row, field, val) => {
    setData((prev) => ({
      ...prev,
      whyChooseUs: {
        ...prev.whyChooseUs,
        [row]: { ...prev.whyChooseUs[row], [field]: val },
      },
    }));
  };

  const updateWhyChooseBullets = (row, idx, val) => {
    setData((prev) => {
      const bullets = [...prev.whyChooseUs[row].bullets];
      bullets[idx] = val;
      return {
        ...prev,
        whyChooseUs: {
          ...prev.whyChooseUs,
          [row]: { ...prev.whyChooseUs[row], bullets },
        },
      };
    });
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--primary)]" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} className="space-y-8 animate-slide-in">
      {/* Save Floating Bar */}
      <div className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm rounded-lg">
        <div>
          <h2 className="text-lg font-bold">Home Page Configuration</h2>
          <p className="text-xs text-[var(--muted)]">Configure content for the homepage sections</p>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="btn btn-primary min-w-[120px] flex items-center gap-2"
        >
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Changes"
          )}
        </button>
      </div>

      {/* Hero Section Card */}
      <div className="card p-6 space-y-4">
        <h3 className="text-md font-bold border-b border-[var(--border)] pb-2 text-[var(--primary)]">1. Hero Section</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-semibold">Active Tagline Alert</label>
            <input
              type="text"
              className="input"
              value={data.hero?.tag || ""}
              onChange={(e) => updateHero("tag", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold">Hero Background Image Path / URL</label>
            <div className="flex gap-3 items-center">
              <input
                type="text"
                className="input flex-1"
                value={data.hero?.heroImage || ""}
                onChange={(e) => updateHero("heroImage", e.target.value)}
              />
              {data.hero?.heroImage && (
                <button
                  type="button"
                  onClick={() => setPreviewImg(data.hero.heroImage)}
                  title="Click to view full image"
                  className="h-10 w-16 bg-[var(--surface-soft)] rounded border border-[var(--border)] overflow-hidden shrink-0 block hover:opacity-80 transition cursor-pointer"
                >
                  <img src={data.hero.heroImage} alt="Hero Preview" className="w-full h-full object-cover" />
                </button>
              )}
            </div>
          </div>
          <div className="md:col-span-2 space-y-2">
            <label className="text-xs font-semibold">Main Heading</label>
            <input
              type="text"
              className="input"
              value={data.hero?.title || ""}
              onChange={(e) => updateHero("title", e.target.value)}
            />
            <p className="text-[10px] text-[var(--muted)]">Use HTML or italic tags in React if supported on client.</p>
          </div>
          <div className="md:col-span-2 space-y-2">
            <label className="text-xs font-semibold">Sub-heading Description</label>
            <textarea
              rows={3}
              className="input"
              value={data.hero?.subtitle || ""}
              onChange={(e) => updateHero("subtitle", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold">Button 1 Text (Call to Action)</label>
            <input
              type="text"
              className="input"
              value={data.hero?.button1Text || ""}
              onChange={(e) => updateHero("button1Text", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold">Button 2 Text</label>
            <input
              type="text"
              className="input"
              value={data.hero?.button2Text || ""}
              onChange={(e) => updateHero("button2Text", e.target.value)}
            />
          </div>
          <div className="md:col-span-2 space-y-2">
            <label className="text-xs font-semibold">Verification Badges (Comma-separated)</label>
            <input
              type="text"
              className="input"
              value={data.hero?.verifiedBy?.join(", ") || ""}
              onChange={(e) => updateHero("verifiedBy", e.target.value.split(",").map(s => s.trim()))}
            />
          </div>
        </div>
      </div>

      {/* Trusted By logo cloud Card */}
      <div className="card p-6 space-y-4">
        <h3 className="text-md font-bold border-b border-[var(--border)] pb-2 text-[var(--primary)]">2. Trusted By Section</h3>
        <div className="space-y-2">
          <label className="text-xs font-semibold">Section Heading Title</label>
          <input
            type="text"
            className="input"
            value={data.trustedBy?.title || ""}
            onChange={(e) => updateTrustedTitle(e.target.value)}
          />
        </div>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <label className="text-xs font-semibold">Partner Companies Logos</label>
            <button
              type="button"
              onClick={addCompany}
              className="btn btn-outline py-1 px-3 text-xs flex items-center gap-1"
            >
              <Plus className="h-3 w-3" /> Add Partner
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {data.trustedBy?.companies?.map((comp, idx) => (
              <div key={comp.id || idx} className="p-3 bg-[var(--surface-soft)] rounded border border-[var(--border)] flex flex-col justify-between space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-[var(--muted)]">Partner #{idx + 1}</span>
                  <button
                    type="button"
                    onClick={() => removeCompany(idx)}
                    className="text-[var(--danger)] hover:opacity-80 transition"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="Name"
                  className="input py-1 px-2 text-xs"
                  value={comp.name || ""}
                  onChange={(e) => updateCompany(idx, "name", e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Domain (for Clearbit logo fetch)"
                  className="input py-1 px-2 text-xs"
                  value={comp.domain || ""}
                  onChange={(e) => updateCompany(idx, "domain", e.target.value)}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Core Capabilities Card */}
      <div className="card p-6 space-y-4">
        <h3 className="text-md font-bold border-b border-[var(--border)] pb-2 text-[var(--primary)]">3. Core Capabilities Header</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-semibold">Section Title</label>
            <input
              type="text"
              className="input"
              value={data.capabilitiesHeader?.title || ""}
              onChange={(e) => setData(prev => ({ ...prev, capabilitiesHeader: { ...prev.capabilitiesHeader, title: e.target.value } }))}
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold">Section Subtitle</label>
            <input
              type="text"
              className="input"
              value={data.capabilitiesHeader?.subtitle || ""}
              onChange={(e) => setData(prev => ({ ...prev, capabilitiesHeader: { ...prev.capabilitiesHeader, subtitle: e.target.value } }))}
            />
          </div>
        </div>
      </div>

      {/* Execution Protocol Process Card */}
      <div className="card p-6 space-y-4">
        <h3 className="text-md font-bold border-b border-[var(--border)] pb-2 text-[var(--primary)]">4. Execution Protocol Section</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-semibold">Protocol Title</label>
            <input
              type="text"
              className="input"
              value={data.executionProtocol?.title || ""}
              onChange={(e) => updateExecutionHeader("title", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold">Protocol Subtitle</label>
            <input
              type="text"
              className="input"
              value={data.executionProtocol?.subtitle || ""}
              onChange={(e) => updateExecutionHeader("subtitle", e.target.value)}
            />
          </div>
        </div>
        <div className="space-y-3 pt-2">
          <label className="text-xs font-semibold">Steps (Fixed 5 Steps)</label>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            {data.executionProtocol?.steps?.map((step, idx) => (
              <div key={idx} className="p-3 bg-[var(--surface-soft)] rounded border border-[var(--border)] space-y-2">
                <span className="text-xs font-bold text-[var(--primary)]">Step {step.num || `0${idx+1}`}</span>
                <input
                  type="text"
                  placeholder="Name"
                  className="input py-1 px-2 text-xs"
                  value={step.name || ""}
                  onChange={(e) => updateExecutionStep(idx, "name", e.target.value)}
                />
                <textarea
                  placeholder="Description"
                  rows={4}
                  className="input py-1 px-2 text-xs"
                  value={step.desc || ""}
                  onChange={(e) => updateExecutionStep(idx, "desc", e.target.value)}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Why Choose Us: Alternating Layout Card */}
      <div className="card p-6 space-y-6">
        <h3 className="text-md font-bold border-b border-[var(--border)] pb-2 text-[var(--primary)]">5. Why Choose Us Section</h3>
        
        {/* Row 1 */}
        <div className="p-4 bg-[var(--surface-soft)] rounded border border-[var(--border)] space-y-4">
          <h4 className="text-xs font-bold text-[var(--primary)] uppercase">Row 1 Card Configuration</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold">Row Title</label>
              <input
                type="text"
                className="input"
                value={data.whyChooseUs?.row1?.title || ""}
                onChange={(e) => updateWhyChooseUs("row1", "title", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold">Row Image URL</label>
              <div className="flex gap-3 items-center">
                <input
                  type="text"
                  className="input flex-1"
                  value={data.whyChooseUs?.row1?.img || ""}
                  onChange={(e) => updateWhyChooseUs("row1", "img", e.target.value)}
                />
                {data.whyChooseUs?.row1?.img && (
                  <button
                    type="button"
                    onClick={() => setPreviewImg(data.whyChooseUs.row1.img)}
                    title="Click to view full image"
                    className="h-10 w-16 bg-[var(--surface-soft)] rounded border border-[var(--border)] overflow-hidden shrink-0 block hover:opacity-80 transition cursor-pointer"
                  >
                    <img src={data.whyChooseUs.row1.img} alt="Row 1 Preview" className="w-full h-full object-cover" />
                  </button>
                )}
              </div>
            </div>
            <div className="md:col-span-2 space-y-2">
              <label className="text-xs font-semibold">Row Description Paragraph</label>
              <textarea
                rows={3}
                className="input"
                value={data.whyChooseUs?.row1?.desc || ""}
                onChange={(e) => updateWhyChooseUs("row1", "desc", e.target.value)}
              />
            </div>
            <div className="md:col-span-2 space-y-2">
              <label className="text-xs font-semibold">Check Bullet Items</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {data.whyChooseUs?.row1?.bullets?.map((bull, bIdx) => (
                  <input
                    key={bIdx}
                    type="text"
                    className="input py-1 px-2 text-xs"
                    value={bull || ""}
                    onChange={(e) => updateWhyChooseBullets("row1", bIdx, e.target.value)}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Row 2 */}
        <div className="p-4 bg-[var(--surface-soft)] rounded border border-[var(--border)] space-y-4">
          <h4 className="text-xs font-bold text-[var(--primary)] uppercase">Row 2 Card Configuration</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold">Row Title</label>
              <input
                type="text"
                className="input"
                value={data.whyChooseUs?.row2?.title || ""}
                onChange={(e) => updateWhyChooseUs("row2", "title", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold">Row Image URL</label>
              <div className="flex gap-3 items-center">
                <input
                  type="text"
                  className="input flex-1"
                  value={data.whyChooseUs?.row2?.img || ""}
                  onChange={(e) => updateWhyChooseUs("row2", "img", e.target.value)}
                />
                {data.whyChooseUs?.row2?.img && (
                  <button
                    type="button"
                    onClick={() => setPreviewImg(data.whyChooseUs.row2.img)}
                    title="Click to view full image"
                    className="h-10 w-16 bg-[var(--surface-soft)] rounded border border-[var(--border)] overflow-hidden shrink-0 block hover:opacity-80 transition cursor-pointer"
                  >
                    <img src={data.whyChooseUs.row2.img} alt="Row 2 Preview" className="w-full h-full object-cover" />
                  </button>
                )}
              </div>
            </div>
            <div className="md:col-span-2 space-y-2">
              <label className="text-xs font-semibold">Row Description Paragraph</label>
              <textarea
                rows={3}
                className="input"
                value={data.whyChooseUs?.row2?.desc || ""}
                onChange={(e) => updateWhyChooseUs("row2", "desc", e.target.value)}
              />
            </div>
            <div className="md:col-span-2 space-y-2">
              <label className="text-xs font-semibold">Check Bullet Items</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {data.whyChooseUs?.row2?.bullets?.map((bull, bIdx) => (
                  <input
                    key={bIdx}
                    type="text"
                    className="input py-1 px-2 text-xs"
                    value={bull || ""}
                    onChange={(e) => updateWhyChooseBullets("row2", bIdx, e.target.value)}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <ImagePreviewModal src={previewImg} onClose={() => setPreviewImg(null)} />
    </form>
  );
}
