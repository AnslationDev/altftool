"use client";

import { useState, useCallback, useRef } from "react";
import { PDFDocument } from "pdf-lib";
import { decryptPDF } from "@pdfsmaller/pdf-decrypt";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  FileText,
  Lock,
  Unlock,
  Download,
  Key,
  Shield,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Eye,
  EyeOff,
  X,
  FileWarning,
  Trash2,
  Info,
} from "lucide-react";
import { saveAs } from "file-saver";
import { toast } from "sonner";

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(2)} MB`;
}

function getFileIcon(file) {
  if (!file) return null;
  const pages = file.pages !== undefined ? `${file.pages} page${file.pages !== 1 ? "s" : ""}` : "";
  return { name: file.name, size: formatBytes(file.size), pages };
}

export default function PdfPasswordRemover() {
  const [file, setFile] = useState(null);
  const [fileBytes, setFileBytes] = useState(null);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState("idle");
  const [pdfInfo, setPdfInfo] = useState(null);
  const resultBlobRef = useRef(null);

  const reset = useCallback(() => {
    setFile(null);
    setFileBytes(null);
    setPassword("");
    setShowPassword(false);
    setIsProcessing(false);
    setResult(null);
    setError(null);
    setStatus("idle");
    setPdfInfo(null);
    resultBlobRef.current = null;
  }, []);

  const onDrop = useCallback(async (acceptedFiles) => {
    const f = acceptedFiles[0];
    if (!f) return;
    if (f.type !== "application/pdf" && !f.name.toLowerCase().endsWith(".pdf")) {
      setError("Please upload a valid PDF file.");
      toast.error("Invalid file type. Please upload a PDF.");
      return;
    }
    setError(null);
    setResult(null);
    setPassword("");
    setStatus("loading");

    try {
      const bytes = await f.arrayBuffer();
      setFile(f);
      setFileBytes(bytes);

      try {
        const pdfDoc = await PDFDocument.load(bytes);
        const pageCount = pdfDoc.getPageCount();
        setPdfInfo({ pages: pageCount, needsPassword: false });
        setStatus("ready");
        toast.success(`PDF loaded — ${pageCount} page${pageCount !== 1 ? "s" : ""}`);
      } catch (loadErr) {
        // Many restricted PDFs only have an owner password.
        // We can unlock these by passing the empty string as the user password.
        try {
          const decrypted = await decryptPDF(new Uint8Array(bytes), "");
          const pdfDoc = await PDFDocument.load(decrypted);
          const pageCount = pdfDoc.getPageCount();
          // It unlocked successfully with no password! 
          setPdfInfo({ pages: pageCount, needsPassword: false, isOwnerLockedOnly: true });
          setStatus("ready");
          toast.success(`PDF loaded — Owner restrictions detected and ready to strip!`);
        } catch (innerErr) {
          const errMsg = innerErr.message ? innerErr.message.toLowerCase() : "";
          if (errMsg.includes("password") || errMsg.includes("encrypt") || errMsg.includes("security")) {
            setPdfInfo({ pages: null, needsPassword: true });
            setStatus("needs-password");
          } else {
            setStatus("ready");
            try {
              const pdfDoc = await PDFDocument.load(bytes, { ignoreEncryption: true });
              const pageCount = pdfDoc.getPageCount();
              setPdfInfo({ pages: pageCount, needsPassword: false, ignoreEncryption: true });
            } catch {
              setPdfInfo({ pages: null, needsPassword: false });
            }
          }
        }
      }
    } catch (err) {
      setError("Could not read the PDF file. It may be corrupted.");
      setStatus("idle");
      toast.error("Failed to read PDF file.");
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
    multiple: false,
    disabled: isProcessing,
  });

  const removePassword = useCallback(async () => {
    if (!fileBytes || !file) return;
    setIsProcessing(true);
    setError(null);
    setResult(null);
    setStatus("processing");

    try {
      let pdfDoc;
      const needsPassword = pdfInfo?.needsPassword;

      if (needsPassword) {
        if (!password) {
          setError("Please enter the PDF password.");
          setStatus("needs-password");
          setIsProcessing(false);
          return;
        }
        try {
          const decrypted = await decryptPDF(new Uint8Array(fileBytes), password);
          pdfDoc = await PDFDocument.load(decrypted);
        } catch (pwdErr) {
          const msg = pwdErr.message ? pwdErr.message.toLowerCase() : "";
          if (msg.includes("aes-256")) {
            setError("This PDF uses AES-256 encryption, which requires an advanced decryptor. Currently not supported.");
            setIsProcessing(false);
            return;
          }
          setError(`Incorrect password or unsupported encryption. [Error: ${pwdErr.message}]. Please try again.`);
          setStatus("needs-password");
          setIsProcessing(false);
          toast.error("Decryption failed.");
          return;
        }
      } else {
        try {
          // If it was owner-locked only, we pass empty password to decrypt
          if (pdfInfo?.isOwnerLockedOnly) {
            const decrypted = await decryptPDF(new Uint8Array(fileBytes), "");
            pdfDoc = await PDFDocument.load(decrypted);
          } else {
            pdfDoc = await PDFDocument.load(new Uint8Array(fileBytes));
          }
        } catch {
          pdfDoc = await PDFDocument.load(new Uint8Array(fileBytes), { ignoreEncryption: true });
        }
      }

      const pageCount = pdfDoc.getPageCount();
      const modifiedBytes = await pdfDoc.save();
      const resultBlob = new Blob([modifiedBytes], { type: "application/pdf" });
      resultBlobRef.current = resultBlob;

      const originalSize = file.size;
      const resultSize = resultBlob.size;

      setResult({
        pages: pageCount,
        originalSize,
        resultSize,
        saved: originalSize - resultSize,
        name: file.name.replace(/\.pdf$/i, "") + "_unlocked.pdf",
      });
      setStatus("done");
      toast.success("Password removed successfully!");
    } catch (err) {
      const msg = err.message || "An unexpected error occurred.";
      setError(msg);
      setStatus(pdfInfo?.needsPassword ? "needs-password" : "ready");
      toast.error("Failed to remove password.");
    } finally {
      setIsProcessing(false);
    }
  }, [fileBytes, file, password, pdfInfo]);

  const handleDownload = useCallback(() => {
    if (resultBlobRef.current && result?.name) {
      saveAs(resultBlobRef.current, result.name);
      toast.success("PDF downloaded!");
    }
  }, [result]);

  return (
    <div className="min-h-screen bg-(--background)">
      <div className="container py-12 px-4 md:px-6">
        <motion.div
          className="max-w-3xl mx-auto text-center space-y-4 mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-(--primary)/10 mb-2">
            <Unlock className="w-8 h-8 text-(--primary)" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-(--foreground)">
            PDF Password Remover
          </h1>
          <p className="text-lg text-(--muted-foreground) max-w-2xl mx-auto">
            Remove passwords from protected PDF files instantly. All processing happens
            locally in your browser — nothing is uploaded.
          </p>
        </motion.div>

        <div className="max-w-2xl mx-auto space-y-6">
          {status === "idle" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div
                {...getRootProps()}
                className={`relative flex flex-col items-center justify-center p-12 rounded-xl border-2 border-dashed cursor-pointer transition-all duration-200 ${
                  isDragActive
                    ? "border-(--primary) bg-(--primary)/5 shadow-lg shadow-(--primary)/10"
                    : "border-(--border) bg-(--card) hover:border-(--primary)/50 hover:bg-(--card)/80"
                }`}
              >
                <input {...getInputProps()} />
                <motion.div
                  animate={isDragActive ? { scale: 1.1, y: -4 } : { scale: 1, y: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <Upload className={`w-14 h-14 mb-5 ${isDragActive ? "text-(--primary)" : "text-(--muted-foreground)"}`} />
                </motion.div>
                {isDragActive ? (
                  <p className="text-lg font-semibold text-(--primary)">Drop your PDF here</p>
                ) : (
                  <>
                    <p className="text-lg font-semibold text-(--foreground) mb-1">
                      Drag & drop your PDF here
                    </p>
                    <p className="text-sm text-(--muted-foreground)">or click to browse files</p>
                  </>
                )}
                <div className="flex items-center gap-2 mt-4 text-xs text-(--muted-foreground)">
                  <Shield className="w-3.5 h-3.5" />
                  <span>100% local processing — file never leaves your device</span>
                </div>
              </div>
            </motion.div>
          )}

          <AnimatePresence mode="wait">
            {(status === "loading" || status === "ready" || status === "needs-password" || status === "processing" || status === "done") && (
              <motion.div
                key="file-loaded"
                initial={{ opacity: 0, y: 20, height: 0 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                exit={{ opacity: 0, y: -20, height: 0 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="rounded-xl border border-(--border) bg-(--card) shadow-sm overflow-hidden"
              >
                <div className="p-5 border-b border-(--border) flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-(--primary)/10 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-(--primary)" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-(--foreground) truncate max-w-[280px] md:max-w-[400px]">
                        {file?.name}
                      </p>
                      <p className="text-xs text-(--muted-foreground)">
                        {file && formatBytes(file.size)}
                        {pdfInfo?.pages && ` · ${pdfInfo.pages} page${pdfInfo.pages !== 1 ? "s" : ""}`}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={reset}
                    disabled={isProcessing}
                    className="flex-shrink-0 p-2 rounded-lg text-(--muted-foreground) hover:text-(--foreground) hover:bg-(--border) transition-colors disabled:opacity-50"
                    title="Remove file"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-5 space-y-5">
                  {status === "loading" && (
                    <div className="flex items-center gap-3 py-6">
                      <Loader2 className="w-5 h-5 text-(--primary) animate-spin" />
                      <span className="text-sm text-(--muted-foreground)">Analyzing PDF file...</span>
                    </div>
                  )}

                  {status === "ready" && !pdfInfo?.needsPassword && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-5"
                    >
                      <div className="flex items-start gap-3 p-4 rounded-lg bg-(--primary)/5 border border-(--primary)/10">
                        <Info className="w-5 h-5 text-(--primary) flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-(--foreground)">No password detected</p>
                          <p className="text-xs text-(--muted-foreground) mt-1">
                            This PDF does not appear to have an opening password. You can still
                            re-save it to strip any encryption.
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={removePassword}
                        disabled={isProcessing}
                        className="w-full flex items-center justify-center gap-2.5 h-11 rounded-lg bg-(--primary) text-white font-semibold text-sm hover:bg-(--primary)/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-(--primary)/35"
                      >
                        {isProcessing ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <Download className="w-4 h-4" />
                            Strip Encryption & Download
                          </>
                        )}
                      </button>
                    </motion.div>
                  )}

                  {(status === "needs-password" || (status === "ready" && pdfInfo?.needsPassword)) && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-4"
                    >
                      <div className="flex items-start gap-3 p-4 rounded-lg bg-amber-50 dark:bg-amber-900/15 border border-amber-200 dark:border-amber-800/30">
                        <Lock className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
                            Password-protected PDF
                          </p>
                          <p className="text-xs text-amber-700 dark:text-amber-400/70 mt-1">
                            Enter the document password to unlock it. The password is never sent
                            anywhere — all decryption happens locally.
                          </p>
                        </div>
                      </div>

                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
                          <Key className="w-4 h-4 text-(--muted-foreground)" />
                        </div>
                        <input
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Enter PDF password"
                          disabled={isProcessing}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && !isProcessing && password) removePassword();
                          }}
                          className="w-full h-11 pl-10 pr-10 rounded-lg border border-(--border) bg-(--background) text-(--foreground) text-sm placeholder:text-(--muted-foreground) focus:outline-none focus:ring-3 focus:ring-(--primary)/35 focus:border-(--primary) transition-all disabled:opacity-60"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-(--muted-foreground) hover:text-(--foreground) transition-colors"
                          tabIndex={-1}
                        >
                          {showPassword ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>

                      <button
                        onClick={removePassword}
                        disabled={isProcessing || !password.trim()}
                        className="w-full flex items-center justify-center gap-2.5 h-11 rounded-lg bg-(--primary) text-white font-semibold text-sm hover:bg-(--primary)/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-(--primary)/35"
                      >
                        {isProcessing ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Decrypting...
                          </>
                        ) : (
                          <>
                            <Unlock className="w-4 h-4" />
                            Remove Password & Download
                          </>
                        )}
                      </button>
                    </motion.div>
                  )}

                  {status === "processing" && (
                    <div className="flex items-center gap-3 py-6">
                      <Loader2 className="w-5 h-5 text-(--primary) animate-spin" />
                      <span className="text-sm text-(--muted-foreground)">
                        {pdfInfo?.needsPassword ? "Decrypting PDF..." : "Processing PDF..."}
                      </span>
                    </div>
                  )}

                  {error && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="flex items-start gap-3 p-4 rounded-lg bg-red-50 dark:bg-red-900/15 border border-red-200 dark:border-red-800/30"
                    >
                      <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-red-700 dark:text-red-400">Error</p>
                        <p className="text-xs text-red-600 dark:text-red-300/70 mt-0.5">{error}</p>
                      </div>
                      <button
                        onClick={() => setError(null)}
                        className="flex-shrink-0 p-1 rounded text-red-400 hover:text-red-600 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </motion.div>
                  )}
                </div>

                {status === "done" && result && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    transition={{ duration: 0.35 }}
                    className="border-t border-(--border)"
                  >
                    <div className="p-5 space-y-5">
                      <div className="flex items-start gap-3 p-4 rounded-lg bg-green-50 dark:bg-green-900/15 border border-green-200 dark:border-green-800/30">
                        <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-green-700 dark:text-green-300">
                            Password removed successfully
                          </p>
                          <p className="text-xs text-green-600 dark:text-green-400/70 mt-1">
                            Your PDF is now unlocked and ready to download.
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        <div className="rounded-lg bg-(--background) border border-(--border) p-3 text-center">
                          <p className="text-xs text-(--muted-foreground) mb-1">Pages</p>
                          <p className="text-lg font-bold text-(--foreground)">{result.pages}</p>
                        </div>
                        <div className="rounded-lg bg-(--background) border border-(--border) p-3 text-center">
                          <p className="text-xs text-(--muted-foreground) mb-1">Original</p>
                          <p className="text-lg font-bold text-(--foreground)">{formatBytes(result.originalSize)}</p>
                        </div>
                        <div className="rounded-lg bg-(--background) border border-(--border) p-3 text-center">
                          <p className="text-xs text-(--muted-foreground) mb-1">Unlocked</p>
                          <p className="text-lg font-bold text-(--foreground)">{formatBytes(result.resultSize)}</p>
                        </div>
                      </div>

                      <button
                        onClick={handleDownload}
                        className="w-full flex items-center justify-center gap-2.5 h-11 rounded-lg bg-(--primary) text-white font-semibold text-sm hover:bg-(--primary)/90 transition-colors focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-(--primary)/35"
                      >
                        <Download className="w-4 h-4" />
                        Download Unlocked PDF
                      </button>

                      <button
                        onClick={reset}
                        className="w-full flex items-center justify-center gap-2 h-10 rounded-lg border border-(--border) text-(--muted-foreground) font-medium text-sm hover:bg-(--border)/30 hover:text-(--foreground) transition-colors"
                      >
                        <Upload className="w-4 h-4" />
                        Unlock another PDF
                      </button>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Features */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4"
          >
            <div className="rounded-xl border border-(--border) bg-(--card) p-5 text-center">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-(--primary)/10 mb-3">
                <Shield className="w-5 h-5 text-(--primary)" />
              </div>
              <h3 className="font-semibold text-(--foreground) text-sm mb-1">100% Private</h3>
              <p className="text-xs text-(--muted-foreground)">
                Everything runs locally. Your file never leaves your browser.
              </p>
            </div>
            <div className="rounded-xl border border-(--border) bg-(--card) p-5 text-center">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-(--primary)/10 mb-3">
                <Zap className="w-5 h-5 text-(--primary)" />
              </div>
              <h3 className="font-semibold text-(--foreground) text-sm mb-1">Instant</h3>
              <p className="text-xs text-(--muted-foreground)">
                Process PDFs in seconds with no server wait times.
              </p>
            </div>
            <div className="rounded-xl border border-(--border) bg-(--card) p-5 text-center">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-(--primary)/10 mb-3">
                <FileWarning className="w-5 h-5 text-(--primary)" />
              </div>
              <h3 className="font-semibold text-(--foreground) text-sm mb-1">No Limits</h3>
              <p className="text-xs text-(--muted-foreground)">
                Unlock as many PDFs as you want. No file size limits.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function Zap(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  );
}
