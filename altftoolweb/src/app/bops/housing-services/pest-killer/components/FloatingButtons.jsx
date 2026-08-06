import './FloatingButtons.css';

export default function FloatingButtons() {
  return (
    <>
      <span className="float-whatsapp" aria-label="WhatsApp unavailable in this demo" title="Demo only">
        <i className="fa-brands fa-whatsapp"></i>
      </span>
      <span className="float-phone" aria-label="Calling unavailable in this demo" title="Demo only">
        <i className="fa-solid fa-phone"></i>
      </span>
    </>
  );
}
