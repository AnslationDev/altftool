import React from 'react';
import './SectionDivider.css';

const SectionDivider = ({ title }) => {
  return (
    <div className="section-divider">
      <div className="divider-line"></div>
      <div className="divider-title">{title}</div>
    </div>
  );
};

export default SectionDivider;
