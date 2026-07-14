"use client";

import React from "react";
import ContactsTab from "../editor/components/ContactsTab";
import AlphobiaModuleLayout from "../../components/AlphobiaModuleLayout";

export default function ContactsPage() {
  return (
    <AlphobiaModuleLayout
      title="Contacts & Leads"
      subtitle="View and manage all incoming contact form submissions from the Alphobia website."
    >
      <ContactsTab />
    </AlphobiaModuleLayout>
  );
}
