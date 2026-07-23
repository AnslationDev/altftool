"use client";

import { Handshake } from "lucide-react";
import { LegalDocPage } from "../policy/page";
import { DEFAULT_TERMS, saveTerms, subscribeTerms } from "./service/terms.service";

export default function ThestylelifeTermConditionPage() {
  return (
    <LegalDocPage
      icon={Handshake}
      title="TheStyleLife Terms & Conditions"
      subtitle="Manage the terms title, subcopy, and sections."
      successLabel="Terms & conditions"
      defaults={DEFAULT_TERMS}
      subscribe={subscribeTerms}
      save={saveTerms}
    />
  );
}
