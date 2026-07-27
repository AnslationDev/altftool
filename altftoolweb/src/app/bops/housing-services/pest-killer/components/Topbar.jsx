import './Topbar.css';

const CONTACT_URL = '/policypages/contact';

export default function Topbar() {
  return (
    <div className="topbar">
      <div className="container">
        <div className="topbar-left">
          <a href={CONTACT_URL}>
            <i className="fa-solid fa-comment-dots"></i>
            <span>Contact us</span>
          </a>
          <a href="mailto:pcds.ggn@gmail.com">
            <i className="fa-solid fa-envelope"></i>
            <span>pcds.ggn@gmail.com</span>
          </a>
        </div>
        <div className="topbar-right">
          <span>Follow Us:</span>
          <div className="topbar-social">
            <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram"><i className="fa-brands fa-instagram"></i></a>
            <a href="https://facebook.com" target="_blank" rel="noreferrer" aria-label="Facebook"><i className="fa-brands fa-facebook-f"></i></a>
            <a href="https://x.com" target="_blank" rel="noreferrer" aria-label="Twitter"><i className="fa-brands fa-x-twitter"></i></a>
            <a href="https://pinterest.com" target="_blank" rel="noreferrer" aria-label="Pinterest"><i className="fa-brands fa-pinterest-p"></i></a>
          </div>
        </div>
      </div>
    </div>
  );
}
