import React, { useState, useEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { TypewriterText } from '../components/TypewriterText';
import { useAppContext } from '../AppContext';
import { Sparkles } from 'lucide-react';

const generateFloatingQuestionMarks = (count: number) => {
  return Array.from({ length: count }).map((_, i) => ({
    id: i,
    size: Math.random() * 80 + 30,
    x: Math.random() * 100,
    y: Math.random() * 100,
    duration: Math.random() * 2 + 1.5,
    delay: Math.random() * 2,
    color: ['text-agent-vera', 'text-agent-nova', 'text-agent-vox', 'text-agent-trace'][Math.floor(Math.random() * 4)],
  }));
};

export const LandingScreen: React.FC = () => {
  const { dispatch } = useAppContext();
  const [phase, setPhase] = useState<'typing' | 'holding' | 'exiting' | 'resolved'>('typing');
  const [qMarks] = useState(() => generateFloatingQuestionMarks(15));
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (phase === 'holding') {
      const t = setTimeout(() => setPhase('exiting'), 1500);
      return () => clearTimeout(t);
    }
    if (phase === 'exiting') {
      const t = setTimeout(() => setPhase('resolved'), 500);
      return () => clearTimeout(t);
    }
  }, [phase]);

  const handleSkip = () => setPhase('resolved');

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen w-full overflow-hidden">
      {/* Cartoon Question Marks */}
      {phase !== 'resolved' && !shouldReduceMotion && qMarks.map(qm => (
        <motion.div
          key={qm.id}
          className={`absolute font-black ${qm.color}`}
          style={{ left: `${qm.x}%`, top: `${qm.y}%`, fontSize: qm.size, WebkitTextStroke: '2px black' }}
          animate={phase === 'exiting' ? { scale: 0, opacity: 0 } : {
            y: ['-15px', '15px', '-15px'],
            rotate: [-15, 15, -15]
          }}
          transition={phase === 'exiting' ? { duration: 0.4 } : {
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
            animate={phase === 'exiting' ? { opacity: 0, scale: 0.5, y: -50 } : {}}
            transition={{ type: "spring", bounce: 0.5 }}
            className="text-6xl md:text-8xl font-black text-white"
            style={{ WebkitTextStroke: '3px black', textShadow: '4px 4px 0px #000' }}
          >
            <TypewriterText 
              text="Verify" 
              delay={80} 
              onComplete={() => setPhase('holding')} 
              cursorColor="bg-black"
            />
          </motion.div>
        )}

        {phase === 'resolved' && (
          <motion.div
            initial={{ scale: 0.5, opacity: 0, rotate: -10 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            transition={{ type: 'spring', bounce: 0.6, duration: 0.6 }}
            className="flex flex-col items-center"
          >
            <div className="relative mb-4">
              <h1 className="text-7xl md:text-9xl font-black text-[#FFD93D] tracking-tighter relative z-10" style={{ WebkitTextStroke: '4px black', textShadow: '8px 8px 0px #000' }}>
                VeriFY
              </h1>
              <Sparkles className="w-16 h-16 text-[#FF6B6B] absolute -top-8 -right-8 animate-bounce z-20" strokeWidth={3} color="black" fill="#FF6B6B" />
            </div>
            
            <div className="cartoon-panel px-6 py-3 bg-white mt-4 rotate-2">
              <p className="text-xl md:text-2xl font-black uppercase">
                Multi-agent verification for student claims!
              </p>
            </div>

            <motion.button
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, type: "spring" }}
              onClick={() => dispatch({ type: 'NEXT_STEP' })}
              className="mt-12 px-10 py-5 text-2xl bg-[#4D96FF] cartoon-button text-white shadow-cartoon-lg hover:shadow-cartoon active:shadow-none"
              style={{ WebkitTextStroke: '1px black' }}
            >
              Get Started
            </motion.button>
          </motion.div>
        )}
      </div>

      {phase !== 'resolved' && (
        <button onClick={handleSkip} className="absolute bottom-8 right-8 text-black font-bold text-sm uppercase tracking-widest z-50 bg-white border-2 border-black px-4 py-2 shadow-[2px_2px_0px_0px_#000] hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[4px_4px_0px_0px_#000] active:translate-y-0 active:translate-x-0 active:shadow-none transition-all">
          Skip animation
        </button>
      )}
    </div>
  );
};
