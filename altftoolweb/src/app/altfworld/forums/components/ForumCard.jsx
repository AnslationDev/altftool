import Link from "next/link";
import { motion } from "framer-motion";
import { formatCompactNumber } from "../utils/forumUtils";

export default function ForumCard({ thread, index }) {
  return (
    <motion.article className="forum-module-card" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.035 }}>
      <span className={`avatar-orbit ${thread.tone}`}>{thread.initials}</span>
      <div>
        <div className="forum-card-tags"><span>{thread.tag}</span>{thread.pinned && <b>PINNED</b>}</div>
        <Link href={`/altfworld/forums/${thread.categorySlug}/general/${thread.slug}`}>{thread.title}</Link>
        <p>{thread.excerpt}</p>
        <small>by <strong>{thread.author}</strong> · {thread.category}</small>
      </div>
      <div className="forum-card-metrics"><span><b>{formatCompactNumber(thread.replies)}</b> replies</span><span><b>{formatCompactNumber(thread.views)}</b> views</span><time>{thread.lastReply}</time></div>
    </motion.article>
  );
}
