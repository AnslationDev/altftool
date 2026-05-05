import Header from "../components/Header";
import Features from "../components/Features";
import FocusTabs from "../components/FocusTabs";

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 w-full mx-auto py-6 px-3">
        <FocusTabs />
      </div>
      <Features />
    </div>
  );
}
