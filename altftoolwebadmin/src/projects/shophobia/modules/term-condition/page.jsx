"use client";

import { Handshake } from "lucide-react";
import { LegalDocPage } from "../policy/page";
import { DEFAULT_TERMS, saveTerms, subscribeTerms } from "./service/terms.service";

export default function ShophobiaTermConditionPage() {
  return (
    <LegalDocPage
      icon={Handshake}
      title="Shophobia Terms & Conditions"
      subtitle="Manage the terms title, last-updated date, and sections."
      successLabel="Terms & conditions"
      defaults={DEFAULT_TERMS}
      subscribe={subscribeTerms}
      save={saveTerms}
    />
  );
}
