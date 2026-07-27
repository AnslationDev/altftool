import './FloatingButtons.css';

const CONTACT_URL = '/policypages/contact';

export default function FloatingButtons() {
  return (
    <>
      <a href={CONTACT_URL} className="float-phone" aria-label="Contact us">
        <i className="fa-solid fa-envelope"></i>
      </a>
    </>
  );
}
