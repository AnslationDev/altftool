import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import * as pdfjsLib from "pdfjs-dist";
import { PDFDocument } from "pdf-lib";
import { Download, Upload, GripVertical } from "lucide-react";
pdfjsLib.GlobalWorkerOptions.workerSrc = "/altflovepdf/pdf.worker.min.mjs";
const PageThumbnail = ({ page }) => {
  const { setNodeRef, transform, transition, attributes, listeners } = useSortable({ id: page.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  };
  return <div
    ref={setNodeRef}
    style={style}
    className="border p-3 rounded-lg bg-(--background) shadow hover:shadow-lg transition"
  >
      <div className="flex items-center gap-2 mb-2">
        <div
    {...attributes}
    {...listeners}
    className="cursor-grab active:cursor-grabbing"
  >
          <GripVertical className="text-(--muted-foreground)" />
        </div>
        <p className="font-semibold">Page {page.number}</p>
      </div>
      <img
    src={page.image}
    alt={`PDF Page ${page.number} Preview`}
    className="w-full rounded border"
  />
    </div>;
};
const PageReorderTool = () => {
  const [pages, setPages] = useState([]);
  const [rawPdfBytes, setRawPdfBytes] = useState(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );
  async function renderPageThumb(pdf, pageNum) {
    const page = await pdf.getPage(pageNum);
    const viewport = page.getViewport({ scale: 0.3 });
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return "";
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    await page.render({ canvasContext: ctx, viewport }).promise;
    return canvas.toDataURL("image/png");
  }
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const arrayBuffer = await file.arrayBuffer();
    const clonedBuffer = arrayBuffer.slice(0);
    setRawPdfBytes(clonedBuffer);
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const thumbs = [];
    for (let i = 1; i <= pdf.numPages; i++) {
      const img = await renderPageThumb(pdf, i);
      thumbs.push({
        id: i,
        number: i,
        image: img
      });
    }
    setPages(thumbs);
  };
  const handleDragEnd = (e) => {
    const { active, over } = e;
    if (!over) return;
    setPages((items) => {
      const oldIndex = items.findIndex((i) => i.id === active.id);
      const newIndex = items.findIndex((i) => i.id === over.id);
      return arrayMove(items, oldIndex, newIndex);
    });
  };
  const handleDownload = async () => {
    if (!rawPdfBytes) {
      alert("Please upload a PDF first!");
      return;
    }
    try {
      const originalPdf = await PDFDocument.load(rawPdfBytes);
      const newPdf = await PDFDocument.create();
      const totalPages = originalPdf.getPageCount();
      for (const page of pages) {
        const index = page.id - 1;
        if (index < 0 || index >= totalPages) continue;
        const [copied] = await newPdf.copyPages(originalPdf, [index]);
        newPdf.addPage(copied);
      }
      const pdfBytes = await newPdf.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "reordered.pdf";
      link.click();
    } catch (error) {
      console.error("Error processing PDF:", error);
      alert("Error processing PDF. Please try again.");
    }
  };
  return <div className="w-full max-w-6xl mx-auto p-4">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-2xl">PDF Page Reorder Tool</CardTitle>
          <p className="text-(--muted-foreground)">
            Drag and drop to rearrange pages for presentations or corrections
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Button asChild>
              <label className="cursor-pointer">
                <Upload className="mr-2 h-4 w-4" />
                Upload PDF
                <input
    type="file"
    accept=".pdf"
    onChange={handleFileUpload}
    hidden
  />
              </label>
            </Button>

            {pages.length > 0 && <Button onClick={handleDownload} variant="secondary">
                <Download className="mr-2 h-4 w-4" />
                Download Reordered PDF
              </Button>}
          </div>
        </CardContent>
      </Card>

      {pages.length > 0 && <Card>
          <CardContent className="pt-6">
            <DndContext
    sensors={sensors}
    collisionDetection={closestCenter}
    onDragEnd={handleDragEnd}
  >
              <SortableContext
    items={pages.map((p) => p.id)}
    strategy={verticalListSortingStrategy}
  >
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {pages.map((page) => <PageThumbnail key={page.id} page={page} />)}
                </div>
              </SortableContext>
            </DndContext>
          </CardContent>
        </Card>}

      {pages.length === 0 && <Card className="text-center py-12">
          <CardContent>
            <p className="text-(--muted-foreground) mb-4">
              Upload a PDF file to start reordering pages
            </p>
            <p className="text-sm text-(--muted-foreground)">
              Your files are processed locally in your browser. No data is sent to any server.
            </p>
          </CardContent>
        </Card>}

      <div className="mt-8 text-center text-sm text-(--muted-foreground)">
        <p>
          &copy; {(/* @__PURE__ */ new Date()).getFullYear()} PDF Microtool. All Rights Reserved.
          Secure and Client-Side Processing.
        </p>
      </div>
    </div>;
};
export default PageReorderTool;
