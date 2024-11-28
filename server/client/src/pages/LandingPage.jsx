import React from 'react';
import { Link } from 'react-router-dom';
import './LandingPage.css';

const LandingPage = () => {
  return (
    <div className="landing-container">
      <header>
        <img
          src="/Images/VARP_logo.png"
          alt="Vaccine Awareness Logo"
          className="logo"
        />
      </header>

      <h1>Stay Protected. Stay Informed.</h1>
      <p>
        Welcome to the Vaccine Awareness Platform, a safe space to learn about
        the importance of vaccines in protecting yourself and your loved ones.
        Together, we can create a healthier, safer future.
      </p>

      <div className="features-section">
        <div className="feature">
          <i className="las la-book feature-icon"></i>
          <h3>Learn</h3>
          <p>
            Discover the science behind vaccines and their role in eradicating
            diseases.
          </p>
        </div>
        <div className="feature">
          <i className="las la-gamepad feature-icon"></i>
          <h3>Engage</h3>
          <p>
            Play educational games and earn rewards while expanding your
            knowledge.
          </p>
        </div>
        <div className="feature">
          <i className="las la-hands-helping feature-icon"></i>
          <h3>Connect</h3>
          <p>
            Join a community committed to spreading awareness and saving lives.
          </p>
        </div>
      </div>

      <div className="cta">
        <h2>Join Us Today!</h2>
        <p>Your journey towards vaccine awareness starts here.</p>
        <div className="buttons-container">
          <Link to="/login">
            <button>Login</button>
          </Link>
          <Link to="/signup">
            <button>Sign Up</button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
