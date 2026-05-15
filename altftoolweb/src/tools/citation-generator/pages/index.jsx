"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Sparkles, Wand2, History as HistoryIcon, Trash2, Plus } from 'lucide-react';
import SourceTypeSelector from '../components/SourceTypeSelector';
import StyleSelector from '../components/StyleSelector';
import CitationForm from '../components/CitationForm';
import CitationPreview from '../components/CitationPreview';
import HistoryPanel from '../components/HistoryPanel';
import { generateCitation } from '../utils/citation-engine';

export default function CitationGenerator() {
  const [sourceType, setSourceType] = useState('Book');
  const [style, setStyle] = useState('APA 7');
  const [formData, setFormData] = useState({
    authors: '',
    title: '',
    publisher: '',
    year: '',
    url: '',
    journal: '',
    volume: '',
    issue: '',
    pages: '',
    doi: '',
    edition: '',
    city: '',
    accessDate: new Date().toISOString().split('T')[0],
    publishedDate: ''
  });
  const [citation, setCitation] = useState('');
  const [history, setHistory] = useState([]);

  // Load history from LocalStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem('citation_history');
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, []);

  // Update citation whenever form data or style changes
  useEffect(() => {
    if (formData.title || formData.authors) {
      const generated = generateCitation({ ...formData, sourceType }, style);
      setCitation(generated);
    } else {
      setCitation('');
    }
  }, [formData, style, sourceType]);

  const saveToHistory = () => {
    if (!citation) return;
    
    const newItem = {
      id: Date.now(),
      citation,
      style,
      sourceType,
      data: { ...formData },
      timestamp: new Date().toISOString()
    };
    
    const newHistory = [newItem, ...history].slice(0, 50);
    setHistory(newHistory);
    localStorage.setItem('citation_history', JSON.stringify(newHistory));
  };

  const deleteFromHistory = (id) => {
    const newHistory = history.filter(item => item.id !== id);
    setHistory(newHistory);
    localStorage.setItem('citation_history', JSON.stringify(newHistory));
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('citation_history');
  };

  const reuseCitation = (item) => {
    setSourceType(item.sourceType);
    setStyle(item.style);
    setFormData(item.data);
  };

  const clearForm = () => {
    setFormData({
      authors: '',
      title: '',
      publisher: '',
      year: '',
      url: '',
      journal: '',
      volume: '',
      issue: '',
      pages: '',
      doi: '',
      edition: '',
      city: '',
      accessDate: new Date().toISOString().split('T')[0],
      publishedDate: ''
    });
    setCitation('');
  };

  // Mock auto-fill from URL
  const handleAutoFill = () => {
    if (!formData.url) return;
    // In a real app, you'd fetch metadata here. 
    // For this tool, we'll simulate a smart fill for demo purposes if URL contains certain keywords
    if (formData.url.includes('nature.com')) {
      setFormData(prev => ({
        ...prev,
        title: 'Global Warming Trends in the 21st Century',
        authors: 'Smith, A., Johnson, B.',
        journal: 'Nature Climate Change',
        year: '2024',
        volume: '14',
        issue: '2',
        pages: '145-160',
        doi: '10.1038/s41558-024-01931-y'
      }));
      setSourceType('Journal Article');
    } else if (formData.url.includes('amazon.com')) {
      setFormData(prev => ({
        ...prev,
        title: 'The Future of AI',
        authors: 'Tim Urban',
        publisher: 'Wait But Why Publications',
        year: '2025'
      }));
      setSourceType('Book');
    }
  };

  return (
    <div className="min-h-screen bg-(--background) p-4 md:p-8 transition-colors duration-300">
      <div className="max-w-5xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-(--primary)/10 text-(--primary) rounded-full mb-4 border border-(--primary)/20"
          >
            <Sparkles size={16} />
            <span className="text-xs font-black uppercase tracking-wider">Premium Academic Tool</span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-black text-(--foreground) mb-4 tracking-tight"
          >
            Citation <span className="text-(--primary)">Generator</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-base text-(--secondary-foreground) max-w-2xl mx-auto"
          >
            Create accurate citations instantly in APA, MLA, Chicago, Harvard, IEEE, and Vancouver styles. Professional, fast, and publication-ready.
          </motion.p>
        </div>

        <div className="flex flex-col gap-8">
          {/* Main Workspace */}
          <div className="space-y-8 w-full">
            {/* Form Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-(--card) border border-(--border) rounded-[2rem] p-6 md:p-10 shadow-2xl relative overflow-hidden w-full transition-all hover:shadow-blue-500/10"
            >
              <div className="absolute top-0 right-0 p-4">
                <button
                  onClick={clearForm}
                  className="p-2 hover:bg-red-50 text-red-400 hover:text-red-500 rounded-xl transition-all"
                  title="Clear Form"
                >
                  <Trash2 size={20} />
                </button>
              </div>

              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 bg-(--primary) text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                  <BookOpen size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-(--foreground)">New Citation</h2>
                  <p className="text-sm text-(--secondary-foreground)">Select source type and fill details</p>
                </div>
              </div>

              <SourceTypeSelector selected={sourceType} onSelect={setSourceType} />
              
              <div className="relative mb-8">
                <StyleSelector selected={style} onSelect={setStyle} />
              </div>

              {sourceType === "Website" && (
                <div className="mb-8 flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    placeholder="Paste URL here for auto-fill..."
                    className="flex-1 px-4 py-4 bg-(--background) border border-(--border) rounded-2xl focus:outline-none focus:ring-2 focus:ring-(--primary) transition-all text-(--foreground) placeholder:text-(--secondary-foreground)/50"
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  />
                  <button
                    onClick={handleAutoFill}
                    className="px-8 py-4 bg-(--primary) text-white rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-(--primary-hover) transition-all active:scale-95 shadow-lg shadow-blue-500/20"
                  >
                    <Wand2 size={20} /> Auto-fill
                  </button>
                </div>
              )}

              <CitationForm
                data={formData}
                onChange={setFormData}
                sourceType={sourceType}
              />

              <div className="mt-8 flex justify-end">
                <button
                  onClick={saveToHistory}
                  disabled={!citation}
                  className="px-8 py-4 bg-(--primary) text-white rounded-2xl font-black text-lg flex items-center gap-3 hover:bg-(--primary-hover) transition-all active:scale-95 shadow-xl shadow-blue-500/20 disabled:opacity-50 disabled:grayscale"
                >
                  <Plus size={24} /> Save Citation
                </button>
              </div>
            </motion.div>

            {/* Preview Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <CitationPreview citation={citation} style={style} />
            </motion.div>

            {/* History Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <HistoryPanel
                history={history}
                onClear={clearHistory}
                onDelete={deleteFromHistory}
                onReuse={reuseCitation}
              />
            </motion.div>
          </div>
        </div>
      </div>
      
      {/* Footer / Info */}
      <div className="mt-20 text-center text-(--secondary-foreground) text-sm pb-10">
        <p>© 2024 Citation Generator Tool. All formatting follows official style guides.</p>
      </div>
    </div>
  );
}
