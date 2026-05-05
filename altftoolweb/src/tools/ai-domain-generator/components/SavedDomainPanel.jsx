"use client";

import { useContext, useState } from "react";
import { DomainContext } from "../context/DomainContext";
import { Trash, X } from "lucide-react";

export default function SavedDomainsPanel() {
  const { savedDomains, removeDomain } = useContext(DomainContext);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <>
      {/* Panel Button */}
      <div
        className="bg-(--background) p-4 rounded-xl border border-(--border) cursor-pointer hover:shadow-md transition "
        onClick={openModal}
      >
        <h3 className="font-semibold mb-2 flex items-center gap-2">
          ⭐ Saved Domains
          {savedDomains.length > 0 && (
            <span className="text-sm text-(--foreground)/70">
              ({savedDomains.length})
            </span>
          )}
        </h3>
        {savedDomains.length === 0 && (
          <p className="text-sm text-(--foreground)/70">No domains saved yet.</p>
        )}
        {savedDomains.length > 0 && (
          <ul className="text-sm text-(--foreground)/70 space-y-1 truncate max-h-16 overflow-hidden">
            {savedDomains.slice(0, 3).map((d) => (
              <li key={d}>{d}</li>
            ))}
            {savedDomains.length > 3 && <li>…and more</li>}
          </ul>
        )}
      </div>

      {/* Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={closeModal}
          ></div>

          {/* Card */}
          <div className="relative bg-(--background) rounded-2xl shadow-2xl max-w-md w-full p-6 z-50">
            <button
              className="absolute top-4 right-4 text-(--foreground)/70 hover:text-(--foreground)"
              onClick={closeModal}
            >
              <X size={24} />
            </button>

            <h2 className="text-xl font-semibold mb-4">⭐ Saved Domains</h2>

            {savedDomains.length === 0 ? (
              <p className="text-(--foreground)/70">No domains saved yet.</p>
            ) : (
              <ul className="space-y-2 max-h-96 overflow-y-auto">
                {savedDomains.map((domain) => (
                  <li
                    key={domain}
                    className="flex justify-between items-center p-2 rounded-lg hover:bg-(--border)/30"
                  >
                    <span>{domain}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeDomain(domain); // ✅ now works
                      }}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash size={16} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </>
  );
}