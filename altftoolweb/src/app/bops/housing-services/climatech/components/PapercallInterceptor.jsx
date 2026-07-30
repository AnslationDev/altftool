"use client";

// This component used to run a global capture-phase click listener that hijacked
// "Send Message" / "Book Now" / "Call Us" clicks (and even real tel:/mailto: links)
// into a fake "Sorry! No Result Found." popup pointing to a placeholder number.
// Disabled in place so genuine CTAs and tel/mailto links behave normally again.
export default function PapercallInterceptor() {
  return null;
}
