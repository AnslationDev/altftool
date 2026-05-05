"use client";

import { useState, useMemo } from "react";
import { formulas } from "../data/formula";
import { Search } from "lucide-react";
import Features from "../components/Features";


export default function ToolHome() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [expandedId, setExpandedId] = useState(null);
  const [visibleCount, setVisibleCount] = useState(12);


  
  const categories = useMemo(() => {
    const cats = new Set(formulas.map((f) => f.category));
    return ["All", ...Array.from(cats).sort()];
  }, []);

 
  const filteredFormulas = useMemo(() => {
    return formulas.filter((formula) => {
      const matchesSearch =
        formula.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        formula.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        formula.syntax.toLowerCase().includes(searchTerm.toLowerCase()) ||
        formula.example.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory =
        selectedCategory === "All" || formula.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, selectedCategory]);

  const displayedFormulas =
    searchTerm || selectedCategory !== "All"
      ? filteredFormulas
      : filteredFormulas;

  const handleToggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-(--background) text-(--foreground)">
     
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        
            
            <h1 className="heading text-center animate-fade-up ">Excel Formula </h1>
        
          <p className="description text-center animate-fade-up pt-2">Search and discover Excel formulas to boost your productivity</p>
         
        </div>
      

      {/* Main Content */}
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative">
           <Search className="absolute left-3 top-3.5 h-5 w-5 text-(--foreground)" />
            <input
              type="text"
              placeholder="Search formulas by name, syntax, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border border-(--border) bg-(--card) py-3 pl-10 pr-4 rounded-lg text-(--foreground) "
            />
          </div>
        </div>

        {/* Category Filter */}
        <div className="mb-8">
          <h2 className="mb-3 text-sm font-semibold text-(--foreground)">Filter by Category</h2>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors cursor-pointer ${
                  selectedCategory === category
                    ? "bg-blue-600 text-white"
                    : "border border-gray-300 bg-(--card) text-(--foreground) hover:border-blue-400 "
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Results Info */}
        <div className="mb-6">
          <p className="text-sm text-(--foreground)">
            Showing {displayedFormulas.length} of {formulas.length} formulas
            {searchTerm && ` • Searching for "${searchTerm}"`}
            {selectedCategory !== "All" && ` • Category: ${selectedCategory}`}
          </p>
        </div>

        {/* Formulas Grid */}
        {displayedFormulas.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 "> 
            {displayedFormulas.map((formula) => (
              <div
                key={formula.id}
                className="flex flex-col rounded-lg border border-gray-300 bg-(--card) shadow-sm transition-all hover:shadow-md hover:border-l-4 hover:border-l-(--primary)"
              >
                {/* Card Header */}
                <div
                  onClick={() => handleToggleExpand(formula.id)}
                  className="cursor-pointer bg-(--card) px-4 py-4"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-(--foreground)">
                        {formula.name}
                      </h3>
                      <span className="inline-block mt-2 rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-500">
                        {formula.category}
                      </span>
                    </div>
                    <svg
                      className={`h-5 w-5 text-blue-600 transition-transform ${
                        expandedId === formula.id ? "rotate-180" : ""
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 14l-7 7m0 0l-7-7m7 7V3"
                      />
                    </svg>
                  </div>
                </div>

                {/* Card Content */}
                <div className="flex-1 px-4 py-4">
                  <div className="mb-3">
                    <p className="text-xs font-semibold text-(--muted-foreground) uppercase tracking-wide">
                      Syntax
                    </p>
                    <p className="mt-1 rounded bg-(--card) px-2 py-1 font-mono text-sm text-(--foreground">
                      {formula.syntax}
                    </p>
                  </div>

                  {expandedId === formula.id && (
                    <>
                      <div className="mb-3">
                        <p className="text-xs font-semibold text-(--muted-foreground) uppercase tracking-wide">
                          Description
                        </p>
                        <p className="mt-1 text-sm text-(--muted-foreground)">
                          {formula.description}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs font-semibold text-(--muted-foreground) uppercase tracking-wide">
                          Example
                        </p>
                        <p className="mt-1 rounded bg-(--card) px-2 py-2 font-mono text-sm text-blue-500">
                          {formula.example}
                        </p>
                      </div>
                    </>
                  )}
                </div>

                {/* Card Footer */}
                <div className="border-t border-(--border) bg-(--card) px-4 py-3 text-center">
                  <button
                    onClick={() => handleToggleExpand(formula.id)}
                    className="text-sm font-medium cursor-pointer text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    {expandedId === formula.id ? "Show Less" : "Learn More"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-gray-300 bg-white p-12 text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h3 className="mt-2 text-lg font-medium text-black">
              No formulas found
            </h3>
            <p className="mt-1 text-gray-600">
              Try adjusting your search or filter criteria
            </p>
          </div>
        )}
       
        {/* Info Section */}
        {/* {!searchTerm && selectedCategory === "All" && (
          <div className="mt-12 rounded-lg bg-blue-50 p-6 text-center">
            <p className="text-sm text-gray-700">
               Showing the first 6 formulas. Use the search bar or category filters to
              discover more formulas!
            </p>
          </div>
        )} */}
      </main>

    <Features/>
    </div>
  );
}