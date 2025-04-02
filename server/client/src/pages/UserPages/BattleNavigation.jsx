import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { VscTools } from "react-icons/vsc";
import { FaUsers, FaRobot } from "react-icons/fa";
import ActionNavbar from '../../components/ActionNavbar';

const BattleNavigation = () => {
  const navigate = useNavigate();

  const buttons = [
    {
      title: "Build Deck",
      description: "Create and customize your battle deck",
      icon: <VscTools className="text-4xl" />,
      route: "/games/card-game",
      color: "from-green-600 to-green-700"
    },
    {
      title: "PvE Battle",
      description: "Battle against computer opponents",
      icon: <FaRobot className="text-4xl" />,
      route: "/games/PvE-battle",
      color: "from-blue-600 to-blue-700"
    },
    {
      title: "PvP Battle",
      description: "Challenge other players",
      icon: <FaUsers className="text-4xl" />,
      route: "/games/PvP-battle",
      color: "from-purple-600 to-purple-700"
    }
  ];

  return (
    <div className="relative min-h-screen bg-[#0B0C10] p-8">
      {/* Background */}
      <div className="absolute inset-0 bg-[url('/BG/bg3.jpg')] bg-cover bg-center bg-no-repeat opacity-50" />
      
      {/* Main Content */}
      <div className="relative z-10 max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-12 text-[#66FCF1]">
          Battle Arena
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {buttons.map((button) => (
            <motion.div
              key={button.title}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`bg-gradient-to-br ${button.color} rounded-lg shadow-xl overflow-hidden`}
            >
              <button
                onClick={() => navigate(button.route)}
                className="w-full h-full p-6 text-white hover:opacity-90 transition-opacity"
              >
                <div className="flex flex-col items-center gap-4">
                  {button.icon}
                  <h2 className="text-2xl font-bold">{button.title}</h2>
                  <p className="text-sm text-center opacity-90">
                    {button.description}
                  </p>
                </div>
              </button>
            </motion.div>
          ))}
        </div>

        {/* Additional Info Section */}
        <div className="mt-12 p-6 bg-gray-800 bg-opacity-80 rounded-lg">
          <h2 className="text-2xl font-bold text-[#66FCF1] mb-4">
            Getting Started
          </h2>
          <div className="text-gray-300 space-y-3">
            <p>1. First, build your deck with at least 4 vaccines and 4 viruses</p>
            <p>2. Try your deck against the computer in PvE battles</p>
            <p>3. Challenge other players in PvP battles when you're ready</p>
          </div>
        </div>
      </div>

      <ActionNavbar />
    </div>
  );
};

export default BattleNavigation; 