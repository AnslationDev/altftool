"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { emitAlert } from "@/lib/alertBus";
import OfferForm from "../../components/OfferForm";
import { getOffer } from "../../service/offers.service";

export default function EditInfodrifOfferPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id ? decodeURIComponent(String(params.id)) : "";
  const [offer, setOffer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    if (!id) {
      setLoading(false);
      emitAlert({ type: "error", message: "Offer id is missing from the edit route." });
      router.push("/infodrif/offers");
      return undefined;
    }

    // Single document read — no whole-collection subscription to find one offer.
    getOffer(id)
      .then((data) => {
        if (cancelled) return;
        if (!data) {
          emitAlert({ type: "error", message: "Offer not found." });
          router.push("/infodrif/offers");
          return;
        }
        setOffer(data);
      })
      .catch((error) => {
        if (cancelled) return;
        emitAlert({ type: "error", message: error?.message || "Failed to load offer." });
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id, router]);

  if (loading || !offer) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-sm font-semibold text-muted">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Loading offer...
      </div>
    );
  }

  return <OfferForm mode="edit" offer={offer} />;
}
