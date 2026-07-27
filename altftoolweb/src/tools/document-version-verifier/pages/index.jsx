"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  FileCheck,
  Search,
  SlidersHorizontal,
  Columns2,
  ListTree,
  Image as ImageIcon,
  Table as TableIcon,
  Layout,
  Hash,
  Clock,
  ShieldCheck,
  Sparkles,
  Download,
  Upload,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

import { extractLocalDocument } from "../lib/extractDocumentText";
import { compareDocumentVersions, DEFAULT_COMPARISON_OPTIONS } from "../lib/compareVersions.mjs";
import { calculateOverallSimilarityMetrics } from "../lib/semanticEngine";
import { extractDocumentStructure, compareStructures } from "../lib/structureAnalyzer";
import { analyzeSecurityAndTampering } from "../lib/securityTamperAnalyzer";
import { predictVersionRelationship } from "../lib/versionPredictorAI";

import HeroLanding from "../components/HeroLanding";
import UploadZone from "../components/UploadZone";
import DashboardHeader from "../components/DashboardHeader";
import QuickToolbar from "../components/QuickToolbar";

import OverviewTab from "../components/OverviewTab";
import MetadataTab from "../components/MetadataTab";
import ContentComparisonTab from "../components/ContentComparisonTab";
import VisualComparisonTab from "../components/VisualComparisonTab";
import StructureTab from "../components/StructureTab";
import ImagesTab from "../components/ImagesTab";
import TablesTab from "../components/TablesTab";
import HeadersFootersTab from "../components/HeadersFootersTab";
import HashVerificationTab from "../components/HashVerificationTab";
import TimelineTab from "../components/TimelineTab";
import SecurityTab from "../components/SecurityTab";
import AIInsightsTab from "../components/AIInsightsTab";
import ExportTab from "../components/ExportTab";

const MAIN_TABS = [
  { id: "overview", label: "Overview", icon: FileCheck },
  { id: "metadata", label: "Metadata", icon: SlidersHorizontal },
  { id: "content", label: "Content Comparison", icon: FileText },
  { id: "visual", label: "Visual Comparison", icon: Columns2 },
  { id: "structure", label: "Structure", icon: ListTree },
  { id: "images", label: "Images", icon: ImageIcon },
  { id: "tables", label: "Tables", icon: TableIcon },
  { id: "headers", label: "Headers & Footers", icon: Layout },
  { id: "hashes", label: "Hash Verification", icon: Hash },
  { id: "timeline", label: "Timeline", icon: Clock },
  { id: "security", label: "Security", icon: ShieldCheck },
  { id: "insights", label: "Insights", icon: Search },
  { id: "export", label: "Export", icon: Download },
];

const SAMPLE_DOC_A = {
  name: "Master_Service_Agreement_v1.0.docx",
  text: `# MASTER SERVICE AGREEMENT

This Master Service Agreement ("Agreement") is entered into as of January 15, 2026, by and between Enterprise Solutions Inc. ("Provider") and Global Tech Ltd. ("Client").

## 1. SCOPE OF SERVICES
Provider agrees to render cloud infrastructure management, software development, and technical support services as detailed in Statement of Work #1.
The payment should be completed within seven days of invoice issuance.

## 2. COMPENSATION & FEES
Client shall pay Provider $15,000 per month for ongoing maintenance and support services.
All late payments shall incur a penalty fee of 1.5% per month.

## 3. CONFIDENTIALITY
Each party agrees to maintain strict confidentiality of all proprietary technical data and trade secrets.

## 4. TERM & TERMINATION
This Agreement shall commence on the Effective Date and remain in force for twelve (12) months.`,
  format: "markdown",
  sourceType: "Sample DOCX",
  hashes: {
    crc32: "9A1F2C4B",
    md5: "5D41402ABC4B2A76B9719D911017C592",
    sha1: "2FD4E1C67A2D28FCED849EE1BB76E7391B93EB12",
    sha256: "E3B0C44298FC1C149AFBF4C8996FB92427AE41E4649B934CA495991B7852B855",
    sha512: "CF83E1357EEFB8BDF1542850D66D8007D620E4050B5715DC83F4A921D36CE9CE47D0D13C5D85F2B0FF8318D2877EEC2F63B931BD47417A81A538327AF927DA3E",
  },
  metadata: {
    filename: "Master_Service_Agreement_v1.0.docx",
    extension: "docx",
    fileSize: 48200,
    createdDate: "2026-01-15T09:00:00.000Z",
    modifiedDate: "2026-01-15T11:30:00.000Z",
    author: "Alice Legal Counsel",
    creator: "Microsoft Word 16.0",
    wordCount: 142,
    characterCount: 940,
    pageCount: 2,
    paragraphCount: 10,
    imageCount: 1,
    tableCount: 1,
  },
  warnings: [],
};

const SAMPLE_DOC_B = {
  name: "Master_Service_Agreement_v2.0_Final.docx",
  text: `# MASTER SERVICE AGREEMENT

This Master Service Agreement ("Agreement") is entered into as of January 20, 2026, by and between Enterprise Solutions Inc. ("Provider") and Global Tech Ltd. ("Client").

## 1. SCOPE OF SERVICES
Provider agrees to render cloud infrastructure management, custom AI software development, and 24/7 technical support services as detailed in Statement of Work #1 and SOW #2.
The payment must be made within one week of invoice receipt.

## 2. COMPENSATION & FEES
Client shall pay Provider $18,500 per month for ongoing maintenance and expanded support services.
All late payments shall incur a penalty fee of 2.0% per month.

## 3. CONFIDENTIALITY & DATA SECURITY
Each party agrees to maintain strict confidentiality of all proprietary technical data, customer PII, and trade secrets in accordance with GDPR regulations.

## 4. TERM & TERMINATION
This Agreement shall commence on the Effective Date and remain in force for twenty-four (24) months.

## 5. INDEMNIFICATION
Provider agrees to defend and hold harmless Client against third-party patent infringement claims.`,
  format: "markdown",
  sourceType: "Sample DOCX",
  hashes: {
    crc32: "8E3D7B1F",
    md5: "098F6BCD4621D373CAD4E832627B4F6F",
    sha1: "40BD001563085FC35165329EA1FF5C5ECEDBDEF9",
    sha256: "2C26B46B68FFC68FF99B453C1D30413413422D706483BFA0F98A5E886266E7AE",
    sha512: "F7C3BC1D808E04732ADF6799FE45B067DCD34CB9F9203E796F4B6116F4F5E68E079A3B508C6A610A3816C6A019D2088D6A42971B3EBF8150247EE18116C97F3E",
  },
  metadata: {
    filename: "Master_Service_Agreement_v2.0_Final.docx",
    extension: "docx",
    fileSize: 64100,
    createdDate: "2026-01-20T14:15:00.000Z",
    modifiedDate: "2026-01-22T16:45:00.000Z",
    author: "Alice Legal Counsel",
    creator: "Microsoft Word 16.0 (Revised)",
    wordCount: 198,
    characterCount: 1320,
    pageCount: 3,
    paragraphCount: 14,
    imageCount: 2,
    tableCount: 2,
  },
  warnings: [],
};

export default function DocumentVersionVerifierPage() {
  const [fileList, setFileList] = useState([]);
  const [selectedDocAIndex, setSelectedDocAIndex] = useState(0);
  const [selectedDocBIndex, setSelectedDocBIndex] = useState(1);

  const [activeTab, setActiveTab] = useState("overview");
  const [activeMode, setActiveMode] = useState("exact");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState({
    added: true,
    removed: true,
    modified: true,
    tables: true,
    images: true,
    security: true,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [comparisonResult, setComparisonResult] = useState(null);
  const [error, setError] = useState("");

  const uploadSectionRef = useRef(null);

  const handleScrollToUpload = () => {
    uploadSectionRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleFilesAdded = async (files) => {
    setIsLoading(true);
    setError("");
    try {
      const extractedDocs = await Promise.all(
        files.map(async (file) => {
          try {
            return await extractLocalDocument(file);
          } catch (e) {
            return {
              name: file.name,
              text: "",
              metadata: { filename: file.name, fileSize: file.size },
              warnings: [e.message],
              hashes: { crc32: "N/A", md5: "N/A", sha1: "N/A", sha256: "N/A", sha512: "N/A" },
            };
          }
        })
      );

      setFileList((prev) => {
        const nextList = [...prev, ...extractedDocs].slice(0, 10);
        return nextList;
      });

      if (fileList.length === 0 && extractedDocs.length >= 2) {
        setSelectedDocAIndex(0);
        setSelectedDocBIndex(1);
      }
    } catch (err) {
      setError("Error reading local document files.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadDemo = () => {
    setFileList([SAMPLE_DOC_A, SAMPLE_DOC_B]);
    setSelectedDocAIndex(0);
    setSelectedDocBIndex(1);
    setError("");
  };

  const handleClearAll = () => {
    setFileList([]);
    setSelectedDocAIndex(0);
    setSelectedDocBIndex(0);
    setComparisonResult(null);
    setError("");
  };

  const handleRemoveFile = (idx) => {
    setFileList((prev) => {
      const next = prev.filter((_, i) => i !== idx);
      return next;
    });
  };

  const currentDocA = fileList[selectedDocAIndex] || (fileList.length > 0 ? fileList[0] : null);
  const currentDocB = fileList[selectedDocBIndex] || (fileList.length > 1 ? fileList[1] : currentDocA);

  // Execute Comparison Pipeline whenever active documents or settings change
  useEffect(() => {
    if (!currentDocA || !currentDocB || !currentDocA.text || !currentDocB.text) {
      setComparisonResult(null);
      return;
    }

    try {
      // 1. Line/Word Diff Engine
      const diff = compareDocumentVersions(currentDocA.text, currentDocB.text, {
        format: currentDocA.format || "text",
        options: DEFAULT_COMPARISON_OPTIONS,
      });

      if (!diff.ok) {
        setError(diff.error);
        setComparisonResult(null);
        return;
      }

      // 2. Semantic Similarity Engine
      const similarity = calculateOverallSimilarityMetrics(currentDocA.text, currentDocB.text);

      // 3. Structure Analyzer
      const structA = extractDocumentStructure(currentDocA.text, currentDocA.metadata || {});
      const structB = extractDocumentStructure(currentDocB.text, currentDocB.metadata || {});
      const structureDelta = compareStructures(structA, structB);

      // 4. Cryptographic Hash Comparison
      const hashesA = currentDocA.hashes || {};
      const hashesB = currentDocB.hashes || {};
      const hashesIdentical = hashesA.sha256 !== "N/A" && hashesA.sha256 === hashesB.sha256;

      // 5. Security & Tampering Analyzer
      const security = analyzeSecurityAndTampering(currentDocA, currentDocB, hashesA, hashesB);

      // 6. Version Lineage AI Predictor
      const versionAI = predictVersionRelationship(currentDocA, currentDocB, diff, security, similarity);

      setComparisonResult({
        diffRows: diff.rows,
        diffSummary: diff.summary,
        lineStats: diff.lineStats,
        similarity,
        structA,
        structB,
        structureDelta,
        hashesA,
        hashesB,
        hashesIdentical,
        security,
        versionAI,
        docA: currentDocA,
        docB: currentDocB,
      });
      setError("");
    } catch (err) {
      console.error("Comparison execution error:", err);
      setError("An unexpected error occurred while comparing the documents.");
    }
  }, [currentDocA, currentDocB]);

  const handleToggleFilter = (key) => {
    setActiveFilters((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleModeChange = (modeId) => {
    setActiveMode(modeId);
    if (modeId === "exact") setActiveTab("content");
    else if (modeId === "semantic") setActiveTab("insights");
    else if (modeId === "metadata") setActiveTab("metadata");
    else if (modeId === "visual") setActiveTab("visual");
    else if (modeId === "deep") setActiveTab("security");
  };

  return (
    <main className="min-h-screen bg-[#F5F7FA] w-full py-8 px-4 sm:px-6 flex flex-col items-center space-y-8">
      {/* 1. Centered Verification Card Header */}
      <HeroLanding onUploadClick={handleScrollToUpload} onTryDemoClick={handleLoadDemo} />

      {/* 2. Document Upload Zone & Analysis Results */}
      <div className="w-full max-w-7xl mx-auto space-y-8">
        <div ref={uploadSectionRef}>
          <UploadZone
            fileList={fileList}
            selectedDocAIndex={selectedDocAIndex}
            selectedDocBIndex={selectedDocBIndex}
            onFilesAdded={handleFilesAdded}
            onRemoveFile={handleRemoveFile}
            onSelectDocA={setSelectedDocAIndex}
            onSelectDocB={setSelectedDocBIndex}
            onClearAll={handleClearAll}
            isLoading={isLoading}
          />
        </div>

        {/* 3. Error Banner */}
        {error && (
          <div className="rounded-2xl border border-red-300 dark:border-red-900 bg-red-50 dark:bg-red-950/40 p-4 text-sm font-bold text-red-600 dark:text-red-400 flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* 4. Executive Dashboard & KPI Cards */}
        {comparisonResult && <DashboardHeader comparisonData={comparisonResult} />}

        {/* 5. Quick Toolbar (Modes & Filters) */}
        {comparisonResult && (
          <QuickToolbar
            activeMode={activeMode}
            onModeChange={handleModeChange}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            activeFilters={activeFilters}
            onToggleFilter={handleToggleFilter}
          />
        )}

        {/* 6. Main Navigation Tabs */}
        {comparisonResult && (
          <div className="space-y-6">
            <div className="overflow-x-auto pb-2">
              <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 min-w-max">
                {MAIN_TABS.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`inline-flex items-center gap-2 border-b-2 px-4 py-3 text-xs font-bold transition-all ${
                        isActive
                          ? "border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400"
                          : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tab Views */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {activeTab === "overview" && <OverviewTab comparisonData={comparisonResult} />}
                {activeTab === "metadata" && <MetadataTab docA={comparisonResult.docA} docB={comparisonResult.docB} searchQuery={searchQuery} />}
                {activeTab === "content" && <ContentComparisonTab diffRows={comparisonResult.diffRows} searchQuery={searchQuery} activeFilters={activeFilters} />}
                {activeTab === "visual" && <VisualComparisonTab docA={comparisonResult.docA} docB={comparisonResult.docB} />}
                {activeTab === "structure" && <StructureTab structureData={comparisonResult.structureDelta} />}
                {activeTab === "images" && <ImagesTab docA={comparisonResult.docA} docB={comparisonResult.docB} />}
                {activeTab === "tables" && <TablesTab docA={comparisonResult.docA} docB={comparisonResult.docB} />}
                {activeTab === "headers" && <HeadersFootersTab docA={comparisonResult.docA} docB={comparisonResult.docB} />}
                {activeTab === "hashes" && (
                  <HashVerificationTab
                    hashesA={comparisonResult.hashesA}
                    hashesB={comparisonResult.hashesB}
                    hashesIdentical={comparisonResult.hashesIdentical}
                  />
                )}
                {activeTab === "timeline" && (
                  <TimelineTab
                    docA={comparisonResult.docA}
                    docB={comparisonResult.docB}
                    versionAI={comparisonResult.versionAI}
                  />
                )}
                {activeTab === "security" && <SecurityTab securityData={comparisonResult.security} />}
                {activeTab === "insights" && (
                  <AIInsightsTab
                    versionAI={comparisonResult.versionAI}
                    semanticData={comparisonResult.similarity}
                  />
                )}
                {activeTab === "export" && <ExportTab comparisonData={comparisonResult} />}
              </motion.div>
            </AnimatePresence>
          </div>
        )}
      </div>
    </main>
  );
}
