'use client'

import React from 'react';
import { AncestorHeader } from './components/AncestorHeader';
import { AncestorHomePage } from './pages/AncestorHomePage';
import './style/ancestory.css';

export default function AncestoryPage() {
  return (
    <div className="ancestory-root min-h-screen bg-slate-50 dark:bg-slate-950">
      <AncestorHeader />
      <AncestorHomePage />
    </div>
  );
}
