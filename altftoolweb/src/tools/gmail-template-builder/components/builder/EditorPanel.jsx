import React, { useState } from "react";
import {
  Trash2,
  Edit,
  X,
  Upload,
  Plus,
  Minus,
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  Github,
} from "lucide-react";
import StyleInput from "../ui/StyleInput";

// Map string icon names to Lucide components for the editor
const SocialIcons = { Facebook, Twitter, Linkedin, Instagram, Github };

// --- NEW: Social Media Editor Subcomponent ---
const SocialMediaEditor = ({ component, onUpdate }) => {
  const { id, links, style } = component;
  const [newLinkUrl, setNewLinkUrl] = useState("");
  const [newLinkName, setNewLinkName] = useState("Facebook");

  const handleAddLink = () => {
    if (newLinkUrl.trim()) {
      const newLink = {
        name: newLinkName,
        url: newLinkUrl,
        icon: newLinkName,
      };
      onUpdate(id, { ...component, links: [...links, newLink] });
      setNewLinkUrl("");
    }
  };

  const handleDeleteLink = (index) => {
    const newLinks = links.filter((_, i) => i !== index);
    onUpdate(id, { ...component, links: newLinks });
  };

  const handleLinkChange = (index, key, value) => {
    const newLinks = links.map((link, i) =>
      i === index ? { ...link, [key]: value } : link
    );
    onUpdate(id, { ...component, links: newLinks });
  };

  const handleStyleChange = (key, value) => {
    onUpdate(id, {
      ...component,
      style: {
        ...style,
        [key]: value,
      },
    });
  };

  return (
    <>
      {/* Existing Links */}
      <label className="block text-xs font-medium text-(--muted-foreground) mb-1">
        Existing Links
      </label>
      <div className="space-y-3 mb-4">
        {links.map((link, index) => {
          const Icon = SocialIcons[link.icon] || X;
          return (
            <div
              key={index}
              className="flex items-center space-x-2 p-2 border border-(--border) dark:border-(--border) rounded-lg bg-input-bg"
            >
              <Icon className="w-5 h-5 flex-shrink-0 text-(--foreground)" />
              <input
                type="url"
                value={link.url}
                onChange={(e) => handleLinkChange(index, "url", e.target.value)}
                placeholder="https://..."
                className="w-full p-1 text-sm bg-transparent outline-none focus:ring-0"
              />
              <button
                onClick={() => handleDeleteLink(index)}
                className="p-1 text-red-500 hover:bg-red-500 hover:text-foreground rounded-full transition-colors"
                title="Remove Link"
              >
                <Minus className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Add New Link */}
      <label className="block text-xs font-medium text-(--muted-foreground) mb-1">
        Add New Link
      </label>
      <div className="flex space-x-2 mb-4">
        <select
          value={newLinkName}
          onChange={(e) => setNewLinkName(e.target.value)}
          className="w-1/3 p-2 border border-(--border) dark:border-(--border) rounded-lg shadow-sm bg-input-bg text-(--foreground) text-sm"
        >
          {Object.keys(SocialIcons).map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
        <input
          type="url"
          value={newLinkUrl}
          onChange={(e) => setNewLinkUrl(e.target.value)}
          placeholder="Link URL"
          className="w-2/3 p-2 border border-(--border) dark:border-(--border) rounded-lg shadow-sm bg-input-bg text-(--foreground) text-sm"
        />
        <button
          onClick={handleAddLink}
          className="p-2 bg-(--primary) text-foreground rounded-lg hover:hover:bg-(--primary)/90 transition-all"
          title="Add Link"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {/* Style Inputs for Social Media */}
      <h4 className="text-sm font-semibold text-(--foreground) mt-4 mb-2">
        Icon Styling
      </h4>
      <div className="grid grid-cols-2 gap-3">
        <StyleInput
          label="Icon Size (px)"
          type="number"
          value={parseInt(style.iconSize)}
          onChange={(v) => handleStyleChange("iconSize", `${v}px`)}
        />
        <StyleInput
          label="Spacing (px)"
          type="number"
          value={parseInt(style.iconSpacing)}
          onChange={(v) => handleStyleChange("iconSpacing", `${v}px`)}
        />
        <StyleInput
          label="Icon Color"
          type="color"
          value={style.iconColor}
          onChange={(v) => handleStyleChange("iconColor", v)}
        />
        {/* Alignment inherited from wrapper styles */}
        <StyleInput
          label="Alignment"
          type="select"
          value={style.textAlign || "center"}
          onChange={(v) => handleStyleChange("textAlign", v)}
          options={["left", "center", "right"]}
        />
      </div>
    </>
  );
};
// --- END: Social Media Editor Subcomponent ---

const EditorPanel = ({ component, onUpdate, onDelete }) => {
  if (!component) {
    return (
      <div className="p-6 h-full flex items-center justify-center text-center text-(--muted-foreground) animate-fade-in">
        <p>Select a component on the canvas to edit its properties.</p>
      </div>
    );
  }

  const { id, type, style, content, text, src, alt, href } = component;

  // Generic style update handler
  const handleStyleChange = (key, value) => {
    onUpdate(id, {
      ...component,
      style: {
        ...style,
        [key]: value,
      },
    });
  };

  // Generic content update handler (text, content, src, etc.)
  const handleContentChange = (key, value) => {
    onUpdate(id, {
      ...component,
      [key]: value,
    });
  };

  // Image Upload Handler (Data URL)
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        // Update the component's src with the Data URL
        onUpdate(id, { ...component, src: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="p-4 overflow-y-auto hide-scrollbar flex-1 animate-slide-in-right">
      <div className="flex justify-between items-center pb-4 border-b border-(--border) dark:border-(--border) mb-4">
        <h3 className="text-xl font-bold text-(--foreground) flex items-center gap-2">
          <Edit className="w-5 h-5 text-accent" />
          Edit {type.charAt(0).toUpperCase() + type.slice(1)}
        </h3>
        <button
          onClick={() => onDelete(id)}
          className="p-2 text-red-500 hover:bg-red-500 hover:text-foreground rounded-lg transition-all"
          title="Delete Component"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>

      {/* --- CONTENT PROPERTIES --- */}
      <h4 className="text-sm font-semibold text-(--foreground) mt-4 mb-2">
        Content
      </h4>
      <div className="border border-(--border) dark:border-(--border) p-3 rounded-lg bg-(--card) dark:bg-(--card)">
        {/* Text-based Content */}
        {(type === "text" ||
          type === "header" ||
          type === "footer" ||
          type === "signature") && (
          <div className="mb-4">
            <label className="block text-xs font-medium text-(--muted-foreground) mb-1">
              Text/HTML Content
            </label>
            <textarea
              className="w-full p-3 border border-(--border) dark:border-(--border) rounded-lg shadow-sm bg-input-bg text-(--foreground) focus:ring-2 focus:ring-accent focus:border-transparent transition-all min-h-[100px] text-sm"
              value={content}
              onChange={(e) => handleContentChange("content", e.target.value)}
            />
          </div>
        )}

        {/* Image/Logo Content (Combined) */}
        {(type === "image" || type === "logo") && (
          <>
            <StyleInput
              label="Image Source (URL)"
              type="text"
              value={src}
              onChange={(v) => handleContentChange("src", v)}
            />

            {/* NEW: Device Upload */}
            <div className="mb-4">
              <label className="block text-xs font-medium text-(--muted-foreground) mb-1">
                OR Upload from Device (Uses Base64/Data URL)
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="w-full text-sm text-(--foreground) file:cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gray-600 file:text-foreground hover:file:hover:bg-(--primary)/90 transition-all"
                />
              </div>
            </div>

            <StyleInput
              label="Alt Text"
              type="text"
              value={alt}
              onChange={(v) => handleContentChange("alt", v)}
            />

            {/* Logo Link */}
            {type === "logo" && (
              <StyleInput
                label="Link URL (href)"
                type="text"
                value={href}
                onChange={(v) => handleContentChange("href", v)}
              />
            )}
          </>
        )}

        {/* Button Content */}
        {type === "button" && (
          <>
            <StyleInput
              label="Button Text"
              type="text"
              value={text}
              onChange={(v) => handleContentChange("text", v)}
            />
            <StyleInput
              label="Link URL (href)"
              type="text"
              value={href}
              onChange={(v) => handleContentChange("href", v)}
            />
          </>
        )}

        {/* NEW: Social Media Content Editor */}
        {type === "socialMedia" && (
          <SocialMediaEditor component={component} onUpdate={onUpdate} />
        )}
      </div>

      {/* --- STYLE PROPERTIES --- */}
      <h4 className="text-sm font-semibold text-(--foreground) mt-4 mb-2">
        Styling
      </h4>
      <div className="border border-(--border) dark:border-(--border) p-3 rounded-lg bg-(--card) dark:bg-(--card)">
        {/* Color/Background */}
        <div className="grid grid-cols-2 gap-3 mb-2">
          {style.color && type !== "socialMedia" && (
            <StyleInput
              label="Text Color"
              type="color"
              value={style.color}
              onChange={(v) => handleStyleChange("color", v)}
            />
          )}
          {style.backgroundColor && (
            <StyleInput
              label="Background Color"
              type="color"
              value={style.backgroundColor}
              onChange={(v) => handleStyleChange("backgroundColor", v)}
            />
          )}
        </div>

        {/* Font/Text */}
        <div className="grid grid-cols-2 gap-3 mb-2">
          {style.fontSize && (
            <StyleInput
              label="Font Size (px)"
              type="number"
              value={parseInt(style.fontSize)}
              onChange={(v) => handleStyleChange("fontSize", `${v}px`)}
            />
          )}
          {style.lineHeight && (
            <StyleInput
              label="Line Height"
              type="number"
              value={style.lineHeight}
              onChange={(v) => handleStyleChange("lineHeight", v)}
            />
          )}
        </div>
        {style.textAlign && type !== "socialMedia" && (
          <StyleInput
            label="Text Alignment"
            type="select"
            value={style.textAlign}
            onChange={(v) => handleStyleChange("textAlign", v)}
            options={["left", "center", "right"]}
          />
        )}

        {/* NEW: Image/Logo Specific Sizing & Appearance */}
        {(type === "image" || type === "logo") && (
          <>
            <div className="grid grid-cols-2 gap-3 mb-2 mt-4">
              <StyleInput
                label="Width (px or %)"
                type="text"
                value={style.width || "100%"}
                onChange={(v) => handleStyleChange("width", v)}
              />
              <StyleInput
                label="Height (px or auto)"
                type="text"
                value={style.height || "auto"}
                onChange={(v) => handleStyleChange("height", v)}
              />
            </div>
            <StyleInput
              label="Border Radius (px)"
              type="number"
              value={parseInt(style.borderRadius) || 0}
              onChange={(v) => handleStyleChange("borderRadius", `${v}px`)}
            />
          </>
        )}

        {/* Padding */}
        <div className="grid grid-cols-2 gap-3 mb-2">
          <StyleInput
            label="Padding Top (px)"
            type="number"
            value={parseInt(style.paddingTop)}
            onChange={(v) => handleStyleChange("paddingTop", `${v}px`)}
          />
          <StyleInput
            label="Padding Bottom (px)"
            type="number"
            value={parseInt(style.paddingBottom)}
            onChange={(v) => handleStyleChange("paddingBottom", `${v}px`)}
          />
          <StyleInput
            label="Padding Left (px)"
            type="number"
            value={parseInt(style.paddingLeft)}
            onChange={(v) => handleStyleChange("paddingLeft", `${v}px`)}
          />
          <StyleInput
            label="Padding Right (px)"
            type="number"
            value={parseInt(style.paddingRight)}
            onChange={(v) => handleStyleChange("paddingRight", `${v}px`)}
          />
        </div>

        {/* Divider/Button Specific Styles */}
        {type === "divider" && (
          <StyleInput
            label="Border Color"
            type="color"
            value={style.borderColor || "#e2e8f0"}
            onChange={(v) => handleStyleChange("borderColor", v)}
          />
        )}
        {type === "button" && (
          <StyleInput
            label="Border Radius (px)"
            type="number"
            value={parseInt(style.borderRadius)}
            onChange={(v) => handleStyleChange("borderRadius", `${v}px`)}
          />
        )}
      </div>
    </div>
  );
};

export default EditorPanel;
