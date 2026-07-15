"use client";

import CustomBlogEditor from "@/components/admin/CustomBlogEditor";

export default function BlogEditor({ value, onChange }) {
  return <CustomBlogEditor value={value} onChange={onChange} />;
}
