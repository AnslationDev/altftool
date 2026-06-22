import React from 'react';
import './NavMenu.css';

const categories = [
  'NEW',
  'TRIVIA',
  'PERSONALITY',
  'LOVE',
  'LIFESTYLE',
  'ENTERTAINMENT',
  'SMART',
  'ANIMALS',
  'SPORTS',
  'MUSIC',
  'MOVIES'
];

const NavMenu = ({ activeCategory, onCategorySelect }) => {
  return (
    <nav className="nav-menu">
      <div className="nav-container">
        <ul className="nav-list">
          {categories.map((category) => (
            <li key={category} className="nav-item">
              <button 
                className={`nav-link ${activeCategory === category ? 'active' : ''}`}
                onClick={() => onCategorySelect(category)}
              >
                {category}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
};

export default NavMenu;
