const InputField = ({ label, value, onChange, placeholder, type = "text" }) => (
  <div className="space-y-1">
    <label className="block text-sm font-medium text-(--muted-foreground)">
      {label}
    </label>

    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-3 py-2 border border-(--border) rounded-lg text-sm focus:outline-none
focus:ring-2
focus:ring-(--primary)
focus:border-(--primary)
transition-all duration-200"
    />


  </div>
);

export default InputField;
