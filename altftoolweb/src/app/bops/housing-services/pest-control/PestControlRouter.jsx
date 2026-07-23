"use client";

import { BrowserRouter } from "react-router-dom";
import App from "./App";

export default function PestControlRouter() {
  return (
    <BrowserRouter basename="/bops/housing-services/pest-control">
      <App />
    </BrowserRouter>
  );
}
