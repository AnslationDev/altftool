import { getAllTools, getStudentFriendlyTools } from "../../data/tools";
import ToolWallColumn from "./ToolWallColumn";

const COLUMN_KEYS = [
  [
    ["ChatGPT", "chatgpt.com"],
    ["Claude", "claude.ai"],
    ["Midjourney", "midjourney.com"],
    ["Cursor", "cursor.com"],
    ["GitHub Copilot", "github.com"],
    ["Suno", "suno.com"],
    ["ElevenLabs", "elevenlabs.io"],
    ["Notion AI", "notion.so"],
  ],
  [
    ["Ideogram", "ideogram.ai"],
    ["Gamma", "gamma.app"],
    ["HeyGen", "heygen.com"],
    ["DeepL", "deepl.com"],
    ["Runway", "runwayml.com"],
    ["Canva AI", "canva.com"],
    ["Framer AI", "framer.com"],
    ["Perplexity", "perplexity.ai"],
  ],
  [
    ["Leonardo AI", "leonardo.ai"],
    ["Otter.ai", "otter.ai"],
    ["Zapier AI", "zapier.com"],
    ["Khanmigo", "khanmigo.ai"],
    ["Duolingo Max", "duolingo.com"],
    ["Photomath", "photomath.com"],
    ["Fathom", "fathom.video"],
    ["Microsoft Copilot", "copilot.microsoft.com"],
  ],
];

const DURATIONS = [34, 40, 27];
const REVERSE = [false, true, false];

function deriveStatus(tool, studentKeys) {
  if (studentKeys.has(`${tool.name}|${tool.domain}`)) return "STUDENT FREE";
  if (tool.pricing === "PAID") return "SUBSCRIPTION";
  if (tool.dealType === "Free Trial") return "TRIAL";
  return "FREE PLAN";
}

/** Right-side hero visual: three columns of real tool cards, each looping in a seamless vertical marquee. */
export default function HeroToolWall() {
  const catalog = getAllTools();
  const studentKeys = new Set(getStudentFriendlyTools().map((tool) => `${tool.name}|${tool.domain}`));

  const columns = COLUMN_KEYS.map((keys) =>
    keys
      .map(([name, domain]) => catalog.find((item) => item.name === name && item.domain === domain))
      .filter(Boolean)
      .map((tool) => ({ ...tool, status: deriveStatus(tool, studentKeys) })),
  );

  return (
    <div className="aib-marquee-mask relative mx-auto h-[420px] w-full max-w-md sm:h-[480px] lg:h-[560px] lg:max-w-none">
      <div className="grid h-full grid-cols-3 gap-3">
        {columns.map((items, index) => (
          <ToolWallColumn key={index} items={items} duration={DURATIONS[index]} reverse={REVERSE[index]} />
        ))}
      </div>
    </div>
  );
}
