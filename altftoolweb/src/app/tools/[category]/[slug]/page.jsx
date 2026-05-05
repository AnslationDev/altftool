import { toolMetaMap } from "@/platform/registry/toolMetaMap";

import { notFound } from "next/navigation";

import ToolClient from "./ToolClient";



export async function generateMetadata ({params}) {

  const {slug} = await params

  const tools = toolMetaMap[slug]



if (!tools) {

    return {

      title: "Tool Not Found",

      description: "The requested tool does not exist.",

    };

  }

  return {

    title: tools.name,

    description: tools.description,

  };

}

export default async function ToolPage({ params }) {

  const { slug } = await params;



  if (!toolMetaMap[slug]) {

    notFound();

  }



  return <ToolClient slug={slug} />;

}