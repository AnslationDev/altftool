"use client";
import dynamic from "next/dynamic";
const BrowserRouter = dynamic(() => import("react-router-dom").then(mod => mod.BrowserRouter), { ssr: false });
const App = dynamic(() => import("./App.jsx"), { ssr: false });
import "./index.css";

export default function Page() {
  return (
    <BrowserRouter basename="/housingneeds/windows/window-replacement">
      <App />
    </BrowserRouter>
  );
}
