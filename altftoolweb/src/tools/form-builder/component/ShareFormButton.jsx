import React from "react";
import { Button } from "@/shared/ui/Button";
import { encodeForm } from "../utils/shareForm";

  const ShareFormButton = ({
  formFields,
  formTitle,
  formDescription,
  theme,
}) => {
  const handleShare = async () => {
    if (!formFields || formFields.length === 0) {
      alert("Add at least 1 field before sharing!");
      return;
    }

    const formData = {
      formFields,
      formTitle,
      formDescription,
      theme,
    };


    const encoded = encodeForm(formData);

    if (!encoded) {
      alert("Error generating link");
      return;
    }

    const link = `${window.location.origin}${window.location.pathname}?data=${encodeURIComponent(encoded)}`;

    console.log("SHARE LINK:", link);

    // ✅ Native Share
    if (navigator.share) {
      try {
        await navigator.share({
          title: formTitle || "Custom Form",
          text: "Check this form",
          url: link,
        });
        return;
      } catch (err) {
        console.log("Share cancelled");
      }
    }

    // ✅ Clipboard
    try {
      await navigator.clipboard.writeText(link);
      alert("Link copied!\n" + link);
    } catch (err) {
      console.log("Clipboard fallback");

      const input = document.createElement("input");
      input.value = link;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);

      alert("Link copied!\n" + link);
    }
  };

  return <Button onClick={handleShare}>Share</Button>;
};

export default ShareFormButton;