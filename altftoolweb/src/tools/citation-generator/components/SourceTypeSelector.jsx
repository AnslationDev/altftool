import React from 'react';
import { SOURCE_TYPES } from '../utils/citation-engine';
import { Book, Globe, FileText, Newspaper, Tv, Mic, GraduationCap, FileSearch } from 'lucide-react';

const icons = {
  "Book": <Book size={18} />,
  "Website": <Globe size={18} />,
  "Journal Article": <FileText size={18} />,
  "Newspaper": <Newspaper size={18} />,
  "Magazine": <Newspaper size={18} />,
  "YouTube Video": <Tv size={18} />,
  "Podcast": <Mic size={18} />,
  "Thesis": <GraduationCap size={18} />,
  "Research Paper": <FileSearch size={18} />
};

const SourceTypeSelector = ({ selected, onSelect }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 mb-8">
      {SOURCE_TYPES.map((type) => (
        <button
          key={type}
          onClick={() => onSelect(type)}
          className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl transition-all border ${
            selected === type
              ? 'bg-(--primary) text-white border-(--primary) shadow-lg scale-105'
              : 'bg-(--card) text-(--foreground) border-(--border) hover:bg-(--card-hover-bg)'
          }`}
        >
          <div className={`${selected === type ? 'text-white' : 'text-(--primary)'}`}>
            {icons[type] || <FileText size={18} />}
          </div>
          <span className="text-[11px] font-bold whitespace-nowrap">{type}</span>
        </button>
      ))}
    </div>
  );
};

export default SourceTypeSelector;
