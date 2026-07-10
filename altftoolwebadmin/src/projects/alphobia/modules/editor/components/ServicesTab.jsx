import React, { useState, useEffect } from "react";
import { fetchPageData, savePageData } from "@/projects/alphobia/services/alphobiaService";
import { emitAlert } from "@/lib/alertBus";
import { Loader2, Plus, Trash2 } from "lucide-react";
import ImagePreviewModal from "@/projects/alphobia/components/ImagePreviewModal";

export default function ServicesTab() {
  const [previewImg, setPreviewImg] = useState(null);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeServiceId, setActiveServiceId] = useState("digital-marketing");

  useEffect(() => {
    async function loadData() {
      try {
        const data = await fetchPageData("services");
        setServices(data || []);
      } catch (err) {
        emitAlert({ type: "error", message: "Failed to load services data." });
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
      await savePageData("services", services);
      emitAlert({ type: "success", message: "Services configuration updated successfully!" });
    } catch (err) {
      emitAlert({ type: "error", message: "Failed to save services." });
    } finally {
      setSaving(false);
    }
  };

  const activeServiceIdx = services.findIndex((s) => s.id === activeServiceId);
  const activeService = services[activeServiceIdx] || null;

  // Change Handlers
  const updateServiceMeta = (field, val) => {
    if (activeServiceIdx === -1) return;
    setServices((prev) => {
      const list = [...prev];
      list[activeServiceIdx] = { ...list[activeServiceIdx], [field]: val };
      return list;
    });
  };

  const updateMetric = (metricIdx, field, val) => {
    if (activeServiceIdx === -1) return;
    setServices((prev) => {
      const list = [...prev];
      const metrics = [...list[activeServiceIdx].metrics];
      metrics[metricIdx] = { ...metrics[metricIdx], [field]: val };
      list[activeServiceIdx] = { ...list[activeServiceIdx], metrics };
      return list;
    });
  };

  const updateCapability = (capIdx, field, val) => {
    if (activeServiceIdx === -1) return;
    setServices((prev) => {
      const list = [...prev];
      const capabilities = [...list[activeServiceIdx].capabilities];
      capabilities[capIdx] = { ...capabilities[capIdx], [field]: val };
      list[activeServiceIdx] = { ...list[activeServiceIdx], capabilities };
      return list;
    });
  };

  const updateCapabilityBullet = (capIdx, bulletIdx, val) => {
    if (activeServiceIdx === -1) return;
    setServices((prev) => {
      const list = [...prev];
      const capabilities = [...list[activeServiceIdx].capabilities];
      const bullets = [...capabilities[capIdx].bullets];
      bullets[bulletIdx] = val;
      capabilities[capIdx] = { ...capabilities[capIdx], bullets };
      list[activeServiceIdx] = { ...list[activeServiceIdx], capabilities };
      return list;
    });
  };

  const updateFrameworkHeader = (field, val) => {
    if (activeServiceIdx === -1) return;
    setServices((prev) => {
      const list = [...prev];
      const framework = { ...list[activeServiceIdx].framework, [field]: val };
      list[activeServiceIdx] = { ...list[activeServiceIdx], framework };
      return list;
    });
  };

  const updateFrameworkStep = (stepIdx, field, val) => {
    if (activeServiceIdx === -1) return;
    setServices((prev) => {
      const list = [...prev];
      const steps = [...list[activeServiceIdx].framework.steps];
      steps[stepIdx] = { ...steps[stepIdx], [field]: val };
      list[activeServiceIdx] = {
        ...list[activeServiceIdx],
        framework: { ...list[activeServiceIdx].framework, steps },
      };
      return list;
    });
  };

  const updateSuccessMetric = (mIdx, field, val) => {
    if (activeServiceIdx === -1) return;
    setServices((prev) => {
      const list = [...prev];
      const successMetrics = [...list[activeServiceIdx].successMetrics];
      successMetrics[mIdx] = { ...successMetrics[mIdx], [field]: val };
      list[activeServiceIdx] = { ...list[activeServiceIdx], successMetrics };
      return list;
    });
  };

  const updateComparisonRow = (rowIdx, field, val) => {
    if (activeServiceIdx === -1) return;
    setServices((prev) => {
      const list = [...prev];
      const comparisonTable = [...list[activeServiceIdx].comparisonTable];
      comparisonTable[rowIdx] = { ...comparisonTable[rowIdx], [field]: val };
      list[activeServiceIdx] = { ...list[activeServiceIdx], comparisonTable };
      return list;
    });
  };

  // FAQ handlers
  const updateFaq = (faqIdx, field, val) => {
    if (activeServiceIdx === -1) return;
    setServices((prev) => {
      const list = [...prev];
      const faqs = [...list[activeServiceIdx].faqs];
      faqs[faqIdx] = { ...faqs[faqIdx], [field]: val };
      list[activeServiceIdx] = { ...list[activeServiceIdx], faqs };
      return list;
    });
  };

  const addFaq = () => {
    if (activeServiceIdx === -1) return;
    setServices((prev) => {
      const list = [...prev];
      const faqs = [...(list[activeServiceIdx].faqs || []), { q: "New Question", a: "New Answer" }];
      list[activeServiceIdx] = { ...list[activeServiceIdx], faqs };
      return list;
    });
  };

  const removeFaq = (faqIdx) => {
    if (activeServiceIdx === -1) return;
    setServices((prev) => {
      const list = [...prev];
      const faqs = list[activeServiceIdx].faqs.filter((_, i) => i !== faqIdx);
      list[activeServiceIdx] = { ...list[activeServiceIdx], faqs };
      return list;
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
      {/* Floating Save Header */}
      <div className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm rounded-lg">
        <div className="space-y-1">
          <h2 className="text-lg font-bold">Services Configuration</h2>
          {/* Sub Navigation Tabs */}
          <div className="flex gap-2 pt-2">
            {services.map((serv) => (
              <button
                key={serv.id}
                type="button"
                onClick={() => setActiveServiceId(serv.id)}
                className={`px-3 py-1.5 text-xs font-semibold rounded transition ${
                  activeServiceId === serv.id
                    ? "bg-[var(--primary)] text-white"
                    : "bg-[var(--surface-soft)] hover:bg-[var(--border)] text-[var(--foreground)]"
                }`}
              >
                {serv.name}
              </button>
            ))}
          </div>
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

      {activeService && (
        <div className="space-y-8 animate-slide-in">
          {/* Section 1: Meta Details Card */}
          <div className="card p-6 space-y-4">
            <h3 className="text-md font-bold border-b border-[var(--border)] pb-2 text-[var(--primary)]">1. General Service Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold">Service Name</label>
                <input
                  type="text"
                  className="input"
                  value={activeService.name || ""}
                  onChange={(e) => updateServiceMeta("name", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold">Hero Background Image</label>
                <div className="flex gap-3 items-center">
                  <input
                    type="text"
                    className="input flex-1"
                    value={activeService.heroImage || ""}
                    onChange={(e) => updateServiceMeta("heroImage", e.target.value)}
                  />
                  {activeService.heroImage && (
                    <button
                      type="button"
                      onClick={() => setPreviewImg(activeService.heroImage)}
                      title="Click to view full image"
                      className="h-10 w-16 bg-slate-100 rounded border border-[var(--border)] overflow-hidden shrink-0 block hover:opacity-80 transition cursor-pointer"
                    >
                      <img src={activeService.heroImage} alt="Hero Preview" className="w-full h-full object-cover" />
                    </button>
                  )}
                </div>
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-xs font-semibold">Tagline Phrase</label>
                <input
                  type="text"
                  className="input"
                  value={activeService.tagline || ""}
                  onChange={(e) => updateServiceMeta("tagline", e.target.value)}
                />
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-xs font-semibold">Long Description</label>
                <textarea
                  rows={3}
                  className="input"
                  value={activeService.description || ""}
                  onChange={(e) => updateServiceMeta("description", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold">Aggressive Result Summary Bullet</label>
                <input
                  type="text"
                  className="input"
                  value={activeService.results || ""}
                  onChange={(e) => updateServiceMeta("results", e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Section 2: Main Banner Metrics Card */}
          <div className="card p-6 space-y-4">
            <h3 className="text-md font-bold border-b border-[var(--border)] pb-2 text-[var(--primary)]">2. Primary Hero Metrics (Fixed 3 Counters)</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {activeService.metrics?.map((metric, idx) => (
                <div key={idx} className="p-3 bg-[var(--surface-soft)] rounded border border-[var(--border)] space-y-2">
                  <span className="text-xs font-bold text-[var(--muted)]">Counter #{idx + 1}</span>
                  <div className="grid grid-cols-1 gap-2">
                    <input
                      type="text"
                      placeholder="Label (e.g. ROAS)"
                      className="input py-1 px-2 text-xs"
                      value={metric.label || ""}
                      onChange={(e) => updateMetric(idx, "label", e.target.value)}
                    />
                    <input
                      type="text"
                      placeholder="Value (e.g. 4.2x)"
                      className="input py-1 px-2 text-xs"
                      value={metric.value || ""}
                      onChange={(e) => updateMetric(idx, "value", e.target.value)}
                    />
                    <input
                      type="text"
                      placeholder="Detail Detail (e.g. Blended)"
                      className="input py-1 px-2 text-xs"
                      value={metric.detail || ""}
                      onChange={(e) => updateMetric(idx, "detail", e.target.value)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Capabilities Card */}
          <div className="card p-6 space-y-4">
            <h3 className="text-md font-bold border-b border-[var(--border)] pb-2 text-[var(--primary)]">3. Channels & Capabilities (Fixed 4 Subservices)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeService.capabilities?.map((cap, capIdx) => (
                <div key={capIdx} className="p-4 bg-[var(--surface-soft)] rounded border border-[var(--border)] space-y-3">
                  <span className="text-xs font-bold text-[var(--primary)]">Capability #{capIdx + 1}</span>
                  <input
                    type="text"
                    placeholder="Capability Name"
                    className="input py-1 px-2 text-xs font-bold"
                    value={cap.name || ""}
                    onChange={(e) => updateCapability(capIdx, "name", e.target.value)}
                  />
                  <textarea
                    placeholder="Short Description"
                    rows={2}
                    className="input py-1 px-2 text-xs"
                    value={cap.desc || ""}
                    onChange={(e) => updateCapability(capIdx, "desc", e.target.value)}
                  />
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-[var(--muted)]">Checklist Bullet Details (2 Items)</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {cap.bullets?.map((bull, bIdx) => (
                        <input
                          key={bIdx}
                          type="text"
                          className="input py-1 px-2 text-xs"
                          value={bull || ""}
                          onChange={(e) => updateCapabilityBullet(capIdx, bIdx, e.target.value)}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 4: Process Framework Card */}
          <div className="card p-6 space-y-4">
            <h3 className="text-md font-bold border-b border-[var(--border)] pb-2 text-[var(--primary)]">4. Growth Process Framework</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold">Framework Section Title</label>
                <input
                  type="text"
                  className="input"
                  value={activeService.framework?.title || ""}
                  onChange={(e) => updateFrameworkHeader("title", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold">Illustration Image URL</label>
                <div className="flex gap-3 items-center">
                  <input
                    type="text"
                    className="input flex-1"
                    value={activeService.framework?.image || ""}
                    onChange={(e) => updateFrameworkHeader("image", e.target.value)}
                  />
                  {activeService.framework?.image && (
                    <button
                      type="button"
                      onClick={() => setPreviewImg(activeService.framework.image)}
                      title="Click to view full image"
                      className="h-10 w-16 bg-slate-100 rounded border border-[var(--border)] overflow-hidden shrink-0 block hover:opacity-80 transition cursor-pointer"
                    >
                      <img src={activeService.framework.image} alt="Framework Preview" className="w-full h-full object-cover" />
                    </button>
                  )}
                </div>
              </div>
            </div>
            <div className="space-y-3 pt-2">
              <label className="text-xs font-semibold">Framework Steps (Fixed 3 Steps)</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {activeService.framework?.steps?.map((step, idx) => (
                  <div key={idx} className="p-3 bg-[var(--surface-soft)] rounded border border-[var(--border)] space-y-2">
                    <span className="text-xs font-bold text-[var(--primary)]">Step {step.num || `0${idx+1}`}</span>
                    <input
                      type="text"
                      placeholder="Name"
                      className="input py-1 px-2 text-xs"
                      value={step.name || ""}
                      onChange={(e) => updateFrameworkStep(idx, "name", e.target.value)}
                    />
                    <textarea
                      placeholder="Description"
                      rows={3}
                      className="input py-1 px-2 text-xs"
                      value={step.desc || ""}
                      onChange={(e) => updateFrameworkStep(idx, "desc", e.target.value)}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Section 5: Stats Progress Bars Card */}
          <div className="card p-6 space-y-4">
            <h3 className="text-md font-bold border-b border-[var(--border)] pb-2 text-[var(--primary)]">5. Channel Metrics Progress Bars (Fixed 3 Items)</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {activeService.successMetrics?.map((met, idx) => (
                <div key={idx} className="p-3 bg-[var(--surface-soft)] rounded border border-[var(--border)] space-y-2">
                  <span className="text-xs font-bold text-[var(--muted)]">Progress Bar #{idx + 1}</span>
                  <div className="grid grid-cols-1 gap-2">
                    <input
                      type="text"
                      placeholder="Icon Identifier"
                      className="input py-1 px-2 text-xs"
                      value={met.icon || ""}
                      onChange={(e) => updateSuccessMetric(idx, "icon", e.target.value)}
                    />
                    <input
                      type="text"
                      placeholder="Tag Label"
                      className="input py-1 px-2 text-xs"
                      value={met.tag || ""}
                      onChange={(e) => updateSuccessMetric(idx, "tag", e.target.value)}
                    />
                    <input
                      type="text"
                      placeholder="Title"
                      className="input py-1 px-2 text-xs"
                      value={met.title || ""}
                      onChange={(e) => updateSuccessMetric(idx, "title", e.target.value)}
                    />
                    <input
                      type="text"
                      placeholder="Metric Value"
                      className="input py-1 px-2 text-xs"
                      value={met.value || ""}
                      onChange={(e) => updateSuccessMetric(idx, "value", e.target.value)}
                    />
                    <input
                      type="text"
                      placeholder="Bar Fill Width (e.g. 75%)"
                      className="input py-1 px-2 text-xs"
                      value={met.width || ""}
                      onChange={(e) => updateSuccessMetric(idx, "width", e.target.value)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 6: Tier Comparison Table Card */}
          <div className="card p-6 space-y-4">
            <h3 className="text-md font-bold border-b border-[var(--border)] pb-2 text-[var(--primary)]">6. Service Tier Comparison Matrix Rows</h3>
            <div className="space-y-3">
              {activeService.comparisonTable?.map((row, idx) => (
                <div key={idx} className="p-3 bg-[var(--surface-soft)] rounded border border-[var(--border)] grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-[var(--muted)]">Capability Name</label>
                    <input
                      type="text"
                      className="input py-1 px-2 text-xs"
                      value={row.capability || ""}
                      onChange={(e) => updateComparisonRow(idx, "capability", e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-[var(--muted)]">Standard Growth Tier Value</label>
                    <input
                      type="text"
                      className="input py-1 px-2 text-xs"
                      value={row.standard || ""}
                      onChange={(e) => updateComparisonRow(idx, "standard", e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-[var(--muted)]">Kinetic Enterprise Tier Value</label>
                    <input
                      type="text"
                      className="input py-1 px-2 text-xs font-bold text-blue-600"
                      value={row.kinetic || ""}
                      onChange={(e) => updateComparisonRow(idx, "kinetic", e.target.value)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 7: FAQs Card */}
          <div className="card p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-[var(--border)] pb-2">
              <h3 className="text-md font-bold text-[var(--primary)]">7. Frequently Asked Questions</h3>
              <button
                type="button"
                onClick={addFaq}
                className="btn btn-outline py-1 px-3 text-xs flex items-center gap-1"
              >
                <Plus className="h-3 w-3" /> Add FAQ
              </button>
            </div>
            <div className="space-y-4">
              {activeService.faqs?.map((faq, idx) => (
                <div key={idx} className="p-4 bg-[var(--surface-soft)] rounded border border-[var(--border)] space-y-2 relative">
                  <div className="absolute right-4 top-4">
                    <button
                      type="button"
                      onClick={() => removeFaq(idx)}
                      className="text-red-500 hover:text-red-700 transition"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-[var(--muted)]">Question Text</label>
                      <input
                        type="text"
                        className="input py-1 px-2 text-xs font-bold"
                        value={faq.q || ""}
                        onChange={(e) => updateFaq(idx, "q", e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-[var(--muted)]">Detailed Answer</label>
                      <textarea
                        rows={3}
                        className="input py-1 px-2 text-xs"
                        value={faq.a || ""}
                        onChange={(e) => updateFaq(idx, "a", e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      <ImagePreviewModal src={previewImg} onClose={() => setPreviewImg(null)} />
    </form>
  );
}
