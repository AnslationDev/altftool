"use client";

import { BrowserRouter } from "react-router-dom";
import App from "./App";

export default function PestControlRouter() {
  return (
    <BrowserRouter basename="/housingneeds/pest-control/pest-control">
      <App />
    </BrowserRouter>
  );
}
