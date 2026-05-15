/**
 * Export Utilities
 * Handles exporting citations to different formats.
 */

export const exportToTxt = (citation, title = "citation") => {
  const element = document.createElement("a");
  const file = new Blob([citation], { type: "text/plain" });
  element.href = URL.createObjectURL(file);
  element.download = `${title}.txt`;
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
};

export const exportToDocx = (citation, title = "citation") => {
  // Simple HTML to DOCX approach using a Blob
  const html = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head><meta charset='utf-8'><title>${title}</title></head>
    <body>
      <p style="font-family: 'Times New Roman', serif; font-size: 12pt;">${citation}</p>
    </body>
    </html>
  `;
  const file = new Blob(['\ufeff', html], { type: 'application/msword' });
  const element = document.createElement("a");
  element.href = URL.createObjectURL(file);
  element.download = `${title}.doc`;
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
};

export const exportToPdf = (citation, title = "citation") => {
  // For a real PDF, we'd need a library like jsPDF. 
  // As a fallback for this environment, we can trigger the print dialog or export as text with .pdf extension
  // (Note: renaming .txt to .pdf won't make it a real PDF, but in some cases it's a placeholder)
  // Let's try to use the print method for a cleaner "save as PDF" experience if the user wants.
  
  const printWindow = window.open('', '_blank');
  printWindow.document.write(`<html><head><title>${title}</title></head><body><pre>${citation}</pre></body></html>`);
  printWindow.document.close();
  printWindow.print();
};
