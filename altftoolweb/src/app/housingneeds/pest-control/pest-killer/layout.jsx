import { buildServiceMetadata } from "../../_lib/seo";

export const metadata = buildServiceMetadata("pest-control", "pest-killer");

export default function PestKillerLayout({ children }) {
  return (
    <>
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"
      />
      {children}
    </>
  );
}
