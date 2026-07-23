"use client";

import { useEffect, useMemo, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db, isFirebaseConfigured } from "@/lib/firebase";
import { HOME_DOC_PATH, fetchHomeContent } from "@/app/bops/tripfindbox/lib/homeContent";
import {
  contactFromHomeContent,
  DEFAULT_TRIPFINDBOX_CONTACT,
  telHref,
} from "@/app/bops/tripfindbox/lib/contactInfo";

function normalizeContact(contact) {
  return {
    ...DEFAULT_TRIPFINDBOX_CONTACT,
    ...(contact || {}),
  };
}

export function useTripFindBoxContactInfo(initialContact) {
  const [contact, setContact] = useState(() => normalizeContact(initialContact));

  useEffect(() => {
    let active = true;
    let unsubscribe = null;

    const applyContent = (content) => {
      if (active) setContact(contactFromHomeContent(content));
    };

    const refreshFromRest = () => {
      fetchHomeContent()
        .then(applyContent)
        .catch(() => {});
    };

    refreshFromRest();

    if (isFirebaseConfigured) {
      try {
        unsubscribe = onSnapshot(
          doc(db, ...HOME_DOC_PATH),
          (snapshot) => {
            if (snapshot.exists()) {
              applyContent(snapshot.data());
            }
          },
          refreshFromRest,
        );
      } catch {
        refreshFromRest();
      }
    }

    return () => {
      active = false;
      if (unsubscribe) unsubscribe();
    };
  }, []);

  return useMemo(
    () => ({
      ...contact,
      href: telHref(contact.phone),
    }),
    [contact],
  );
}
