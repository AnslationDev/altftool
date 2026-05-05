"use client";

import React, { useEffect, useState, useCallback } from "react";

import CreditCardTable from "./components/CreditCardTable";
import CreditCardStatus from "./components/CreditCardStatus";
import { emitAlert } from "@/lib/alertBus";
import { logAuditEvent } from "@/lib/auditClient";


import { deleteCard,bulkDeleteCards ,fetchCardsCount,fetchCardsPage} from "./credit-card-services/CreditCardService";

const PAGE_SIZE = 10;

export default function CreditCard() {
  const [cards, setcards] = useState([]);
  const [loading, setLoading] = useState(true);

  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: PAGE_SIZE,
  });

  const [rowCount, setRowCount] = useState(0);
  const [cursorCache, setCursorCache] = useState({});

  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("All Blogs");

  const [deleteId, setDeleteId] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCards, setSelectedCards] = useState([]);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);

  /* =============================================================
     Fetch total count
  ============================================================= */
  const loadRowCount = useCallback(async () => {
    try {
      const count = await fetchCardsCount();
      setRowCount(count);
    } catch (err) {
      console.error("Count fetch failed", err);
    }
  }, []);

  /* =============================================================
     Fetch one page — delegates entirely to the service
  ============================================================= */
  const fetchPage = useCallback(
    async (page, pageSize) => {
      setLoading(true);
      try {
        const cursor = cursorCache[page] ?? null;
        const { cards: data, lastDoc } = await fetchCardsPage({ pageSize, cursor });

        setcards(data);

        if (lastDoc) {
          setCursorCache((prev) => ({ ...prev, [page + 1]: lastDoc }));
        }
      } catch (err) {
        console.error("Failed to fetch page", err);
        emitAlert({ type: "error", message: "Failed to load cards" });
      } finally {
        setLoading(false);
      }
    },
    [cursorCache]
  );

  /* On mount */
  useEffect(() => {
    loadRowCount();
    fetchPage(0, PAGE_SIZE);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* Pagination changes */
  const handlePaginationModelChange = (newModel) => {
    if (newModel.pageSize !== paginationModel.pageSize) {
      setCursorCache({});
      setPaginationModel({ page: 0, pageSize: newModel.pageSize });
      fetchPage(0, newModel.pageSize);
      return;
    }
    setPaginationModel(newModel);
    fetchPage(newModel.page, newModel.pageSize);
  };

  /* =============================================================
     Single Delete
  ============================================================= */
  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteCard(deleteId);
      setcards((prev) => prev.filter((b) => b.id !== deleteId));
      setRowCount((c) => c - 1);
      emitAlert({ type: "success", message: "Card deleted successfully" });
      logAuditEvent({
        module: "creditcard",
        action: "CARD_DELETE",
        entityType: "creditcard",
        entityId: deleteId,
        summary: `Deleted card ${deleteId}`,
        changes: { id: deleteId },
        route: "/creditcard",
      });
    } catch (err) {
      console.error("Delete failed", err);
      emitAlert({ type: "error", message: "Failed to delete card" });
    }
    setDeleteId(null);
    setIsDeleteModalOpen(false);
  };

  /* =============================================================
     Bulk Delete — uses the service function directly
  ============================================================= */
  const confirmBulkDelete = async () => {
    if (selectedCards.length === 0) return;
    try {
      await bulkDeleteCards(selectedCards);
      const deletedCount = selectedCards.length;
      setcards((prev) => prev.filter((b) => !selectedCards.includes(b.id)));
      setRowCount((c) => c - deletedCount);
      setSelectedCards([]);
      emitAlert({ type: "success", message: "Selected Cards deleted" });
      logAuditEvent({
        module: "creditcard",
        action: "CARD_BULK_DELETE",
        entityType: "creditcard",
        entityId: null,
        summary: `Bulk deleted ${deletedCount} cards`,
        changes: { ids: selectedCards },
        route: "/creditcard",
      });
    } catch (err) {
      console.error("Bulk delete failed", err);
      emitAlert({ type: "error", message: "Bulk delete failed" });
    }
    setIsBulkDeleteModalOpen(false);
  };

  /* =============================================================
     Client-side filter (on top of paginated server data)
  ============================================================= */
  const filteredCards = cards
    .filter((card) => {
      if (activeTab === "Drafts Card") return card.status === "draft";
      if (activeTab === "Published Card") return card.status === "published";
      return true;
    })
    .filter((card) => {
      if (!search) return true;
      return (
        card.heading?.toLowerCase().includes(search.toLowerCase()) ||
      card.author?.toLowerCase().includes(search.toLowerCase())
      );
    });

  return (
    <div className="space-y-6">
      <div className="mx-auto px-6 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-800">
            Manage your Credit Cards
          </h1>
          <a
            href="/leadtree/credit-cards/add-cards"
            className="bg-(--primary) text-white px-4 py-2 rounded-md text-sm hover:opacity-90"
          >
            Add New Card
          </a>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <CreditCardStatus cards={cards} />
        </div>

        <CreditCardTable
          cards={filteredCards}
          setcards={setcards}
          setDeleteId={setDeleteId}
          openDeleteModal={() => setIsDeleteModalOpen(true)}
          selectedCards={selectedCards}
          setSelectedCards={setSelectedCards}
          openBulkDeleteModal={() => setIsBulkDeleteModalOpen(true)}
          rowCount={rowCount}
          paginationModel={paginationModel}
          onPaginationModelChange={handlePaginationModelChange}
          loading={loading}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          search={search}
          onSearch={setSearch}
        />
      </div>

      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-80 shadow-xl">
            <h2 className="text-lg font-semibold mb-4">
              Are you sure you want to delete this card?
            </h2>
            <div className="flex justify-end gap-3">
              <button onClick={() => setIsDeleteModalOpen(false)} className="border px-4 py-2 rounded">
                Cancel
              </button>
              <button onClick={confirmDelete} className="bg-red-600 text-white px-4 py-2 rounded">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {isBulkDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-96 shadow-xl">
            <h2 className="text-lg font-semibold mb-4">
              Delete {selectedCards.length} selected card
              {selectedCards.length > 1 ? "s" : ""}?
            </h2>
            <div className="flex justify-end gap-3">
              <button onClick={() => setIsBulkDeleteModalOpen(false)} className="border px-4 py-2 rounded">
                Cancel
              </button>
              <button onClick={confirmBulkDelete} className="bg-red-600 text-white px-4 py-2 rounded">
                Delete All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}