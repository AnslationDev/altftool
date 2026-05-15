import React from 'react';
import { User, Type, Link, Calendar, Building, Hash, MapPin, Bookmark, Globe, Tv } from 'lucide-react';

const InputField = ({ label, name, value, onChange, icon: Icon, placeholder, type = "text" }) => (
  <div className="flex flex-col gap-1.5 w-full">
    <label className="text-sm font-semibold text-(--foreground) ml-1">{label}</label>
    <div className="relative group">
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-(--secondary-foreground) group-focus-within:text-(--primary) transition-colors">
        <Icon size={18} />
      </div>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full pl-10 pr-4 py-3 bg-(--card) border border-(--border) rounded-xl focus:outline-none focus:ring-2 focus:ring-(--primary) focus:border-transparent transition-all placeholder:text-(--secondary-foreground)/50"
      />
    </div>
  </div>
);

const CitationForm = ({ data, onChange, sourceType }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    onChange({ ...data, [name]: value });
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-6 w-full">
      <InputField
        label="Author(s)"
        name="authors"
        value={data.authors || ''}
        onChange={handleChange}
        icon={User}
        placeholder="e.g. John Doe, Jane Smith"
      />
      <InputField
        label="Title"
        name="title"
        value={data.title || ''}
        onChange={handleChange}
        icon={Type}
        placeholder="e.g. The Great Gatsby"
      />

      {sourceType === "Book" && (
        <>
          <InputField label="Publisher" name="publisher" value={data.publisher || ''} onChange={handleChange} icon={Building} placeholder="e.g. Penguin Books" />
          <InputField label="Year" name="year" value={data.year || ''} onChange={handleChange} icon={Calendar} placeholder="e.g. 2024" />
          <InputField label="Edition" name="edition" value={data.edition || ''} onChange={handleChange} icon={Hash} placeholder="e.g. 2nd" />
          <InputField label="City" name="city" value={data.city || ''} onChange={handleChange} icon={MapPin} placeholder="e.g. New York" />
        </>
      )}

      {sourceType === "Website" && (
        <>
          <InputField label="URL" name="url" value={data.url || ''} onChange={handleChange} icon={Link} placeholder="https://example.com" />
          <InputField label="Website Title" name="publisher" value={data.publisher || ''} onChange={handleChange} icon={Globe} placeholder="e.g. Wikipedia" />
          <InputField label="Published Date" name="publishedDate" value={data.publishedDate || ''} onChange={handleChange} icon={Calendar} placeholder="e.g. 2024-05-13" />
          <InputField label="Access Date" name="accessDate" value={data.accessDate || ''} onChange={handleChange} icon={Calendar} placeholder="e.g. 2025-01-01" />
        </>
      )}

      {sourceType === "Journal Article" && (
        <>
          <InputField label="Journal Name" name="journal" value={data.journal || ''} onChange={handleChange} icon={Bookmark} placeholder="e.g. Nature" />
          <InputField label="Volume" name="volume" value={data.volume || ''} onChange={handleChange} icon={Hash} placeholder="e.g. 15" />
          <InputField label="Issue" name="issue" value={data.issue || ''} onChange={handleChange} icon={Hash} placeholder="e.g. 4" />
          <InputField label="Pages" name="pages" value={data.pages || ''} onChange={handleChange} icon={Type} placeholder="e.g. 120-135" />
          <InputField label="DOI" name="doi" value={data.doi || ''} onChange={handleChange} icon={Link} placeholder="e.g. 10.1038/nature" />
          <InputField label="Year" name="year" value={data.year || ''} onChange={handleChange} icon={Calendar} placeholder="e.g. 2023" />
        </>
      )}

      {(sourceType === "YouTube Video" || sourceType === "Podcast") && (
        <>
          <InputField label="URL" name="url" value={data.url || ''} onChange={handleChange} icon={Link} placeholder="https://youtube.com/..." />
          <InputField label="Publisher/Channel" name="publisher" value={data.publisher || ''} onChange={handleChange} icon={Tv} placeholder="e.g. TEDx Talks" />
          <InputField label="Published Date" name="publishedDate" value={data.publishedDate || ''} onChange={handleChange} icon={Calendar} placeholder="e.g. 2024-05-13" />
        </>
      )}

      {/* Fallback for other types - generic fields */}
      {!["Book", "Website", "Journal Article", "YouTube Video", "Podcast"].includes(sourceType) && (
        <>
          <InputField label="Publisher/Source" name="publisher" value={data.publisher || ''} onChange={handleChange} icon={Building} placeholder="Source name" />
          <InputField label="Date/Year" name="year" value={data.year || ''} onChange={handleChange} icon={Calendar} placeholder="Year" />
          <InputField label="URL/DOI" name="url" value={data.url || ''} onChange={handleChange} icon={Link} placeholder="Link if applicable" />
        </>
      )}
    </div>
  );
};

export default CitationForm;
