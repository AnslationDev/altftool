const TextAreaField = ({ label, value, onChange, placeholder, rows = 3 }) => (
  <div className="space-y-1">
    <label className="block text-sm font-medium text-(--muted-foreground)">
      {label}
    </label>
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="w-full px-3 py-2 border border-(--border) rounded-lg text-sm resize-none no-scrollbar focus:outline-none
focus:ring-2
focus:ring-(--primary)
focus:border-(--primary)
transition-all duration-200 "
    />


  </div>
);

export default TextAreaField;
