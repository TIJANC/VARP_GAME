import React from 'react';
import { useNavigate } from 'react-router-dom';
import './ActionNavbar.css';

const ActionNavbar = () => {
  const navigate = useNavigate();

  const options = [
    { label: 'Shop', route: '/shop', iconClass: 'la-store' },
    { label: 'CardGame', route: '/games/card-game', iconClass: 'la-gamepad' },
    { label: 'Forum', route: '/forum', iconClass: 'la-comments' },
    { label: 'Home', route: '/home', iconClass: 'la-home' },
    { label: 'Profile', route: '/profile', iconClass: 'la-user' },
  ];

  return (
    <nav className="action-navbar">
      {options.map(({ label, route, iconClass }, index) => (
        <button
          key={index}
          onClick={() => navigate(route)}
          title={label}
          className="action-nav-button"
        >
          <i className={`la ${iconClass}`} aria-hidden="true"></i>
        </button>
      ))}
    </nav>
  );
};

export default ActionNavbar;
