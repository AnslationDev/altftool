import "./rabbithole.css";

/**
 * Advertises the module's feed to readers and crawlers. Without this the RSS
 * route exists but nothing links to it, so nothing finds it.
 */
export const metadata = {
  alternates: {
    types: {
      "application/rss+xml": [
        { url: "/rabbithole/feed.xml", title: "AltF Rabbithole" },
      ],
    },
  },
};

export default function RabbitholeLayout({ children }) {
  return children;
}
