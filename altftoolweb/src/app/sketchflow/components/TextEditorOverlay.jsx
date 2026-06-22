export default function TextEditorOverlay({ editorRef, editingText, style, onChange, onCommit }) {
  if (!editingText) return null;

  return (
    <textarea
      ref={editorRef}
      autoFocus
      className="sf-text-editor"
      style={style}
      value={editingText.value}
      onChange={(event) => onChange(event.target.value)}
      onBlur={onCommit}
      onKeyDown={(event) => {
        if (event.key === "Escape" || ((event.metaKey || event.ctrlKey) && event.key === "Enter")) {
          event.preventDefault();
          onCommit();
        }
        event.stopPropagation();
      }}
    />
  );
}
