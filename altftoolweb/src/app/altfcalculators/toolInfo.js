// Detailed per-tool info content (rendered by <ToolInfo/> on each tool page).
// Merged from per-category info files. Auto-generated import surface.
import u0 from "./info/finance-a";
import u1 from "./info/finance-b";
import u2 from "./info/finance-c";
import u3 from "./info/health";
import u4 from "./info/math-a";
import u5 from "./info/math-b";
import u6 from "./info/datetime";
import u7 from "./info/education";
import u8 from "./info/conversion";
import u9 from "./info/developer";
import u10 from "./info/construction";
import u11 from "./info/engineering";
import u12 from "./info/automobile";
import u13 from "./info/weather";
import u14 from "./info/fun";

export const TOOL_INFO = { ...u0, ...u1, ...u2, ...u3, ...u4, ...u5, ...u6, ...u7, ...u8, ...u9, ...u10, ...u11, ...u12, ...u13, ...u14 };

export const getToolInfo = (slug) => TOOL_INFO[slug] || null;
