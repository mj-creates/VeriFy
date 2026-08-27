import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

export const AnimatedBackground: React.FC = () => {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className="fixed inset-0 z-[-1] bg-gradient-to-br from-[#FFEDFA] to-[#E6F4F1]" />;
  }

  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none bg-gradient-to-br from-[#FFEDFA] to-[#E6F4F1]">
      <motion.div
        className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-agent-trace opacity-20 filter blur-[80px]"
        animate={{ x: [0, 50, 0], y: [0, 30, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-[20%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-agent-vox opacity-15 filter blur-[100px]"
        animate={{ x: [0, -40, 0], y: [0, -40, 0], scale: [1, 1.2, 1] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />
      <motion.div
        className="absolute bottom-[-10%] left-[20%] w-[70vw] h-[70vw] rounded-full bg-agent-nova opacity-20 filter blur-[120px]"
        animate={{ x: [0, 30, 0], y: [0, -50, 0], scale: [1, 1.05, 1] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 5 }}
      />
    </div>
  );
};
