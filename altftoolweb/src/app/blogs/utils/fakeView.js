



export function getDisplayViews(blogId, realViews) {
  if (typeof window === "undefined") return realViews;

  if (realViews >= 500) return realViews;

  const key = `base_views_${blogId}`;

  let baseViews = localStorage.getItem(key);

  if (!baseViews) {
    baseViews = Math.floor(Math.random() * 301) + 150;
    localStorage.setItem(key, baseViews);
  }

  return Number(baseViews) + Number(realViews);
}




// Fake Reading Timing Of blogs page 


export function readTime(blogId, excerpt = "") {
  if (typeof window === "undefined") return "5 min";

  const baseTime = Math.max(2, Math.ceil(excerpt.split(" ").length / 200));

  const key = `read_time_${blogId}`;
  let extra = localStorage.getItem(key);

  if (!extra) {
    extra = Math.floor(Math.random() * 3);
    localStorage.setItem(key, extra);
  }

  return `${baseTime + Number(extra)} min`;
}



//  Formated Date of Blogs Uploaded date



export function formatDate(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}




// blogs category styles. 




export const CATEGORY_STYLES = {
  Extensions: "bg-blue-600",
  Design: "bg-sky-600",
  Performance: "bg-indigo-600",
  Tutorials: "bg-cyan-600",
  default: "bg-blue-700",
};