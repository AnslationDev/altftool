import { notFound } from "next/navigation";

export const metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

/**
 * Match the root quarantine for every historical Top3 sub-route so direct
 * loads cannot expose the illustrative rankings or create soft-404 variants.
 */
export default function Top3CatchAllPage() {
  notFound();
}
