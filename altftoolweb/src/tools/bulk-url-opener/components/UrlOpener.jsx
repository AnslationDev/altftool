// "use client";
// import React, { useState } from "react";

// export default function UrlOpener() {
//   const [urls, setUrls] = useState("");
//   const [invalidUrls, setInvalidUrls] = useState([]);

//   const privacyFeatures = [
//     "No tracking",
//     "No cookies",
//     "Frontend-only",
//     "Safe & private",
//   ];

//   const handleCheckAndOpen = () => {
//     setInvalidUrls([]);
//     const list = urls
//       .split("\n")
//       .map((u) => u.trim())
//       .filter((u) => u);

//     const invalid = [];
//     let delay = 0;

//     list.forEach((url) => {
//       let checkUrl = /^https?:\/\//i.test(url) ? url : "https://" + url;

//       try {
//         new URL(checkUrl);
//         setTimeout(() => {
//           window.open(checkUrl, "_blank", "noopener,noreferrer");
//         }, delay);
//         delay += 200;
//       } catch {
//         invalid.push(url);
//       }
//     });

//     setInvalidUrls(invalid);
//   };

//   return (
//     <div className="bg-(--background) text-(--foreground) px-2 py-8">
//       {/*  Main Tool Card */}
//       <div className="w-full max-w-4xl mx-auto bg-(--card) border border-(--border) rounded-3xl shadow-lg p-4">
//         <h1 className="subheading text-center mb-6 md:text-3xl lg:text-4xl"> Open Multiple Links at Once</h1>

//         {/* Textarea */}
//         <textarea
//           className="
//             w-full h-44 resize-y rounded-xl
//             bg-(--background)
//             border border-(--border)
//             p-5 text-sm
//             text-(--foreground)
//             placeholder:text-(--muted-foreground)
//             focus:outline-none
//             focus:ring-1 focus:ring-(--primary)
//             focus:border-(--primary)
//             transition-all
//           "
//           placeholder="Paste multiple URLs here (one per line)…"
//           value={urls}
//           onChange={(e) => setUrls(e.target.value)}
//         />

//         {/* Button */}
//         <button
//           onClick={handleCheckAndOpen}
//           className="
//             mt-5 w-full py-3 rounded-xl
//             bg-(--primary) text-(--primary-foreground)
//             font-semibold
//             hover:opacity-90
//             active:scale-[0.98]
//             transition-all cursor-pointer
//           "
//         >
//           Open Valid URLs
//         </button>

//         {/* Invalid URLs */}
//         {invalidUrls.length > 0 && (
//           <div className="mt-6">
//             <h2 className="font-semibold mb-3 text-red-500">
//               Invalid URLs ({invalidUrls.length})
//             </h2>
//             <div className="space-y-2">
//               {invalidUrls.map((url, i) => (
//                 <div
//                   key={i}
//                   className="
//                     bg-red-500/10
//                     text-red-500
//                     px-3 py-2 rounded-lg
//                     truncate text-sm
//                   "
//                 >
//                   {url}
//                 </div>
//               ))}
//             </div>
//           </div>
//         )}
//       </div>

//       {/* Privacy Section */}
//       <div className="w-full max-w-4xl mx-auto mt-20 text-center">
//         <h2 className="heading md:text-4xl mb-6 text-(--foreground)">
//           Privacy & Data Safety
//         </h2>

//         <p className="description mb-10 max-w-2xl mx-auto">
//           This tool works entirely in your browser. Your URLs are never sent
//           anywhere.
//         </p>

//         {/* Privacy Feature Cards */}
//         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
//           {privacyFeatures.map((feature, idx) => (
//             <div
//               key={idx}
//               className="
//                 bg-(--card)
//                 border border-(--border)
//                 p-5 rounded-xl
//                 shadow-sm
//                 hover:shadow-md
//                 transition
//                 font-medium
//                 text-(--foreground)
//               "
//             >
//             <span className="text-(--primary)">✅</span> {feature}
//             </div>
//           ))}
//         </div>

//         <p className="mt-8 text-(--muted-foreground)">
//           Browsers may block multiple tabs for security reasons.
//         </p>
//       </div>
//     </div>
//   );
// }
"use client";
import React, { useState, useRef } from "react";

export default function UrlOpener() {
  const [urls, setUrls] = useState("");
  const [invalidUrls, setInvalidUrls] = useState([]);
  const [openedCount, setOpenedCount] = useState(null);
  const [blocked, setBlocked] = useState(false);
  const formRef = useRef(null);

  const privacyFeatures = [
    "No tracking",
    "No cookies",
    "Frontend-only",
    "Safe & private",
  ];

  const normalizeUrl = (url) => {
    const trimmed = url.trim();
    if (!trimmed) return null;
    return /^https?:\/\//i.test(trimmed) ? trimmed : "https://" + trimmed;
  };

  const isValidUrl = (url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleCheckAndOpen = () => {
    setInvalidUrls([]);
    setOpenedCount(null);
    setBlocked(false);

    const lines = urls
      .split("\n")
      .map((u) => u.trim())
      .filter((u) => u);

    if (lines.length === 0) return;

    const invalid = [];
    const validUrls = [];

    lines.forEach((url) => {
      const normalized = normalizeUrl(url);
      if (normalized && isValidUrl(normalized)) {
        validUrls.push(normalized);
      } else {
        invalid.push(url);
      }
    });

    setInvalidUrls(invalid);

    if (validUrls.length === 0) return;

    // Strategy: open all tabs synchronously within the user gesture.
    // This is the only reliable way to bypass popup blockers.
    let successCount = 0;
    let wasBlocked = false;

    validUrls.forEach((url) => {
      const tab = window.open(url, "_blank", "noopener,noreferrer");
      if (tab) {
        successCount++;
      } else {
        // Popup was blocked by the browser
        wasBlocked = true;
      }
    });

    setOpenedCount(successCount);

    if (wasBlocked) {
      setBlocked(true);
    }
  };

  return (
    <div className="bg-(--background) text-(--foreground) px-2 py-8">
      {/* Main Tool Card */}
      <div className="w-full max-w-4xl mx-auto bg-(--card) border border-(--border) rounded-3xl shadow-lg p-4">
        <h1 className="subheading text-center mb-6 md:text-3xl lg:text-4xl">
          Open Multiple Links at Once
        </h1>

        {/* Textarea */}
        <textarea
          className="
            w-full h-44 resize-y rounded-xl
            bg-(--background)
            border border-(--border)
            p-5 text-sm
            text-(--foreground)
            placeholder:text-(--muted-foreground)
            focus:outline-none
            focus:ring-1 focus:ring-(--primary)
            focus:border-(--primary)
            transition-all
          "
          placeholder="Paste multiple URLs here (one per line)…"
          value={urls}
          onChange={(e) => setUrls(e.target.value)}
        />

        {/* Button */}
        <button
          onClick={handleCheckAndOpen}
          className="
            mt-5 w-full py-3 rounded-xl
            bg-(--primary) text-(--primary-foreground)
            font-semibold
            hover:opacity-90
            active:scale-[0.98]
            transition-all cursor-pointer
          "
        >
          Open Valid URLs
        </button>

        {/* Success feedback */}
        {openedCount !== null && openedCount > 0 && (
          <div className="mt-4 px-3 py-2 rounded-lg bg-green-500/10 text-green-600 text-sm font-medium">
            ✅ Opened {openedCount} tab{openedCount !== 1 ? "s" : ""} successfully.
          </div>
        )}

        {/* Popup blocked warning */}
        {blocked && (
          <div className="mt-3 px-3 py-2 rounded-lg bg-yellow-500/10 text-yellow-600 text-sm">
            ⚠️ Some tabs were blocked by your browser's popup blocker. Please
            allow popups for this site and try again.
          </div>
        )}

        {/* Invalid URLs */}
        {invalidUrls.length > 0 && (
          <div className="mt-6">
            <h2 className="font-semibold mb-3 text-red-500">
              Invalid URLs ({invalidUrls.length})
            </h2>
            <div className="space-y-2">
              {invalidUrls.map((url, i) => (
                <div
                  key={i}
                  className="
                    bg-red-500/10
                    text-red-500
                    px-3 py-2 rounded-lg
                    truncate text-sm
                  "
                >
                  {url}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Privacy Section */}
      <div className="w-full max-w-4xl mx-auto mt-20 text-center">
        <h2 className="heading md:text-4xl mb-6 text-(--foreground)">
          Privacy & Data Safety
        </h2>

        <p className="description mb-10 max-w-2xl mx-auto">
          This tool works entirely in your browser. Your URLs are never sent
          anywhere.
        </p>

        {/* Privacy Feature Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {privacyFeatures.map((feature, idx) => (
            <div
              key={idx}
              className="
                bg-(--card)
                border border-(--border)
                p-5 rounded-xl
                shadow-sm
                hover:shadow-md
                transition
                font-medium
                text-(--foreground)
              "
            >
              <span className="text-(--primary)">✅</span> {feature}
            </div>
          ))}
        </div>

        <p className="mt-8 text-(--muted-foreground)">
          If tabs are blocked, allow popups for this site in your browser settings.
        </p>
      </div>
    </div>
  );
}