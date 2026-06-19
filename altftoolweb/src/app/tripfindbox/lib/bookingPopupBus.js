"use client";

import { useEffect } from "react";

const BOOKING_POPUP_EVENT = "tripnest-booking-popup-open";
const BODY_CLASS = "booking-popup-active";
const CLOSE_ALL_ID = "__tripnest_close_all__";

export function announceBookingPopupOpen(id) {
  window.dispatchEvent(new CustomEvent(BOOKING_POPUP_EVENT, { detail: { id } }));
}

export function closeAllBookingPopups() {
  window.dispatchEvent(new CustomEvent(BOOKING_POPUP_EVENT, { detail: { id: CLOSE_ALL_ID } }));
}

export function useBookingPopupCoordinator(id, open, close) {
  useEffect(() => {
    const handleOpen = (event) => {
      const nextId = event.detail?.id;
      if (nextId === CLOSE_ALL_ID || (nextId && nextId !== id)) {
        close();
      }
    };

    window.addEventListener(BOOKING_POPUP_EVENT, handleOpen);
    return () => window.removeEventListener(BOOKING_POPUP_EVENT, handleOpen);
  }, [close, id]);

  useEffect(() => {
    document.body.classList.toggle(BODY_CLASS, open);
    return () => {
      if (open) document.body.classList.remove(BODY_CLASS);
    };
  }, [open]);
}
