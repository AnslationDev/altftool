import React, { useState } from 'react';
import Link from 'next/link';
import './Header.css';

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [aboutDropdownOpen, setAboutDropdownOpen] = useState(false);

  return (
    <>
      <header className="header">
        <div className="header-container">
          <div className="logo-section">
            <button className="hamburger-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              <span></span>
              <span></span>
              <span></span>
            </button>
            <Link href="/playbuzz" className="logo">
              <span className="play">play</span>buzz
            </Link>

            <div className="nav-dropdown" onMouseLeave={() => setAboutDropdownOpen(false)}>
              <button className="dropdown-btn" onMouseEnter={() => setAboutDropdownOpen(true)}>
                ABOUT <span className="caret">▼</span>
              </button>
              {aboutDropdownOpen && (
                <div className="dropdown-menu">
                  <a href="#">Privacy Policy</a>
                  <a href="#">Online Terms</a>
                  <a href="#">DMCA Notice</a>
                </div>
              )}
            </div>
          </div>

          <div className="actions-section">
            <div className="search-container">
              {searchOpen && <input type="text" className="search-input" placeholder="Search..." autoFocus />}

            </div>

            <div className="avatar-placeholder"></div>
          </div>
        </div>
      </header>


    </>
  );
};

export default Header;
