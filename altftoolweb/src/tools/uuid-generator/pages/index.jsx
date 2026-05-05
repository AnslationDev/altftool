"use-client";
import Features from "../coomponents/Features";
// import FAQSection from "./components/FAQs";
// import MainSection from "../components/MainSection";
import MainSection from "../coomponents/MainSection";

function UUIDGenerator() {
  return (
    <div className="min-h-screen bg-(--muted) flex flex-col">
      <MainSection />
      {/* <FAQSection /> */}
     <div className="p-6 bg-(--card) border border-(--border) rounded-xl">
        <Features/>
      </div>
    </div>
  );
}

export default UUIDGenerator;
