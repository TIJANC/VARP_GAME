import React from 'react';
import './ActionNavbar.css';

const ActionNavbar = ({ coins, navigate, options }) => {
  return (
    <div className="action-navbar">
      {options.map(({ label, route, iconClass }, index) => (
        <button
          key={index}
          onClick={() => navigate(route)}
          title={label} // Tooltip for accessibility
        >
          <i className={`la ${iconClass}`} aria-hidden="true"></i>
        </button>
      ))}
    </div>
  );
};

export default ActionNavbar;
