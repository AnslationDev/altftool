"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/Dialog";
import { Switch } from "@/shared/ui/Switch";
import { Button } from "@/shared/ui/Button";
import { useState } from "react";
import { useCookieConsent } from "./CookieConsentContext";

export const CookiePreferencesModal = ({ open, onClose }) => {
  const { consent, saveConsent } = useCookieConsent();

  const [state, setState] = useState({
    analytics: consent?.analytics ?? false,
    marketing: consent?.marketing ?? false,
    preferences: consent?.preferences ?? false,
  });

  const save = () => {
    saveConsent({ necessary: true, ...state });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cookie Preferences</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Row label="Necessary" checked disabled />
          <Row
            label="Analytics"
            checked={state.analytics}
            onChange={(v) => setState(s => ({ ...s, analytics: v }))}
          />
          <Row
            label="Marketing"
            checked={state.marketing}
            onChange={(v) => setState(s => ({ ...s, marketing: v }))}
          />
          <Row
            label="Preferences"
            checked={state.preferences}
            onChange={(v) => setState(s => ({ ...s, preferences: v }))}
          />
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={save}>Save</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const Row = ({ label, checked, onChange, disabled }) => (
  <div className="flex items-center justify-between">
    <span className="text-sm">{label}</span>
    <Switch
      checked={checked}
      disabled={disabled}
      onCheckedChange={onChange ?? (() => {})}
    />
  </div>
);
