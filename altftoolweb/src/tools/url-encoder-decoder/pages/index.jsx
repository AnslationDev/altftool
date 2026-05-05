"use client";

import EncoderDecoder from "../components/EncoderDecoder";
import Feature from "../components/Feature";
import Header from "../components/Header";


export default function EncoderDecoderApp() {
  return (
    <div className="w-full bg-(--background) text-(--foreground) flex flex-col">

      {/* Header */}
     <Header/>

      {/* Main Content */}
      <main className="flex-1 w-full px-6 py-12 max-w-6xl mx-auto">
        <EncoderDecoder />
      </main>

      {/* Feature Section */}
      <section className="bg-(--muted) py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <Feature/>
        </div>
      </section>

    </div>
  );
}
