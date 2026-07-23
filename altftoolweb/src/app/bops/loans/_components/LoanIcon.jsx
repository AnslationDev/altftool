import { createElement } from "react";
import { getLoanIcon } from "../_lib/icons";

/**
 * Renders a lucide icon by name.
 *
 * Uses createElement rather than assigning the looked-up component to a
 * capitalised variable and rendering it as JSX — the JSX form trips
 * react-hooks/static-components, which cannot tell a map lookup apart from a
 * component defined inline.
 */
export default function LoanIcon({ name, ...props }) {
  return createElement(getLoanIcon(name), props);
}
