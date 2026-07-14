import React, { useState, useEffect } from "react";
import {
  fetchPageData,
  savePageData,
  fetchTeam,
  saveTeamMember,
  deleteTeamMember,
  fetchTestimonials,
  saveTestimonial,
  deleteTestimonial,
} from "@/projects/alphobia/services/alphobiaService";
import { emitAlert } from "@/lib/alertBus";
import { Loader2, Plus, Trash2 } from "lucide-react";
import ImagePreviewModal from "@/projects/alphobia/components/ImagePreviewModal";

export default function AboutTab() {
  const [previewImg, setPreviewImg] = useState(null);
  const [data, setData] = useState(null);
  const [team, setTeam] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const aboutData = await fetchPageData("about");
        const teamData = await fetchTeam();
        const testData = await fetchTestimonials();

        setData(aboutData);
        setTeam(teamData);
        setTestimonials(testData);
      } catch (err) {
        emitAlert({ type: "error", message: "Failed to load about page details." });
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
      await savePageData("about", data);
      
      // Save all team members
      await Promise.all(team.map((member) => saveTeamMember(member.id, member)));
      
      // Save all testimonials
      await Promise.all(testimonials.map((test) => saveTestimonial(test.id, test)));

      emitAlert({ type: "success", message: "About page details updated successfully!" });
    } catch (err) {
      emitAlert({ type: "error", message: "Failed to save details." });
    } finally {
      setSaving(false);
    }
  };

  // About Handlers
  const updateHeader = (field, val) => {
    setData((prev) => ({
      ...prev,
      header: { ...prev.header, [field]: val },
    }));
  };

  const updateTimelineHeader = (field, val) => {
    setData((prev) => ({
      ...prev,
      timelineHeader: { ...prev.timelineHeader, [field]: val },
    }));
  };

  const updateValue = (idx, field, val) => {
    setData((prev) => {
      const values = [...prev.values];
      values[idx] = { ...values[idx], [field]: val };
      return { ...prev, values };
    });
  };

  const updateTimelineItem = (idx, field, val) => {
    setData((prev) => {
      const timeline = [...prev.timeline];
      timeline[idx] = { ...timeline[idx], [field]: val };
      return { ...prev, timeline };
    });
  };

  const addTimelineItem = () => {
    setData((prev) => ({
      ...prev,
      timeline: [
        ...prev.timeline,
        { year: "2027", title: "New Milestone", text: "Milestone detail text here." },
      ],
    }));
  };

  const removeTimelineItem = (idx) => {
    setData((prev) => {
      const timeline = prev.timeline.filter((_, i) => i !== idx);
      return { ...prev, timeline };
    });
  };

  // Team Handlers
  const updateMember = (idx, field, val) => {
    setTeam((prev) => {
      const list = [...prev];
      list[idx] = { ...list[idx], [field]: val };
      return list;
    });
  };

  const addMember = () => {
    setTeam((prev) => [
      ...prev,
      {
        id: `team-${Date.now()}`,
        name: "New Leader",
        role: "VP Growth",
        color: "#64748b",
        bio: "Bio detail goes here.",
        img: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&h=750&q=80",
      },
    ]);
  };

  const removeMember = async (id, idx) => {
    try {
      await deleteTeamMember(id);
      setTeam((prev) => prev.filter((_, i) => i !== idx));
    } catch {
      emitAlert({ type: "error", message: "Failed to delete team member from database." });
    }
  };

  // Testimonials Handlers
  const updateTestimonial = (idx, field, val) => {
    setTestimonials((prev) => {
      const list = [...prev];
      list[idx] = { ...list[idx], [field]: val };
      return list;
    });
  };

  const addTestimonial = () => {
    setTestimonials((prev) => [
      ...prev,
      { id: `test-${Date.now()}`, quote: "New testimonial quote.", author: "Client Exec" },
    ]);
  };

  const removeTestimonial = async (id, idx) => {
    try {
      await deleteTestimonial(id);
      setTestimonials((prev) => prev.filter((_, i) => i !== idx));
    } catch {
      emitAlert({ type: "error", message: "Failed to delete testimonial." });
    }
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
        <div>
          <h2 className="text-lg font-bold">About Page Configuration</h2>
          <p className="text-xs text-[var(--muted)]">Configure content for the about page, team, and testimonials</p>
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

      {/* Page Header Card */}
      <div className="card p-6 space-y-4">
        <h3 className="text-md font-bold border-b border-[var(--border)] pb-2 text-[var(--primary)]">1. About Header</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-semibold">Badge Tag</label>
            <input
              type="text"
              className="input"
              value={data.header?.badge || ""}
              onChange={(e) => updateHeader("badge", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold">Header Title</label>
            <input
              type="text"
              className="input"
              value={data.header?.title || ""}
              onChange={(e) => updateHeader("title", e.target.value)}
            />
          </div>
          <div className="md:col-span-2 space-y-2">
            <label className="text-xs font-semibold">Description Summary</label>
            <textarea
              rows={3}
              className="input"
              value={data.header?.subtitle || ""}
              onChange={(e) => updateHeader("subtitle", e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Values Card */}
      <div className="card p-6 space-y-4">
        <h3 className="text-md font-bold border-b border-[var(--border)] pb-2 text-[var(--primary)]">2. Company Values (Fixed 3 Core Values)</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {data.values?.map((val, idx) => (
            <div key={idx} className="p-4 bg-[var(--surface-soft)] rounded border border-[var(--border)] space-y-2">
              <span className="text-xs font-bold text-[var(--primary)]">Value 0{idx + 1}</span>
              <input
                type="text"
                placeholder="Title"
                className="input py-1 px-2 text-xs"
                value={val.title || ""}
                onChange={(e) => updateValue(idx, "title", e.target.value)}
              />
              <textarea
                placeholder="Text description"
                rows={4}
                className="input py-1 px-2 text-xs"
                value={val.text || ""}
                onChange={(e) => updateValue(idx, "text", e.target.value)}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Story Timeline Card */}
      <div className="card p-6 space-y-4">
        <div className="flex justify-between items-center border-b border-[var(--border)] pb-2">
          <h3 className="text-md font-bold text-[var(--primary)]">3. Story Timeline Milestones</h3>
          <button
            type="button"
            onClick={addTimelineItem}
            className="btn btn-outline py-1 px-3 text-xs flex items-center gap-1"
          >
            <Plus className="h-3 w-3" /> Add Event
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-semibold">Timeline Header Title</label>
            <input
              type="text"
              className="input"
              value={data.timelineHeader?.title || ""}
              onChange={(e) => updateTimelineHeader("title", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold">Timeline Header Subtitle</label>
            <input
              type="text"
              className="input"
              value={data.timelineHeader?.subtitle || ""}
              onChange={(e) => updateTimelineHeader("subtitle", e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-3 pt-4">
          {data.timeline?.map((item, idx) => (
            <div key={idx} className="p-4 bg-[var(--surface-soft)] rounded border border-[var(--border)] space-y-3 relative">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-[var(--muted)]">Milestone #{idx + 1}</span>
                <button
                  type="button"
                  onClick={() => removeTimelineItem(idx)}
                  className="text-red-500 hover:text-red-700 transition"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-[var(--muted)]">Year</label>
                  <input
                    type="text"
                    placeholder="e.g. 2026"
                    className="input py-1 px-2 text-xs"
                    value={item.year || ""}
                    onChange={(e) => updateTimelineItem(idx, "year", e.target.value)}
                  />
                </div>
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-[10px] font-semibold text-[var(--muted)]">Title</label>
                  <input
                    type="text"
                    placeholder="Milestone Title"
                    className="input py-1 px-2 text-xs"
                    value={item.title || ""}
                    onChange={(e) => updateTimelineItem(idx, "title", e.target.value)}
                  />
                </div>
                <div className="sm:col-span-3 space-y-1">
                  <label className="text-[10px] font-semibold text-[var(--muted)]">Milestone Details</label>
                  <textarea
                    placeholder="Milestone Details"
                    rows={2}
                    className="input py-1 px-2 text-xs"
                    value={item.text || ""}
                    onChange={(e) => updateTimelineItem(idx, "text", e.target.value)}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Leadership Team Card */}
      <div className="card p-6 space-y-4">
        <div className="flex justify-between items-center border-b border-[var(--border)] pb-2">
          <h3 className="text-md font-bold text-[var(--primary)]">4. Leadership Team</h3>
          <button
            type="button"
            onClick={addMember}
            className="btn btn-outline py-1 px-3 text-xs flex items-center gap-1"
          >
            <Plus className="h-3 w-3" /> Add Leader
          </button>
        </div>
        <div className="grid grid-cols-1 gap-4">
          {team.map((member, idx) => (
            <div key={member.id || idx} className="p-4 bg-[var(--surface-soft)] rounded border border-[var(--border)] flex flex-col md:flex-row gap-4 relative">
              <div className="absolute right-4 top-4">
                <button
                  type="button"
                  onClick={() => removeMember(member.id, idx)}
                  className="text-red-500 hover:text-red-700 transition"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <div className="flex-shrink-0 w-24 h-32 rounded border border-[var(--border)] overflow-hidden bg-slate-200">
                <button
                  type="button"
                  onClick={() => setPreviewImg(member.img || "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&h=750&q=80")}
                  title="Click to view full image"
                  className="w-full h-full block hover:opacity-85 transition cursor-pointer"
                >
                  <img
                    src={member.img || "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=120&h=160&q=80"}
                    alt={member.name}
                    className="w-full h-full object-cover"
                  />
                </button>
              </div>
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-[var(--muted)]">Name</label>
                  <input
                    type="text"
                    className="input py-1 px-2 text-xs"
                    value={member.name || ""}
                    onChange={(e) => updateMember(idx, "name", e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-[var(--muted)]">Role</label>
                  <input
                    type="text"
                    className="input py-1 px-2 text-xs"
                    value={member.role || ""}
                    onChange={(e) => updateMember(idx, "role", e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-[var(--muted)]">Profile Image URL</label>
                  <input
                    type="text"
                    className="input py-1 px-2 text-xs"
                    value={member.img || ""}
                    onChange={(e) => updateMember(idx, "img", e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-[var(--muted)]">Theme Tag Color (Hex)</label>
                  <input
                    type="text"
                    className="input py-1 px-2 text-xs"
                    value={member.color || ""}
                    onChange={(e) => updateMember(idx, "color", e.target.value)}
                  />
                </div>
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-[10px] font-semibold text-[var(--muted)]">Leader Biography Bio</label>
                  <textarea
                    rows={2}
                    className="input py-1 px-2 text-xs"
                    value={member.bio || ""}
                    onChange={(e) => updateMember(idx, "bio", e.target.value)}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Testimonials Card */}
      <div className="card p-6 space-y-4">
        <div className="flex justify-between items-center border-b border-[var(--border)] pb-2">
          <h3 className="text-md font-bold text-[var(--primary)]">5. Client Testimonials</h3>
          <button
            type="button"
            onClick={addTestimonial}
            className="btn btn-outline py-1 px-3 text-xs flex items-center gap-1"
          >
            <Plus className="h-3 w-3" /> Add Testimonial
          </button>
        </div>
        <div className="space-y-3">
          {testimonials.map((test, idx) => (
            <div key={test.id || idx} className="p-4 bg-[var(--surface-soft)] rounded border border-[var(--border)] space-y-2 relative">
              <div className="absolute right-4 top-4">
                <button
                  type="button"
                  onClick={() => removeTestimonial(test.id, idx)}
                  className="text-red-500 hover:text-red-700 transition"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-[10px] font-semibold text-[var(--muted)]">Quote Statement</label>
                  <textarea
                    rows={2}
                    className="input py-1 px-2 text-xs"
                    value={test.quote || ""}
                    onChange={(e) => updateTestimonial(idx, "quote", e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-[var(--muted)]">Author / Client Reference</label>
                  <input
                    type="text"
                    className="input py-1 px-2 text-xs"
                    value={test.author || ""}
                    onChange={(e) => updateTestimonial(idx, "author", e.target.value)}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <ImagePreviewModal src={previewImg} onClose={() => setPreviewImg(null)} />
    </form>
  );
}
