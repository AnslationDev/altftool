import './FloatingButtons.css';

export default function FloatingButtons() {
  return (
    <>
      <a href="https://wa.me/919999605070/?text=Hello" className="float-whatsapp" target="_blank" rel="noreferrer" aria-label="WhatsApp">
        <i className="fa-brands fa-whatsapp"></i>
      </a>
      <a href="tel:+919999605070" className="float-phone" aria-label="Call Now">
        <i className="fa-solid fa-phone"></i>
      </a>
    </>
  );
}
