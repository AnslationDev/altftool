"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/*
 * The expand control.
 *
 * The floor carries a lot of detail — faces, cabin partitions, pod meters, work
 * moving between teams — and at hero size most of it is below the threshold
 * where anyone can see it. This gives the scene a full-screen view where it is
 * actually legible.
 *
 * WHY <dialog> AND NOT A DIV
 * The native element brings the modal behaviours for free and gets them right:
 * Escape closes, focus is moved in and restored on close, the rest of the page
 * is inert, and the ::backdrop is a real layer rather than a fixed div fighting
 * z-index with the header. Re-implementing that on a <div> is how modals end up
 * trapping keyboard users.
 *
 * This is the only client component in the whole scene. Everything it opens is
 * still server-rendered markup passed in as children, so expanding costs no
 * extra request and no second copy of the floor.
 */

export default function FloorViewer({ children, label = "Expand the floor" }) {
  const ref = useRef(null);
  const [open, setOpen] = useState(false);

  const close = useCallback(() => {
    ref.current?.close();
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const onClose = () => setOpen(false);
    el.addEventListener("close", onClose);
    return () => el.removeEventListener("close", onClose);
  }, []);

  return (
    <>
      <button
        type="button"
        className="fl-expand"
        onClick={() => {
          ref.current?.showModal();
          setOpen(true);
        }}
      >
        <span aria-hidden="true">⤢</span>
        {label}
      </button>

      <dialog ref={ref} className="fl-modal" aria-label="The AltFTool floor, full size">
        <div className="fl-modal__inner">
          <button type="button" className="fl-modal__close" onClick={close}>
            Close
            <span aria-hidden="true">✕</span>
          </button>
          {/* Only mounted while open: the scene is a few hundred animated
              elements, and running a second copy of them behind a closed dialog
              is work the compositor does not need to do. */}
          {open ? children : null}
        </div>
      </dialog>
    </>
  );
}
