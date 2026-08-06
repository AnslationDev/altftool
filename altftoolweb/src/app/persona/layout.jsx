import "./persona.css";
import PersonaNav from "./_components/PersonaNav";

export default function PersonaLayout({ children }) {
  return (
    <>
      <PersonaNav />
      {children}
    </>
  );
}
