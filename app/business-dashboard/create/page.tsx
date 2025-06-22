"use client";

import { useRouter } from "next/navigation";
import { FaTrophy, FaMicrophone, FaUsers, FaRegSmile, FaRocket, FaPalette, FaCode, FaLightbulb } from "react-icons/fa";
import { FiPlusCircle, FiAward, FiTrendingUp } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { Sword } from "lucide-react";
import BusinessSidebar from "@/components/BusinessSidebar";

export default function CreatePostPageWithSidebar() {
  const router = useRouter();
  
  const postOptions = [
    {
      id: "competition",
      label: "Heroic Challenge",
      icon: <FaTrophy className="w-12 h-12" />,
      description: "Launch a multi-stage challenge with epic rewards",
      route: "/business-dashboard/create/competition",
      color: "from-orange-600 to-amber-600",
      badge: "Most Popular",
      enabled: true // Enabled
    },
    {
      id: "talkshow",
      label: "Hero's Council",
      icon: <FaMicrophone className="w-12 h-12" />,
      description: "Host live discussions with legendary creators",
      route: "/business-dashboard/create/talkshow",
      color: "from-red-600 to-pink-600",
      badge: "Trending",
      enabled: true // Enabled
    },
    {
      id: "recruitment",
      label: "Party Formation",
      icon: <FaUsers className="w-12 h-12" />,
      description: "Assemble your dream team of creative heroes",
      route: "/business-dashboard/create/recruitment",
      color: "from-emerald-600 to-teal-600",
      badge: "New Feature",
      enabled: false // Disabled
    },
    {
      id: "social",
      label: "Tavern Gathering",
      icon: <FaRegSmile className="w-12 h-12" />,
      description: "Organize collaborative workshops and networking",
      route: "/business-dashboard/create/social",
      color: "from-yellow-600 to-amber-600",
      enabled: false // Disabled
    },
    {
      id: "project",
      label: "Epic Quest",
      icon: <FaCode className="w-12 h-12" />,
      description: "Start an open creative adventure",
      route: "/business-dashboard/create/project",
      color: "from-blue-600 to-cyan-600",
      enabled: false // Disabled
    },
    {
      id: "gallery",
      label: "Hall of Heroes",
      icon: <FaPalette className="w-12 h-12" />,
      description: "Showcase legendary creative works",
      route: "/business-dashboard/create/gallery",
      color: "from-purple-600 to-fuchsia-600",
      enabled: false // Disabled
    }
  ];

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: '#FFF3E0' }}>
      {/* OROA Sidebar */}
      <BusinessSidebar />

      {/* Main Content */}
      <div className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Heroic Header */}
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex items-center justify-between mb-10"
          >
            <div>
              <div className="flex items-center mb-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center mr-3"
                  style={{
                    background: 'linear-gradient(135deg, #D84315, #FF5722)',
                    boxShadow: '0 4px 12px rgba(216, 67, 21, 0.3)'
                  }}
                >
                  <Sword className="w-5 h-5 text-white" strokeWidth={2.5} />
                </div>
                <h1 className="text-4xl font-extrabold tracking-tight">
                  <span 
                    className="text-transparent bg-clip-text"
                    style={{
                      backgroundImage: 'linear-gradient(45deg, #D84315, #FF5722)'
                    }}
                  >
                    Create New Quest
                  </span>
                </h1>
              </div>
              <p className="text-orange-900/80 mt-2">Choose your quest type to begin your adventure</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-2 px-4 py-2 rounded-full"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.5)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(216, 67, 21, 0.2)'
                }}
              >
                <FiTrendingUp style={{ color: '#FF5722' }} />
                <span className="text-sm font-medium" style={{ color: '#D84315' }}>Trending: Heroic Challenges</span>
              </div>
            </div>
          </motion.div>

          {/* Quest Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence>
              {postOptions.map((option) => (
                <motion.div
                  key={option.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: option.enabled ? 1 : 0.6, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  whileHover={{ y: option.enabled ? -5 : 0 }}
                  whileTap={{ scale: option.enabled ? 0.98 : 1 }}
                  onClick={() => option.enabled && router.push(option.route)}
                  className={`relative cursor-pointer group overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br ${option.color} ${
                    !option.enabled ? 'pointer-events-none' : ''
                  }`}
                  style={{
                    boxShadow: '0 8px 32px rgba(216, 67, 21, 0.1)',
                    filter: !option.enabled ? 'grayscale(50%)' : 'none'
                  }}
                >
                  {/* "Coming Soon" overlay for disabled options */}
                  {!option.enabled && (
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center z-10">
                      <div className="bg-white/90 text-orange-800 px-4 py-2 rounded-full text-sm font-bold">
                        Coming Soon
                      </div>
                    </div>
                  )}

                  {/* Badge */}
                  {option.badge && (
                    <div className="absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold z-10"
                      style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        backdropFilter: 'blur(5px)',
                        color: '#D84315'
                      }}
                    >
                      {option.badge}
                    </div>
                  )}

                  {/* Card Content */}
                  <div className="p-8 text-white">
                    <div className="flex justify-center mb-6">
                      <div className="p-4 rounded-xl"
                        style={{
                          backgroundColor: 'rgba(255, 255, 255, 0.2)',
                          backdropFilter: 'blur(5px)'
                        }}
                      >
                        {option.icon}
                      </div>
                    </div>
                    <h2 className="text-2xl font-bold text-center mb-3">{option.label}</h2>
                    <p className="text-white/90 text-center text-sm mb-6">{option.description}</p>
                    
                    {/* Action Button */}
                    <div className="flex justify-center">
                      <motion.div 
                        whileHover={{ scale: option.enabled ? 1.05 : 1 }}
                        className="flex items-center justify-center px-6 py-2 rounded-full text-sm font-medium"
                        style={{
                          backgroundColor: 'rgba(255, 255, 255, 0.9)',
                          color: '#D84315'
                        }}
                      >
                        <FiPlusCircle className="mr-2" />
                        {option.enabled ? 'Begin Quest' : 'Coming Soon'}
                      </motion.div>
                    </div>
                  </div>

                  {/* Hover Effect */}
                  {option.enabled && (
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="absolute inset-0"
                        style={{
                          backgroundColor: 'rgba(255, 255, 255, 0.1)',
                          backdropFilter: 'blur(5px)'
                        }}
                      ></div>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Footer */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-16 pt-8"
            style={{
              borderTop: '1px solid rgba(216, 67, 21, 0.1)'
            }}
          >
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="flex items-center space-x-4 mb-4 md:mb-0">
                <FaLightbulb style={{ color: '#FF5722' }} />
                <p className="text-orange-900/80">Need guidance? <span 
                  className="font-medium cursor-pointer"
                  style={{ color: '#D84315' }}
                >See legendary quest examples</span></p>
              </div>
              <div className="flex items-center space-x-2 px-4 py-2 rounded-full"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.5)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(216, 67, 21, 0.2)'
                }}
              >
                <FiAward style={{ color: '#FF5722' }} />
                <span className="text-sm font-medium" style={{ color: '#D84315' }}>Your last quest: Design Challenge</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}