import { ImageResponse } from "next/og";
import { getBlogBySlug, getBlogFreshness, stripHtml } from "../data";
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

function formatDate(value) {
  if (!value) return "Recently updated";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Recently updated";

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
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
  const author = trimText(blog?.author || "AltFTool Editorial", 34);
  const date = formatDate(blog?.updatedAt || blog?.date || blog?.createdAt);
  const freshness = getBlogFreshness(blog || {});
  const tags = Array.isArray(blog?.tags)
    ? blog.tags.filter(Boolean).slice(0, 3)
    : [];
  const titleFontSize = title.length > 70 ? 52 : title.length > 52 ? 58 : 64;

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          background: "#eef6ff",
          color: "#0f172a",
          fontFamily: "Arial",
          padding: 48,
        }}
      >
        <div
          style={{
            display: "flex",
            width: "100%",
            height: "100%",
            border: "1px solid #c9d9ef",
            borderRadius: 30,
            background: "#ffffff",
            overflow: "hidden",
            boxShadow: "0 28px 80px rgba(15, 23, 42, 0.16)",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              width: 322,
              height: "100%",
              background: "#0f172a",
              color: "#ffffff",
              padding: 38,
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  fontSize: 24,
                  fontWeight: 900,
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
                    background: "#38bdf8",
                    color: "#0f172a",
                  }}
                >
                  A
                </div>
                AltFTool
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div
                  style={{
                    display: "flex",
                    width: "100%",
                    border: "1px solid rgba(255,255,255,0.18)",
                    borderRadius: 16,
                    padding: "14px 16px",
                    fontSize: 22,
                    fontWeight: 800,
                    color: "#bae6fd",
                  }}
                >
                  {category}
                </div>
                <div
                  style={{
                    display: "flex",
                    width: "100%",
                    border: "1px solid rgba(255,255,255,0.18)",
                    borderRadius: 16,
                    padding: "14px 16px",
                    fontSize: 20,
                    fontWeight: 700,
                    color: "#e2e8f0",
                  }}
                >
                  {freshness.label}
                </div>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12, fontSize: 20, color: "#cbd5e1" }}>
              <div style={{ display: "flex" }}>{author}</div>
              <div style={{ display: "flex" }}>{date}</div>
              <div style={{ display: "flex", color: "#ffffff", fontWeight: 800 }}>{readTime}</div>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              flex: 1,
              padding: 46,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  border: "1px solid #bfdbfe",
                  borderRadius: 999,
                  padding: "10px 18px",
                  fontSize: 20,
                  fontWeight: 800,
                  color: "#1d4ed8",
                  background: "#eff6ff",
                }}
              >
                Practical guide
              </div>
              <div style={{ display: "flex", fontSize: 22, fontWeight: 800, color: "#0f172a" }}>
                altftool.com
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              <div
                style={{
                  display: "flex",
                  width: 112,
                  height: 6,
                  borderRadius: 999,
                  background: "#38bdf8",
                }}
              />
              <div
                style={{
                  display: "flex",
                  fontSize: titleFontSize,
                  lineHeight: 1.02,
                  fontWeight: 900,
                  letterSpacing: 0,
                  maxWidth: 760,
                }}
              >
                {title}
              </div>
              <div
                style={{
                  display: "flex",
                  fontSize: 27,
                  lineHeight: 1.34,
                  color: "#475569",
                  maxWidth: 760,
                }}
              >
                {description}
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 18 }}>
              <div style={{ display: "flex", gap: 10 }}>
                {(tags.length ? tags : [category, "Tools"]).slice(0, 3).map((tag) => (
                  <div
                    key={tag}
                    style={{
                      display: "flex",
                      border: "1px solid #dbe3ef",
                      borderRadius: 999,
                      padding: "9px 14px",
                      fontSize: 18,
                      fontWeight: 700,
                      color: "#475569",
                    }}
                  >
                    {trimText(tag, 24)}
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", color: "#1d4ed8", fontSize: 22, fontWeight: 900 }}>
                Free tools, smarter workflows
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
