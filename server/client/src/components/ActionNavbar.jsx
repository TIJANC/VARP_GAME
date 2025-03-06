import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ActionNavbar = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const options = [
    { label: 'Shop', route: '/shop', iconClass: 'la-store' },
    { label: 'CardGame', route: '/games/card-game', iconClass: 'la-gamepad' },
    { label: 'Home', route: '/home', iconClass: 'la-home' },
    { label: 'Forum', route: '/forum', iconClass: 'la-comments' },
    { label: 'Profile', route: '/profile', iconClass: 'la-user' },
  ];

  return (
    <div className="fixed top-4 right-4 z-50">
      {/* Toggle Button */}
      <button
        className="p-2 text-3xl bg-white shadow rounded-full focus:outline-none"
        onClick={() => setIsOpen(!isOpen)}
        title={isOpen ? "Close Navigation" : "Open Navigation"}
      >
        {isOpen ? (
          <i className="la la-times" aria-hidden="true"></i>
        ) : (
          <i className="la la-bars" aria-hidden="true"></i>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="mt-2 bg-white rounded shadow p-2 flex flex-col space-y-2">
          {options.map(({ label, route, iconClass }, index) => (
            <button
              key={index}
              onClick={() => {
                navigate(route);
                setIsOpen(false);
              }}
              title={label}
              className="flex items-center space-x-2 text-2xl hover:text-blue-500 focus:outline-none"
            >
              <i className={`la ${iconClass}`} aria-hidden="true"></i>
              <span className="text-base">{label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ActionNavbar;
