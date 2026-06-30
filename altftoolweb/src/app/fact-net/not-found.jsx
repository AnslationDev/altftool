import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function FactNetNotFound() {
  return (
    <main className="fn-page">
      <section className="fn-panel fn-empty fn-themed-empty">
        <h1 className="fn-title-sm">Fact Hub record not found</h1>
        <p className="fn-subtitle">The requested route does not match a generated topic record.</p>
        <Link
          href="/fact-net"
          className="fn-button fn-button-primary fn-themed-button"
        >
          <ArrowLeft className="fn-icon" />
          Fact Hub home
        </Link>
      </section>
    </main>
  );
}
