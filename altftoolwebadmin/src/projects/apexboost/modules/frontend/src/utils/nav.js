/**
 * Programmatic navigation helper that works with HashRouter
 * from anywhere (no need to prop-drill useNavigate).
 * Usage: goTo("/contact")
 */
export function goTo(path) {
  const clean = path.startsWith("/") ? path : `/${path}`;
  window.location.hash = `#${clean}`;
  window.scrollTo({ top: 0 });
}
