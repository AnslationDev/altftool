import { useState } from "react";
import { Modal, Button } from "@altftool/ui";
import { Share2, Link, Download, Twitter, Facebook, Check } from "lucide-react";
import { downloadJSON } from "../utils/helpers";

export default function ShareDialog({ open, onClose, entries }) {
  const [copied, setCopied] = useState(false);

  const shareData = { entries };
  const shareUrl = typeof window !== "undefined" ? window.location.href : "";

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  const handleExport = () => {
    downloadJSON(shareData, `decision-wheel-${Date.now()}.json`);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: "Decision Wheel", text: `Check out my decision wheel with ${entries.length} entries!`, url: shareUrl });
      } catch {}
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Share Wheel" size="sm">
      <div className="space-y-3">
        <Button variant="secondary" className="w-full justify-start" onClick={handleCopyLink}>
          {copied ? <Check size="16" className="text-(--primary)" /> : <Link size="16" />}
          {copied ? "Copied!" : "Copy Link"}
        </Button>
        <Button variant="secondary" className="w-full justify-start" onClick={handleExport}>
          <Download size="16" /> Export JSON
        </Button>
        {typeof navigator !== "undefined" && navigator.share && (
          <Button variant="secondary" className="w-full justify-start" onClick={handleShare}>
            <Share2 size="16" /> Share via OS
          </Button>
        )}
      </div>
    </Modal>
  );
}
