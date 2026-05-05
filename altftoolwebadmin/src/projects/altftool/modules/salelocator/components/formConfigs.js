/**
 * formConfigs.js
 *
 * Config-driven field definitions for each module.
 * Each config shapes what FormModal renders — no extra logic needed in the modal itself.
 *
 * Field shape:
 * {
 *   key: string            — maps to form state key
 *   type: FieldType        — drives which renderer is used
 *   label: string
 *   icon?: string          — lucide-react icon name (resolved in FieldIcon helper)
 *   placeholder?: string
 *   hint?: string
 *   required?: boolean
 *   readOnlyOnEdit?: boolean  — locks field when isEdit=true (e.g. slug)
 *   rows?: number          — textarea only
 *   step?: number          — number input only
 *   min?: number
 *   max?: number
 *   validate?: (value, allValues) => string | undefined
 * }
 *
 * FieldType values:
 *   "text" | "textarea" | "number" | "url" | "rating" | "array" | "image"
 *
 * Sections group fields visually:
 * {
 *   title: string
 *   fields: Field[]
 *   columns?: 1 | 2   — defaults to 1; "2" renders a 2-col grid
 * }
 */

// ─── Shared validators ────────────────────────────────────────────────────────

const required = (label) => (v) =>
  !String(v ?? "").trim() ? `${label} is required` : undefined;

const validUrl = (label) => (v) => {
  if (!v?.trim()) return undefined; // optional — let `required` handle empty
  try { new URL(v); return undefined; }
  catch { return `${label} must be a valid URL (include https://)`; }
};

const requiredUrl = (label) => (v) => {
  if (!v?.trim()) return `${label} is required`;
  try { new URL(v); return undefined; }
  catch { return `${label} must be a valid URL (include https://)`; }
};

const ratingValidator = (v) => {
  if (v === "" || v == null) return undefined;
  const n = parseFloat(v);
  if (isNaN(n) || n < 0 || n > 5) return "Rating must be between 0 and 5";
  return undefined;
};

const arrayValidator = (v) =>
  Array.isArray(v) && v.some((item) => !String(item ?? "").trim())
    ? "All feature entries must have text"
    : undefined;

// ─── Default (initial) values per field type ─────────────────────────────────

export const defaultValueForType = {
  text: "",
  textarea: "",
  number: "",
  url: "",
  rating: "",
  array: [""],
  image: null,
};

// ─── Module configs ───────────────────────────────────────────────────────────

export const formConfigs = {

  // ── Extension ──────────────────────────────────────────────────────────────
  extension: {
    title: { create: "New Extension", edit: "Edit Extension" },
    subtitle: {
      create: "Configure extension details, features, and preview image.",
      edit: (entity) => `Editing ${entity?.name}`,
    },
    sections: [
      {
        title: "Basic Info",
        columns: 2,
        fields: [
          {
            key: "name",
            type: "text",
            label: "Extension Name",
            icon: "Type",
            placeholder: "e.g. BMI Calculator",
            hint: "The public-facing name of the extension.",
            required: true,
            validate: required("Extension name"),
          },
          {
            key: "slug",
            type: "text",
            label: "Slug",
            icon: "Hash",
            hint: { create: "Auto-generated from name.", edit: "Slug cannot be changed after creation." },
            readOnlyOnEdit: true,
            required: true,
            validate: required("Slug"),
            // special: auto-derived from `name` on create — handled in FormModal
            deriveFrom: { field: "name", transform: (v) =>
              v.toLowerCase().replace(/[^\w\s]/g, "").replace(/\s+/g, "-").trim()
            },
          },
          {
            key: "category",
            type: "text",
            label: "Category",
            icon: "Tag",
            placeholder: "e.g. Utilities & Calculators",
            required: true,
            validate: required("Category"),
          },
          {
            key: "icon",
            type: "text",
            label: "Icon (lucide-react)",
            icon: "Zap",
            placeholder: "Calculator",
            hint: "Component name, e.g. Calculator",
            required: true,
            validate: required("Icon name"),
          },
        ],
      },
      {
        title: "Basic Info",       // same section, single-col for description
        columns: 1,
        fields: [
          {
            key: "description",
            type: "textarea",
            label: "Description",
            icon: "AlignLeft",
            placeholder: "Describe what this extension does…",
            rows: 3,
            required: true,
            validate: required("Description"),
          },
        ],
      },
      {
        title: "Store & Rating",
        columns: 1,
        fields: [
          {
            key: "chromeUrl",
            type: "url",
            label: "Chrome Web Store URL",
            icon: "Link2",
            placeholder: "https://chromewebstore.google.com/detail/…",
            hint: "Leave blank if not listed on the Chrome Store.",
            validate: validUrl("Chrome Store URL"),
          },
          {
            key: "rating",
            type: "rating",
            label: "Rating",
            icon: "Star",
            hint: "Click a star or type a value between 0.0 and 5.0.",
            validate: ratingValidator,
          },
        ],
      },
      {
        title: "Features",
        columns: 1,
        fields: [
          {
            key: "features",
            type: "array",
            label: "Features",
            placeholder: "Feature",
            addLabel: "Add Feature",
            validate: arrayValidator,
          },
        ],
      },
      {
        title: "Preview Image",
        columns: 1,
        fields: [
          {
            key: "image",
            type: "image",
            label: "Preview Image",
          },
        ],
      },
    ],
    // Footer hint
    footerHint: {
      create: <><span className="font-semibold text-gray-600">hasChromeStore</span> is set automatically from the Chrome URL.</>,
      edit: "Changes will update the extension immediately.",
    },
  },

  // ── Academy ────────────────────────────────────────────────────────────────
  academy: {
    title: { create: "New Course", edit: "Edit Course" },
    subtitle: {
      create: "Add a new academy course with details and curriculum.",
      edit: (entity) => `Editing ${entity?.name}`,
    },
    sections: [
      {
        title: "Course Info",
        columns: 2,
        fields: [
          {
            key: "name",
            type: "text",
            label: "Course Name",
            icon: "Type",
            placeholder: "e.g. JavaScript Mastery",
            required: true,
            validate: required("Course name"),
          },
          {
            key: "slug",
            type: "text",
            label: "Slug",
            icon: "Hash",
            hint: { create: "Auto-generated from name.", edit: "Slug cannot be changed after creation." },
            readOnlyOnEdit: true,
            required: true,
            validate: required("Slug"),
            deriveFrom: { field: "name", transform: (v) =>
              v.toLowerCase().replace(/[^\w\s]/g, "").replace(/\s+/g, "-").trim()
            },
          },
          {
            key: "category",
            type: "text",
            label: "Category",
            icon: "Tag",
            placeholder: "e.g. Programming",
            required: true,
            validate: required("Category"),
          },
          {
            key: "subCategory",
            type: "text",
            label: "Sub-Category",
            icon: "Tag",
            placeholder: "e.g. Frontend",
          },
          {
            key: "price",
            type: "number",
            label: "Price ($)",
            icon: "DollarSign",
            placeholder: "0.00",
            min: 0,
            step: 0.01,
            hint: "Set to 0 for free courses.",
            validate: (v) => {
              if (v === "" || v == null) return undefined;
              if (isNaN(parseFloat(v)) || parseFloat(v) < 0) return "Price must be 0 or greater";
            },
          },
          {
            key: "instructor",
            type: "text",
            label: "Instructor",
            icon: "User",
            placeholder: "e.g. Jane Doe",
          },
        ],
      },
      {
        title: "Course Info",
        columns: 1,
        fields: [
          {
            key: "description",
            type: "textarea",
            label: "Description",
            icon: "AlignLeft",
            placeholder: "What will students learn in this course?",
            rows: 3,
            required: true,
            validate: required("Description"),
          },
        ],
      },
      {
        title: "Rating",
        columns: 1,
        fields: [
          {
            key: "rating",
            type: "rating",
            label: "Rating",
            icon: "Star",
            hint: "Click a star or type a value between 0.0 and 5.0.",
            validate: ratingValidator,
          },
        ],
      },
      {
        title: "Curriculum",
        columns: 1,
        fields: [
          {
            key: "features",
            type: "array",
            label: "What You'll Learn",
            placeholder: "Learning objective",
            addLabel: "Add Objective",
            validate: arrayValidator,
          },
        ],
      },
      {
        title: "Course Image",
        columns: 1,
        fields: [
          {
            key: "image",
            type: "image",
            label: "Course Thumbnail",
          },
        ],
      },
    ],
    footerHint: {
      create: "Course will be saved as a draft until published.",
      edit: "Changes are applied immediately.",
    },
  },

  // ── Blog Post ──────────────────────────────────────────────────────────────
  blog: {
    title: { create: "New Blog Post", edit: "Edit Blog Post" },
    subtitle: {
      create: "Write and configure a new post.",
      edit: (entity) => `Editing "${entity?.name}"`,
    },
    sections: [
      {
        title: "Post Info",
        columns: 2,
        fields: [
          {
            key: "name",
            type: "text",
            label: "Post Title",
            icon: "Type",
            placeholder: "e.g. Getting Started with React",
            required: true,
            validate: required("Post title"),
          },
          {
            key: "slug",
            type: "text",
            label: "Slug",
            icon: "Hash",
            hint: { create: "Auto-generated from title.", edit: "Slug cannot be changed after creation." },
            readOnlyOnEdit: true,
            required: true,
            validate: required("Slug"),
            deriveFrom: { field: "name", transform: (v) =>
              v.toLowerCase().replace(/[^\w\s]/g, "").replace(/\s+/g, "-").trim()
            },
          },
          {
            key: "category",
            type: "text",
            label: "Category",
            icon: "Tag",
            placeholder: "e.g. Tutorials",
            required: true,
            validate: required("Category"),
          },
          {
            key: "readTime",
            type: "number",
            label: "Read Time (min)",
            icon: "Clock",
            placeholder: "5",
            min: 1,
            step: 1,
          },
        ],
      },
      {
        title: "Post Info",
        columns: 1,
        fields: [
          {
            key: "description",
            type: "textarea",
            label: "Excerpt",
            icon: "AlignLeft",
            placeholder: "Short summary shown in post listings…",
            rows: 3,
            required: true,
            validate: required("Excerpt"),
          },
          {
            key: "externalUrl",
            type: "url",
            label: "External URL",
            icon: "Link2",
            placeholder: "https://…",
            hint: "Link to the full post if hosted elsewhere.",
            validate: validUrl("External URL"),
          },
        ],
      },
      {
        title: "Tags",
        columns: 1,
        fields: [
          {
            key: "features",
            type: "array",
            label: "Tags",
            placeholder: "Tag",
            addLabel: "Add Tag",
            validate: arrayValidator,
          },
        ],
      },
      {
        title: "Cover Image",
        columns: 1,
        fields: [
          {
            key: "image",
            type: "image",
            label: "Cover Image",
          },
        ],
      },
    ],
    footerHint: {
      create: "Post will be saved as a draft.",
      edit: "Changes are applied immediately.",
    },
  },

};