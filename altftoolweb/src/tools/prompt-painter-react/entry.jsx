import Page from "./pages/Index";
import config from "./tool.config";

export { config };

// Wrapped so the tool's palette can live on this element instead of on body —
// a tool stylesheet stays attached after the visitor navigates away, so a bare
// body rule repainted every later page.
export default function ToolEntry(props) {
  return (
    <div className="ppr-scope">
      <Page {...props} />
    </div>
  );
}
