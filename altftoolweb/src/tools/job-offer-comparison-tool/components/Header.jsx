"use client";

import React from "react";
import { Moon, Sun, Download, Plus, Menu } from "lucide-react";

const Header = ({
  theme,
  setTheme,
  onAddOffer,
  onExport,
  sidebarOpen,
  onToggleSidebar,
}) => {
  return (
    <div className="job-header">
      <div className="job-header-left">
        <button
          type="button"
          className="job-theme-toggle job-menu-toggle"
          onClick={onToggleSidebar}
          aria-label={
            sidebarOpen ? "Close navigation menu" : "Open navigation menu"
          }
          aria-expanded={sidebarOpen}
        >
          <Menu size={20} />
        </button>
        <div>
          <h1 className="job-header-title">Job Offer Comparison</h1>
          <p className="job-header-subtitle">
            Compare multiple offers and find your best opportunity
          </p>
        </div>
      </div>
      <div className="job-header-right">
        <button
          className="job-btn job-btn-secondary"
          onClick={onExport}
          title="Export comparison"
        >
          <Download size={18} />
          Export
        </button>
        <button
          className="job-btn job-btn-primary"
          onClick={onAddOffer}
          title="Add new job offer"
        >
          <Plus size={18} />
          Add Offer
        </button>
        <button
          className="job-theme-toggle"
          onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          title="Toggle dark mode"
        >
          {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
        </button>
      </div>
    </div>
  );
};

export default Header;
