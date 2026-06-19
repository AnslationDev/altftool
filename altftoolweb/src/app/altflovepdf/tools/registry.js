if (typeof window !== "undefined" && typeof Promise.withResolvers === "undefined") {
  Promise.withResolvers = function () {
    let resolve, reject;
    const promise = new Promise((res, rej) => {
      resolve = res;
      reject = rej;
    });
    return { promise, resolve, reject };
  };
}

import dynamic from "next/dynamic";

export const ToolRegistry = {
  "merge-pdf": dynamic(() => import("./merge-pdf"), { ssr: false }),
  "split-pdf": dynamic(() => import("./split-pdf"), { ssr: false }),
  "rotate-pdf": dynamic(() => import("./rotate-pdf"), { ssr: false }),
  "organize-pdf": dynamic(() => import("./organize-pdf"), { ssr: false }),
  "crop-pdf": dynamic(() => import("./crop-pdf"), { ssr: false }),
  "insert-blank-pages": dynamic(() => import("./insert-blank-pages"), { ssr: false }),
  "image-to-pdf": dynamic(() => import("./image-to-pdf"), { ssr: false }),
  "pdf-to-image": dynamic(() => import("./pdf-to-image"), { ssr: false }),
  "pdf-to-text": dynamic(() => import("./pdf-to-text"), { ssr: false }),
  "extract-images": dynamic(() => import("./extract-images"), { ssr: false }),
  "webpage-to-pdf": dynamic(() => import("./webpage-to-pdf"), { ssr: false }),
  "grayscale-pdf": dynamic(() => import("./grayscale-pdf"), { ssr: false }),
  "compress-pdf": dynamic(() => import("./compress-pdf"), { ssr: false }),
  "page-numbers": dynamic(() => import("./page-numbers"), { ssr: false }),
  "header-footer": dynamic(() => import("./header-footer"), { ssr: false }),
  "watermark-pdf": dynamic(() => import("./watermark-pdf"), { ssr: false }),
  "redact-pdf": dynamic(() => import("./redact-pdf"), { ssr: false }),
  "edit-metadata": dynamic(() => import("./edit-metadata"), { ssr: false }),
  "protect-pdf": dynamic(() => import("./protect-pdf"), { ssr: false }),
  "unlock-pdf": dynamic(() => import("./unlock-pdf"), { ssr: false }),
  "flatten-pdf": dynamic(() => import("./flatten-pdf"), { ssr: false }),
  "pdf-info": dynamic(() => import("./pdf-info"), { ssr: false }),
  "image-resizer": dynamic(() => import("./image-resizer"), { ssr: false }),
  "image-compress": dynamic(() => import("./image-compress"), { ssr: false }),
  "image-crop": dynamic(() => import("./image-crop"), { ssr: false }),
  "rotate-image": dynamic(() => import("./rotate-image"), { ssr: false }),
  "remove-background": dynamic(() => import("./remove-background"), { ssr: false }),
  "meme-generator": dynamic(() => import("./meme-generator"), { ssr: false }),
  "exif-remover": dynamic(() => import("./exif-remover"), { ssr: false }),
  "format-convert": dynamic(() => import("./format-convert"), { ssr: false }),
  "pdf-preview": dynamic(() => import("./pdf-preview"), { ssr: false }),
  "html-to-pdf": dynamic(() => import("./html-to-pdf"), { ssr: false }),
  "batch-process": dynamic(() => import("./batch-process"), { ssr: false }),
  "sign-pdf": dynamic(() => import("./sign-pdf"), { ssr: false }),
  "compare-pdf": dynamic(() => import("./compare-pdf"), { ssr: false }),
  "repair-pdf": dynamic(() => import("./repair-pdf"), { ssr: false }),
  "pdf-to-excel": dynamic(() => import("./pdf-to-excel"), { ssr: false }),
  "pdf-to-word": dynamic(() => import("./pdf-to-word"), { ssr: false }),
};
