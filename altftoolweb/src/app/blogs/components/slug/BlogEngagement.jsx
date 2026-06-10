"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  addDoc,
  collection,
  doc,
  getDocs,
  increment,
  limit,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "@/lib/firebase";
import { incrementUniqueView } from "../../context/views.service";
import BlogActions from "./BlogActions";
import BlogComments from "./BlogComments";

const PROJECT_ID = "altftool";
const EngagementContext = createContext(null);

const blogsCol = () => collection(db, "projects", PROJECT_ID, "blogs");
const commentsCol = (blogId) => collection(db, "projects", PROJECT_ID, "blogs", blogId, "comments");

function createLocalComment(text) {
  return {
    text,
    createdAt: { seconds: Date.now() / 1000 },
  };
}

function withTimeout(promise, timeoutMs, fallbackValue) {
  return Promise.race([
    promise,
    new Promise((resolve) => {
      window.setTimeout(() => resolve(fallbackValue), timeoutMs);
    }),
  ]);
}

function useEngagement() {
  const context = useContext(EngagementContext);
  if (!context) {
    throw new Error("Blog engagement components must be rendered inside BlogEngagementProvider.");
  }
  return context;
}

export function BlogEngagementProvider({ blog, children }) {
  const blogId = typeof blog?.id === "string" ? blog.id : "";
  const [likes, setLikes] = useState(Number(blog?.likesCount || 0));
  const [liked, setLiked] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentsLoaded, setCommentsLoaded] = useState(false);
  const [commentsLoading, setCommentsLoading] = useState(Boolean(blogId && isFirebaseConfigured));
  const [commentStatus, setCommentStatus] = useState("");
  const [showCommentBox, setShowCommentBox] = useState(false);

  const initialCommentsCount = Number(blog?.commentsCount || 0);

  const loadComments = useCallback(async () => {
    if (!blogId || !isFirebaseConfigured) {
      setCommentsLoading(false);
      setCommentsLoaded(true);
      return;
    }

    setCommentsLoading(true);
    try {
      const snap = await withTimeout(
        getDocs(query(commentsCol(blogId), orderBy("createdAt", "desc"), limit(20))),
        3200,
        null,
      );

      if (snap) {
        setComments(snap.docs.map((item) => ({ id: item.id, ...item.data() })));
      }
    } catch (error) {
      console.warn("Unable to load blog comments:", error?.message || error);
      setCommentStatus("Discussion could not refresh. You can still add a local note.");
      window.setTimeout(() => setCommentStatus(""), 3600);
    } finally {
      setCommentsLoaded(true);
      setCommentsLoading(false);
    }
  }, [blogId]);

  useEffect(() => {
    if (!blogId || !isFirebaseConfigured) {
      setCommentsLoading(false);
      return;
    }

    const schedule = window.requestIdleCallback || ((callback) => window.setTimeout(callback, 600));
    const cancel = window.cancelIdleCallback || window.clearTimeout;
    const handle = schedule(() => {
      incrementUniqueView(blogId);
      loadComments();
    });

    return () => cancel(handle);
  }, [blogId, loadComments]);

  const addComment = useCallback(async (text) => {
    const cleanedText = text?.trim();
    if (!cleanedText) return false;

    if (!blogId || !isFirebaseConfigured) {
      setComments((prev) => [
        createLocalComment(cleanedText),
        ...prev,
      ]);
      setCommentsLoaded(true);
      setCommentStatus("Saved locally for this session.");
      window.setTimeout(() => setCommentStatus(""), 2200);
      return true;
    }

    setCommentStatus("Posting...");
    try {
      await addDoc(commentsCol(blogId), {
        text: cleanedText,
        createdAt: serverTimestamp(),
      });
      await updateDoc(doc(blogsCol(), blogId), {
        commentsCount: increment(1),
      });
      setComments((prev) => [
        createLocalComment(cleanedText),
        ...prev,
      ]);
      setCommentsLoaded(true);
      setCommentStatus("Comment posted.");
      window.setTimeout(() => setCommentStatus(""), 2200);
      return true;
    } catch (error) {
      console.warn("Unable to sync blog comment:", error?.message || error);
      setComments((prev) => [
        createLocalComment(cleanedText),
        ...prev,
      ]);
      setCommentsLoaded(true);
      setCommentStatus("Could not sync yet. Saved locally for this session.");
      window.setTimeout(() => setCommentStatus(""), 3600);
      return true;
    }
  }, [blogId]);

  const value = useMemo(() => ({
    blog,
    liked,
    likes,
    setLiked,
    setLikes,
    comments,
    commentsCount: commentsLoaded ? comments.length : initialCommentsCount,
    commentsLoaded,
    commentsLoading,
    commentStatus,
    showCommentBox,
    setShowCommentBox,
    addComment,
  }), [
    addComment,
    blog,
    commentStatus,
    comments,
    commentsLoaded,
    commentsLoading,
    initialCommentsCount,
    liked,
    likes,
    showCommentBox,
  ]);

  return (
    <EngagementContext.Provider value={value}>
      {children}
    </EngagementContext.Provider>
  );
}

export function BlogEngagementActions() {
  const {
    blog,
    liked,
    likes,
    setLiked,
    setLikes,
    commentsCount,
    showCommentBox,
    setShowCommentBox,
  } = useEngagement();

  return (
    <BlogActions
      likes={likes}
      blogId={blog?.id}
      setLikes={setLikes}
      liked={liked}
      setLiked={setLiked}
      commentsCount={commentsCount}
      showCommentBox={showCommentBox}
      setShowCommentBox={setShowCommentBox}
      date={blog?.date}
      author={blog?.author}
    />
  );
}

export function BlogEngagementComments() {
  const {
    addComment,
    blog,
    comments,
    commentsCount,
    commentsLoaded,
    commentsLoading,
    commentStatus,
    showCommentBox,
    setShowCommentBox,
  } = useEngagement();

  return (
    <BlogComments
      comments={comments}
      commentsCount={commentsCount}
      commentsLoaded={commentsLoaded}
      isLoading={commentsLoading}
      status={commentStatus}
      addComment={addComment}
      draftKey={blog?.slug || blog?.id || ""}
      showCommentBox={showCommentBox}
      setShowCommentBox={setShowCommentBox}
    />
  );
}
