"use client";

import { useState, useEffect } from "react";
import { X, Save, Loader2, Upload } from "lucide-react";
import { emitAlert } from "@/lib/alertBus";
import { collection, addDoc, updateDoc, doc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebaseFirestore";
import ImageUpload from "../../../components/ImageUpload";

const COLLECTION = "projects/marketys/team";
const INITIAL = { name: "", role: "", bio: "", avatar: "", active: true };

export default function AddTeamMemberModal({ existingMember, onClose, onSaved }) {
  const isEdit = Boolean(existingMember);
  const [form, setForm] = useState(INITIAL);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (existingMember) {
      setForm({
        name: existingMember.name || "",
        role: existingMember.role || "",
        bio: existingMember.bio || "",
        avatar: existingMember.avatar || existingMember.image || "",
        active: existingMember.active !== false,
      });
    }
  }, [existingMember]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = "Name is required";
    if (!form.role.trim()) errs.role = "Role is required";
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSubmitting(true);
    try {
      const data = {
        name: form.name.trim(),
        role: form.role.trim(),
        bio: form.bio.trim(),
        avatar: form.avatar.trim(),
        image: form.avatar.trim(),
        active: form.active,
        updatedAt: serverTimestamp(),
      };

      if (isEdit) {
        await updateDoc(doc(db, COLLECTION, existingMember.id), data);
        emitAlert({ type: "success", message: "Member updated" });
      } else {
        data.createdAt = serverTimestamp();
        const ref = await addDoc(collection(db, COLLECTION), data);
        data.id = ref.id;
        emitAlert({ type: "success", message: "Member created" });
      }
      onSaved?.(data);
      onClose?.();
    } catch {
      emitAlert({ type: "error", message: isEdit ? "Failed to update member" : "Failed to create member" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-xl mt-12 mb-12 rounded-xl border border-gray-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h2 className="text-lg font-bold text-gray-900">{isEdit ? "Edit Team Member" : "Add Team Member"}</h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition"><X className="h-5 w-5" /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Name *</label>
              <input value={form.name} onChange={(e) => handleChange("name", e.target.value)}
                className={`w-full rounded-lg border ${errors.name ? "border-red-400" : "border-gray-300"} px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20`} />
              {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Role *</label>
              <input value={form.role} onChange={(e) => handleChange("role", e.target.value)}
                className={`w-full rounded-lg border ${errors.role ? "border-red-400" : "border-gray-300"} px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20`} />
              {errors.role && <p className="mt-1 text-xs text-red-500">{errors.role}</p>}
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Bio</label>
              <textarea value={form.bio} onChange={(e) => handleChange("bio", e.target.value)} rows={3}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" />
            </div>

            <div className="col-span-2">
              <ImageUpload value={form.avatar} onChange={(v) => handleChange("avatar", v)} label="Avatar" folder="marketys/team" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Active</label>
              <label className="flex items-center gap-2 mt-2 cursor-pointer">
                <input type="checkbox" checked={form.active} onChange={(e) => handleChange("active", e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                <span className="text-sm text-gray-600">Show on website</span>
              </label>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-5">
            <button type="button" onClick={onClose}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition">Cancel</button>
            <button type="submit" disabled={submitting}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 transition">
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {isEdit ? "Update Member" : "Create Member"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
