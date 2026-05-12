import React, { useRef, useState, useEffect } from "react";
import {
  Download,
  Eye,
  Plus,
  Trash2,
  GripVertical,
  ChevronDown,
  Code,
  LayoutTemplate,
  Copy,
  Undo2,
  Redo2,
  Export,
  FlaskConical,
} from "lucide-react";
import { Button } from "@/shared/ui/Button";
import { generateAIForm } from "../utils/generateAIForm";
import DragDropBuilder from "./DragDropBuilder";

import ExportPanel from "./ExportPanel";
import TemplateSelector from "./TemplateSelector";
import ValidationBuilder from "./ValidationBuilder";
import AnalyticsPanel from "./AnalyticsPanel";
import MultiStepForm from "./MultiStepForm";
import ShareFormButton from "./ShareFormButton";
import FormScore from "./FormScore";
import TestMode from "./TestMode";
import { downloadForm } from "../download/download";
import { decodeForm } from "../utils/shareForm";
import FieldSettingsPanel from "./FieldSettingsPanel";

const DEFAULT_FORM_THEME = {
  primaryColor: "#2563eb",
  borderRadius: 12,
  fontFamily: "var(--font-secondary)",
  buttonStyle: "rounded",
};

const FormBuilder = () => {
  const nextIdRef = useRef(0);
  const [formFields, setFormFields] = useState([]);
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState({});
  const [errors, setErrors] = useState({});
  const [draggedItem, setDraggedItem] = useState(null);
  const [showComponents, setShowComponents] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [fields, setFields] = useState([]);
  const [conditions, setConditions] = useState([]);
  const [livePreviewData, setLivePreviewData] = useState({});
  const [views, setViews] = useState(0);
  const [submissions, setSubmissions] = useState(0);

  const [showExportPanel, setShowExportPanel] = useState(false);
  const [exportType, setExportType] = useState("html");
  const [copied, setCopied] = useState(false);

  const [showTemplates, setShowTemplates] = useState(false);
  const [autoSaved, setAutoSaved] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const [history, setHistory] = useState([]);
  const [future, setFuture] = useState([]);

  const [showTestMode, setShowTestMode] = useState(false);
  const [isSharedView, setIsSharedView] = useState(false);

  const [selectedFieldId, setSelectedFieldId] = useState(null);

  // theme customizer
  const [theme, setTheme] = useState(DEFAULT_FORM_THEME);

  const fieldTypes = [
    { type: "text", label: "Text Input", icon: "📝" },
    { type: "email", label: "Email", icon: "✉️" },
    { type: "number", label: "Number", icon: "🔢" },
    { type: "tel", label: "Phone", icon: "📞" },
    { type: "url", label: "URL", icon: "🔗" },
    { type: "password", label: "Password", icon: "🔒" },
    { type: "textarea", label: "Text Area", icon: "📄" },
    { type: "select", label: "Dropdown", icon: "📋" },
    { type: "radio", label: "Radio Buttons", icon: "⭕" },
    { type: "checkbox", label: "Checkboxes", icon: "☑️" },
    { type: "date", label: "Date", icon: "📅" },
    { type: "time", label: "Time", icon: "⏰" },
    { type: "datetime-local", label: "Date & Time", icon: "📆" },
    { type: "file", label: "File Upload", icon: "📎" },
    { type: "range", label: "Range Slider", icon: "🎚️" },
    { type: "color", label: "Color Picker", icon: "🎨" },
  ];

  // --- Handlers ---
  const createId = (prefix) => `${prefix}-${++nextIdRef.current}`;

  const addField = (type) => {
    setHistory((prev) => [...prev, formFields]);
    setFuture([]);
    const newField = {
      id: createId("field"),
      type,
      label: `${type.charAt(0).toUpperCase() + type.slice(1)} Field`,
      placeholder:
        type === "textarea" ? "Enter your text here..." : `Enter ${type}...`,
      required: false,
      options:
        type === "select" || type === "radio" || type === "checkbox"
          ? ["Option 1", "Option 2", "Option 3"]
          : [],
      minLength: "",
      maxLength: "",
      pattern: "",
      min: type === "range" ? "0" : "",
      max: type === "range" ? "100" : "",
      step: type === "range" ? "1" : "",
    };
    setFormFields([...formFields, newField]);
    setFields((prev) => [...prev, { id: newField.id, value: "" }]);
  };
  // undo handler
  const handleUndo = () => {
    if (history.length === 0) return;

    const previous = history[history.length - 1];

    setFuture((prev) => [formFields, ...prev]);
    setFormFields(previous);
    setHistory((prev) => prev.slice(0, -1));
  };
  // redo handler
  const handleRedo = () => {
    if (future.length === 0) return;

    const next = future[0];

    setHistory((prev) => [...prev, formFields]);
    setFormFields(next);
    setFuture((prev) => prev.slice(1));
  };

  const handleDropField = (type) => {
    addField(type);
    setShowComponents(false);
  };

  const removeField = (id) => {
    setFormFields(formFields.filter((field) => field.id !== id));
    setFields(fields.filter((f) => f.id !== id));
  };
  //  duplicate
  const duplicateField = (id) => {
    const fieldToCopy = formFields.find((f) => f.id === id);
    if (!fieldToCopy) return;

    const newField = {
      ...fieldToCopy,
      id: createId("field"),
      label: fieldToCopy.label + " (Copy)",
    };

    setFormFields((prev) => [...prev, newField]);
    setFields((prev) => [...prev, { id: newField.id, value: "" }]);
  };

  const updateField = (id, property, value) => {
    setFormFields(
      formFields.map((field) =>
        field.id === id ? { ...field, [property]: value } : field,
      ),
    );
  };

  const updateOptions = (id, optionIndex, value) => {
    setFormFields(
      formFields.map((field) => {
        if (field.id === id) {
          const newOptions = [...field.options];
          newOptions[optionIndex] = value;
          return { ...field, options: newOptions };
        }
        return field;
      }),
    );

    const addOption = (id) => {
      setFormFields(
        formFields.map((field) => {
          if (field.id === id) {
            return {
              ...field,
              options: [...field.options, `Option ${field.options.length + 1}`],
            };
          }
          return field;
        }),
      );
    };
  };

  const removeOption = (id, optionIndex) => {
    setFormFields(
      formFields.map((field) => {
        if (field.id === id) {
          return {
            ...field,
            options: field.options.filter((_, i) => i !== optionIndex),
          };
        }
        return field;
      }),
    );
  };

  const validateField = (field, value) => {
    if (field.required && !value) return "This field is required";
    if (
      field.type === "email" &&
      value &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
    )
      return "Invalid email format";
    if (field.type === "url" && value && !/^https?:\/\/.+/.test(value))
      return "Invalid URL format";
    if (field.type === "tel" && value && !/^[0-9+\-\s()]+$/.test(value))
      return "Invalid phone number";
    if (field.minLength && value && value.length < parseInt(field.minLength))
      return `Minimum ${field.minLength} characters required`;
    if (field.maxLength && value && value.length > parseInt(field.maxLength))
      return `Maximum ${field.maxLength} characters allowed`;
    if (field.pattern && value && !new RegExp(field.pattern).test(value))
      return "Invalid format";
    if (field.type === "number" && value) {
      if (field.min && parseFloat(value) < parseFloat(field.min))
        return `Minimum value is ${field.min}`;
      if (field.max && parseFloat(value) > parseFloat(field.max))
        return `Maximum value is ${field.max}`;
    }
    // ✅ Confirm Email Match Validation
    if (field.isConfirmEmail && value) {
      const originalField = formFields.find(
        (f) => f.id === field.linkedFieldId,
      );

      const originalValue =
        previewData[originalField?.id] || livePreviewData[originalField?.id];

      if (value !== originalValue) {
        return "Emails do not match";
      }
    }
    return null;
  };

  const addCondition = (showFieldId) => {
    const newCondition = {
      id: createId("condition"),
      ifFieldId: "",
      ifValue: "",
      showFieldId,
      ifFieldLabel: "",
    };
    setConditions((prev) => [...prev, newCondition]);
  };

  const handleFieldChange = (fieldId, value) => {
    setFields((prev) =>
      prev.map((f) => (f.id === fieldId ? { ...f, value } : f)),
    );
  };

  const handlePreviewChange = (fieldId, value) => {
    setPreviewData({ ...previewData, [fieldId]: value });
    const field = formFields.find((f) => f.id === fieldId);
    const error = validateField(field, value);
    setErrors({ ...errors, [fieldId]: error });
  };

  const handleLivePreviewChange = (fieldId, value) => {
    setLivePreviewData((prev) => ({ ...prev, [fieldId]: value }));
    const field = formFields.find((f) => f.id === fieldId);
    const error = validateField(field, value);
    setErrors((prev) => ({ ...prev, [fieldId]: error }));
  };

  const handlePreviewSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    formFields.forEach((field) => {
      const error = validateField(field, previewData[field.id]);
      if (error) newErrors[field.id] = error;
    });
    setErrors(newErrors);
    if (Object.keys(newErrors).length === 0) {
      setSubmissions((prev) => prev + 1);
      alert(
        "Form submitted successfully!\n\n" +
          JSON.stringify(previewData, null, 2),
      );
    }
  };

  const handleDragStart = (index) => setDraggedItem(index);
  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (draggedItem === null || draggedItem === index) return;
    const newFields = [...formFields];
    const draggedField = newFields[draggedItem];
    newFields.splice(draggedItem, 1);
    newFields.splice(index, 0, draggedField);
    setFormFields(newFields);
    setDraggedItem(index);
  };
  const handleDragEnd = () => setDraggedItem(null);

  const buttonRadiusClass =
    theme.buttonStyle === "pill"
      ? "rounded-full"
      : theme.buttonStyle === "square"
        ? "rounded-none"
        : "rounded-md";

  //  decode forms
  useEffect(() => {
    const loadForm = setTimeout(() => {
      const params = new URLSearchParams(window.location.search);
      const data = params.get("data");

      console.log("URL DATA:", data);

      // ✅ Shared URL case
      if (data) {
        setIsSharedView(true);

        const decoded = decodeForm(decodeURIComponent(data));

        if (decoded) {
          setFormFields(decoded.formFields || []);
          setFormTitle(decoded.formTitle || "");
          setFormDescription(decoded.formDescription || "");
          setTheme(decoded.theme || DEFAULT_FORM_THEME);

          setFields(
            (decoded.formFields || []).map((f) => ({
              id: f.id,
              value: "",
            })),
          );
        }

        // shared form = always preview mode
        setShowPreview(true);

        setIsLoaded(true);
        return;
      }

      // localStorage (same as before)
      const savedData = localStorage.getItem("formData");

      if (savedData) {
        const parsed = JSON.parse(savedData);

        setFormFields(parsed.formFields || []);
        setFormTitle(parsed.formTitle || "");
        setFormDescription(parsed.formDescription || "");
        setTheme(parsed.theme || DEFAULT_FORM_THEME);

        setFields(
          (parsed.formFields || []).map((f) => ({
            id: f.id,
            value: "",
          })),
        );
      }

      setIsLoaded(true);
    }, 0);

    return () => clearTimeout(loadForm);
  }, []);

  // Auto Save
  useEffect(() => {
    if (!isLoaded) return;
    const formData = {
      formFields,
      formTitle,
      formDescription,
      theme,
    };

    localStorage.setItem("formData", JSON.stringify(formData));

    // UI feedback
    const showSaved = setTimeout(() => setAutoSaved(true), 0);

    const timer = setTimeout(() => {
      setAutoSaved(false);
    }, 2000);

    return () => {
      clearTimeout(showSaved);
      clearTimeout(timer);
    };
  }, [formFields, formTitle, formDescription, isLoaded, theme]);

  //  generte form handler
  const handleGenerateAIForm = () => {
    const generated = generateAIForm(aiPrompt);
    if (generated.length > 0) {
      setFormFields(generated);
      setFields(
        generated.map((field) => ({
          id: field.id,
          value: "",
        })),
      );
      setAiPrompt("");
    }
  };

  // Analytical handler
  const handlePreviewToggle = () => {
    setShowTestMode(false);
    if (!showPreview) {
      setViews((prev) => prev + 1);
    }
    setShowPreview(!showPreview);
  };

  

  if (isSharedView) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-8">
        {formTitle && <h1 className="subheading mb-4">{formTitle}</h1>}

        {formDescription && (
          <p className="text-lg text-(--foreground) mb-8">{formDescription}</p>
        )}

        <form onSubmit={handlePreviewSubmit} className="space-y-6">
          <MultiStepForm
            formFields={formFields}
            previewData={previewData}
            handlePreviewChange={handlePreviewChange}
            handlePreviewSubmit={handlePreviewSubmit}
            errors={errors}
            theme={theme}
          />
        </form>
      </div>
    );
  }

  return (
    <div className="w-full-auto bg-(--card) text-(--foreground) rounded-2xl  ">
      <h1 className="heading text-center animate-fade-up pt-8 ">
        Form Builder
      </h1>
      <FormScore formFields={formFields} />
      <p className="description text-center animate-fade-up pt-2">
        Design smarter forms, faster than ever.
      </p>
      {/* Autosave  */}
      {autoSaved && (
        <p className="text-green-500 text-sm text-center mt-2">Auto Saved </p>
      )}

      {/* AI Form Input */}
      <div className="max-w-2xl mx-auto mt-6 mb-4 flex flex-col sm:flex-row gap-3 px-4">
        <input
          type="text"
          placeholder="Describe your form... (eg: job application form)"
          value={aiPrompt}
          onChange={(e) => setAiPrompt(e.target.value)}
          className="flex-1 px-4 py-3 border border-(--border) rounded-md bg-(--card) text-(--foreground)"
        />
        <Button
          onClick={handleGenerateAIForm}
          className={`${buttonRadiusClass} w-full sm:w-auto px-6 py-3`}
        >
          Generate Form
        </Button>
      </div>

      {/* Add Field & Preview Buttons */}
      <div className="max-w-7xl mx-auto px-6 py-5 mt-4 ">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="relative">
            <button
              onClick={() => setShowComponents(!showComponents)}
              className=" w-full sm:w-auto flex items-center justify-between gap-2 px-4 py-2 border border-(--border) rounded-md bg-(--card) "
            >
              <Plus size={18} />
              Add Field
              <ChevronDown size={16} />
            </button>

            {showComponents && (
              <div className="absolute left-0 sm:left-0 sm:right-auto mt-2 w-full sm:w-72 max-h-80 overflow-y-auto no-scrollbar bg-(--card) border border-(--border) rounded-md shadow-lg z-50 p-3 ">
                <DragDropBuilder
                  fieldTypes={fieldTypes}
                  onDropField={handleDropField}
                  addField={addField}
                  fields={fields}
                  conditions={conditions}
                  addCondition={addCondition}
                />
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 w-full overflow-x-auto whitespace-nowrap no-scrollbar">
            <Button
              onClick={handleUndo}
              disabled={history.length === 0}
              className="w-full sm:w-auto flex items-center gap-2 shrink-0"
            >
              <Undo2 size={16} />
              Undo
            </Button>
            <Button
              onClick={handleRedo}
              disabled={future.length === 0}
              className="w-full sm:w-auto flex items-center gap-2"
            >
              {" "}
              <Undo2 size={16} />
              Redo
            </Button>
            <Button
              onClick={handlePreviewToggle}
              className={`${buttonRadiusClass} w-full sm:w-auto flex items-center justify-center gap-2`}
            >
              <Eye size={20} />
              {showPreview ? "Edit" : "Preview"}
            </Button>

            <Button
              onClick={() => {
                setShowTestMode(true);
                setShowPreview(false);
              }}
              className={`${buttonRadiusClass} w-full sm:w-auto flex items-center gap-2`}
            >
              <FlaskConical size={18} />
              Test
            </Button>
            <Button
              onClick={() =>
                downloadForm(formTitle, formDescription, formFields, theme)
              }
              disabled={formFields.length === 0}
              className={`${buttonRadiusClass} w-full sm:w-auto flex items-center gap-2`}
              style={{
                backgroundColor: "#1abd2d",
                fontFamily: theme.fontFamily,
              }}
            >
              <Download size={20} />
              Download
            </Button>

            <Button
              onClick={() => setShowTemplates(!showTemplates)}
              className={`${buttonRadiusClass} w-full sm:w-auto flex items-center gap-2`}
            >
              <LayoutTemplate size={20} />
              Templates
            </Button>
            <Button
              onClick={() => setShowExportPanel(!showExportPanel)}
              className={`${buttonRadiusClass} w-full sm:w-auto flex items-center gap-2`}
            >
              <Code size={20} />
              Export
            </Button>
            <div className="flex items-center gap-2 shrink-0 ">
              <ShareFormButton
                formFields={formFields}
                formTitle={formTitle}
                formDescription={formDescription}
                theme={theme}
              />
            </div>
          </div>
        </div>
      </div>
      {/* templates */}
      {showTemplates && (
        <TemplateSelector setFormFields={setFormFields} setFields={setFields} />
      )}

      {/* export panel render */}
      {showExportPanel && (
        <div className="max-w-7xl mx-auto px-6">
          <ExportPanel
            formFields={formFields}
            exportType={exportType}
            setExportType={setExportType}
          />
        </div>
      )}

      {/* Form Fields + Live Preview / Full Preview */}
      {/* 🧪 TEST MODE ADD START */}
      {isSharedView ? (
        // ✅ ONLY SHARED FORM VIEW
        <div className="max-w-3xl mx-auto px-6 py-8">
          {formTitle && <h1 className="subheading mb-4">{formTitle}</h1>}
          {formDescription && (
            <p className="text-lg text-(--foreground) mb-8">
              {formDescription}
            </p>
          )}

          <form onSubmit={handlePreviewSubmit} className="space-y-6">
            <MultiStepForm
              formFields={formFields}
              previewData={previewData}
              handlePreviewChange={handlePreviewChange}
              handlePreviewSubmit={handlePreviewSubmit}
              errors={errors}
              theme={theme}
            />
          </form>
        </div>
      ) : showTestMode ? (
        <TestMode
          formFields={formFields}
          handlePreviewChange={handlePreviewChange}
          errors={errors}
          theme={theme}
        />
      ) : !showPreview ? (
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          {/* Builder + Live Preview Split */}
          {/* Left Column: Builder */}
          <div className="flex-1">
            {/* Paste your existing Form Fields Section here */}
            <div className="grid grid-cols-1 gap-4 sm:gap-6">
              <div className="w-full ">
                <div className="bg-(--card) p-4 sm:p-8 rounded-2xl">
                  <div className="mb-8 ">
                    <input
                      type="text"
                      placeholder="Form Title"
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      className="w-full text-xl sm:text-3xl  sm:text-4xl font-bold mb-4 px-4 py-3 border border-(--border) rounded-md"
                    />
                    <textarea
                      placeholder="Form Description (optional)"
                      value={formDescription}
                      onChange={(e) => setFormDescription(e.target.value)}
                      className="w-full text-base sm:text-2xl mb-4 px-4 py-3 border border-(--border) rounded-md resize-none"
                      rows="2"
                    />
                  </div>

                  {formFields.length === 0 ? (
                    <div
                      className="text-center py-10 sm:py-20 border-2 border-dashed border-(--border) rounded-md bg-(--card)"
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        const fieldType = e.dataTransfer.getData("fieldType");
                        if (fieldType) handleDropField(fieldType);
                      }}
                    >
                      <p className="text-2xl font-bold text-(--muted-foreground) mb-2">
                        No fields yet
                      </p>
                      <p className="text-(--muted-foreground)">
                        Click on components to add them to your form
                      </p>
                    </div>
                  ) : (
                    <div
                      className="space-y-6"
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        const fieldType = e.dataTransfer.getData("fieldType");
                        if (fieldType) handleDropField(fieldType);
                      }}
                    >
                      {formFields.map((field, index) => (
                        <div
                          key={field.id}
                          draggable
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedFieldId(field.id);
                          }}
                          onDragStart={() => handleDragStart(index)}
                          onDragOver={(e) => handleDragOver(e, index)}
                          onDragEnd={handleDragEnd}
                          className={`field-card w-full max-w-full overflow-hidden border border-(--border) p-4 sm:p-6 bg-(--card) rounded-xl hover:border-(--primary) transition-all duration-200 ${
                            selectedFieldId === field.id
                              ? "border-(--primary) shadow-md"
                              : draggedItem === index
                                ? "opacity-50 scale-[0.98] border-(--primary)"
                                : ""
                          }`}
                        >
                          <div className="flex flex-col gap-3 w-full">
                            {/* Top row (drag + actions) */}
                            <div className="flex items-center justify-between">
                              <GripVertical
                                size={18}
                                className="cursor-move text-(--muted-foreground)"
                              />

                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => duplicateField(field.id)}
                                  className="p-2 hover:bg-blue-100 rounded-md"
                                >
                                  <Copy size={16} className="text-blue-600" />
                                </button>

                                <button
                                  onClick={() => removeField(field.id)}
                                  className="p-2 hover:bg-red-100 rounded-md"
                                >
                                  <Trash2 size={16} className="text-red-600" />
                                </button>
                              </div>
                            </div>

                            {/* LABEL (same as Live Preview) */}
                            <label className="text-sm sm:text-base font-medium">
                              {field.label}
                            </label>

 

                            {/* INPUT  fields */}
                            <input
                              type="text"
                              value={field.label}
                              onChange={(e) =>
                                updateField(field.id, "label", e.target.value)
                              }
                              placeholder="Enter field name"
                              className="w-full px-4 py-3 text-base border border-(--border) rounded-md"
                            />




                            
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Live Preview */}

          <div className="flex-1 flex flex-col gap-4 ">
            <div className="bg-(--card) p-4 sm:p-6 border border-(--border) w-full max-w-full overflow-hidden rounded-xl">
              <h2 className="text-xl font-semibold mb-4">Live Preview</h2>
              <form className="space-y-4">
                {formFields.map((field) => (
                  <div key={field.id}>
                    <label className="block mb-2 text-sm sm:text-base font-medium ">
                      {field.label}
                      {field.required && (
                        <span className="text-red-600 ml-1">*</span>
                      )}
                    </label>
                    {field.type === "textarea" ? (
                      <textarea
                        value={livePreviewData[field.id] || ""}
                        onChange={(e) =>
                          handleLivePreviewChange(field.id, e.target.value)
                        }
                        placeholder={field.placeholder}
                        className="w-full px-4 py-3 sm:py-3 text-base sm:text-lg border border-(--border) rounded-md"
                        style={{
                          borderRadius: `${theme.borderRadius}px`,
                          fontFamily: theme.fontFamily,
                        }}
                        rows={3}
                      />
                    ) : (
                      <input
                        type={field.type}
                        value={livePreviewData[field.id] || ""}
                        onChange={(e) =>
                          handleLivePreviewChange(field.id, e.target.value)
                        }
                        placeholder={field.placeholder}
                        className="w-full px-3 py-2 border border-(--border) rounded-md"
                        
                      />
                    )}
                    {errors[field.id] && (
                      <p className="text-red-600 text-sm mt-1">
                        {errors[field.id]}
                      </p>
                    )}
                  </div>
                ))}
              </form>
            </div>
            {selectedFieldId && (
              <FieldSettingsPanel
                field={formFields.find((f) => f.id === selectedFieldId)}
                updateField={updateField}
                formFields={formFields}
                setFormFields={setFormFields}
              />
            )}
            <AnalyticsPanel views={views} submissions={submissions} />
           
          </div>
        </div>
      ) : (
        // Full-width Preview Mode
        <div className="max-w-3xl mx-auto px-6 py-8">
          {formTitle && <h1 className="subheading mb-4">{formTitle}</h1>}
          {formDescription && (
            <p className="text-lg text-(--foreground) mb-8">
              {formDescription}
            </p>
          )}
          <form onSubmit={handlePreviewSubmit} className="space-y-6">
            <MultiStepForm
              formFields={formFields}
              previewData={previewData}
              handlePreviewChange={handlePreviewChange}
              handlePreviewSubmit={handlePreviewSubmit}
              errors={errors}
              theme={theme}
            />
          </form>
        </div>
      )}
    </div>
  );
};

export default FormBuilder;
