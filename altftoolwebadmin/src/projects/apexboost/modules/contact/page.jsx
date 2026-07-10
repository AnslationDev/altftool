"use client";

import React, { useState, useEffect } from "react";
import { Plus, Trash2, Save, Mail, Phone, MapPin, Clock } from "lucide-react";
import { emitAlert } from "@/lib/alertBus";

export default function ContactPage() {
  const [form, setForm] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/apexboost/data?section=contactConfig')
      .then(res => res.json())
      .then(json => {
        if (json.success && json.data) {
          setForm(json.data);
        }
        setIsLoading(false);
      })
      .catch(err => {
        console.error(err);
        setIsLoading(false);
      });
  }, []);

  const handleSave = async () => {
    try {
      const res = await fetch('/api/apexboost/data', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ section: 'contactConfig', data: form }),
      });
      if (res.ok) {
        emitAlert({ type: "success", title: "Saved", message: "Contact section updated successfully!" });
      } else {
        emitAlert({ type: "error", title: "Error", message: "Failed to save updates." });
      }
    } catch (err) {
      emitAlert({ type: "error", title: "Error", message: "Error saving updates." });
    }
  };

  const updateHeading = (field, value) => setForm(f => ({ ...f, heading: { ...f.heading, [field]: value } }));
  const updateCard = (field, value) => setForm(f => ({ ...f, card: { ...f.card, [field]: value } }));
  const updateFormConfig = (field, value) => setForm(f => ({ ...f, form: { ...f.form, [field]: value } }));

  const updateInfo = (index, field, value) => {
    const newInfo = [...form.info];
    newInfo[index][field] = value;
    setForm(f => ({ ...f, info: newInfo }));
  };

  const addRequirement = () => {
    setForm(f => ({ ...f, requirements: [...f.requirements, "New Requirement"] }));
  };

  const updateRequirement = (index, value) => {
    const newReqs = [...form.requirements];
    newReqs[index] = value;
    setForm(f => ({ ...f, requirements: newReqs }));
  };

  const removeRequirement = (index) => {
    const newReqs = form.requirements.filter((_, i) => i !== index);
    setForm(f => ({ ...f, requirements: newReqs }));
  };

  if (isLoading) return <div className="p-8 text-center text-gray-500">Loading Contact Config...</div>;
  if (!form) return <div className="p-8 text-center text-red-500">Failed to load data.</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Manage Contact Section</h1>
          <p className="text-gray-600 text-sm mt-1">Update the contact form, details, and text</p>
        </div>
        <button onClick={handleSave} className="flex items-center gap-2 bg-(--primary) text-white px-4 py-2 rounded-md hover:bg-opacity-90">
          <Save size={16} /> Save Changes
        </button>
      </div>

      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Header Content</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Eyebrow (Small text)</label>
            <input type="text" value={form.heading.eyebrow} onChange={e => updateHeading('eyebrow', e.target.value)} className="w-full px-3 py-2 border rounded" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Main Title</label>
            <input type="text" value={form.heading.title} onChange={e => updateHeading('title', e.target.value)} className="w-full px-3 py-2 border rounded" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Highlighted Title Word(s)</label>
            <input type="text" value={form.heading.highlight} onChange={e => updateHeading('highlight', e.target.value)} className="w-full px-3 py-2 border rounded" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Subtitle</label>
            <textarea value={form.heading.subtitle} onChange={e => updateHeading('subtitle', e.target.value)} rows={2} className="w-full px-3 py-2 border rounded" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Side: Contact Card & Info */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Contact Info Card (Left Side)</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Card Title</label>
                <input type="text" value={form.card.title} onChange={e => updateCard('title', e.target.value)} className="w-full px-3 py-2 border rounded" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Card Subtitle</label>
                <textarea value={form.card.subtitle} onChange={e => updateCard('subtitle', e.target.value)} rows={2} className="w-full px-3 py-2 border rounded" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Locations (Bottom Map)</label>
                <input type="text" value={form.card.locations} onChange={e => updateCard('locations', e.target.value)} className="w-full px-3 py-2 border rounded" placeholder="e.g. New York · London" />
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <h3 className="font-medium text-gray-700">Contact Details List</h3>
              {form.info.map((item, index) => (
                <div key={index} className="grid grid-cols-2 gap-2 p-3 border rounded bg-gray-50">
                  <div className="col-span-2 text-xs text-gray-500 uppercase tracking-wider font-semibold">{item.id}</div>
                  <div>
                    <label className="block text-xs font-medium mb-1">Label</label>
                    <input type="text" value={item.label} onChange={e => updateInfo(index, 'label', e.target.value)} className="w-full px-2 py-1 text-sm border rounded" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">Value</label>
                    <input type="text" value={item.value} onChange={e => updateInfo(index, 'value', e.target.value)} className="w-full px-2 py-1 text-sm border rounded" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Form Configuration */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Lead Form Options</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Submit Button Text</label>
                <input type="text" value={form.form.buttonText} onChange={e => updateFormConfig('buttonText', e.target.value)} className="w-full px-3 py-2 border rounded" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Success Message (Popup)</label>
                <input type="text" value={form.form.successMsg} onChange={e => updateFormConfig('successMsg', e.target.value)} className="w-full px-3 py-2 border rounded" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Footer / Privacy Text</label>
                <input type="text" value={form.form.footerText} onChange={e => updateFormConfig('footerText', e.target.value)} className="w-full px-3 py-2 border rounded" />
              </div>
            </div>

            <div className="mt-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-gray-700">Marketing Requirements Dropdown</h3>
                <button onClick={addRequirement} className="text-sm text-(--primary) flex items-center gap-1 hover:underline">
                  <Plus size={14} /> Add Option
                </button>
              </div>
              <div className="space-y-2 max-h-[250px] overflow-y-auto pr-2">
                {form.requirements.map((req, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input type="text" value={req} onChange={e => updateRequirement(index, e.target.value)} className="flex-1 px-3 py-2 text-sm border rounded focus:outline-none focus:border-(--primary)" />
                    <button onClick={() => removeRequirement(index)} className="p-2 text-red-500 hover:bg-red-50 rounded">
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
