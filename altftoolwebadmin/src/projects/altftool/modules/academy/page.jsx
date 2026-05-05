"use client";

import React, { useState, useEffect } from "react";
import AcademyFilters from "./components/AcademyFilters";
import AcademyTopBar from "./components/AcademyTopBar";
import AcademyTable from "./components/AcademyTable";
import AcademyModal from "./components/AcademyModal";
import { fetchAcademies, deleteAcademy } from "./service/academyService";
import { emitAlert } from "@/lib/alertBus";
import DeleteConfirmModal from "@/components/ui/DeleteConfirmModal";

function AcademyManagement() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [linkFilter, setLinkFilter] = useState("");
  const [selected, setSelected] = useState([]);
  const [academies, setAcademies] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingAcademy, setEditingAcademy] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
const [deleteLoading, setDeleteLoading] = useState(false);

  const categories = [...new Set(academies.map(a => a.category))];

  const loadAcademies = async () => {
  try {
    const data = await fetchAcademies();
    setAcademies(data);
  } catch (err) {
    console.error("Failed to load academies", err);
    setAcademies([]);
  }
};

  const total = academies.length;
  const selectedAcademy = academies.find(a => a.id === deleteTarget);

  const avgPrice = total ? (academies.reduce((sum, a) => sum + (a.price || 0), 0) / total).toFixed(2) : "0.00";

  const last7Days = Date.now() - 7 * 24 * 60 * 60 * 1000;

  const recentCount = academies.filter(a =>
    a.createdAt && new Date(a.createdAt).getTime() > last7Days
  ).length;

  const categoriesCount = new Set(academies.map(a => a.category)).size;

  const avgRating =
    academies.length > 0
      ? academies.reduce((sum, a) => sum + (a.rating || 0), 0) / academies.length
      : 0;

  const filteredAcademies = academies.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.description.toLowerCase().includes(search.toLowerCase());

    const matchesCategory =
      !category || item.category === category;

    const matchesLink = !linkFilter || (linkFilter === "hasLink" && item.academyUrl) || (linkFilter === "noLink" && !item.academyUrl);

    return matchesSearch && matchesCategory && matchesLink;
  });

  const confirmDelete = (id) => {
  setDeleteTarget(id);
};

const handleDelete = async () => {
  if (!deleteTarget) return;

  setDeleteLoading(true);

  try {
    if (Array.isArray(deleteTarget)) {
      await Promise.all(deleteTarget.map((id) => deleteAcademy(id)));

      emitAlert({
        type: "success",
        message: `${deleteTarget.length} academies deleted successfully`,
      });

    } else {
      await deleteAcademy(deleteTarget);

      emitAlert({
        type: "success",
        message: "Academy deleted successfully",
      });
    }

    await loadAcademies();
    setSelected([]);
    setDeleteTarget(null);

  } catch (err) {
    console.error(err);

    emitAlert({
      type: "error",
      message: "Failed to delete academy",
    });

  } finally {
    setDeleteLoading(false);
  }
};

  useEffect(() => {
    setSelected((prev) => {
      const updated = prev.filter((id) =>
        filteredAcademies.some((a) => a.id === id)
      );

      // Prevent unnecessary state update (THIS STOPS LOOP)
      if (updated.length === prev.length) return prev;

      return updated;
    });
  }, [filteredAcademies]);

   useEffect(() => {
    loadAcademies();
  }, []);

  const toggleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id)
        ? prev.filter((i) => i !== id)
        : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selected.length === filteredAcademies.length) {
      setSelected([]);
    } else {
      setSelected(filteredAcademies.map((a) => a.id));
    }
  };

  return (
    <div className="m-10">
      <AcademyTopBar 
        academies={academies}
        total={total}
        avgPrice={avgPrice}
        recentCount={recentCount}
        categories={categoriesCount}
        avgRating={avgRating}
        onCreate={() => {
          setEditingAcademy(null);
          setShowModal(true);
        }}
      />

      <AcademyFilters
        search={search}
        setSearch={setSearch}
        category={category}
        setCategory={setCategory}
        categories={categories}
        academyFilter={linkFilter}
        setAcademyFilter={setLinkFilter}
        totalFiltered={filteredAcademies.length}
        totalAll={academies.length}
      />

      <AcademyTable
        academies={filteredAcademies}
        selected={selected}
        toggleSelect={toggleSelect}
        toggleSelectAll={toggleSelectAll}
        onEdit={(row) => {
          setEditingAcademy(row); 
          setShowModal(true);      
        }}
        onDelete={confirmDelete}
      />
      {showModal && (
        <AcademyModal
          academy={editingAcademy}  
          academies={academies}
          onClose={() => {
            setShowModal(false);
            setEditingAcademy(null);
          }}
          refresh={loadAcademies} 
        />
      )}

      {deleteTarget && (
  <DeleteConfirmModal
    title="Delete Academy"
    message={
      Array.isArray(deleteTarget)
        ? `Are you sure you want to delete ${deleteTarget.length} academies?`
        : `Are you sure you want to delete ${selectedAcademy?.name || 'this academy'}?`
    }
    confirmText="Delete"
    cancelText="Cancel"
    loading={deleteLoading}
    onConfirm={handleDelete}
    onCancel={() => setDeleteTarget(null)}
  />
)}
    </div>

    
  );
}

export default AcademyManagement;