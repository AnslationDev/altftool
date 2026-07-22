import { createElement } from "react";
import { getIcon } from "../_lib/icons";

/**
 * Renders a lucide icon by name.
 *
 * Uses createElement rather than assigning the looked-up component to a
 * capitalised variable and rendering it as JSX. Both are functionally
 * identical — getIcon returns a stable module-level reference, it does not
 * create a component — but the JSX form trips react-hooks/static-components,
 * which cannot tell a map lookup apart from a component defined inline.
 */
export default function HnIcon({ name, ...props }) {
  return createElement(getIcon(name), props);
}
