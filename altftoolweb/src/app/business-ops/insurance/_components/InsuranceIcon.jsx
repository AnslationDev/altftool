import { createElement } from "react";
import { getInsuranceIcon } from "../_lib/icons";

/**
 * Renders a lucide icon by name.
 *
 * Uses createElement rather than assigning the looked-up component to a
 * capitalised variable and rendering it as JSX — the JSX form trips
 * react-hooks/static-components, which cannot tell a map lookup apart from a
 * component defined inline.
 */
export default function InsuranceIcon({ name, ...props }) {
  return createElement(getInsuranceIcon(name), props);
}
