import { useCallback, useEffect, useState } from "react";
export function useKeyboardControls({
  onNext, onPrev, onTogglePause, onToggleMute,
}) {
  useEffect(() => {
    const handler = (e) => {
    
      if (["INPUT","TEXTAREA"].includes((e.target ).tagName)) return;
      switch (e.key) {
        case "ArrowDown": e.preventDefault(); onNext(); break;
        case "ArrowUp":  e.preventDefault(); onPrev(); break;
        case " ":        e.preventDefault(); onTogglePause(); break;  
        case "Tab":      e.preventDefault(); onTogglePause(); break;  
        case "m":
        case "M":        onToggleMute(); break;
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onNext, onPrev, onTogglePause, onToggleMute]);
}







export function useLikeComment(initialCounts) {
  const [state, setState] = useState(initialCounts);

  const toggleLike = useCallback((id) => {
    setState(prev => {
      const cur = prev[id];
      return {
        ...prev,
        [id]: { ...cur, likes: cur.liked ? cur.likes - 1 : cur.likes + 1, liked: !cur.liked },
      } ;
    });
  }, []);

  const toggleSave = useCallback((id) => {
    setState(prev => ({
      ...prev,
      [id]: { ...prev[id], saved: !prev[id].saved },
    }));
  }, []);

  const addComment = useCallback((id, text) => {
    const comment = {
      id: Date.now().toString(),
      text,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
   setState(prev => {
    const item = prev[id] ?? {};  

    return {
      ...prev,
      [id]: {
        ...item,
        comments: [...(item.comments ?? []), comment],
      },
    };
  });

  return comment;
}, []);

  return { state, toggleLike, toggleSave, addComment };
}