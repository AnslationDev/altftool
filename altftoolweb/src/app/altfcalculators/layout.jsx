import "./altfcalculators.css";
import AltfCalcFooter from "./components/AltfCalcFooter";

export const metadata = {
  title: {
    default: "AltF Calculators — Free Online Calculators",
    template: "%s | AltF Calculators",
  },
  description:
    "A clean, fast and fully private suite of online calculators — finance, health, maths, unit conversion, date & time. Everything runs in your browser.",
  icons: {
    icon: "/favicon1.png",
  },
};

export default function AltfCalcLayout({ children }) {
  return (
    <div className="afc-app">
      {children}
      <AltfCalcFooter />
    </div>
  );
}
