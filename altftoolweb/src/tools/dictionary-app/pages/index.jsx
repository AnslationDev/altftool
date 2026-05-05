import DictionaryApp from "../components/DictionaryApp";
import Features from "../components/Features";
import Header from "../components/Header";

export default function ToolHome() {
  return (
    <div className="w-full min-h-screen px-4 sm:px-6 lg:px-8">
      <Header />
      <DictionaryApp />
      <Features/>
    </div>
  );
}