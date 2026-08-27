import React from 'react';
import { motion } from 'framer-motion';
import { useAppContext } from '../AppContext';
import { ShieldCheck } from 'lucide-react';

export const LandingScreen: React.FC = () => {
  const { dispatch } = useAppContext();

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen w-full p-4 overflow-hidden bg-neo-bg">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-4xl flex flex-col items-center text-center relative z-10"
      >
        <div className="bg-neo-yellow px-6 py-2 border-4 border-neo-black shadow-neo rounded-full mb-8 rotate-[-2deg]">
          <span className="font-space font-bold uppercase tracking-widest text-neo-black text-sm md:text-base">Beta v2.0 Available</span>
        </div>

        <h1 className="text-7xl md:text-9xl font-black font-space text-neo-black mb-8 leading-none drop-shadow-[6px_6px_0_rgba(17,17,17,1)]">
          VERIFY.
        </h1>

        <div className="bg-neo-blue/10 border-4 border-neo-black p-6 md:p-8 rounded-xl shadow-neo max-w-2xl mx-auto mb-12">
          <p className="text-xl md:text-3xl font-display font-bold text-neo-black leading-relaxed">
            The multi-agent truth engine. No fluff, just hard facts.
          </p>
        </div>

        <button
          onClick={() => dispatch({ type: 'NEXT_STEP' })}
          className="group relative flex items-center gap-4 bg-neo-pink text-neo-black px-12 py-6 text-2xl font-space font-bold uppercase tracking-widest border-4 border-neo-black rounded-xl shadow-neo hover:-translate-y-1 hover:shadow-neo-lg active:translate-y-1 active:translate-x-1 active:shadow-neo-active transition-all"
        >
          <span>Start Verification</span>
          <ShieldCheck className="w-8 h-8 group-hover:rotate-12 transition-transform" strokeWidth={3} />
        </button>
      </motion.div>
      
      {/* Decorative Neo-Brutalist elements */}
      <div className="absolute top-10 left-10 w-24 h-24 bg-neo-green border-4 border-neo-black rounded-full shadow-neo hidden md:block"></div>
      <div className="absolute bottom-20 right-10 w-32 h-32 bg-neo-purple border-4 border-neo-black rounded-xl shadow-neo hidden md:block rotate-12"></div>
    </div>
  );
};
