"use client";

import CustomBlogEditor from "@/components/admin/CustomBlogEditor";

export default function CoozterBlogEditor({ value, onChange, error, readOnly, draftKey }) {
  return (
    <CustomBlogEditor
      value={value}
      onChange={onChange}
      error={error}
      readOnly={readOnly}
      draftKey={draftKey || "coozter-blog-editor"}
    />
  );
}
