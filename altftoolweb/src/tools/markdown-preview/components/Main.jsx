import { useState } from "react";
import {
  FileText,
  Eye,
  Code,
  Copy,
  Check,
  Download,
  Maximize2,
} from "lucide-react";

export default function Main() {
  const [markdown, setMarkdown] = useState(`# Welcome to Markdown Previewer! 👋

## Features
- **Bold text** and *italic text*
- [Links](https://example.com)
- Lists and more!

### Code Example
\`\`\`javascript
function hello() {
  console.log("Hello World!");
}
\`\`\`

> This is a blockquote

### Task List
- [x] Write some markdown
- [ ] Preview it live
- [ ] Download as HTML

---

**Try editing the markdown on the left!**`);

  const [copied, setCopied] = useState(false);
  const [view, setView] = useState("split"); // split, editor, preview

  // Simple markdown to HTML converter
  const parseMarkdown = (text) => {
    let html = text;

    // Headers
    html = html.replace(
      /^### (.*$)/gim,
      '<h3 class="text-foreground font-semibold text-lg mt-4 mb-2">$1</h3>',
    );
    html = html.replace(
      /^## (.*$)/gim,
      '<h2 class="text-foreground font-bold text-xl mt-5 mb-3">$1</h2>',
    );
    html = html.replace(
      /^# (.*$)/gim,
      '<h1 class="text-foreground font-extrabold text-2xl mt-6 mb-4">$1</h1>',
    );

    // Bold
    html = html.replace(
      /\*\*(.+?)\*\*/g,
      '<strong class="font-bold text-foreground">$1</strong>',
    );
    html = html.replace(
      /__(.+?)__/g,
      '<strong class="font-bold text-foreground">$1</strong>',
    );

    // Italic
    html = html.replace(
      /\*(.+?)\*/g,
      '<em class="italic text-foreground">$1</em>',
    );
    html = html.replace(
      /_(.+?)_/g,
      '<em class="italic text-foreground">$1</em>',
    );

    // Links
    html = html.replace(
      /\[([^\]]+)\]\(([^)]+)\)/g,
      '<a href="$2" target="_blank" class="text-primary hover:text-primary/80 underline">$1</a>',
    );

    // Images
    html = html.replace(
      /!\[([^\]]*)\]\(([^)]+)\)/g,
      '<img src="$2" alt="$1" class="max-w-full h-auto rounded-lg my-4 border border-border" />',
    );

    // Code blocks
    html = html.replace(
      /```(\w+)?\n([\s\S]*?)```/g,
      '<pre class="bg-muted text-foreground p-4 rounded-lg overflow-x-auto my-4"><code class="font-mono text-sm">$2</code></pre>',
    );

    // Inline code
    html = html.replace(
      /`([^`]+)`/g,
      '<code class="bg-muted text-foreground px-2 py-1 rounded text-sm font-mono">$1</code>',
    );

    // Blockquotes
    html = html.replace(
      /^> (.+)/gim,
      '<blockquote class="border-l-4 border-primary pl-4 italic text-foreground my-4 bg-muted/30 py-2 px-4 rounded-r-lg">$1</blockquote>',
    );

    // Horizontal rule
    html = html.replace(/^---$/gim, '<hr class="my-6 border-border" />');

    // Task lists
    html = html.replace(
      /- \[x\] (.+)/gi,
      '<div class="flex items-center gap-2 my-2"><input type="checkbox" checked disabled class="w-4 h-4 accent-primary" /><span class="text-foreground">$1</span></div>',
    );
    html = html.replace(
      /- \[ \] (.+)/gi,
      '<div class="flex items-center gap-2 my-2"><input type="checkbox" disabled class="w-4 h-4 accent-primary" /><span class="text-foreground">$1</span></div>',
    );

    // Unordered lists
    html = html.replace(
      /^\* (.+)/gim,
      '<li class="ml-6 list-disc text-foreground">$1</li>',
    );
    html = html.replace(
      /^- (.+)/gim,
      '<li class="ml-6 list-disc text-foreground">$1</li>',
    );

    // Ordered lists
    html = html.replace(
      /^\d+\. (.+)/gim,
      '<li class="ml-6 list-decimal text-foreground">$1</li>',
    );

    // Wrap consecutive list items
    html = html.replace(
      /(<li[^>]*>.*<\/li>\n?)+/g,
      '<ul class="my-4 space-y-1">$&</ul>',
    );

    // Line breaks
    html = html.replace(/\n/g, "<br />");

    return html;
  };

  const htmlOutput = parseMarkdown(markdown);

  const copyMarkdown = () => {
    navigator.clipboard.writeText(markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadHTML = () => {
    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Markdown Preview</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; line-height: 1.6; background-color: #ffffff; color: #333333; }
    @media (prefers-color-scheme: dark) {
      body { background-color: #1a1a1a; color: #e0e0e0; }
    }
    h1, h2, h3 { margin-top: 24px; margin-bottom: 16px; font-weight: 600; }
    h1 { font-size: 2em; border-bottom: 1px solid #eee; padding-bottom: 8px; }
    h2 { font-size: 1.5em; }
    h3 { font-size: 1.25em; }
    code { background: #f4f4f4; padding: 2px 6px; border-radius: 3px; font-size: 0.9em; }
    @media (prefers-color-scheme: dark) {
      code { background: #2d2d2d; }
    }
    pre { background: #2d2d2d; color: #f8f8f8; padding: 16px; border-radius: 6px; overflow-x: auto; }
    blockquote { border-left: 4px solid #3b82f6; padding-left: 16px; margin: 16px 0; color: #666; font-style: italic; }
    @media (prefers-color-scheme: dark) {
      blockquote { color: #aaa; }
    }
    a { color: #3b82f6; text-decoration: none; } a:hover { text-decoration: underline; }
    img { max-width: 100%; height: auto; border-radius: 8px; margin: 16px 0; }
    ul, ol { margin: 16px 0; }
    hr { border: 0; border-top: 1px solid #ddd; margin: 24px 0; }
  </style>
</head>
<body>
  ${htmlOutput.replace(/<br\s*\/?>/g, "\n")}
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "markdown-preview.html";
    a.click();
    URL.revokeObjectURL(url);
  };

  const loadSample = () => {
    setMarkdown(`# Markdown Cheat Sheet 📝

## Text Formatting
**Bold Text** or __Bold Text__
*Italic Text* or _Italic Text_
***Bold and Italic***

## Links and Images
[Visit GitHub](https://github.com)
![Sample Image](https://via.placeholder.com/400x200)

## Lists
### Unordered List
- Item 1
- Item 2
  - Nested Item
- Item 3

### Ordered List
1. First item
2. Second item
3. Third item

### Task List
- [x] Completed task
- [ ] Pending task
- [ ] Another task

## Code
Inline code: \`console.log('Hello')\`

### Code Block
\`\`\`javascript
function greet(name) {
  return \`Hello, \${name}!\`;
}
console.log(greet('World'));
\`\`\`

## Blockquotes
> "The best way to predict the future is to invent it."
> - Alan Kay

## Horizontal Rule
---

## Tables (basic)
| Header 1 | Header 2 |
|----------|----------|
| Cell 1   | Cell 2   |
| Cell 3   | Cell 4   |

**Happy Markdown Writing! ✨**`);
  };

  return (
    <>
      <div className="bg-(--background)  px-4 sm:px-6 py-3">

     <div >
      <h1 className="heading text-center pt-8 animate-fade-up">Markdown Previewer</h1>
      <p className="description text-center animate-fade-up">
        Format, validate, and visualize Markdown with ease
      </p>
      </div>

       
      </div>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8">

 <div className="max-w-5xl mx-auto flex flex-wrap  m-4 border border-(--border) rounded-md shadow-lg p-4 item-center justify-center">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setView("split")}
              className={`bg-(--card) hover:bg-(--primary) border border-(--border) hover:bg-primary/90 text-foreground px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 cursor-pointer shadow-lg ${
                view === "split"
                  ? "bg-(--primary) text-(--foreground) shadow-lg"
                  : "bg-(--muted) text-(--foreground) hover:bg-accent"
              }`}
            >
              <Code className="w-4 h-4" />
              Split
            </button>
            <button
              onClick={() => setView("editor")}
              className={`bg-(--card) hover:bg-(--primary) border border-(--border)  text-foreground px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center cursor-pointer gap-2 shadow-lg ${
                view === "editor"
                  ? "bg-(--primary) text-(--foreground) shadow-lg"
                  : "bg-(--muted) text-(--foreground) hover:bg-accent"
              }`}
            >
              <FileText className="w-4 h-4" />
              Editor
            </button>
            <button
              onClick={() => setView("preview")}
              className={`bg-(--card) hover:bg-(--primary) border border-(--border)  text-foreground px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center cursor-pointer  shadow-lg gap-2 ${
                view === "preview"
                  ? "bg-(--primary) text-(--foreground) shadow-lg"
                  : "bg-(--muted) text-(--foreground)hover:bg-accent"
              }`}
            >
              <Eye className="w-4 h-4" />
              Preview
            </button>
          
            <button
              onClick={loadSample}
              className="bg-(--card) hover:bg-(--primary) border border-(--border)  text-foreground px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center cursor-pointer gap-2 shadow-lg"
            >
              Load Sample
            </button>
            <button
              onClick={copyMarkdown}
              className="bg-(--card) hover:bg-(--primary) border border-(--border)  text-foreground px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center cursor-pointer gap-2 shadow-lg"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-green-600" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copy
                </>
              )}
            </button>
            <button
              onClick={downloadHTML}
              className="bg-(--card) hover:bg-(--primary) border border-(--border)  text-foreground px-4 py-2 rounded-lg text-sm font-medium transition-all flex cursor-pointer items-center gap-2 shadow-lg"
            >
              <Download className="w-4 h-4" />
              Download HTML
            </button>
          </div>
        </div>
        <div
          className={`grid ${view === "split" ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1"} gap-6 h-full `}
        >
          {/* Editor */}
          {(view === "split" || view === "editor") && (
            <div className="bg-(--card) rounded-2xl shadow-xl border border-(--border) flex flex-col overflow-hidden">
              <div className="bg-(--card) px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Code className="w-5 h-5 text-(--primary) " />
                  <h2 className="text-lg font-bold text-(--foreground)">
                    Markdown Editor
                  </h2>
                </div>
                <span className="text-foreground/80 text-sm">
                  {markdown.length} characters
                </span>
              </div>
              <textarea
                value={markdown}
                onChange={(e) => setMarkdown(e.target.value)}
                placeholder="Enter your markdown here..."
                className="flex-1 p-6 font-mono text-sm text-(--foreground) bg-(--background) resize-none focus:outline-none"
                style={{ minHeight: "500px" }}
              />
            </div>
          )}

          {/* Preview */}
          {(view === "split" || view === "preview") && (
            <div className="bg-card rounded-2xl shadow-xl border border-(--border) flex flex-col overflow-hidden">
              <div className="bg-(--card) px-6 py-4 flex items-center gap-3">
                <Eye className="w-5 h-5 text-(--primary)" />
                <h2 className="text-lg font-bold text-foreground">
                  Live Preview
                </h2>
              </div>
              <div
                className="flex-1 p-6 prose prose-sm max-w-none overflow-y-auto bg-(--background)"
                style={{ minHeight: "500px" }}
                dangerouslySetInnerHTML={{ __html: htmlOutput }}
              />
            </div>
          )}
        </div>

     
      </main>
    </>
  );
}
