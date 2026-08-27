import React, { useState, useEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { TypewriterText } from '../components/TypewriterText';
import { useAppContext } from '../AppContext';
import { Sparkles, Cloud } from 'lucide-react';

const generateFloatingClouds = (count: number) => {
  return Array.from({ length: count }).map((_, i) => ({
    id: i,
    size: Math.random() * 40 + 40,
    x: Math.random() * 100,
    y: Math.random() * 100,
    duration: Math.random() * 4 + 4,
    delay: Math.random() * 3,
    color: ['text-white', 'text-agent-vera', 'text-agent-trace'][Math.floor(Math.random() * 3)],
    opacity: Math.random() * 0.4 + 0.4
  }));
};

export const LandingScreen: React.FC = () => {
  const { dispatch } = useAppContext();
  const [phase, setPhase] = useState<'typing' | 'holding' | 'exiting' | 'resolved'>('typing');
  const [clouds] = useState(() => generateFloatingClouds(12));
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (phase === 'holding') {
      const t = setTimeout(() => setPhase('exiting'), 1500);
      return () => clearTimeout(t);
    }
    if (phase === 'exiting') {
      const t = setTimeout(() => setPhase('resolved'), 600);
      return () => clearTimeout(t);
    }
  }, [phase]);

  const handleSkip = () => setPhase('resolved');

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen w-full overflow-hidden">
      {/* Floating Kawaii Clouds */}
      {phase !== 'resolved' && !shouldReduceMotion && clouds.map(c => (
        <motion.div
          key={c.id}
          className={`absolute ${c.color}`}
          style={{ left: `${c.x}%`, top: `${c.y}%`, opacity: c.opacity }}
          animate={phase === 'exiting' ? { scale: 0, opacity: 0 } : {
            y: ['-20px', '20px', '-20px'],
          }}
          transition={phase === 'exiting' ? { duration: 0.6 } : {
            duration: c.duration,
            repeat: Infinity,
            delay: c.delay,
            ease: 'easeInOut'
          }}
        >
          <Cloud size={c.size} fill="currentColor" strokeWidth={0} />
        </motion.div>
      ))}

      <div className="z-10 flex flex-col items-center text-center">
        {(phase === 'typing' || phase === 'holding' || phase === 'exiting') && (
          <motion.div
            animate={phase === 'exiting' ? { opacity: 0, scale: 1.2, filter: 'blur(10px)' } : {}}
            transition={{ type: "spring", bounce: 0.4, duration: 0.8 }}
            className="text-6xl md:text-8xl font-black text-[#FF9AA2] title-stroke drop-shadow-xl"
          >
            <TypewriterText 
              text="Verify" 
              delay={90} 
              onComplete={() => setPhase('holding')} 
              cursorColor="bg-[#FF9AA2]"
            />
          </motion.div>
        )}

        {phase === 'resolved' && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ type: 'spring', bounce: 0.5, duration: 0.8 }}
            className="flex flex-col items-center"
          >
            <div className="relative mb-6">
              <h1 className="text-7xl md:text-9xl font-black text-[#FFB7B2] tracking-tighter relative z-10 title-stroke drop-shadow-[0_10px_10px_rgba(255,183,178,0.5)]">
                VeriFY
              </h1>
              <Sparkles className="w-16 h-16 text-[#FFDAC1] absolute -top-8 -right-8 animate-pulse-soft z-20 drop-shadow-md" strokeWidth={3} fill="#FFDAC1" />
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm border-[4px] border-white px-8 py-4 rounded-[2rem] shadow-bubbly mt-2">
              <p className="text-xl md:text-2xl font-bold text-candy-text">
                Multi-agent verification for student claims! ✨
              </p>
            </div>

            <motion.button
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, type: "spring", bounce: 0.6 }}
              onClick={() => dispatch({ type: 'NEXT_STEP' })}
              className="mt-12 px-12 py-5 text-2xl bg-[#7BDFF2] candy-button-color title-stroke"
            >
              Get Started!
            </motion.button>
          </motion.div>
        )}
      </div>

      {phase !== 'resolved' && (
        <button onClick={handleSkip} className="absolute bottom-8 right-8 text-candy-text font-bold text-sm uppercase tracking-widest z-50 bg-white/80 border-4 border-white px-5 py-3 rounded-full shadow-bubbly hover:bg-white transition-all">
          Skip intro
        </button>
      )}
    </div>
  );
};
