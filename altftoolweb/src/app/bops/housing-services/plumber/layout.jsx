import "./index.css";

/**
 * The wrapper exists so this lander's palette has somewhere to live other than
 * `body`. A route stylesheet is never detached, so painting the document here
 * repainted every page the visitor opened next.
 */
export default function PlumbingLandingLayout({ children }) {
  return <div className="plumber-page">{children}</div>;
}
