import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-[#0B0C10] text-[#C5C6C7] flex flex-col items-center p-6">
      <header className="w-full flex justify-between items-center py-4 px-6">
        <h1 className="text-4xl font-bold text-[#66FCF1]">VARP</h1>
        <div className="flex space-x-4">
          <Link to="/login">
            <button className="bg-[#45A29E] text-white px-6 py-2 rounded-lg shadow-md hover:bg-[#66FCF1] transition">Login</button>
          </Link>
          <Link to="/signup">
            <button className="border-2 border-[#45A29E] text-[#45A29E] px-6 py-2 rounded-lg shadow-md hover:bg-[#66FCF1] hover:text-white transition">Sign Up</button>
          </Link>
        </div>
      </header>

      <div className="max-w-3xl text-center">
        <h1 className="text-5xl font-bold text-[#66FCF1] mb-4">Stay Protected. Stay Informed.</h1>
        <p className="text-lg text-[#C5C6C7] mb-8">
          Welcome to the Vaccine Awareness Platform, a safe space to learn about
          the importance of vaccines in protecting yourself and your loved ones.
          Together, we can create a healthier, safer future.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full text-center mb-12">
        <div className="bg-[#1F2833] p-8 rounded-lg shadow-lg h-64 flex flex-col justify-center">
          <i className="las la-book text-5xl text-[#66FCF1] mb-4"></i>
          <h3 className="text-2xl font-semibold text-[#66FCF1]">Learn</h3>
          <p className="text-base">Discover the science behind vaccines and their role in eradicating diseases.</p>
        </div>
        <div className="bg-[#1F2833] p-8 rounded-lg shadow-lg h-64 flex flex-col justify-center">
          <i className="las la-gamepad text-5xl text-[#66FCF1] mb-4"></i>
          <h3 className="text-2xl font-semibold text-[#66FCF1]">Engage</h3>
          <p className="text-base">Play educational games and earn rewards while expanding your knowledge.</p>
        </div>
        <div className="bg-[#1F2833] p-8 rounded-lg shadow-lg h-64 flex flex-col justify-center">
          <i className="las la-hands-helping text-5xl text-[#66FCF1] mb-4"></i>
          <h3 className="text-2xl font-semibold text-[#66FCF1]">Connect</h3>
          <p className="text-base">Join a community committed to spreading awareness and saving lives.</p>
        </div>
      </div>

      <div className="max-w-4xl text-center mb-12">
        <h2 className="text-3xl font-bold text-[#66FCF1]">Why Vaccines Matter?</h2>
        <p className="text-lg mt-4">
          Vaccines protect against deadly diseases and help build community immunity.
          By staying informed and spreading awareness, we can ensure a healthier world for everyone.
        </p>
      </div>
    </div>
  );
};

export default LandingPage;
