"use client";

import {
  User,
  SquareUser,
  Link2,
  PlusCircle,
  X,
  Camera,
  Linkedin,
  Twitter,
  Mail,
  Instagram,
  Globe,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Trash2,
} from "lucide-react";
import React, { useState, useRef } from "react";
import {
  createMember,
  uploadMemberProfileImage,
} from "../our-team-services/OurTeamService";
import { emitAlert } from "@/lib/alertBus";

/* ── Social config ── */
const SOCIAL_TYPES = [
  {
    key: "LinkedIn",
    placeholder: "https://linkedin.com/in/username",
    icon: Linkedin,
    color: "#0A66C2",
  },
  {
    key: "Twitter",
    placeholder: "https://twitter.com/username",
    icon: Twitter,
    color: "#1DA1F2",
  },
  {
    key: "Email",
    placeholder: "mailto:name@example.com",
    icon: Mail,
    color: "#EA4335",
  },
  {
    key: "Instagram",
    placeholder: "https://instagram.com/username",
    icon: Instagram,
    color: "#E1306C",
  },
  {
    key: "Custom",
    placeholder: "https://yourwebsite.com",
    icon: Globe,
    color: "#6B7280",
  },
];

/* ── Validation ── */
function validate(fields, imageFile, imageUrl, socialLinks) {
  const errs = {};
  if (!fields.name.trim()) errs.name = "Full name is required.";
  if (!fields.role.trim()) errs.role = "Role is required.";
  if (!fields.description.trim()) errs.description = "Description is required.";
  if (!imageFile && !imageUrl) errs.image = "Profile photo is required.";
  socialLinks.forEach((s, i) => {
    if (!s.value.trim()) errs[`social_${i}`] = "Link cannot be empty.";
  });
  return errs;
}

/* ─ Input */
function FormInput({ icon: Icon, error, iconColor, ...props }) {
  return (
    <div className="relative">
      {Icon && (
        <Icon
          className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
          size={16}
          style={{ color: error ? "#ef4444" : iconColor || "#9ca3af" }}
        />
      )}
      <input
        {...props}
        className={`w-full ${Icon ? "pl-9" : "pl-3"} pr-3 py-2.5 text-sm rounded-lg border bg-white text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 transition-all duration-200 focus:border-none focus:ring-blue-500
          ${
            error
              ? "border-red-300 focus:ring-red-400/30 focus:border-red-400 bg-red-50/30"
              : "border-gray-200 focus:ring-blue-400/25 focus:border-blue-400 hover:border-gray-300"
          }`}
      />
      {error && (
        <p className="flex items-center gap-1 mt-1 text-[11px] text-red-500 font-medium">
          <AlertCircle size={10} className="shrink-0" /> {error}
        </p>
      )}
    </div>
  );
}

/* ─ Main component ─ */
const AddOurTeamModal = ({ onClose, onSubmit }) => {
  const fileInputRef = useRef(null);

  const [isOpen, setIsOpen] = useState(true);
  const handleClose = () => {
    setIsOpen(false);
    onClose?.();
  };

  const [fields, setFields] = useState({ name: "", role: "", description: "" });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageError, setImageError] = useState("");
  const [dragOver, setDragOver] = useState(false);

  const [socialLinks, setSocialLinks] = useState([]);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadTask, setUploadTask] = useState(null);

  if (!isOpen) return null;

  /* ── Image handling ── */
  const processImage = (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setImageError("Please select a JPG, PNG, or WebP file.");
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      setImageError("Image must be under 3MB.");
      return;
    }
    setImageError("");
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setErrors((p) => ({ ...p, image: undefined }));
  };

  const removeImage = () => {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  /* ─ Social links ─ */
  const addSocial = () => {
    if (socialLinks.length >= SOCIAL_TYPES.length) return;
    const nextType = SOCIAL_TYPES[socialLinks.length];
    setSocialLinks((p) => [...p, { type: nextType.key, value: "" }]);
  };

  const updateSocial = (index, value) => {
    setSocialLinks((p) => {
      const u = [...p];
      u[index] = { ...u[index], value };
      return u;
    });
    setErrors((p) => ({ ...p, [`social_${index}`]: undefined }));
  };

  const removeSocial = (index) => {
    setSocialLinks((p) => p.filter((_, i) => i !== index));
    setErrors((p) => {
      const next = { ...p };
      delete next[`social_${index}`];
      return next;
    });
  };

  /* ─ Cancel upload ─ */
  const handleCancelUpload = () => {
    if (uploadTask) {
      uploadTask.cancel();
      setUploadTask(null);
      setUploadProgress(0);
      setSubmitting(false);
      emitAlert({ type: "info", message: "Upload cancelled." });
    }
  };

  /* ── Submit  */
  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate(fields, imageFile, null, socialLinks);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setSubmitting(true);
    setUploadProgress(0);

    try {
      
      let profileImageUrl = "";

      const tempId = crypto.randomUUID();

      if (imageFile) {
        profileImageUrl = await uploadMemberProfileImage({
          file: imageFile,
          memberId: tempId,
          onProgress: setUploadProgress,
          onTaskReady: setUploadTask,
        });
      }

      // 2. Save member to Firestore
      await createMember({
        name: fields.name,
        role: fields.role,
        description: fields.description,
        profileImageUrl,
        socialLinks,
        status: "active",
      });

      // 3. Notify parent if needed
      await onSubmit?.({ ...fields, profileImageUrl, socialLinks });

      emitAlert({
        type: "success",
        message: "Team member created successfully!",
      });
      setSuccess(true);
      setTimeout(() => handleClose(), 1200);
    } catch (err) {
      console.error("Create member error:", err);
      emitAlert({
        type: "error",
        message: "Something went wrong. Please try again.",
      });
    } finally {
      setSubmitting(false);
      setUploadTask(null);
    }
  };

  /* ─ Field change helper ─ */
  const set = (key) => (e) => {
    setFields((p) => ({ ...p, [key]: e.target.value }));
    setErrors((p) => ({ ...p, [key]: undefined }));
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(6px)" }}
    >
      <div
        className="relative w-full max-w-[680px] max-h-[92vh] overflow-y-auto bg-white rounded-2xl shadow-2xl"
        style={{ boxShadow: "0 32px 80px rgba(0,0,0,0.18)" }}
      >
        {/* ── Header ── */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-7 py-4 flex items-center justify-between rounded-t-2xl">
          <div>
            <h2 className="text-[17px] font-bold text-gray-900 tracking-tight">
              Add Team Member
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Fill in the details below to create a new member profile.
            </p>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleClose();
            }}
            className="h-8 w-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-7 py-6 space-y-6">
          {/* ── Profile + Basic Info ── */}
          <div className="flex gap-5 items-start">
            {/* Avatar upload */}
            <div className="flex flex-col items-center gap-2 shrink-0">
              <div
                className={`relative h-24 w-24 rounded-2xl overflow-hidden cursor-pointer group border-2 transition-all duration-200
                  ${dragOver ? "border-blue-400 scale-105" : errors.image ? "border-red-300" : "border-dashed border-gray-300 hover:border-blue-300"}`}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOver(false);
                  processImage(e.dataTransfer.files[0]);
                }}
              >
                {imagePreview ? (
                  <>
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeImage();
                        }}
                        className="bg-red-500 text-white rounded-lg p-1.5"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="h-full w-full flex flex-col items-center justify-center gap-1 bg-gray-50 group-hover:bg-gray-100 transition-all">
                    <Camera
                      size={20}
                      className={dragOver ? "text-blue-400" : "text-gray-300"}
                    />
                    <span className="text-[10px] text-gray-400 font-medium">
                      Upload
                    </span>
                  </div>
                )}
              </div>
              {imageError && (
                <p className="text-[10px] text-red-500 text-center w-24 leading-tight">
                  {imageError}
                </p>
              )}
              {errors.image && !imageError && (
                <p className="text-[10px] text-red-500 text-center w-24 leading-tight">
                  {errors.image}
                </p>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => processImage(e.target.files[0])}
              />
            </div>

            {/* Name + Role + Description */}
            <div className="flex flex-col gap-3 flex-1">
              <FormInput
                icon={User}
                placeholder="Full Name"
                value={fields.name}
                onChange={set("name")}
                error={errors.name}
              />
              <FormInput
                icon={SquareUser}
                placeholder="Role / Position"
                value={fields.role}
                onChange={set("role")}
                error={errors.role}
              />
              <div>
                <textarea
                  rows={3}
                  placeholder="Short bio or description…"
                  value={fields.description}
                  onChange={set("description")}
                  className={`w-full px-3 py-2.5 text-sm rounded-lg border bg-white text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 transition-all duration-200 resize-none
                    ${
                      errors.description
                        ? "border-red-300 focus:ring-red-400/30 focus:border-red-400 bg-red-50/30"
                        : "border-gray-200 focus:ring-blue-400/25 focus:border-blue-400 hover:border-gray-300"
                    }`}
                />
                {errors.description && (
                  <p className="flex items-center gap-1 mt-1 text-[11px] text-red-500 font-medium">
                    <AlertCircle size={10} className="shrink-0" />{" "}
                    {errors.description}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/*  Divider ─ */}
          <div className="border-t border-dashed border-gray-200" />

          {/* ─ Social Links ─ */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                Social Links
              </p>
              <span className="text-[11px] text-gray-400">
                {socialLinks.length}/{SOCIAL_TYPES.length} added
              </span>
            </div>

            {socialLinks.length === 0 && (
              <div className="flex flex-col items-center justify-center py-5 rounded-xl border border-dashed border-gray-200 bg-gray-50/60">
                <Link2 size={18} className="text-gray-300 mb-1.5" />
                <p className="text-xs text-gray-400">
                  No social links added yet
                </p>
              </div>
            )}

            <div className="space-y-2.5">
              {socialLinks.map((item, index) => {
                const config = SOCIAL_TYPES.find((t) => t.key === item.type);
                const Icon = config?.icon || Globe;
                return (
                  <div key={index} className="flex items-start gap-2">
                    {/* Type badge */}
                    <div
                      className="h-9 w-9 shrink-0 rounded-lg flex items-center justify-center mt-0.5"
                      style={{ background: `${config?.color}15` }}
                    >
                      <Icon size={15} style={{ color: config?.color }} />
                    </div>

                    <div className="flex-1">
                      <input
                        value={item.value}
                        onChange={(e) => updateSocial(index, e.target.value)}
                        placeholder={config?.placeholder}
                        className={`w-full px-3 py-2 text-sm rounded-lg border bg-white text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 transition-all duration-200
                          ${
                            errors[`social_${index}`]
                              ? "border-red-300 focus:ring-red-400/30 focus:border-red-400"
                              : "border-gray-200 focus:ring-blue-400/25 focus:border-blue-400 hover:border-gray-300"
                          }`}
                      />
                      {errors[`social_${index}`] && (
                        <p className="flex items-center gap-1 mt-0.5 text-[11px] text-red-500 font-medium">
                          <AlertCircle size={10} className="shrink-0" />{" "}
                          {errors[`social_${index}`]}
                        </p>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => removeSocial(index)}
                      className="h-9 w-9 shrink-0 mt-0.5 flex items-center justify-center rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all cursor-pointer"
                    >
                      <X size={14} />
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Add social button */}
            {socialLinks.length < SOCIAL_TYPES.length && (
              <button
                type="button"
                onClick={addSocial}
                className="flex items-center gap-1.5 text-[13px] font-medium text-blue-600 hover:text-blue-700 transition-colors cursor-pointer mt-1"
              >
                <PlusCircle size={14} />
                Add {SOCIAL_TYPES[socialLinks.length]?.key} Link
              </button>
            )}
            {socialLinks.length >= SOCIAL_TYPES.length && (
              <p className="text-[11px] text-gray-400 italic">
                All social link types added.
              </p>
            )}
          </div>

          {/* ─ Divider ─ */}
          <div className="border-t border-dashed border-gray-200" />

          {/* ─ Upload progress ─ */}
          {submitting &&
            imageFile &&
            uploadProgress > 0 &&
            uploadProgress < 100 && (
              <div className="space-y-1.5 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Uploading profile image…</span>
                  <span className="font-semibold tabular-nums">
                    {uploadProgress}%
                  </span>
                </div>
                <div className="h-1.5 w-full bg-blue-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full transition-all duration-200"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <button
                  type="button"
                  onClick={handleCancelUpload}
                  className="text-xs text-red-500 hover:text-red-700 font-medium underline cursor-pointer"
                >
                  Cancel upload
                </button>
              </div>
            )}

          {/* ─ Actions ─ */}
          <div className="flex items-center justify-between gap-3">
            {/* Success state */}
            {success && (
              <div className="flex items-center gap-1.5 text-sm text-green-600 font-medium">
                <CheckCircle2 size={15} />
                Member created!
              </div>
            )}
            {!success && <div />}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleClose();
                }}
                disabled={submitting}
                className="px-5 py-2.5 rounded-lg text-sm font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || success}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold bg-black text-white hover:bg-gray-800 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                {submitting ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
                    {uploadProgress > 0 && uploadProgress < 100
                      ? `Uploading… ${uploadProgress}%`
                      : "Saving…"}
                  </>
                ) : success ? (
                  <>
                    <CheckCircle2 size={15} /> Created!
                  </>
                ) : (
                  <>
                    <PlusCircle size={15} /> Create Member
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddOurTeamModal;
