"use client";

import React from "react";

export default function AltfPdfPanels({ activePanelId }) {
  // Helper to check if a panel is the active one
  const getPanelClass = (panelId) => {
    return activePanelId === panelId ? "panel active" : "panel";
  };

  return (
    <div id="toolkit-root">
      {/* 1. MERGE PDF */}
      <div id="panel-merge" className={getPanelClass("merge")}>
        <div id="merge-drop" className="dropzone">
          <svg className="dropzone-icon"><use href="#s-merge" /></svg>
          <p>Drag and drop PDF files here, or click to browse</p>
          <input type="file" id="merge-input" multiple accept=".pdf" style={{ display: "none" }} />
        </div>
        <div id="merge-list" className="file-list"></div>
        
        <div id="merge-progress" className="progress-wrap">
          <div id="merge-bar" className="progress-bar"></div>
          <span id="merge-label" className="progress-label"></span>
        </div>

        <div className="action-row">
          <button id="merge-btn" className="btn" disabled>Merge PDF</button>
          <button id="merge-clear-btn" className="btn btn-sec">Clear</button>
        </div>
        <div id="merge-result" className="result-box"></div>
      </div>

      {/* 2. SPLIT PDF */}
      <div id="panel-split" className={getPanelClass("split")}>
        <div id="split-drop" className="dropzone">
          <svg className="dropzone-icon"><use href="#s-cut" /></svg>
          <p>Drag and drop a PDF file here, or click to browse</p>
          <input type="file" id="split-input" accept=".pdf" style={{ display: "none" }} />
        </div>
        <div id="split-list" className="file-list"></div>

        <div className="options-card">
          <h4>Split Settings</h4>
          <div className="radio-group-wrap">
            <button className="radio-btn active" data-group="split-mode" data-value="all">Extract All Pages</button>
            <button className="radio-btn" data-group="split-mode" data-value="range">Extract Specific Range</button>
          </div>
          
          <div id="split-range-group" className="input-group" style={{ display: "none", marginTop: "15px" }}>
            <label htmlFor="split-range">Page Range (e.g., 1-3, 5):</label>
            <input type="text" id="split-range" defaultValue="1" placeholder="e.g. 1-3, 5" />
          </div>
        </div>

        <div id="split-progress" className="progress-wrap">
          <div id="split-bar" className="progress-bar"></div>
          <span id="split-label" className="progress-label"></span>
        </div>

        <div className="action-row">
          <button id="split-btn" className="btn" disabled>Split PDF</button>
        </div>
        <div id="split-result" className="result-box"></div>
      </div>

      {/* 3. ROTATE PDF */}
      <div id="panel-rotate" className={getPanelClass("rotate")}>
        <div id="rotate-drop" className="dropzone">
          <svg className="dropzone-icon"><use href="#s-rot" /></svg>
          <p>Drag and drop a PDF file here, or click to browse</p>
          <input type="file" id="rotate-input" accept=".pdf" style={{ display: "none" }} />
        </div>
        <div id="rotate-list" className="file-list"></div>

        <div className="options-card">
          <h4>Rotation Angle</h4>
          <div className="radio-group-wrap">
            <button className="radio-btn active" data-group="rotate-angle" data-value="90">90° CW</button>
            <button className="radio-btn" data-group="rotate-angle" data-value="180">180°</button>
            <button className="radio-btn" data-group="rotate-angle" data-value="270">90° CCW</button>
          </div>

          <h4 style={{ marginTop: "20px" }}>Page Selection</h4>
          <div className="radio-group-wrap">
            <button className="radio-btn active" data-group="rotate-pages" data-value="all">All Pages</button>
            <button className="radio-btn" data-group="rotate-pages" data-value="specific">Specific Pages</button>
          </div>

          <div id="rotate-pages-group" className="input-group" style={{ display: "none", marginTop: "15px" }}>
            <label htmlFor="rotate-pages-input">Pages to Rotate (e.g., 1, 3-5):</label>
            <input type="text" id="rotate-pages-input" defaultValue="1" />
          </div>
        </div>

        <div className="action-row">
          <button id="rotate-btn" className="btn" disabled>Rotate PDF</button>
        </div>
        <div id="rotate-result" className="result-box"></div>
      </div>

      {/* 4. ORGANIZE PAGES */}
      <div id="panel-organize" className={getPanelClass("organize")}>
        <div id="organize-drop" className="dropzone">
          <svg className="dropzone-icon"><use href="#s-list" /></svg>
          <p>Drag and drop a PDF file here to reorder/delete pages</p>
          <input type="file" id="organize-input" accept=".pdf" style={{ display: "none" }} />
        </div>
        
        <div id="organize-grid" className="organize-grid"></div>

        <div id="organize-progress" className="progress-wrap">
          <div id="organize-bar" className="progress-bar"></div>
          <span id="organize-label" className="progress-label"></span>
        </div>

        <div id="organize-controls" className="action-row" style={{ display: "none" }}>
          <button id="organize-dl-btn" className="btn">Download Organized PDF</button>
          <button id="organize-clear-btn" className="btn btn-sec">Clear</button>
        </div>
        <div id="organize-result" className="result-box"></div>
      </div>

      {/* 5. CROP PAGES */}
      <div id="panel-crop" className={getPanelClass("crop")}>
        <div id="crop-drop" className="dropzone">
          <svg className="dropzone-icon"><use href="#s-crop" /></svg>
          <p>Drag and drop a PDF file here, or click to browse</p>
          <input type="file" id="crop-input" accept=".pdf" style={{ display: "none" }} />
        </div>
        <div id="crop-list" className="file-list"></div>

        <div className="options-card">
          <h4>Crop Settings</h4>
          <div className="radio-group-wrap">
            <button className="radio-btn active" data-group="crop-pages" data-value="all">All Pages</button>
            <button className="radio-btn" data-group="crop-pages" data-value="specific">Specific Pages</button>
          </div>

          <div id="crop-pages-group" className="input-group" style={{ display: "none", marginTop: "15px" }}>
            <label htmlFor="crop-pages-input">Pages to Crop:</label>
            <input type="text" id="crop-pages-input" defaultValue="1" />
          </div>

          <h4 style={{ marginTop: "20px" }}>Crop Margins (Points)</h4>
          <div className="crop-grid-inputs">
            <div className="input-group">
              <label htmlFor="crop-top">Top Margin</label>
              <input type="number" id="crop-top" defaultValue="50" min="0" />
            </div>
            <div className="input-group">
              <label htmlFor="crop-bottom">Bottom Margin</label>
              <input type="number" id="crop-bottom" defaultValue="50" min="0" />
            </div>
            <div className="input-group">
              <label htmlFor="crop-left">Left Margin</label>
              <input type="number" id="crop-left" defaultValue="50" min="0" />
            </div>
            <div className="input-group">
              <label htmlFor="crop-right">Right Margin</label>
              <input type="number" id="crop-right" defaultValue="50" min="0" />
            </div>
          </div>
        </div>

        <div className="action-row">
          <button id="crop-btn" className="btn" disabled>Crop PDF</button>
        </div>
        <div id="crop-result" className="result-box"></div>
      </div>

      {/* 6. INSERT BLANK PAGES */}
      <div id="panel-insertblank" className={getPanelClass("insertblank")}>
        <div id="insertblank-drop" className="dropzone">
          <svg className="dropzone-icon"><use href="#s-plus" /></svg>
          <p>Drag and drop a PDF file here, or click to browse</p>
          <input type="file" id="insertblank-input" accept=".pdf" style={{ display: "none" }} />
        </div>
        <div id="insertblank-list" className="file-list"></div>

        <div className="options-card">
          <h4>Insert Position</h4>
          <div className="radio-group-wrap">
            <button className="radio-btn active" data-group="blank-pos" data-value="start">Start of PDF</button>
            <button className="radio-btn" data-group="blank-pos" data-value="end">End of PDF</button>
            <button className="radio-btn" data-group="blank-pos" data-value="specific">Specific Page</button>
          </div>

          <div className="input-group" style={{ marginTop: "15px" }}>
            <label htmlFor="blank-page-num">Page Number (for Specific Page):</label>
            <input type="number" id="blank-page-num" defaultValue="1" min="1" />
          </div>

          <h4 style={{ marginTop: "20px" }}>Page Configuration</h4>
          <div className="split-inputs">
            <div className="input-group">
              <label htmlFor="blank-count">Number of Pages:</label>
              <input type="number" id="blank-count" defaultValue="1" min="1" />
            </div>
            <div className="input-group">
              <label htmlFor="blank-size">Page Size:</label>
              <select id="blank-size">
                <option value="a4">A4 (595 x 842 pt)</option>
                <option value="letter">Letter (612 x 792 pt)</option>
              </select>
            </div>
          </div>
        </div>

        <div className="action-row">
          <button id="insertblank-btn" className="btn" disabled>Insert Blank Pages</button>
        </div>
        <div id="insertblank-result" className="result-box"></div>
      </div>

      {/* 7. IMAGE → PDF */}
      <div id="panel-img2pdf" className={getPanelClass("img2pdf")}>
        <div id="img2pdf-drop" className="dropzone">
          <svg className="dropzone-icon"><use href="#s-img" /></svg>
          <p>Drag and drop JPG, PNG, or WebP images here</p>
          <input type="file" id="img2pdf-input" multiple accept="image/*" style={{ display: "none" }} />
        </div>
        <div id="img2pdf-list" className="file-list"></div>

        <div className="options-card">
          <h4>Page Orientation &amp; Size</h4>
          <div className="radio-group-wrap">
            <button className="radio-btn active" data-group="img2pdf-layout" data-value="fit">Fit Page to Image Size</button>
            <button className="radio-btn" data-group="img2pdf-layout" data-value="a4-portrait">A4 Portrait</button>
            <button className="radio-btn" data-group="img2pdf-layout" data-value="a4-landscape">A4 Landscape</button>
            <button className="radio-btn" data-group="img2pdf-layout" data-value="letter-portrait">Letter Portrait</button>
            <button className="radio-btn" data-group="img2pdf-layout" data-value="letter-landscape">Letter Landscape</button>
          </div>

          <h4 style={{ marginTop: "20px" }}>Page Margin</h4>
          <div className="radio-group-wrap">
            <button className="radio-btn active" data-group="img2pdf-margin" data-value="none">No Margin</button>
            <button className="radio-btn" data-group="img2pdf-margin" data-value="small">Small Margin (20pt)</button>
            <button className="radio-btn" data-group="img2pdf-margin" data-value="large">Large Margin (50pt)</button>
          </div>
        </div>

        <div className="action-row">
          <button id="img2pdf-btn" className="btn" disabled>Convert to PDF</button>
          <button id="img2pdf-clear-btn" className="btn btn-sec">Clear</button>
        </div>
        <div id="img2pdf-result" className="result-box"></div>
      </div>

      {/* 8. PDF → IMAGE */}
      <div id="panel-pdf2img" className={getPanelClass("pdf2img")}>
        <div id="pdf2img-drop" className="dropzone">
          <svg className="dropzone-icon"><use href="#s-cam" /></svg>
          <p>Drag and drop a PDF file here, or click to browse</p>
          <input type="file" id="pdf2img-input" accept=".pdf" style={{ display: "none" }} />
        </div>
        <div id="pdf2img-list" className="file-list"></div>

        <div className="options-card">
          <h4>Export Settings</h4>
          <div className="radio-group-wrap">
            <button className="radio-btn active" data-group="pdf2img-fmt" data-value="jpeg">JPEG Format</button>
            <button className="radio-btn" data-group="pdf2img-fmt" data-value="png">PNG Format</button>
          </div>

          <div className="slider-row" style={{ marginTop: "20px" }}>
            <label htmlFor="pdf2img-scale">Render Scale (Resolution):</label>
            <div className="slider-wrap">
              <input type="range" id="pdf2img-scale" min="1" max="4" step="0.5" defaultValue="1.5" />
              <span id="pdf2img-scale-val">1.5x</span>
            </div>
          </div>
        </div>

        <div id="pdf2img-progress" className="progress-wrap">
          <div id="pdf2img-bar" className="progress-bar"></div>
          <span id="pdf2img-label" className="progress-label"></span>
        </div>

        <div className="action-row">
          <button id="pdf2img-btn" className="btn" disabled>Export Pages as Images</button>
        </div>
        <div id="pdf2img-result" className="result-box"></div>
        <div id="pdf2img-preview" className="image-previews-container"></div>
      </div>

      {/* 9. PDF → TEXT */}
      <div id="panel-pdf2text" className={getPanelClass("pdf2text")}>
        <div id="pdf2text-drop" className="dropzone">
          <svg className="dropzone-icon"><use href="#s-type" /></svg>
          <p>Drag and drop a searchable PDF file here</p>
          <input type="file" id="pdf2text-input" accept=".pdf" style={{ display: "none" }} />
        </div>
        <div id="pdf2text-list" className="file-list"></div>

        <div id="pdf2text-progress" className="progress-wrap">
          <div id="pdf2text-bar" className="progress-bar"></div>
          <span id="pdf2text-label" className="progress-label"></span>
        </div>

        <div className="action-row">
          <button id="pdf2text-btn" className="btn" disabled>Extract Text</button>
        </div>

        <div className="textarea-card" style={{ marginTop: "20px" }}>
          <textarea id="pdf2text-output" readOnly placeholder="Extracted plain text will display here..."></textarea>
          <div className="action-row" style={{ marginTop: "15px" }}>
            <button id="pdf2text-dl" className="btn" disabled>Download Text File</button>
            <button id="pdf2text-copy" className="btn btn-sec" disabled>Copy to Clipboard</button>
          </div>
        </div>
        <div id="pdf2text-result" className="result-box"></div>
      </div>

      {/* 10. EXTRACT IMAGES */}
      <div id="panel-extractimages" className={getPanelClass("extractimages")}>
        <div id="extractimages-drop" className="dropzone">
          <svg className="dropzone-icon"><use href="#s-extract" /></svg>
          <p>Drag and drop a PDF file here to extract all embedded images</p>
          <input type="file" id="extractimages-input" accept=".pdf" style={{ display: "none" }} />
        </div>
        <div id="extractimages-list" className="file-list"></div>

        <div id="extractimages-progress" className="progress-wrap">
          <div id="extractimages-bar" className="progress-bar"></div>
          <span id="extractimages-label" className="progress-label"></span>
        </div>

        <div className="action-row">
          <button id="extractimages-btn" className="btn" disabled>Extract Images</button>
        </div>
        <div id="extractimages-result" className="result-box"></div>
      </div>

      {/* 11. WEBPAGE → PDF */}
      <div id="panel-web2pdf" className={getPanelClass("web2pdf")}>
        <div className="options-card">
          <h4>Webpage Capture Settings</h4>
          <p className="privacy-note">
            Note: Due to sandbox security constraints, Webpage to PDF captures the tab screenshot locally. Make sure the content you wish to capture is loaded.
          </p>

          <div className="radio-group-wrap" style={{ marginTop: "15px" }}>
            <span className="radio-label-heading">Page Size:</span>
            <button className="radio-btn active" data-group="web2pdf-size" data-value="a4">A4 Size</button>
            <button className="radio-btn" data-group="web2pdf-size" data-value="letter">Letter Size</button>
          </div>

          <div className="radio-group-wrap" style={{ marginTop: "15px" }}>
            <span className="radio-label-heading">Orientation:</span>
            <button className="radio-btn active" data-group="web2pdf-orient" data-value="portrait">Portrait</button>
            <button className="radio-btn" data-group="web2pdf-orient" data-value="landscape">Landscape</button>
          </div>
        </div>

        <div id="web2pdf-progress" className="progress-wrap">
          <div id="web2pdf-bar" className="progress-bar"></div>
          <span id="web2pdf-label" className="progress-label"></span>
        </div>

        <div className="action-row">
          <button id="web2pdf-btn" className="btn">Capture Current Tab &amp; Save PDF</button>
        </div>
        <img id="web2pdf-preview-img" style={{ maxWidth: "100%", display: "none", marginTop: "20px", borderRadius: "8px", border: "1px solid var(--g200)" }} alt="Web Capture Preview" />
        <div id="web2pdf-result" className="result-box"></div>
      </div>

      {/* 12. GRAYSCALE PDF */}
      <div id="panel-grayscale" className={getPanelClass("grayscale")}>
        <div id="grayscale-drop" className="dropzone">
          <svg className="dropzone-icon"><use href="#s-gray" /></svg>
          <p>Drag and drop a color PDF file here</p>
          <input type="file" id="grayscale-input" accept=".pdf" style={{ display: "none" }} />
        </div>
        <div id="grayscale-list" className="file-list"></div>

        <div className="options-card">
          <h4>Grayscale Mode</h4>
          <div className="radio-group-wrap">
            <button className="radio-btn active" data-group="gray-fmt" data-value="vector">Vector / Native Text Mode (Perfect text sharpness)</button>
            <button className="radio-btn" data-group="gray-fmt" data-value="jpeg">Raster / JPEG Mode (Aggressive conversion)</button>
          </div>

          <div id="gray-quality-group" style={{ display: "none", marginTop: "20px" }}>
            <div className="slider-row">
              <label htmlFor="gray-quality">JPEG Quality:</label>
              <div className="slider-wrap">
                <input type="range" id="gray-quality" min="10" max="100" defaultValue="70" />
                <span id="gray-quality-val">70%</span>
              </div>
            </div>
          </div>

          <div className="slider-row" style={{ marginTop: "20px" }}>
            <label htmlFor="gray-scale">Rasterization Scale (Resolution):</label>
            <div className="slider-wrap">
              <input type="range" id="gray-scale" min="1" max="3" step="0.5" defaultValue="1.5" />
              <span id="gray-scale-val">1.5x</span>
            </div>
          </div>
        </div>

        <div className="action-row">
          <button id="grayscale-btn" className="btn" disabled>Convert to Grayscale</button>
        </div>
        <div id="grayscale-preview" className="image-previews-container"></div>
        <div id="grayscale-result" className="result-box"></div>
      </div>

      {/* 13. COMPRESS PDF */}
      <div id="panel-compress" className={getPanelClass("compress")}>
        <div id="compress-drop" className="dropzone">
          <svg className="dropzone-icon"><use href="#s-cmp" /></svg>
          <p>Drag and drop a PDF file here, or click to browse</p>
          <input type="file" id="compress-input" accept=".pdf" style={{ display: "none" }} />
        </div>
        <div id="compress-list" className="file-list"></div>

        <div className="options-card">
          <h4>Compression Mode</h4>
          <div className="radio-group-wrap">
            <button className="radio-btn active" data-group="compress-mode" data-value="normal">Normal Compression (Preserves text, mild image shrinkage)</button>
            <button className="radio-btn" data-group="compress-mode" data-value="heavy">Heavy Compression (Aggressive Resampling)</button>
          </div>

          <div id="compress-heavy-opts" style={{ display: "none", marginTop: "20px" }}>
            <div className="slider-row">
              <label htmlFor="compress-quality">Target Image Quality:</label>
              <div className="slider-wrap">
                <input type="range" id="compress-quality" min="10" max="100" defaultValue="60" />
                <span id="compress-quality-val">60%</span>
              </div>
            </div>
            <div className="slider-row" style={{ marginTop: "20px" }}>
              <label htmlFor="compress-dpi">Target Resolution (DPI):</label>
              <div className="slider-wrap">
                <input type="range" id="compress-dpi" min="72" max="300" step="10" defaultValue="150" />
                <span id="compress-dpi-val">150</span>
              </div>
            </div>
          </div>
        </div>

        <div id="compress-progress" className="progress-wrap">
          <div id="compress-bar" className="progress-bar"></div>
          <span id="compress-label" className="progress-label"></span>
        </div>

        <div className="action-row">
          <button id="compress-btn" className="btn" disabled>Compress PDF</button>
        </div>

        <div id="compress-stats" className="stats-box" style={{ display: "none" }}>
          <div className="stat-item">Original: <span id="stat-original">0 KB</span></div>
          <div className="stat-item">Compressed: <span id="stat-output">0 KB</span></div>
          <div className="stat-item">Saved: <span id="stat-saved">0 KB (0%)</span></div>
        </div>
        <div id="compress-result" className="result-box"></div>
      </div>

      {/* 14. PAGE NUMBERS */}
      <div id="panel-pagenumbers" className={getPanelClass("pagenumbers")}>
        <div id="pagenumbers-drop" className="dropzone">
          <svg className="dropzone-icon"><use href="#s-hash" /></svg>
          <p>Drag and drop a PDF file here</p>
          <input type="file" id="pagenumbers-input" accept=".pdf" style={{ display: "none" }} />
        </div>
        <div id="pn-list" className="file-list"></div>

        <div className="options-card">
          <h4>Numbering Configurations</h4>
          <div className="split-inputs">
            <div className="input-group">
              <label htmlFor="pn-start">Starting Number:</label>
              <input type="number" id="pn-start" defaultValue="1" min="1" />
            </div>
            <div className="input-group">
              <label htmlFor="pn-format">Display Format:</label>
              <select id="pn-format">
                <option value="n">Page X</option>
                <option value="n_of_m">Page X of Y</option>
              </select>
            </div>
          </div>

          <h4 style={{ marginTop: "20px" }}>Page Position</h4>
          <div className="radio-group-wrap">
            <button className="radio-btn active" data-group="pn-pos" data-value="bottom-center">Bottom Center</button>
            <button className="radio-btn" data-group="pn-pos" data-value="bottom-right">Bottom Right</button>
            <button className="radio-btn" data-group="pn-pos" data-value="bottom-left">Bottom Left</button>
            <button className="radio-btn" data-group="pn-pos" data-value="top-center">Top Center</button>
            <button className="radio-btn" data-group="pn-pos" data-value="top-right">Top Right</button>
            <button className="radio-btn" data-group="pn-pos" data-value="top-left">Top Left</button>
          </div>
        </div>

        <div className="action-row">
          <button id="pn-btn" className="btn" disabled>Add Page Numbers</button>
        </div>
        <div id="pn-result" className="result-box"></div>
      </div>

      {/* 15. HEADER / FOOTER */}
      <div id="panel-headerfooter" className={getPanelClass("headerfooter")}>
        <div id="headerfooter-drop" className="dropzone">
          <svg className="dropzone-icon"><use href="#s-hf" /></svg>
          <p>Drag and drop a PDF file here to add running headers or footers</p>
          <input type="file" id="headerfooter-input" accept=".pdf" style={{ display: "none" }} />
        </div>
        <div id="hf-list" className="file-list"></div>

        <div className="options-card">
          <h4>Custom Text Settings</h4>
          <div className="input-group">
            <label htmlFor="hf-header">Header Text (placed at the top of pages):</label>
            <input type="text" id="hf-header" placeholder="e.g. Confidential Document" />
          </div>
          <div className="input-group" style={{ marginTop: "15px" }}>
            <label htmlFor="hf-footer">Footer Text (placed at the bottom of pages):</label>
            <input type="text" id="hf-footer" placeholder="e.g. © 2026 Altf❤️PDF. All rights reserved." />
          </div>

          <h4 style={{ marginTop: "20px" }}>Styling</h4>
          <div className="split-inputs">
            <div className="input-group">
              <label htmlFor="hf-fontsize">Font Size (pt):</label>
              <input type="number" id="hf-fontsize" defaultValue="10" min="6" max="24" />
            </div>
            <div className="input-group">
              <span className="radio-label-heading" style={{ marginBottom: "8px", display: "block" }}>Alignment:</span>
              <div className="radio-group-wrap" style={{ gap: "5px" }}>
                <button className="radio-btn active" data-group="hf-align" data-value="center">Center</button>
                <button className="radio-btn" data-group="hf-align" data-value="left">Left</button>
                <button className="radio-btn" data-group="hf-align" data-value="right">Right</button>
              </div>
            </div>
          </div>
        </div>

        <div className="action-row">
          <button id="hf-btn" className="btn" disabled>Add Header/Footer</button>
        </div>
        <div id="hf-result" className="result-box"></div>
      </div>

      {/* 16. WATERMARK PDF */}
      <div id="panel-watermark" className={getPanelClass("watermark")}>
        <div id="watermark-drop" className="dropzone">
          <svg className="dropzone-icon"><use href="#s-wm" /></svg>
          <p>Drag and drop a PDF file here</p>
          <input type="file" id="watermark-input" accept=".pdf" style={{ display: "none" }} />
        </div>
        <div id="wm-list" className="file-list"></div>

        <div className="options-card">
          <h4>Watermark Stamp Options</h4>
          <div className="split-inputs">
            <div className="input-group">
              <label htmlFor="wm-text">Watermark Text:</label>
              <input type="text" id="wm-text" defaultValue="CONFIDENTIAL" />
            </div>
            <div className="input-group">
              <label htmlFor="wm-color">Text Color:</label>
              <input type="color" id="wm-color" defaultValue="#ff0000" />
            </div>
          </div>

          <div className="slider-row" style={{ marginTop: "20px" }}>
            <label htmlFor="wm-opacity">Watermark Opacity:</label>
            <div className="slider-wrap">
              <input type="range" id="wm-opacity" min="10" max="100" defaultValue="30" />
              <span id="wm-opacity-val">30%</span>
            </div>
          </div>

          <h4 style={{ marginTop: "20px" }}>Layout Placement</h4>
          <div className="radio-group-wrap">
            <button className="radio-btn active" data-group="wm-pos" data-value="center">Center Diagonal</button>
            <button className="radio-btn" data-group="wm-pos" data-value="bottom-right">Bottom Right Corner</button>
          </div>
        </div>

        <div className="action-row">
          <button id="wm-btn" className="btn" disabled>Apply Watermark</button>
        </div>
        <div id="wm-result" className="result-box"></div>
      </div>

      {/* 17. REDACT PDF */}
      <div id="panel-redact" className={getPanelClass("redact")}>
        <div id="redact-drop" className="dropzone">
          <svg className="dropzone-icon"><use href="#s-redact" /></svg>
          <p>Drag and drop a PDF file here to draw censor boxes</p>
          <input type="file" id="redact-input" accept=".pdf" style={{ display: "none" }} />
        </div>
        <div id="redact-list" className="file-list"></div>

        <div id="redact-ui" className="redact-workspace" style={{ display: "none" }}>
          <div className="toolbar-header">
            <div className="nav-controls">
              <button id="redact-prev" className="btn btn-sec">← Previous Page</button>
              <span id="redact-page-info" className="page-counter">Page 1 / 1</span>
              <button id="redact-next" className="btn btn-sec">Next Page →</button>
            </div>
            <div className="censor-actions">
              <button id="redact-clear-page" className="btn btn-sec">Clear Current Page</button>
              <button id="redact-clear-all" className="btn btn-sec">Clear All Boxes</button>
              <button id="redact-apply-btn" className="btn">Apply Redactions &amp; Save</button>
            </div>
          </div>

          <p className="canvas-instruction">Click and drag on the document view below to select censor box regions.</p>
          <div className="canvas-viewport" style={{ overflow: "auto", border: "1px solid var(--g200)", borderRadius: "8px", margin: "15px 0", background: "var(--g50)" }}>
            <canvas id="redact-canvas" style={{ display: "block", margin: "0 auto", cursor: "crosshair" }}></canvas>
          </div>
        </div>

        <div id="redact-progress" className="progress-wrap">
          <div id="redact-bar" className="progress-bar"></div>
          <span id="redact-label" className="progress-label"></span>
        </div>
        <div id="redact-result" className="result-box"></div>
      </div>

      {/* 18. EDIT METADATA */}
      <div id="panel-metadata" className={getPanelClass("metadata")}>
        <div id="metadata-drop" className="dropzone">
          <svg className="dropzone-icon"><use href="#s-edit" /></svg>
          <p>Drag and drop a PDF file here to edit its info headers</p>
          <input type="file" id="metadata-input" accept=".pdf" style={{ display: "none" }} />
        </div>
        <div id="metadata-list" className="file-list"></div>

        <div id="metadata-form" className="options-card" style={{ display: "none" }}>
          <h4>Document Metadata Properties</h4>
          <div className="input-group">
            <label htmlFor="meta-title">Document Title</label>
            <input type="text" id="meta-title" />
          </div>
          <div className="input-group" style={{ marginTop: "12px" }}>
            <label htmlFor="meta-author">Author Name</label>
            <input type="text" id="meta-author" />
          </div>
          <div className="input-group" style={{ marginTop: "12px" }}>
            <label htmlFor="meta-subject">Subject Area</label>
            <input type="text" id="meta-subject" />
          </div>
          <div className="input-group" style={{ marginTop: "12px" }}>
            <label htmlFor="meta-keywords">Keywords (comma separated list)</label>
            <input type="text" id="meta-keywords" />
          </div>
          <div className="input-group" style={{ marginTop: "12px" }}>
            <label htmlFor="meta-creator">Creator Application</label>
            <input type="text" id="meta-creator" />
          </div>
          <div className="input-group" style={{ marginTop: "12px" }}>
            <label htmlFor="meta-producer">Producer Generator</label>
            <input type="text" id="meta-producer" />
          </div>

          <div className="action-row" style={{ marginTop: "20px" }}>
            <button id="metadata-btn" className="btn">Save &amp; Download PDF</button>
            <button id="metadata-clear-btn" className="btn btn-sec">Clear Fields</button>
          </div>
        </div>
        <div id="metadata-result" className="result-box"></div>
      </div>

      {/* 19. PROTECT PDF */}
      <div id="panel-protect" className={getPanelClass("protect")}>
        <div id="protect-drop" className="dropzone">
          <svg className="dropzone-icon"><use href="#s-lock" /></svg>
          <p>Drag and drop a PDF file here to encrypt it</p>
          <input type="file" id="protect-input" accept=".pdf" style={{ display: "none" }} />
        </div>
        <div id="protect-list" className="file-list"></div>

        <div className="options-card">
          <h4>Encryption Credentials</h4>
          <div className="input-group">
            <label htmlFor="protect-user-pw">User Password (required to open and read document):</label>
            <input type="password" id="protect-user-pw" placeholder="Enter opening password..." />
          </div>
          <div className="input-group" style={{ marginTop: "15px" }}>
            <label htmlFor="protect-owner-pw">Owner Password (restricts printing/editing/copying permissions):</label>
            <input type="password" id="protect-owner-pw" placeholder="Leave blank to match User Password" />
          </div>
        </div>

        <div className="action-row">
          <button id="protect-btn" className="btn" disabled>Encrypt PDF</button>
        </div>
        <div id="protect-result" className="result-box"></div>
      </div>

      {/* 20. UNLOCK PDF */}
      <div id="panel-unlock" className={getPanelClass("unlock")}>
        <div id="unlock-drop" className="dropzone">
          <svg className="dropzone-icon"><use href="#s-unlk" /></svg>
          <p>Drag and drop a password-locked PDF file here</p>
          <input type="file" id="unlock-input" accept=".pdf" style={{ display: "none" }} />
        </div>
        <div id="unlock-list" className="file-list"></div>

        <div className="options-card">
          <h4>Decrypt Security Credentials</h4>
          <div className="input-group">
            <label htmlFor="unlock-pw">Current Password:</label>
            <input type="password" id="unlock-pw" placeholder="Enter password to unlock and decrypt..." />
          </div>
        </div>

        <div className="action-row">
          <button id="unlock-btn" className="btn" disabled>Decrypt PDF</button>
        </div>
        <div id="unlock-result" className="result-box"></div>
      </div>

      {/* 21. FLATTEN PDF */}
      <div id="panel-flatten" className={getPanelClass("flatten")}>
        <div id="flatten-drop" className="dropzone">
          <svg className="dropzone-icon"><use href="#s-flat" /></svg>
          <p>Drag and drop a PDF file with interactive form fields here</p>
          <input type="file" id="flatten-input" accept=".pdf" style={{ display: "none" }} />
        </div>
        <div id="flatten-list" className="file-list"></div>

        <div className="action-row">
          <button id="flatten-btn" className="btn" disabled>Flatten PDF Form Fields</button>
        </div>
        <div id="flatten-result" className="result-box"></div>
      </div>

      {/* 22. PDF INFO */}
      <div id="panel-info" className={getPanelClass("info")}>
        <div id="info-drop" className="dropzone">
          <svg className="dropzone-icon"><use href="#s-info" /></svg>
          <p>Drag and drop a PDF file here to inspect properties</p>
          <input type="file" id="info-input" accept=".pdf" style={{ display: "none" }} />
        </div>
        <div id="info-grid" className="file-list"></div>

        <div id="info-display" className="info-display-box" style={{ display: "none", marginTop: "20px" }}></div>
        <div id="info-result" className="result-box"></div>
      </div>

      {/* 23. IMAGE RESIZER */}
      <div id="panel-imgresize" className={getPanelClass("imgresize")}>
        <div id="imgresize-drop" className="dropzone">
          <svg className="dropzone-icon"><use href="#s-resize" /></svg>
          <p>Drag and drop images here (JPG, PNG, WebP)</p>
          <input type="file" id="imgresize-input" multiple accept="image/*" style={{ display: "none" }} />
        </div>
        <div id="imgresize-list" className="file-list"></div>

        <div className="options-card">
          <h4>Resizing Criteria</h4>
          <div className="radio-group-wrap">
            <button className="radio-btn active" data-group="imgresize-mode" data-value="pixel">Resize by Pixels</button>
            <button className="radio-btn" data-group="imgresize-mode" data-value="percent">Resize by Percentage</button>
          </div>

          <div id="imgresize-px-row" className="split-inputs" style={{ marginTop: "15px" }}>
            <div className="input-group">
              <label htmlFor="imgresize-w">Width (pixels)</label>
              <input type="number" id="imgresize-w" defaultValue="800" min="1" />
            </div>
            <div className="aspect-ratio-toggle-wrap">
              <button id="imgresize-lock" className="lock-btn active" style={{ marginTop: "28px" }}>🔒 Lock Aspect Ratio</button>
            </div>
            <div className="input-group">
              <label htmlFor="imgresize-h">Height (pixels)</label>
              <input type="number" id="imgresize-h" defaultValue="600" min="1" />
            </div>
          </div>

          <div id="imgresize-pct-row" className="slider-row" style={{ display: "none", marginTop: "15px" }}>
            <label htmlFor="imgresize-pct">Resize Percentage Scale:</label>
            <div className="slider-wrap">
              <input type="range" id="imgresize-pct" min="1" max="100" defaultValue="50" />
              <span id="imgresize-pct-val">50%</span>
            </div>
          </div>

          <div className="slider-row" style={{ marginTop: "20px" }}>
            <label htmlFor="imgresize-quality">Export Compression Quality:</label>
            <div className="slider-wrap">
              <input type="range" id="imgresize-quality" min="10" max="100" defaultValue="85" />
              <span id="imgresize-quality-val">85%</span>
            </div>
          </div>
        </div>

        <div className="action-row">
          <button id="imgresize-btn" className="btn" disabled>Resize Images</button>
          <button id="imgresize-clear-btn" className="btn btn-sec">Clear</button>
        </div>
        <div id="imgresize-preview" className="image-previews-container"></div>
        <div id="imgresize-result" className="result-box"></div>
      </div>

      {/* 24. IMAGE COMPRESSOR */}
      <div id="panel-imgcompress" className={getPanelClass("imgcompress")}>
        <div id="imgcompress-drop" className="dropzone">
          <svg className="dropzone-icon"><use href="#s-imgcmp" /></svg>
          <p>Drag and drop images here to compress</p>
          <input type="file" id="imgcompress-input" multiple accept="image/*" style={{ display: "none" }} />
        </div>
        <div id="imgcompress-list" className="file-list"></div>

        <div className="options-card">
          <h4>Compression Ratio</h4>
          <div className="slider-row">
            <label htmlFor="imgcompress-quality">Quality Ratio Level:</label>
            <div className="slider-wrap">
              <input type="range" id="imgcompress-quality" min="10" max="100" defaultValue="70" />
              <span id="imgcompress-quality-val">70%</span>
            </div>
          </div>
        </div>

        <div className="action-row">
          <button id="imgcompress-btn" className="btn" disabled>Compress Images</button>
          <button id="imgcompress-clear-btn" className="btn btn-sec">Clear</button>
        </div>

        <div id="imgcompress-stats" className="stats-box" style={{ display: "none" }}>
          <div className="stat-item">Original: <span id="ic-stat-original">0 KB</span></div>
          <div className="stat-item">Compressed: <span id="ic-stat-output">0 KB</span></div>
          <div className="stat-item">Saved: <span id="ic-stat-saved">0 KB (0%)</span></div>
        </div>
        <div id="imgcompress-result" className="result-box"></div>
      </div>

      {/* 25. PDF PREVIEW */}
      <div id="panel-pdfpreview" className={getPanelClass("pdfpreview")}>
        <div id="preview-drop" className="dropzone">
          <svg className="dropzone-icon"><use href="#s-eye" /></svg>
          <p>Drag and drop a PDF file here to view</p>
          <input type="file" id="preview-input" accept=".pdf" style={{ display: "none" }} />
        </div>
        <div id="preview-filelist" className="file-list"></div>

        <div id="preview-ui" className="preview-workspace" style={{ display: "none" }}>
          <div className="toolbar-header">
            <div className="nav-controls">
              <button id="preview-prev" className="btn btn-sec">← Previous Page</button>
              <div className="page-counter">
                <input type="number" id="preview-page-input" defaultValue="1" style={{ width: "60px", textAlign: "center" }} />
                <span> / </span>
                <span id="preview-total">1</span>
              </div>
              <button id="preview-next" className="btn btn-sec">Next Page →</button>
            </div>
            
            <div className="zoom-controls">
              <button id="preview-zoom-out" className="btn btn-sec">Zoom Out</button>
              <span id="preview-zoom-val" className="zoom-value">100%</span>
              <button id="preview-zoom-in" className="btn btn-sec">Zoom In</button>
              <button id="preview-zoom-fit" className="btn btn-sec">Fit Page</button>
            </div>
          </div>

          <div className="preview-layout" style={{ display: "flex", gap: "20px", marginTop: "15px" }}>
            <div id="preview-strip" className="thumbnail-strip" style={{ width: "160px", border: "1px solid var(--g200)", borderRadius: "8px", height: "500px", overflowY: "auto", padding: "10px", background: "var(--g50)" }}></div>
            <div className="canvas-viewport" style={{ flex: 1, border: "1px solid var(--g200)", borderRadius: "8px", height: "500px", overflow: "auto", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--g100)" }}>
              <canvas id="preview-canvas" style={{ boxShadow: "0 4px 12px rgba(0,0,0,0.1)", display: "block" }}></canvas>
            </div>
          </div>
        </div>
        <div id="preview-result" className="result-box"></div>
      </div>

      {/* 26. HTML → PDF */}
      <div id="panel-html2pdf" className={getPanelClass("html2pdf")}>
        <div className="options-card">
          <h4>Convert HTML to PDF Documents</h4>
          <div className="input-group">
            <label htmlFor="html2pdf-raw">Raw HTML Document markup:</label>
            <textarea id="html2pdf-raw" placeholder="Write or paste your HTML here..." style={{ height: "180px", fontFamily: "monospace" }} defaultValue={`<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: sans-serif; padding: 30px; }
    h1 { color: #4f46e5; }
    p { line-height: 1.6; color: #374151; }
  </style>
</head>
<body>
  <h1>Altf❤️PDF Capture Page</h1>
  <p>This PDF was generated 100% client-side inside the browser using local layout rendering pipelines.</p>
</body>
</html>`}></textarea>
          </div>
        </div>

        <div id="html2pdf-filelist" className="file-list"></div>

        <div className="action-row" style={{ marginTop: "15px" }}>
          <button id="html2pdf-btn" className="btn">Convert HTML Code to PDF</button>
          <button id="html2pdf-tab-btn" className="btn btn-sec">Capture Current Page Screen</button>
        </div>
        <div id="html2pdf-result" className="result-box"></div>
      </div>

      {/* 28. IMAGE CROP */}
      <div id="panel-imgcrop" className={getPanelClass("imgcrop")}>
        <div id="imgcrop-drop" className="dropzone">
          <svg className="dropzone-icon"><use href="#s-scissors" /></svg>
          <p>Drag and drop a photo to crop</p>
          <input type="file" id="imgcrop-input" accept="image/*" style={{ display: "none" }} />
        </div>
        <div id="imgcrop-filelist" className="file-list"></div>

        <div className="options-card">
          <h4>Cropper Settings</h4>
          <p className="privacy-note">Click and drag inside the image viewport below to crop target boundaries.</p>

          <div className="slider-row" style={{ marginTop: "15px" }}>
            <label htmlFor="imgcrop-quality">Export Quality:</label>
            <div className="slider-wrap">
              <input type="range" id="imgcrop-quality" min="10" max="100" defaultValue="80" />
              <span id="imgcrop-quality-val">80%</span>
            </div>
          </div>
        </div>

        <div className="canvas-viewport" style={{ overflow: "auto", border: "1px solid var(--g200)", borderRadius: "8px", margin: "15px 0", background: "var(--g50)", minHeight: "350px", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <canvas id="imgcrop-canvas" style={{ display: "block", cursor: "crosshair", maxWidth: "100%", maxHeight: "100%" }}></canvas>
        </div>
        <div id="imgcrop-info" style={{ display: "block", textAlign: "center", fontSize: "14px", color: "var(--g600)", marginBottom: "15px" }}></div>

        <div className="action-row">
          <button id="imgcrop-btn" className="btn">Crop &amp; Download Image</button>
          <button id="imgcrop-reset-btn" className="btn btn-sec">Reset Viewport</button>
        </div>
        <div id="imgcrop-result" className="result-box"></div>
      </div>

      {/* 29. IMAGE FORMAT CONVERT */}
      <div id="panel-imgconvert" className={getPanelClass("imgconvert")}>
        <div id="imgconvert-drop" className="dropzone">
          <svg className="dropzone-icon"><use href="#s-convert" /></svg>
          <p>Drag and drop image files to convert format</p>
          <input type="file" id="imgconvert-input" multiple accept="image/*" style={{ display: "none" }} />
        </div>
        <div id="imgconvert-list" className="file-list"></div>

        <div className="options-card">
          <h4>Export Format Settings</h4>
          <div className="radio-group-wrap">
            <button className="radio-btn active" data-group="imgconvert-fmt" data-value="jpeg">JPEG Format</button>
            <button className="radio-btn" data-group="imgconvert-fmt" data-value="png">PNG Format</button>
            <button className="radio-btn" data-group="imgconvert-fmt" data-value="webp">WebP Format</button>
            <button className="radio-btn" data-group="imgconvert-fmt" data-value="gif">GIF Format</button>
          </div>

          <div className="slider-row" style={{ marginTop: "20px" }}>
            <label htmlFor="imgconvert-quality">Quality Settings (for JPEG/WebP):</label>
            <div className="slider-wrap">
              <input type="range" id="imgconvert-quality" min="10" max="100" defaultValue="80" />
              <span id="imgconvert-quality-val">80%</span>
            </div>
          </div>
        </div>

        <div className="action-row">
          <button id="imgconvert-btn" className="btn" disabled>Convert Images</button>
          <button id="imgconvert-clear-btn" className="btn btn-sec">Clear All</button>
        </div>
        <div id="imgconvert-result" className="result-box"></div>
      </div>

      {/* 30. BATCH PROCESS */}
      <div id="panel-batch" className={getPanelClass("batch")}>
        <div id="batch-drop" className="dropzone">
          <svg className="dropzone-icon"><use href="#s-batch" /></svg>
          <p>Drag and drop multiple PDF files here to bulk process</p>
          <input type="file" id="batch-input" multiple accept=".pdf" style={{ display: "none" }} />
        </div>
        <div id="batch-file-list" className="file-list"></div>

        <div className="options-card">
          <h4>Batch Command Action</h4>
          <div className="radio-group-wrap">
            <button className="radio-btn active" data-group="batch-action" data-value="grayscale">Grayscale PDFs (Native mode)</button>
            <button className="radio-btn" data-group="batch-action" data-value="compress">Compress PDFs (Normal mode)</button>
            <button className="radio-btn" data-group="batch-action" data-value="rotate">Rotate all pages 90° Clockwise</button>
          </div>
        </div>

        <div className="action-row">
          <button id="batch-run-btn" className="btn" disabled>Start Batch Processing</button>
          <button id="batch-clear-btn" className="btn btn-sec">Clear Files</button>
        </div>

        <h4 style={{ marginTop: "20px" }}>Execution Log</h4>
        <div id="batch-log" className="batch-log-box" style={{ background: "var(--g950)", color: "var(--g100)", fontFamily: "monospace", padding: "15px", borderRadius: "8px", fontSize: "13px", minHeight: "150px", overflowY: "auto" }}></div>
        <div id="batch-result" className="result-box"></div>
      </div>
    </div>
  );
}
