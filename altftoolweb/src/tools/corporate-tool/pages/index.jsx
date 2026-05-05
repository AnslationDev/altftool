"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Search, Filter, ChevronDown } from "lucide-react";

export default function ToolHome() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 9;

  const tools = [
    {
      name: "Slack",
      category: "Communication",
      description: "Team messaging and collaboration",
      pricing: "Premium",
      link: "https://slack.com/",
    },
    {
      name: "Microsoft Teams",
      category: "Communication",
      description: "Chat, meetings, and collaboration",
      pricing: "Subscription",
    },
    {
      name: "Zoom",
      category: "Communication",
      description: "Video conferencing platform",
      pricing: "Premium",
    },
    {
      name: "Google Meet",
      category: "Communication",
      description: "Video meetings and calls",
      pricing: "Premium",
    },
    {
      name: "Asana",
      category: "Project Management",
      description: "Task and project tracking",
      pricing: "Premium",
    },
    {
      name: "Trello",
      category: "Project Management",
      description: "Kanban-style project boards",
      pricing: "Premium",
    },
    {
      name: "Monday.com",
      category: "Project Management",
      description: "Work operating system",
      pricing: "Subscription",
    },
    {
      name: "Jira",
      category: "Project Management",
      description: "Agile project management",
      pricing: "Subscription",
    },
    {
      name: "ClickUp",
      category: "Project Management",
      description: "All-in-one productivity platform",
      pricing: "Premium",
    },
    {
      name: "Google Workspace",
      category: "Productivity Suite",
      description: "Email, docs, sheets, and drive",
      pricing: "Subscription",
    },
    {
      name: "Microsoft 365",
      category: "Productivity Suite",
      description: "Office apps and cloud services",
      pricing: "Subscription",
    },
    {
      name: "Notion",
      category: "Productivity Suite",
      description: "Notes, docs, and wikis",
      pricing: "Premium",
    },
    {
      name: "Confluence",
      category: "Productivity Suite",
      description: "Team workspace and documentation",
      pricing: "Subscription",
    },
    {
      name: "Salesforce",
      category: "CRM",
      description: "Customer relationship management",
      pricing: "Subscription",
    },
    {
      name: "HubSpot",
      category: "CRM",
      description: "Marketing, sales, and service platform",
      pricing: "Premium",
    },
    {
      name: "Zoho CRM",
      category: "CRM",
      description: "Sales automation and CRM",
      pricing: "Premium",
    },
    {
      name: "Pipedrive",
      category: "CRM",
      description: "Sales-focused CRM",
      pricing: "Subscription",
    },
    {
      name: "QuickBooks",
      category: "Finance",
      description: "Accounting and bookkeeping",
      pricing: "Subscription",
    },
    {
      name: "Xero",
      category: "Finance",
      description: "Cloud accounting software",
      pricing: "Subscription",
    },
    {
      name: "Expensify",
      category: "Finance",
      description: "Expense management and reporting",
      pricing: "Subscription",
    },
    {
      name: "Bill.com",
      category: "Finance",
      description: "Accounts payable automation",
      pricing: "Subscription",
    },
    {
      name: "BambooHR",
      category: "HR",
      description: "Human resources management",
      pricing: "Subscription",
    },
    {
      name: "Workday",
      category: "HR",
      description: "Enterprise HR and finance",
      pricing: "Subscription",
    },
    {
      name: "Gusto",
      category: "HR",
      description: "Payroll and benefits",
      pricing: "Subscription",
    },
    {
      name: "Lever",
      category: "HR",
      description: "Recruiting and applicant tracking",
      pricing: "Subscription",
    },
    {
      name: "Dropbox",
      category: "File Storage",
      description: "Cloud file storage and sharing",
      pricing: "Premium",
    },
    {
      name: "Box",
      category: "File Storage",
      description: "Enterprise content management",
      pricing: "Subscription",
    },
    {
      name: "OneDrive",
      category: "File Storage",
      description: "Microsoft cloud storage",
      pricing: "Premium",
    },
    {
      name: "Tableau",
      category: "Analytics",
      description: "Data visualization and BI",
      pricing: "Subscription",
    },
    {
      name: "Power BI",
      category: "Analytics",
      description: "Business intelligence platform",
      pricing: "Subscription",
    },
    {
      name: "Google Analytics",
      category: "Analytics",
      description: "Web analytics service",
      pricing: "Premium",
    },
    {
      name: "Mixpanel",
      category: "Analytics",
      description: "Product analytics platform",
      pricing: "Premium",
    },
    {
      name: "GitHub",
      category: "Development",
      description: "Code hosting and version control",
      pricing: "Premium",
    },
    {
      name: "GitLab",
      category: "Development",
      description: "DevOps platform",
      pricing: "Premium",
    },
    {
      name: "Docker",
      category: "Development",
      description: "Container platform",
      pricing: "Premium",
    },
    {
      name: "AWS",
      category: "Development",
      description: "Cloud computing services",
      pricing: "Pay-as-you-go",
    },
    {
      name: "Zendesk",
      category: "Customer Support",
      description: "Customer service platform",
      pricing: "Subscription",
    },
    {
      name: "Intercom",
      category: "Customer Support",
      description: "Customer messaging platform",
      pricing: "Subscription",
    },
    {
      name: "Freshdesk",
      category: "Customer Support",
      description: "Help desk software",
      pricing: "Premium",
    },
  ];

  const categories = ["All", ...new Set(tools.map((tool) => tool.category))];

  const filteredTools = useMemo(() => {
    return tools.filter((tool) => {
      const matchesSearch =
        tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tool.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tool.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory =
        selectedCategory === "All" || tool.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, selectedCategory]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory]);

  const totalPages = Math.ceil(filteredTools.length / ITEMS_PER_PAGE);

  const paginatedTools = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredTools.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredTools, currentPage]);

  return (
    <div className="min-h-screen bg-(--background) text-(--foreground) px-3 sm:px-4 md:px-6 py-4">
      <div className="m-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="heading text-center mb-2 animate-fade-up">
            Corporate Tools Directory
          </h1>
          <p className="description text-center mb-2 animate-fade-up">
            Discover and compare business productivity tools
          </p>
        </div>

        {/* Search & Filter */}
        <div className="rounded-lg shadow-md p-4 sm:p-6 mb-6 bg-(--background) text-(--foreground) border border-(--border)">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-(--foreground) w-5 h-5" />
              <div className="relative w-full rounded-lg border-2 border-[#e5e7eb]">
                <input
                  type="text"
                  placeholder="Search tools..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 sm:py-2 text-sm sm:text-base bg-transparent text-(--foreground) outline-none"
                />
              </div>
            </div>

            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-(--foreground) w-5 h-5 pointer-events-none" />
              <div className="relative w-full rounded-lg border-2 border-[#e5e7eb]">
                <ChevronDown
                  size={18}
                  className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-(--foreground) opacity-70"
                />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 sm:py-2 text-sm sm:text-base bg-(--background) cursor-pointer outline-none appearance-none"
                >
                  {categories.map((category) => (
                    <option
                      key={category}
                      value={category}
                      className="text-(--foreground) bg-(--background)"
                    >
                      {category}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {paginatedTools.map((tool, index) => (
            <div
              key={index}
              className="rounded-xl p-4 sm:p-6 border border-(--border) shadow-sm hover:shadow-lg transition-all duration-200 bg-(--background) text-(--foreground)"
            >
              <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
                <h3 className="text-sm sm:text-base md:text-lg font-semibold">
                  {tool.name}
                </h3>
                <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded-full">
                  {tool.category}
                </span>
              </div>
              <p className="text-xs sm:text-sm md:text-base leading-relaxed">
                {tool.description}
              </p>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400">
                  {tool.pricing}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-6 sm:mt-8 flex-wrap">
            {Array.from({ length: totalPages }).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentPage(index + 1)}
                className={`px-3 sm:px-4 py-1.5 text-xs sm:text-sm rounded-md ${
                  currentPage === index + 1
                    ? "bg-blue-500 text-white"
                    : "bg-blue-300 hover:bg-gray-300"
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        )}

        {filteredTools.length === 0 && (
          <div className="text-center py-10 sm:py-12 bg-white rounded-lg shadow-md">
            <p className="text-sm sm:text-lg text-slate-600">
              No tools found matching your criteria
            </p>
            <p className="text-xs sm:text-sm mt-2 text-slate-500">
              Try adjusting your search or filter
            </p>
          </div>
        )}

        {/* How It Works - 6 Cards with heading hover */}
        <div className="mt-12">
          <h2 className="text-4xl text-bold text-center mb-6 animate-fade-up">
            How It Works ?
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[
              { title: "1. Search Tools", desc: "Use the search bar to quickly find tools by name, category, or description." },
              { title: "2. Filter Categories", desc: "Narrow down your results by selecting a category that fits your needs." },
              { title: "3. Explore Details", desc: "Click on a tool to read more about its features, pricing, and benefits." },
              { title: "4. Compare Tools", desc: "Compare multiple tools side by side to see which best suits your workflow." },
              { title: "5. Check Pricing", desc: "Review each tool’s pricing to find options within your budget." },
              { title: "6. Make a Choice", desc: "Select the best tools for your team and boost productivity instantly." },
            ].map((card, index) => (
              <div
                key={index}
                className="rounded-xl p-6 border border-(--border) shadow-sm hover:shadow-lg transition-all duration-200 bg-(--background) text-(--foreground)"
              >
                <h3 className="text-lg font-semibold mb-2 transition-colors duration-200 hover:text-blue-500">
                  {card.title}
                </h3>
                <p className="text-sm leading-relaxed">{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}