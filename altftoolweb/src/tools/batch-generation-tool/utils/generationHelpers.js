"use client";

import { batchGenerationConfig } from "../config/batchGenerationConfig";

export const STORAGE_KEY = batchGenerationConfig.storageKey;
export const MAX_QUANTITY = batchGenerationConfig.maxQuantity;

export const initialConfig = batchGenerationConfig.defaultConfig;
export const initialField = batchGenerationConfig.defaultField;
export const initialFilters = batchGenerationConfig.defaultFilters;
export const initialWorkspace = { config: initialConfig, fields: [], templates: [], history: [] };

export function loadWorkspace() {
  if (typeof window === "undefined") return initialWorkspace;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return initialWorkspace;
    const parsed = JSON.parse(saved);
    return {
      config: { ...initialConfig, ...(parsed.config || {}) },
      fields: Array.isArray(parsed.fields) ? parsed.fields : [],
      templates: Array.isArray(parsed.templates) ? parsed.templates : [],
      history: Array.isArray(parsed.history) ? parsed.history : [],
    };
  } catch {
    return initialWorkspace;
  }
}

export function makeId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function slugify(value, fallback = batchGenerationConfig.defaultItemSlug) {
  const clean = String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return clean || fallback;
}

export function normalizeKey(value) {
  return slugify(value, batchGenerationConfig.defaultFieldKey).replace(/-/g, "_");
}

export function formatBytes(bytes) {
  const units = batchGenerationConfig.byteUnits;
  if (!bytes) return units.empty;
  if (bytes < 1024) return `${bytes} ${units.bytes}`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} ${units.kilobytes}`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} ${units.megabytes}`;
}

export function downloadBlob(content, filename, type) {
  const blob = content instanceof Blob ? content : new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function applyTemplate(template, variables) {
  return String(template || "").replace(/\{([^}]+)\}/g, (_, key) => {
    const value = variables[String(key).trim()];
    return value === undefined || value === null ? "" : String(value);
  });
}

export function validateConfig(config, fields) {
  const messages = batchGenerationConfig.validationMessages;
  const errors = [];
  if (!config.name.trim()) errors.push(messages.nameRequired);
  if (!config.type.trim()) errors.push(messages.typeRequired);
  if (!config.category.trim()) errors.push(messages.categoryRequired);
  if (!config.purpose.trim()) errors.push(messages.purposeRequired);
  if (!config.template.trim()) errors.push(messages.templateRequired);
  if (!Number.isFinite(Number(config.quantity)) || Number(config.quantity) < 1 || Number(config.quantity) > MAX_QUANTITY) {
    errors.push(messages.quantityRange(MAX_QUANTITY));
  }

  const validFields = fields.filter((field) => field.key.trim() || field.label.trim() || field.value.trim());
  validFields.forEach((field) => {
    if (!field.label.trim()) errors.push(messages.fieldLabelRequired);
    if (!field.key.trim()) errors.push(messages.fieldKeyRequired(field.label));
    if (field.required && !field.value.trim()) errors.push(messages.requiredFieldEmpty(field.label || field.key));
  });

  const duplicateKeys = validFields.map((field) => field.key.trim()).filter(Boolean);
  if (new Set(duplicateKeys).size !== duplicateKeys.length) errors.push(messages.duplicateKeys);
  return errors;
}

export function buildOutputs(config, fields) {
  const quantity = Math.min(MAX_QUANTITY, Math.max(0, Number(config.quantity) || 0));
  const cleanFields = fields
    .filter((field) => field.key.trim() && (field.value.trim() || !field.required))
    .map((field) => ({ ...field, key: normalizeKey(field.key), label: field.label.trim() || field.key.trim() }));

  return Array.from({ length: quantity }, (_, index) => {
    const row = index + 1;
    const variables = {
      batch: config.name.trim(),
      type: config.type.trim(),
      category: config.category.trim(),
      purpose: config.purpose.trim(),
      mode: config.mode,
      index: String(row).padStart(String(quantity).length, "0"),
      number: row,
      seed: config.variationSeed.trim(),
    };

    cleanFields.forEach((field) => {
      variables[field.key] = field.value.replace(/\{index\}/g, row).replace(/\{number\}/g, row);
    });

    const title = applyTemplate(config.namingPattern, variables) || `${config.name || batchGenerationConfig.defaultBatchName}-${row}`;
    const body = applyTemplate(config.template, variables);
    const missing = Array.from(new Set((config.template.match(/\{([^}]+)\}/g) || []).map((token) => token.slice(1, -1).trim())))
      .filter((key) => variables[key] === undefined);

    return {
      id: `${slugify(config.name, batchGenerationConfig.defaultBatchName)}-${row}`,
      index: row,
      title,
      type: config.type,
      category: config.category,
      status: missing.length ? batchGenerationConfig.statuses.failed : body.trim() ? batchGenerationConfig.statuses.generated : batchGenerationConfig.statuses.pending,
      missing,
      content: body,
      variables,
      bytes: new Blob([body]).size,
      createdAt: new Date().toISOString(),
    };
  });
}

export function buildCsv(outputs) {
  const headers = batchGenerationConfig.csvHeaders;
  const escape = (value) => `"${String(value ?? "").replace(/"/g, '""')}"`;
  return [headers.join(","), ...outputs.map((item) => headers.map((key) => escape(item[key])).join(","))].join("\n");
}

export function buildTxt(outputs) {
  return outputs
    .map((item) => `${item.title}\n${"=".repeat(Math.min(batchGenerationConfig.textDividerMaxLength, item.title.length || batchGenerationConfig.textDividerFallbackLength))}\n${item.content}`)
    .join("\n\n");
}
