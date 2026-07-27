"use client";

import { forwardRef, useRef } from "react";

/**
 * A single editor pane (input or output). Reused for both sides of the shell —
 * there is exactly one editor component in the section, not one per tool.
 *
 * @param {{
 *   title: string,
 *   icon?: React.ComponentType<{ className?: string }>,
 *   value: string,
 *   onChange?: (value: string) => void,
 *   readOnly?: boolean,
 *   placeholder?: string,
 *   actions?: React.ReactNode,
 *   footer?: React.ReactNode,
 *   onDropText?: (text: string) => void,
 * }} props
 */
const EditorPane = forwardRef(function EditorPane(
  { title, icon: Icon, value, onChange, readOnly, placeholder, actions, footer, onDropText },
  ref
) {
  const gutterRef = useRef(null);

  const handleScroll = (e) => {
    if (gutterRef.current) {
      gutterRef.current.scrollTop = e.target.scrollTop;
    }
  };

  const linesCount = Math.max(1, value.split("\n").length);
  const lineNumbers = Array.from({ length: linesCount }, (_, i) => i + 1);

  return (
    <section className="flex min-w-0 flex-col rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700/70 dark:bg-slate-950/40">
      {/* header */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 pb-3 pt-4 sm:px-5">
        <h2 className="flex items-center gap-2 text-sm font-bold text-slate-900 sm:text-base dark:text-white">
          {Icon ? <Icon className="h-[18px] w-[18px] text-blue-600" /> : null}
          {title}
        </h2>
        {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
      </div>

      {/* editor body with gutter */}
      <div
        className="mx-4 flex flex-1 overflow-hidden rounded-xl border border-slate-200 bg-slate-50/50 sm:mx-5 dark:border-slate-700/70 dark:bg-slate-900/60"
        onDragOver={onDropText ? (e) => e.preventDefault() : undefined}
        onDrop={
          onDropText
            ? (e) => {
                e.preventDefault();
                const file = e.dataTransfer?.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = () => onDropText(String(reader.result || ""));
                  reader.readAsText(file);
                }
              }
            : undefined
        }
      >
        {/* line numbers gutter */}
        <div
          ref={gutterRef}
          className="w-10 select-none text-right pr-2.5 py-4 font-mono text-[13px] leading-relaxed text-slate-400/70 border-r border-slate-200/80 dark:border-slate-800 dark:text-slate-600 bg-slate-100/10 dark:bg-slate-950/10 overflow-hidden"
        >
          {lineNumbers.map((n) => (
            <div key={n}>{n}</div>
          ))}
        </div>

        {/* text editor */}
        <textarea
          ref={ref}
          value={value}
          onChange={onChange ? (e) => onChange(e.target.value) : undefined}
          readOnly={readOnly}
          placeholder={placeholder}
          spellCheck={false}
          wrap="off"
          onScroll={handleScroll}
          suppressHydrationWarning
          className="h-[20rem] flex-1 resize-none bg-transparent p-4 font-mono text-[13px] leading-relaxed text-slate-800 outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/25 lg:h-[24rem] dark:text-slate-200 dark:placeholder:text-slate-500 overflow-x-auto overflow-y-auto"
        />
      </div>

      {footer ? (
        <div className="flex items-center justify-between px-4 py-3.5 sm:px-5">{footer}</div>
      ) : (
        <div className="h-4" />
      )}
    </section>
  );
});

export default EditorPane;
