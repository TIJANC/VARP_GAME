import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  return (
    <div style={{ textAlign: 'center', padding: '50px' }}>
      <h1>Welcome to Our App!</h1>
      <p>This is a simple MERN app template with email authentication and role based authorization.</p>
      <div style={{ marginTop: '20px' }}>
        <Link to="/login">
          <button style={{ margin: '10px', padding: '10px 20px' }}>Login</button>
        </Link>
        <Link to="/signup">
          <button style={{ margin: '10px', padding: '10px 20px' }}>Sign Up</button>
        </Link>
      </div>
    </div>
  );
};

export default LandingPage;
