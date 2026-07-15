"use client";

import CustomBlogEditor from "@/components/admin/CustomBlogEditor";

export default function CoozterBlogEditor({ value, onChange }) {
  return <CustomBlogEditor value={value} onChange={onChange} />;
}