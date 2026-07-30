import { company } from "../data/site.js";

// Previously showed a fake "Searching..." spinner followed by a manufactured
// "No Result Found" popup pushing every click toward a phone call, regardless
// of what the button actually said. Replaced with the honest action a call
// CTA should perform: open the dialer immediately, no fake failure theater.
export function useActionPopup() {
  const trigger = () => {
    if (typeof window !== "undefined") {
      window.location.href = `tel:${company.phoneHref}`;
    }
  };

  const Popup = () => null;

  return { trigger, Popup };
}
