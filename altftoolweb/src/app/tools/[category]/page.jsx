"use client"
import { useParams } from 'next/navigation'
import React from 'react'
import ToolsClient from '../ToolsClient';
import { toolMetaMap } from "@/platform/registry/toolMetaMap";

function page() {
  const { category } = useParams();

  console.log(category)
  return (
    <div>
      <ToolsClient  meta={toolMetaMap}  category={category} />
    </div>
  )
}

export default page