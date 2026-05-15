import { ImageResponse } from "next/og";
import { getBlogBySlug, stripHtml } from "../data";
import { fetchFirebaseBlogBySlug } from "../data/firebaseBlogs";

export const runtime = "edge";
export const alt = "AltFTool blog article";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

function trimText(value = "", maxLength = 120) {
  const text = stripHtml(value);
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).replace(/\s+\S*$/, "")}...`;
}

export default async function Image({ params }) {
  const { slug } = await params;
  const blog =
    (await fetchFirebaseBlogBySlug(slug).catch(() => null)) ||
    getBlogBySlug(slug);
  const title = trimText(blog?.heading || blog?.title || "AltFTool Blog", 88);
  const description = trimText(
    blog?.seoDescription || blog?.excerpt || blog?.description || "",
    150,
  );
  const category = trimText(blog?.category || "AltFTool", 28);
  const readTime = trimText(blog?.readTime || "Quick read", 20);

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          background: "#f8fafc",
          color: "#0f172a",
          fontFamily: "Arial",
          padding: 54,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: "100%",
            height: "100%",
            border: "1px solid #dbe3ef",
            borderRadius: 28,
            background: "#ffffff",
            padding: 48,
            boxShadow: "0 26px 70px rgba(15, 23, 42, 0.12)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                fontSize: 28,
                fontWeight: 800,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 54,
                  height: 54,
                  borderRadius: 14,
                  background: "#2563eb",
                  color: "#ffffff",
                }}
              >
                A
              </div>
              AltFTool Blog
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                border: "1px solid #cbd5e1",
                borderRadius: 999,
                padding: "10px 18px",
                fontSize: 22,
                fontWeight: 700,
                color: "#2563eb",
              }}
            >
              {category}
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <div
              style={{
                display: "flex",
                width: 92,
                height: 6,
                borderRadius: 999,
                background: "#2563eb",
              }}
            />
            <div
              style={{
                display: "flex",
                fontSize: 68,
                lineHeight: 1.04,
                fontWeight: 900,
                letterSpacing: 0,
                maxWidth: 900,
              }}
            >
              {title}
            </div>
            <div
              style={{
                display: "flex",
                fontSize: 27,
                lineHeight: 1.35,
                color: "#475569",
                maxWidth: 880,
              }}
            >
              {description}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: 24,
              color: "#64748b",
            }}
          >
            <div style={{ display: "flex", gap: 14 }}>
              <span>{readTime}</span>
              <span>altftool.com</span>
            </div>
            <div style={{ display: "flex", color: "#2563eb", fontWeight: 800 }}>
              Free tools, smarter workflows
            </div>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
