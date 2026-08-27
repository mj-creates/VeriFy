import React from 'react';
import { useReducedMotion } from 'framer-motion';

export const AnimatedBackground: React.FC = () => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden bg-slate-900 pointer-events-none">
      {!shouldReduceMotion ? (
        <>
          <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-agent-vera opacity-30 mix-blend-screen filter blur-[120px] animate-blob"></div>
          <div className="absolute top-[20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-agent-nova opacity-30 mix-blend-screen filter blur-[100px] animate-blob" style={{ animationDelay: '5s' }}></div>
          <div className="absolute bottom-[-20%] left-[20%] w-[70%] h-[70%] rounded-full bg-pink-600 opacity-20 mix-blend-screen filter blur-[150px] animate-blob" style={{ animationDelay: '10s' }}></div>
        </>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-agent-vera/20 via-agent-nova/20 to-pink-600/20"></div>
      )}
      {/* Semi-transparent dark overlay to ensure legibility */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]"></div>
    </div>
  );
};
