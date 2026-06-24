"use client";

import { useEffect, useMemo, useState } from "react";
import { fetchHomeContent } from "@/app/tripfindbox/lib/homeContent";
import {
  contactFromHomeContent,
  DEFAULT_TRIPFINDBOX_CONTACT,
  telHref,
} from "@/app/tripfindbox/lib/contactInfo";

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

    fetchHomeContent()
      .then((content) => {
        if (active) {
          setContact(contactFromHomeContent(content));
        }
      })
      .catch(() => {});

    return () => {
      active = false;
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
