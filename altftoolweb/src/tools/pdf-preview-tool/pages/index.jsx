"use client";

import { useRef, useState } from "react";
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '../components/ui/dialog';
import {
  Upload,
  ZoomIn,
  FileText,
  Loader2
} from "lucide-react";
import * as pdfjsLib from "pdfjs-dist";
pdfjsLib.GlobalWorkerOptions.workerSrc = "/altflovepdf/pdf.worker.min.mjs";
const PdfPreviewTool = () => {
  const fileInputRef = useRef(null);
  const [pdfInstance, setPdfInstance] = useState(null);
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState("");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewHD, setPreviewHD] = useState(null);
  const [currentPage, setCurrentPage] = useState(null);
  const renderPDF = async (file) => {
    setLoading(true);
    setPages([]);
    setFileName(file.name);
    try {
      const buffer = await file.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ data: buffer });
      const pdf = await loadingTask.promise;
      setPdfInstance(pdf);
      let tempPages = [];
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 0.25 });
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (ctx) {
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          await page.render({ canvasContext: ctx, viewport }).promise;
          tempPages.push({
            pageNum: i,
            thumb: canvas.toDataURL("image/png")
          });
        }
      }
      setPages(tempPages);
    } catch (err) {
      alert("Error loading PDF: " + err.message);
    }
    setLoading(false);
  };
  const handleFullPreview = async (pageNum) => {
    if (!pdfInstance) return;
    setCurrentPage(pageNum);
    setPreviewHD(null);
    setPreviewOpen(true);
    const page = await pdfInstance.getPage(pageNum);
    const viewport = page.getViewport({ scale: 2 });
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (ctx) {
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      await page.render({ canvasContext: ctx, viewport }).promise;
      setPreviewHD(canvas.toDataURL("image/png"));
    }
  };
  return <div className="space-y-6">
    {
      /* Instructions Card */
    }
    <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
      <h2 className="text-xl font-semibold mb-2">PDF Preview Tool</h2>
      <p className="text-(--muted-foreground)">
        Upload a PDF document to preview its pages. Click on any page thumbnail to view it in high definition.
      </p>
    </Card>

    {
      /* Upload Section */
    }
    {pages.length === 0 && !loading && <Card className="p-8 text-center border-2 border-dashed rounded-lg hover:border-primary/50 transition-colors">
      <FileText className="mx-auto h-12 w-12 text-(--muted-foreground)" />
      <h3 className="mt-4 text-lg font-medium">Drop your PDF here</h3>
      <p className="mt-2 text-sm text-(--muted-foreground)">
        or click the button below to browse
      </p>
      <Button
        className="mt-4"
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload className="mr-2 h-4 w-4" />
        Choose PDF File
      </Button>
    </Card>}

    <input
      ref={fileInputRef}
      hidden
      type="file"
      accept="application/pdf"
      onChange={(e) => e.target.files?.[0] && renderPDF(e.target.files[0])}
    />

    {
      /* Loading State */
    }
    {loading && <Card className="p-8 text-center">
      <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
      <h3 className="mt-4 text-lg font-medium">Processing your PDF...</h3>
      <p className="mt-2 text-sm text-(--muted-foreground)">
        This won't take long
      </p>
    </Card>}

    {
      /* PDF Pages Grid */
    }
    {!loading && pages.length > 0 && <div>
      {
        /* File Info Bar */
      }
      <Card className="p-4 mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="font-medium">{fileName}</h3>
          <p className="text-sm text-(--muted-foreground)">
            {pages.length} {pages.length === 1 ? "page" : "pages"}
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="mr-2 h-4 w-4" />
          Upload New
        </Button>
      </Card>

      {
        /* Thumbnails Grid */
      }
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {pages.map((p, idx) => <Card
          key={p.pageNum}
          className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => handleFullPreview(p.pageNum)}
        >
          <div className="aspect-[1/1.414] relative bg-(--muted) dark:bg-gray-800">
            <img
              src={p.thumb}
              alt={`Page ${p.pageNum}`}
              className="w-full h-full object-contain"
            />
            <div className="absolute inset-0 bg-(--background)/0 hover:bg-(--background)/10 transition-colors flex items-center justify-center">
              <ZoomIn className="opacity-0 hover:opacity-100 h-6 w-6 text-(--foreground) drop-shadow" />
            </div>
          </div>
          <div className="p-2 text-center">
            <span className="text-xs font-medium">Page {p.pageNum}</span>
          </div>
        </Card>)}
      </div>
    </div>}

    {
      /* HD Preview Dialog */
    }
    <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Page {currentPage} - HD Preview</DialogTitle>
        </DialogHeader>
        <div className="text-center min-h-[400px] flex items-center justify-center">
          {!previewHD && <div className="py-8">
            <Loader2 className="mx-auto h-8 w-8 animate-spin" />
            <p className="mt-2 text-sm text-(--muted-foreground)">
              Loading HD preview...
            </p>
          </div>}
          {previewHD && <img
            src={previewHD}
            alt={`Page ${currentPage}`}
            className="max-w-full max-h-[70vh] rounded-lg shadow-lg"
          />}
        </div>
      </DialogContent>
    </Dialog>
  </div>;
};
export default PdfPreviewTool;
