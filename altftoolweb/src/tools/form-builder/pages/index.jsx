// pages/ToolHome.jsx (or wherever your page is)

import React from "react";
import FormBuilder from "../component/main"; 
import Description from "../component/Description";

export default function ToolHome() {
  return (
    <div className="bg-(--background) min-h-screen p-4 md:p-8">
      {/* Render the Form Builder */}
      <div className="mb-16">
        <FormBuilder />
      </div>

      {/* Render the Description Cards */}
      <div>
      
        <Description />
      </div>
    </div>
  );
}