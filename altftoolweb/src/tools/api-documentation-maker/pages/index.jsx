"use client"

import { useRef, useState } from "react";
import yaml from "js-yaml";
import Hero from "../components/Hero";
import SwaggerDocGenerator from "../components/SwaggerDocGenerator";
import PowerfulFeaturesStrip from "../components/PowerfulFeaturesStrip";
import CtaBanner from "../components/CtaBanner";
import Features from "../components/Features";
import {
  getRecentProjects,
  deleteRecentProject,
  markProjectPublished,
} from "../utils/recentProjects";
import { isPostmanCollection, postmanToDocInput } from "../utils/postmanImport";
import { isSwagger2, swagger2ToOpenApi3 } from "../utils/swagger2Convert";
import {
  buildShareUrl,
  downloadTextFile,
  swaggerToMarkdown,
  swaggerToHtml,
  swaggerToPdf,
  slugifyTitle,
} from "../utils/exportFormats";

// JSON is valid YAML too, so try JSON first and fall back to a YAML parse —
// works regardless of the uploaded file's extension.
function parseUploadedText(text) {
  try {
    return JSON.parse(text);
  } catch {
    return yaml.load(text);
  }
}

export default function ApiDocumentMaker() {
  const generatorRef = useRef(null);
  const generatorSectionRef = useRef(null);
  const [recentProjects, setRecentProjects] = useState(() => getRecentProjects());
  const [currentSpec, setCurrentSpec] = useState(null);
  const [published, setPublished] = useState(false);

  const scrollToGenerator = () => {
    generatorSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleFileImport = async (file) => {
    try {
      const parsed = parseUploadedText(await file.text());

      if (isSwagger2(parsed)) {
        generatorRef.current?.loadSpecDirectly(swagger2ToOpenApi3(parsed));
      } else if (parsed?.openapi) {
        generatorRef.current?.loadSpecDirectly(parsed);
      } else if (isPostmanCollection(parsed)) {
        generatorRef.current?.loadAndGenerate(JSON.stringify(postmanToDocInput(parsed), null, 2));
      } else {
        generatorRef.current?.loadAndGenerate(JSON.stringify(parsed, null, 2));
      }
      scrollToGenerator();
    } catch (err) {
      console.error("Failed to import file:", err);
      window.alert(`Couldn't read "${file.name}". Make sure it's a valid JSON or YAML file.`);
    }
  };

  const handlePostmanImport = async (file) => {
    try {
      const parsed = JSON.parse(await file.text());
      if (!isPostmanCollection(parsed)) {
        window.alert("That doesn't look like a Postman collection export.");
        return;
      }
      generatorRef.current?.loadAndGenerate(JSON.stringify(postmanToDocInput(parsed), null, 2));
      scrollToGenerator();
    } catch (err) {
      console.error("Failed to import Postman collection:", err);
      window.alert(`Couldn't read "${file.name}" as a Postman collection.`);
    }
  };

  const handleCreateNew = () => {
    generatorRef.current?.reset();
    scrollToGenerator();
  };

  const handleFocusInput = () => {
    generatorRef.current?.focusInput();
    scrollToGenerator();
  };

  const handleOpenProject = (project) => {
    generatorRef.current?.loadSpecDirectly(project.spec);
    scrollToGenerator();
  };

  const handleDeleteProject = (id) => {
    setRecentProjects(deleteRecentProject(id));
  };

  const handleExport = (format) => {
    if (!currentSpec) {
      scrollToGenerator();
      return;
    }
    const slug = slugifyTitle(currentSpec.info?.title);
    if (format === "markdown") {
      downloadTextFile(swaggerToMarkdown(currentSpec), `${slug}.md`, "text/markdown");
    } else if (format === "html") {
      downloadTextFile(swaggerToHtml(currentSpec), `${slug}.html`, "text/html");
    } else if (format === "pdf") {
      swaggerToPdf(currentSpec);
    }
  };

  const handlePublish = async () => {
    if (!currentSpec) {
      scrollToGenerator();
      return;
    }
    try {
      await navigator.clipboard.writeText(buildShareUrl(currentSpec));
      setRecentProjects(markProjectPublished(currentSpec.info?.title?.trim() || "Untitled API"));
      setPublished(true);
      setTimeout(() => setPublished(false), 2000);
    } catch (err) {
      console.error("Failed to publish:", err);
      window.alert("Couldn't publish this spec. Please try again.");
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center overflow-x-hidden bg-[var(--background)]">
      <Hero
        recentProjects={recentProjects}
        onFileImport={handleFileImport}
        onPostmanImport={handlePostmanImport}
        onCreateNew={handleCreateNew}
        onGenerateShortcut={handleFocusInput}
        onOpenGuide={handleFocusInput}
        onOpenProject={handleOpenProject}
        onDeleteProject={handleDeleteProject}
      />

      <PowerfulFeaturesStrip />

      <div ref={generatorSectionRef} className="w-full scroll-mt-6 mt-8">
        <SwaggerDocGenerator
          ref={generatorRef}
          onSpecChange={setCurrentSpec}
          onProjectSaved={setRecentProjects}
        />
      </div>

      <CtaBanner
        hasSpec={!!currentSpec}
        onExport={handleExport}
        onPublish={handlePublish}
        published={published}
      />

      <Features />
    </div>
  );
}
