// import { Search } from "lucide-react";
// import React, { useState, useEffect } from "react";
// import Features from "../components/Feature";

// const API_URL = "https://domain-checker-8.onrender.com/api/check-domain";

// const formatDomain = (domain) => {
//   return domain
//     .trim()
//     .toLowerCase()
//     .replace(/^(https?:\/\/)?(www\.)?/, "");
// };

// const isValidDomain = (domain) => {
//   const domainRegex = /^[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,}$/i;
//   return domainRegex.test(domain);
// };

// export default function ToolHome() {
  

//   const [domain, setDomain] = useState("");
//   const [validationResult, setValidationResult] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   const handleInputChange = (e) => {
//     setDomain(e.target.value);
//     setValidationResult(null);
//     setError("");
//   };
//   const handleCheck = async () => {
//     const cleanDomain = formatDomain(domain);

//     if (!cleanDomain) {
//       setError("Please enter a domain name");
//       return;
//     }

//     if (!isValidDomain(cleanDomain)) {
//       setError("Please enter a valid domain name (e.g., google.com)");
//       return;
//     }

//     setLoading(true);
//     setError("");
//     setValidationResult(null);

//     try {
//       const response = await fetch(API_URL, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ domain: cleanDomain }),
//       });

//       const data = await response.json();

//       if (data.status === "quota_exceeded") {
//         setError(
//           "⚠️ something went wrong! Please try again later.",
//         );
//         setLoading(false);
//         return;
//       }

//       setValidationResult({
//         available: data.available,
//         domain: cleanDomain,
//         message: data.available
//           ? `${cleanDomain} is available for registration! ✅`
//           : `${cleanDomain} is already taken. ❌`,
//       });
//     } catch {
//       setError("Error checking domain. Please try again later.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleKeyPress = (e) => e.key === "Enter" && handleCheck();

//   const resetForm = () => {
//     setDomain("");
//     setValidationResult(null);
//     setError("");
//   };

//   return (
//     <div className="min-h-screen bg-(--background) relative overflow-hidden pt-6 shadow-lg px-4 pb-12">
      

//       <div className="relative z-10 max-w-4xl mx-auto">
//         {/* Header Section */}
//         <div className="text-center mb-12">
//           <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/30 rounded-full mb-6">
//             <svg
//               className="w-4 h-4 text-blue-400"
//               viewBox="0 0 24 24"
//               fill="none"
//               stroke="currentColor"
//             >
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 strokeWidth={2}
//                 d="M13 10V3L4 14h7v7l9-11h-7z"
//               />
//             </svg>
//             <span className="text-sm font-semibold text-blue-300">
//               Powered by Advanced DNS Technology
//             </span>
//           </div>

//           <h1 className="heading text-center animate-fade-up mb-4">
//             Find  Your Domain
//           </h1>

//           <p className="description text-center animate-fade-up">
//             Check domain availability instantly across millions  <br/> of registered
//             domains worldwide
//           </p>
//         </div>

     
//         <div className="bg-(--card) border-2 border-(--border) rounded-2xl p-8 shadow-2xl relative overflow-hidden">
          

//           <div className="flex items-center gap-4 mb-6">
//             <div className="w-14 h-14 bg-(--card) rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/50">
//               <svg
//                 className="w-8 h-8 text-(--foreground) stroke-2"
//                 viewBox="0 0 24 24"
//                 fill="none"
//                 stroke="currentColor"
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
//                 />
//               </svg>
//             </div>
//             <h2 className="subheading">
//               Domain name search
//             </h2>
//           </div>

//           <div className="relative mb-6">
//             <Search className="absolute left-2 top-4 h-5 w-5 text-(--muted-foreground)" />
//             <input
//               type="text"
//               value={domain}
//               onChange={handleInputChange}
//               onKeyPress={handleKeyPress}
//               placeholder="Enter domain name (e.g., Google.com)"
//               className="w-full pl-12 pr-4 py-4 bg-(--card) border-2 border-(--border) rounded-lg text-(--muted-foreground) "
//             />
//           </div>

//           <button
//             onClick={handleCheck}
//             disabled={loading}
//             className={`w-full py-4 px-6 bg-(--primary) cursor-pointer text-white font-bold rounded-lg flex items-center justify-center  gap-2 shadow-lg shadow-blue-500/30 transition-all ${loading ? "opacity-50 cursor-not-allowed" : "hover:shadow-blue-500/50"}`}
//           >
//             {loading ? (
//               <>
//                 <div className="w-5 h-5 border-2 border-(--border) border-t-white rounded-full animate-spin" />
//                 Checking Availability...
//               </>
//             ) : (
//               "Check Domain"
//             )}
//           </button>

//           {/* Error Message */}
//           {error && (
//             <div className="mt-6 p-4 bg-(--card) border-2 border-red-500/50 rounded-lg flex items-center gap-3">
//               <svg
//                 className="w-6 h-6 text-red-500 shrink-0 stroke-2"
//                 viewBox="0 0 24 24"
//                 fill="none"
//                 stroke="currentColor"
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
//                 />
//               </svg>
//               <p className="text-red-400 font-semibold">{error}</p>
//             </div>
//           )}

//           {/* Success Result */}
//           {validationResult && (
//             <div
//               className={`mt-6 p-6 rounded-lg border-3 text-center ${
//                 validationResult.available
//                   ? "bg-green-500/10 border-green-500"
//                   : "bg-red-500/10 border-red-500"
//               }`}
//             >
//               <div
//                 className={`w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center ${
//                   validationResult.available ? "bg-green-500" : "bg-red-600"
//                 }`}
//               >
//                 {validationResult.available ? (
//                   <svg
//                     className="w-12 h-12 text-(--muted-foreground) stroke-2"
//                     viewBox="0 0 24 24"
//                     fill="none"
//                     stroke="currentColor"
//                   >
//                     <path
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
//                     />
//                   </svg>
//                 ) : (
//                   <svg
//                     className="w-12 h-12 text-(--muted-foreground) stroke-2"
//                     viewBox="0 0 24 24"
//                     fill="none"
//                     stroke="currentColor"
//                   >
//                     <path
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
//                     />
//                   </svg>
//                 )}
//               </div>

//               <h3
//                 className={`text-2xl font-bold mb-2 ${
//                   validationResult.available ? "text-green-400" : "text-red-700"
//                 }`}
//               >
//                 {validationResult.available
//                   ? "Domain Available!"
//                   : "Domain Taken"}
//               </h3>

//               <p className="text-(--foreground) text-lg mb-4">
//                 {validationResult.message}
//               </p>

//               <div className="bg-red-200 border border-(--border) rounded-lg p-4 mb-6">
//                 <p className="text-xl font-bold text-(--foreground) font-mono break-all">
//                   {validationResult.domain}
//                 </p>
//               </div>

//               <button
//                 onClick={resetForm}
//                 className={`w-full py-3 px-4 text-(--foreground) font-bold rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${
//                   validationResult.available
//                     ? "bg-green-600 hover:bg-green-700"
//                     : "bg-red-600 hover:bg-red-700"
//                 }`}
//               >
//                 <svg
//                   className="w-5 h-5 stroke-2"
//                   viewBox="0 0 24 24"
//                   fill="none"
//                   stroke="currentColor"
//                 >
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
//                   />
//                 </svg>
//                 Check Another Domain
//               </button>
//             </div>
//           )}
//         </div>

//       <Features/>
//       </div>
//     </div>
//   );
// }

import { Search } from "lucide-react";
import React, { useState } from "react";
import Features from "../components/Feature";

// ── DNS-over-HTTPS via Cloudflare (no backend, no rate limits, no API key) ──
// NXDOMAIN (status 3)  →  domain not in DNS  →  Available
// NOERROR  + answers   →  domain resolves    →  Taken
async function checkDomainAvailability(domain) {
  const query = async (type) => {
    const res = await fetch(
      `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(domain)}&type=${type}`,
      { headers: { Accept: "application/dns-json" } }
    );
    if (!res.ok) throw new Error("DNS query failed");
    return res.json();
  };

  // Primary check: NS records
  const ns = await query("NS");

  if (ns.Status === 3) return true;                        // NXDOMAIN → available
  if (ns.Status === 0 && ns.Answer?.length) return false;  // has NS records → taken

  // Fallback: A records
  const a = await query("A");
  if (a.Status === 3) return true;
  if (a.Status === 0 && a.Answer?.length) return false;

  // Still ambiguous → conservative: assume taken to avoid false "available" results
  return false;
}

const formatDomain = (domain) =>
  domain
    .trim()
    .toLowerCase()
    .replace(/^(https?:\/\/)?(www\.)?/, "")
    .replace(/\/.*$/, "");

const isValidDomain = (domain) =>
  /^[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,}$/i.test(domain);

export default function ToolHome() {
  const [domain, setDomain] = useState("");
  const [validationResult, setValidationResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleInputChange = (e) => {
    setDomain(e.target.value);
    setValidationResult(null);
    setError("");
  };

  const handleCheck = async () => {
    const cleanDomain = formatDomain(domain);

    if (!cleanDomain) {
      setError("Please enter a domain name");
      return;
    }
    if (!isValidDomain(cleanDomain)) {
      setError("Please enter a valid domain name (e.g., google.com)");
      return;
    }

    setLoading(true);
    setError("");
    setValidationResult(null);

    try {
      const available = await checkDomainAvailability(cleanDomain);
      setValidationResult({
        available,
        domain: cleanDomain,
        message: available
          ? `${cleanDomain} is available for registration! ✅`
          : `${cleanDomain} is already taken. ❌`,
      });
    } catch {
      setError("DNS lookup failed. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => e.key === "Enter" && !loading && handleCheck();

  const resetForm = () => {
    setDomain("");
    setValidationResult(null);
    setError("");
  };

  return (
    <div className="min-h-screen bg-(--background) relative overflow-hidden pt-6 shadow-lg px-4 pb-12">
      <div className="relative z-10 max-w-4xl mx-auto">

        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/30 rounded-full mb-6">
            <svg className="w-4 h-4 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span className="text-sm font-semibold text-blue-300">
              Powered by Advanced DNS Technology
            </span>
          </div>

          <h1 className="heading text-center animate-fade-up mb-4">
            Find Your Domain
          </h1>

          <p className="description text-center animate-fade-up">
            Check domain availability instantly across millions{" "}
            <br className="hidden sm:block" /> of registered domains worldwide
          </p>
        </div>

        {/* Card */}
        <div className="bg-(--card) border-2 border-(--border) rounded-2xl p-4 sm:p-8 shadow-2xl relative overflow-hidden">

          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-(--card) rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/50 shrink-0">
              <svg className="w-6 h-6 sm:w-8 sm:h-8 text-(--foreground) stroke-2" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
            </div>
            <h2 className="subheading">Domain name search</h2>
          </div>

          {/* Input */}
          <div className="relative mb-4 sm:mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-(--muted-foreground)" />
            <input
              type="text"
              value={domain}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder="Enter domain name (e.g., google.com)"
              className="w-full pl-10 pr-4 py-3 sm:py-4 bg-(--card) border-2 border-(--border) rounded-lg text-(--muted-foreground) text-sm sm:text-base"
            />
          </div>

          {/* Button */}
          <button
            onClick={handleCheck}
            disabled={loading}
            className={`w-full py-3 sm:py-4 px-6 bg-(--primary) cursor-pointer text-white font-bold rounded-lg flex items-center justify-center gap-2 shadow-lg shadow-blue-500/30 transition-all text-sm sm:text-base ${
              loading ? "opacity-50 cursor-not-allowed" : "hover:shadow-blue-500/50"
            }`}
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-(--border) border-t-white rounded-full animate-spin" />
                Checking Availability...
              </>
            ) : (
              "Check Domain"
            )}
          </button>

          {/* Error */}
          {error && (
            <div className="mt-6 p-4 bg-(--card) border-2 border-red-500/50 rounded-lg flex items-start sm:items-center gap-3">
              <svg className="w-6 h-6 text-red-500 shrink-0 stroke-2 mt-0.5 sm:mt-0" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-red-400 font-semibold text-sm sm:text-base">{error}</p>
            </div>
          )}

          {/* Result */}
          {validationResult && (
            <div
              className={`mt-6 p-4 sm:p-6 rounded-lg border-2 text-center ${
                validationResult.available
                  ? "bg-green-500/10 border-green-500"
                  : "bg-red-500/10 border-red-500"
              }`}
            >
              <div
                className={`w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 rounded-full flex items-center justify-center ${
                  validationResult.available ? "bg-green-500" : "bg-red-600"
                }`}
              >
                {validationResult.available ? (
                  <svg className="w-9 h-9 sm:w-12 sm:h-12 text-white stroke-2" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ) : (
                  <svg className="w-9 h-9 sm:w-12 sm:h-12 text-white stroke-2" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
              </div>

              <h3
                className={`text-xl sm:text-2xl font-bold mb-2 ${
                  validationResult.available ? "text-green-400" : "text-red-500"
                }`}
              >
                {validationResult.available ? "Domain Available!" : "Domain Taken"}
              </h3>

              <p className="text-(--foreground) text-base sm:text-lg mb-4">
                {validationResult.message}
              </p>

              <div className="bg-(--card) border border-(--border) rounded-lg p-4 mb-6">
                <p className="text-lg sm:text-xl font-bold text-(--foreground) font-mono break-all">
                  {validationResult.domain}
                </p>
              </div>

              <button
                onClick={resetForm}
                className={`w-full py-3 px-4 text-white font-bold rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer text-sm sm:text-base ${
                  validationResult.available
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-red-600 hover:bg-red-700"
                }`}
              >
                <svg className="w-5 h-5 stroke-2" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Check Another Domain
              </button>
            </div>
          )}
        </div>

        <Features />
      </div>
    </div>
  );
}