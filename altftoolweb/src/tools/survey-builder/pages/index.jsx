"use client";

import React, { useState, useEffect, useRef } from "react";

// TAILWIND COMPONENTS (YOUR VERSIONS, NOT MUI)
import HeroSection from "../components/HeroSection";
import SurveyList from "../components/SurveyList";
import CreateSurveyDialog from "../components/CreateSurveyDialog";
import ViewSurveyDialog from "../components/ViewSurveyDialog";
import AnalyticsDialog from "../components/AnalyticsDialog";
import SurveyFeatures from "../components/SurveyFeatures";
import Description from "../components/Description"; // ✅ Imported Description

const SURVEYS_KEY = "surveyBuilder_surveys";
const RESPONSES_KEY = "surveyBuilder_responses";

export default function App() {
  const [surveys, setSurveys] = useState([]);
  const [responses, setResponses] = useState([]);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [analyticsDialogOpen, setAnalyticsDialogOpen] = useState(false);

  const [toast, setToast] = useState({
    open: false,
    message: "",
    type: "info",
    action: null,
  });

  const [selectedSurvey, setSelectedSurvey] = useState(null);
  const deleteTimeoutRef = useRef(null);

  const showToast = (message, type = "info", action = null) => {
    setToast({ open: true, message, type, action });
  };

  const closeToast = () => {
    setToast((prev) => ({ ...prev, open: false }));
  };

  // Load from localStorage
  useEffect(() => {
    const storedSurveys = localStorage.getItem(SURVEYS_KEY);
    const storedResponses = localStorage.getItem(RESPONSES_KEY);

    if (storedSurveys) setSurveys(JSON.parse(storedSurveys));
    if (storedResponses) setResponses(JSON.parse(storedResponses));
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem(SURVEYS_KEY, JSON.stringify(surveys));
  }, [surveys]);

  useEffect(() => {
    localStorage.setItem(RESPONSES_KEY, JSON.stringify(responses));
  }, [responses]);

  // CREATE SURVEY
  const handleCreateSurvey = (surveyData) => {
    const newSurvey = {
      ...surveyData,
      id: `survey_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      createdAt: new Date().toISOString(),
    };

    setSurveys((prev) => [...prev, newSurvey]);
    setCreateDialogOpen(false);

    showToast("Survey created successfully!", "success");
  };

  // DELETE SURVEY
  const handleDeleteSurvey = (surveyId) => {
    showToast(
      "Survey deleted",
      "warning",
      <button
        onClick={() => undoDelete()}
        className="text-(--primary) underline text-sm ml-2"
      >
        Undo
      </button>,
    );

    if (deleteTimeoutRef.current) clearTimeout(deleteTimeoutRef.current);

    deleteTimeoutRef.current = setTimeout(() => {
      setSurveys((prev) => prev.filter((s) => s.id !== surveyId));
      setResponses((prev) => prev.filter((r) => r.surveyId !== surveyId));
      deleteTimeoutRef.current = null;

      showToast("Survey permanently removed", "success");
    }, 3000);
  };

  const undoDelete = () => {
    if (deleteTimeoutRef.current) {
      clearTimeout(deleteTimeoutRef.current);
      deleteTimeoutRef.current = null;
    }
    showToast("Delete cancelled", "success");
  };

  // DUPLICATE SURVEY
  const handleDuplicateSurvey = (surveyId) => {
    const survey = surveys.find((s) => s.id === surveyId);
    if (!survey) return;

    const duplicated = {
      ...survey,
      id: `survey_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      title: `${survey.title} (Copy)`,
      createdAt: new Date().toISOString(),
    };
    setSurveys((prev) => [...prev, duplicated]);

    showToast("Survey duplicated!", "success");
  };

  // VIEW SURVEY (take)
  const handleViewSurvey = (survey) => {
    setSelectedSurvey(survey);
    setViewDialogOpen(true);
  };

  // SUBMIT RESPONSE
  const handleSubmitResponse = (response) => {
    setResponses((prev) => [...prev, response]);
    showToast("Response submitted successfully!", "success");
  };

  // ANALYTICS DIALOG
  const handleViewAnalytics = (survey) => {
    setSelectedSurvey(survey);
    setAnalyticsDialogOpen(true);
  };

  const getSurveyResponses = (surveyId) =>
    responses.filter((r) => r.surveyId === surveyId);

  return (
    <div
      className="
        min-h-screen 
        bg-(--background) 
        text-(--foreground)
        font-secondary
      "
    >
      {/* HERO */}
      <HeroSection onCreateClick={() => setCreateDialogOpen(true)} />

      {/* SURVEY LIST */}
      <SurveyList
        surveys={surveys}
        responses={responses}
        onDelete={handleDeleteSurvey}
        onDuplicate={handleDuplicateSurvey}
        onView={handleViewSurvey}
        onAnalytics={handleViewAnalytics}
      />

      {/* FEATURES SECTION */}
      <SurveyFeatures />

      {/* DESCRIPTION SECTION */}
      <Description /> {/* ✅ Rendered Description component */}

      {/* CREATE SURVEY DIALOG */}
      <CreateSurveyDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onSave={handleCreateSurvey}
      />

      {/* TAKE SURVEY DIALOG */}
      {selectedSurvey && (
        <ViewSurveyDialog
          open={viewDialogOpen}
          onClose={() => setViewDialogOpen(false)}
          survey={selectedSurvey}
          onSubmit={handleSubmitResponse}
        />
      )}

      {/* ANALYTICS DIALOG */}
      {selectedSurvey && (
        <AnalyticsDialog
          open={analyticsDialogOpen}
          onClose={() => setAnalyticsDialogOpen(false)}
          survey={selectedSurvey}
          responses={getSurveyResponses(selectedSurvey.id)}
        />
      )}

      {/* CUSTOM TOAST */}
      {toast.open && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50">
          <div
            className={`px-5 py-3 rounded-lg shadow-lg text-sm flex items-center gap-3
              ${
                toast.type === "success"
                  ? "bg-green-600 text-white"
                  : toast.type === "warning"
                    ? "bg-yellow-500 text-black"
                    : "bg-(--card) border border-(--border)"
              }
            `}
          >
            <span>{toast.message}</span>
            {toast.action}
            <button
              className="ml-3 text-xs opacity-70 hover:opacity-100"
              onClick={closeToast}
            >
              ✖
            </button>
          </div>
        </div>
      )}
    </div>
  );
}