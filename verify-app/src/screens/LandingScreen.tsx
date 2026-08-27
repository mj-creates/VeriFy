import React, { useState, useEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { TypewriterText } from '../components/TypewriterText';
import { useAppContext } from '../AppContext';
import { Sparkles } from 'lucide-react';

const generateFloatingQuestionMarks = (count: number) => {
  return Array.from({ length: count }).map((_, i) => ({
    id: i,
    size: Math.random() * 104 + 16,
    x: Math.random() * 100,
    y: Math.random() * 100,
    duration: Math.random() * 7 + 8,
    delay: Math.random() * 5,
    color: ['text-agent-vera', 'text-agent-nova', 'text-pink-500', 'text-agent-trace'][Math.floor(Math.random() * 4)],
    opacity: Math.random() * 0.3 + 0.1
  }));
};

export const LandingScreen: React.FC = () => {
  const { dispatch } = useAppContext();
  const [phase, setPhase] = useState<'typing' | 'holding' | 'exiting' | 'resolved'>('typing');
  const [qMarks] = useState(() => generateFloatingQuestionMarks(24));
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (phase === 'holding') {
      const t = setTimeout(() => setPhase('exiting'), 2000);
      return () => clearTimeout(t);
    }
    if (phase === 'exiting') {
      const t = setTimeout(() => setPhase('resolved'), 800);
      return () => clearTimeout(t);
    }
  }, [phase]);

  const handleSkip = () => setPhase('resolved');

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen w-full overflow-hidden">
      {/* Floating QMarks */}
      {phase !== 'resolved' && !shouldReduceMotion && qMarks.map(qm => (
        <motion.div
          key={qm.id}
          className={`absolute font-black ${qm.color}`}
          style={{ left: `${qm.x}%`, top: `${qm.y}%`, fontSize: qm.size, opacity: qm.opacity }}
          animate={phase === 'exiting' ? { scale: 0, opacity: 0 } : {
            y: ['-20px', '20px', '-20px'],
            rotate: [-10, 10, -10]
          }}
          transition={phase === 'exiting' ? { duration: 0.6, ease: "easeOut" } : {
            duration: qm.duration,
            repeat: Infinity,
            delay: qm.delay,
            ease: 'easeInOut'
          }}
        >
          ?
        </motion.div>
      ))}

      <div className="z-10 flex flex-col items-center text-center">
        {(phase === 'typing' || phase === 'holding' || phase === 'exiting') && (
          <motion.div
            animate={phase === 'exiting' ? { opacity: 0, filter: 'blur(10px)' } : {}}
            transition={{ duration: 0.6 }}
            className="text-6xl md:text-8xl font-bold primary-gradient-text"
          >
            <TypewriterText 
              text="Verify" 
              delay={100} 
              onComplete={() => setPhase('holding')} 
              cursorColor="bg-agent-nova"
            />
          </motion.div>
        )}

        {phase === 'resolved' && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', bounce: 0.4, duration: 0.8 }}
            className="flex flex-col items-center"
          >
            <h1 className="text-7xl md:text-9xl font-extrabold primary-gradient-text tracking-tighter mb-4 flex items-center gap-4">
              <Sparkles className="w-12 h-12 md:w-20 md:h-20 text-agent-sol animate-pulse" />
              VeriFY
            </h1>
            <p className="text-xl md:text-2xl text-white/80 font-medium">
              Multi-agent verification for student claims.
            </p>
            <motion.button
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              onClick={() => dispatch({ type: 'NEXT_STEP' })}
              className="mt-12 px-8 py-4 rounded-full primary-gradient-bg text-white font-bold text-lg hover:scale-105 transition-transform shadow-lg shadow-agent-nova/50"
            >
              Get Started
            </motion.button>
          </motion.div>
        )}
      </div>

      {phase !== 'resolved' && (
        <button onClick={handleSkip} className="absolute bottom-8 right-8 text-white/50 hover:text-white text-sm uppercase tracking-widest z-50">
          Skip animation
        </button>
      )}
    </div>
  );
};
