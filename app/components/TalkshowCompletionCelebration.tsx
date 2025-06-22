"use client";

import { useEffect, useState } from "react";
import confetti from "canvas-confetti";
import { motion, AnimatePresence } from "framer-motion";
import { FiAward, FiX, FiMic } from "react-icons/fi";

interface TalkshowCompletionCelebrationProps {
  onClose?: () => void;
  show: boolean;
}

export default function TalkshowCompletionCelebration({ 
  onClose, 
  show 
}: TalkshowCompletionCelebrationProps) {
  const [showCelebration, setShowCelebration] = useState(show);
  const [confettiActive, setConfettiActive] = useState(false);

  const triggerConfetti = () => {
    setConfettiActive(true);
    
    // Big initial burst
    confetti({
      particleCount: 200,
      spread: 100,
      origin: { y: 0.6 },
      colors: ['#FF6B00', '#FFD700', '#FF1493', '#00BFFF'],
    });

    // Create a confetti cannon effect
    const end = Date.now() + 2000;
    const frame = () => {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#FF6B00', '#FFD700'],
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#FF1493', '#00BFFF'],
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  };

  useEffect(() => {
    if (show) {
      setShowCelebration(true);
      const timer = setTimeout(() => {
        triggerConfetti();
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [show]);

  const handleClose = () => {
    setShowCelebration(false);
    onClose?.();
  };

  return (
    <AnimatePresence>
      {showCelebration && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 flex items-center justify-center z-50"
        >
          {/* Animated background overlay */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.8 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-gradient-to-br from-orange-900/30 to-blue-900/30 backdrop-blur-sm"
            onClick={handleClose}
          />
          
          {/* Main celebration card */}
          <motion.div 
            initial={{ scale: 0.8, y: 50, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 15, stiffness: 200 }}
            className="relative z-10 w-full max-w-md mx-4"
          >
            <div className="relative overflow-hidden rounded-2xl shadow-2xl">
              {/* Decorative elements */}
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-yellow-400 rounded-full opacity-20" />
              <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-orange-500 rounded-full opacity-20" />
              
              {/* Glitter particles */}
              {confettiActive && (
                <>
                  {[...Array(20)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ 
                        opacity: [0, 1, 0],
                        scale: [0, 1, 0],
                        x: Math.random() * 200 - 100,
                        y: Math.random() * 200 - 100,
                      }}
                      transition={{ 
                        duration: 2 + Math.random() * 3,
                        repeat: Infinity,
                        delay: Math.random() * 2
                      }}
                      className={`absolute text-2xl ${i % 2 ? 'text-yellow-400' : 'text-orange-400'}`}
                      style={{
                        left: `${50 + (Math.random() * 40 - 20)}%`,
                        top: `${50 + (Math.random() * 40 - 20)}%`,
                      }}
                    >
                      {i % 3 === 0 ? '✦' : i % 2 ? '✧' : '★'}
                    </motion.div>
                  ))}
                </>
              )}
              
              {/* Content */}
              <div className="relative bg-gradient-to-br from-blue-500 to-orange-500 text-white p-8 rounded-2xl overflow-hidden z-10">
                <button 
                  onClick={handleClose}
                  className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
                  aria-label="Close"
                >
                  <FiX size={24} />
                </button>
                
                <div className="text-center space-y-4">
                  <motion.div
                    animate={{ 
                      rotate: [0, 15, -15, 0],
                      scale: [1, 1.2, 1],
                      y: [0, -10, 0]
                    }}
                    transition={{ 
                      repeat: Infinity, 
                      duration: 3, 
                      ease: "easeInOut",
                      repeatDelay: 1
                    }}
                    className="text-6xl mb-2"
                  >
                    🎤
                  </motion.div>
                  
                  <motion.h2 
                    className="text-3xl font-bold"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    Talk Show Completed!
                  </motion.h2>
                  
                  <motion.p 
                    className="text-lg text-white/90"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    Congratulations on participating in this talk show!
                  </motion.p>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-white/20 p-4 rounded-lg flex items-center justify-center gap-3"
                  >
                    <FiAward className="text-yellow-300" size={24} />
                    <span className="font-bold">+20 XP Earned</span>
                  </motion.div>
                </div>
              </div>
            </div>
            
            <motion.p 
              className="text-center text-white/70 mt-6 text-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
            >
              Tap anywhere to close
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}