"use client"

import Features from "../components/Features"
import Header from "../components/Header"
import SwaggerDocGenerator from "../components/SwaggerDocGenerator"

export default function ApiDocumentMaker(){
   return(
  <div className="min-h-screen w-full flex flex-col items-center overflow-x-hidden">
    <Header/>
    <SwaggerDocGenerator/>
    <Features/>
  </div>
)
}
