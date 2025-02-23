import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/auth/login', { email, password });
      const { token, role } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('role', role);
      if (role === 'admin') {
        navigate('/admin-home');
      } else {
        navigate('/home');
      }
    } catch (error) {
      alert('Login failed: ' + error.response.data.error);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0C10] text-[#C5C6C7] flex flex-col items-center p-6">
      <header className="w-full flex justify-between items-center py-4 px-6">
        <h1 className="text-4xl font-bold text-[#66FCF1]">VARP</h1>
        <div className="flex space-x-4">
          <Link to="/signup">
            <button className="border-2 border-[#45A29E] text-[#45A29E] px-6 py-2 rounded-lg shadow-md hover:bg-[#66FCF1] hover:text-white transition">Sign Up</button>
          </Link>
        </div>
      </header>

      <div className="max-w-md w-full bg-[#1F2833] p-8 rounded-lg shadow-lg mt-12">
        <h2 className="text-3xl font-bold text-[#66FCF1] text-center mb-6">Login</h2>
        <form onSubmit={handleLogin} className="flex flex-col space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="p-3 rounded bg-[#0B0C10] text-white border border-[#45A29E] focus:outline-none focus:ring-2 focus:ring-[#66FCF1]"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="p-3 rounded bg-[#0B0C10] text-white border border-[#45A29E] focus:outline-none focus:ring-2 focus:ring-[#66FCF1]"
          />
          <button type="submit" className="bg-[#45A29E] text-white px-6 py-3 rounded-lg shadow-md hover:bg-[#66FCF1] transition">Login</button>
        </form>
        <div className="mt-4 text-center">
          <Link to="/forgot-password" className="text-[#66FCF1] underline">Forgot Password?</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
