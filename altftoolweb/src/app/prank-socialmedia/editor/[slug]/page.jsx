import { TEMPLATES } from "../../lib/templates";
import EditorClient from "./EditorClient";
import { notFound } from "next/navigation";
import {
  createPageMetadata,
  createToolJsonLd,
  createBreadcrumbJsonLd,
} from "@/platform/seo/generateMetadata";
import JsonLd from "@/platform/seo/JsonLd";

export async function generateStaticParams() {
  return TEMPLATES.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const t = TEMPLATES.find((x) => x.slug === slug);
  if (!t) {
    return createPageMetadata({
      title: "Editor — Mockly",
      description:
        "This Mockly mockup template does not exist. Pick a template from the Mockly gallery to start editing a social media mockup.",
      path: `/prank-socialmedia/editor/${slug}`,
      noindex: true,
    });
  }
  return createPageMetadata({
    title: `${t.name} — Mockly Editor`,
    description: `Create ${t.name} mockups in your browser, customize the content, and export a PNG for parody, education, or entertainment. Not a genuine screenshot.`,
    path: `/prank-socialmedia/editor/${slug}`,
  });
}

export default async function Page({ params }) {
  const { slug } = await params;
  const t = TEMPLATES.find((x) => x.slug === slug);
  if (!t) notFound();

  const path = `/prank-socialmedia/editor/${slug}`;

  return (
    <>
      {/* The entity describes the editor, not the thing it draws. Mockly is a
          real browser application — EditorLayout composes the preview with
          html-to-image and downloads the PNG on the client, and drafts are kept
          in localStorage — so SoftwareApplication/WebApplication, free and with
          no install, is what this page actually is. The description repeats the
          on-page disclaimer so the node cannot be read as a claim that the
          exported image is a genuine chat, post or system alert. No rating,
          review or usage count exists here, so none is emitted. */}
      <JsonLd
        id={`mockly-editor-schema-${slug}`}
        data={[
          createToolJsonLd({
            slug,
            path,
            tool: {
              name: `${t.name} — Mockly Editor`,
              description: `${t.short} Mockly builds the mockup in your browser and exports it as a PNG for parody, entertainment, and educational use — the result is a mockup, not a genuine screenshot.`,
              topics: [`${t.name.toLowerCase()} mockup`, "social media mockup generator"],
            },
          }),
          createBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Mockly", path: "/prank-socialmedia" },
            { name: "Templates", path: "/prank-socialmedia/templates" },
            { name: t.name, path },
          ]),
        ]}
      />
      <EditorClient slug={slug} />
    </>
  );
}
