import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// Renders an n8n workflow description (Markdown) as clean, themed content.
// Headings ("Setup", "Who is this for?", …) become real headings; images are dropped.
export default function Markdown({ children }) {
  return (
    <div className="text-sm leading-relaxed text-(--color-foreground)">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: (p) => <h3 className="mt-6 mb-2 text-lg font-bold text-(--color-foreground)" {...p} />,
          h2: (p) => <h3 className="mt-6 mb-2 text-lg font-bold text-(--color-foreground)" {...p} />,
          h3: (p) => <h4 className="mt-5 mb-2 text-base font-semibold text-(--color-foreground)" {...p} />,
          h4: (p) => <h4 className="mt-4 mb-1.5 text-sm font-semibold text-(--color-foreground)" {...p} />,
          p: (p) => <p className="mb-3" {...p} />,
          ul: (p) => <ul className="mb-3 ml-5 list-disc space-y-1" {...p} />,
          ol: (p) => <ol className="mb-3 ml-5 list-decimal space-y-1" {...p} />,
          li: (p) => <li className="leading-relaxed" {...p} />,
          strong: (p) => <strong className="font-semibold" {...p} />,
          em: (p) => <em className="italic" {...p} />,
          a: (p) => (
            <a className="text-(--color-primary) underline" target="_blank" rel="noopener noreferrer" {...p} />
          ),
          img: () => null,
          hr: () => <hr className="my-5 border-(--color-border)" />,
          code: (p) => (
            <code className="rounded bg-(--color-muted) px-1.5 py-0.5 text-xs" {...p} />
          ),
          blockquote: (p) => (
            <blockquote className="my-3 border-l-2 border-(--color-primary) pl-3 text-(--color-muted-foreground)" {...p} />
          ),
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
