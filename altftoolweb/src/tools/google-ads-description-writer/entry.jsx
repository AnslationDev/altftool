import Page from "./App";
import config from "./tool.config";

export { config };

// Wrapped so this tool's palette lives here rather than on `body` — a tool
// stylesheet stays attached after the visitor navigates away.
export default function ToolEntry(props) {
  return (
    <div className="gadw-scope">
      <Page {...props} />
    </div>
  );
}
