import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate(); // Initialize useNavigate

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/auth/login', { email, password });
      const { token, role } = response.data;
  
      localStorage.setItem('token', token);
      localStorage.setItem('role', role); // Store the role
    
      // Redirect based on user role
      if (role === 'admin') {
        navigate('/admin-home'); // Redirect to admin page
      } else {
        navigate('/home'); // Redirect to general home page
      }
    } catch (error) {
      alert('Login failed: ' + error.response.data.error);
    }
  };
  

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Login</button>
      </form>
      <div style={{ marginTop: '10px' }}>
        <Link to="/forgot-password" style={{ color: 'blue', textDecoration: 'underline' }}>
          Forgot Password?
        </Link>
      </div>
    </div>
  );
};

export default Login;
