import { ADSENSE_SCRIPT_SRC } from "./adsenseConfig";

export default function ProductionAdSenseScript({ enabled = false }) {
  if (!enabled) return null;

  return (
    <script
      id="google-adsense-loader"
      src={ADSENSE_SCRIPT_SRC}
      async
      crossOrigin="anonymous"
    />
  );
}
