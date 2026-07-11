export default function Container({ children, className = "" }) {
  return <div className={`cx ${className}`}>{children}</div>;
}
