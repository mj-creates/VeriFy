import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppContext } from '../AppContext';
import { CharacterAvatar } from '../components/CharacterAvatar';
import clsx from 'clsx';
import { ShieldCheck } from 'lucide-react';

export const JudgmentScreen: React.FC = () => {
  const { state, dispatch } = useAppContext();
  const [phase, setPhase] = useState<number>(0);
  const [score, setScore] = useState(0);

  const res = state.verifyResult!;
  const targetScore = res.judgment.confidenceScore;

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 800);
    const t2 = setTimeout(() => setPhase(2), 2500);
    const t3 = setTimeout(() => setPhase(3), 4000);
    const t4 = setTimeout(() => setPhase(4), 6000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, [targetScore]);

  useEffect(() => {
    if (phase === 3) {
      let current = 0;
      const interval = setInterval(() => {
        current += 2;
        if (current >= targetScore) {
          setScore(targetScore);
          clearInterval(interval);
        } else {
          setScore(current);
        }
      }, 20);
      return () => clearInterval(interval);
    }
  }, [phase, targetScore]);

  useEffect(() => {
    if (phase === 4) {
      const t = setTimeout(() => dispatch({ type: 'NEXT_STEP' }), 1500);
      return () => clearTimeout(t);
    }
  }, [phase, dispatch]);

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center p-4 bg-neo-bg">
      <div className="w-full max-w-4xl relative z-10 flex flex-col items-center">
        <motion.div 
          initial={{ scale: 0, opacity: 0, y: -20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          className="flex flex-col items-center mb-12"
        >
          <div className="bg-neo-purple p-4 border-4 border-neo-black shadow-neo rounded-full mb-6">
            <CharacterAvatar name="Nova" className="w-32 h-32 md:w-48 md:h-48 rotate-3" />
          </div>
          <div className="bg-neo-black text-white px-8 py-2 font-space font-bold uppercase text-2xl tracking-widest shadow-neo">
            Agent Nova
          </div>
          <div className="text-sm font-bold font-display uppercase tracking-widest text-neo-black mt-4 bg-white border-4 border-neo-black px-4 py-1 shadow-neo">
            Judge & Synthesizer
          </div>
        </motion.div>

        <div className="flex flex-wrap justify-center gap-6 relative min-h-24 w-full max-w-2xl mx-auto mb-8">
          <AnimatePresence>
            {phase >= 1 && res.findings.map((f: any) => {
              const baseColor = f.agentName === 'Vera' ? 'bg-neo-blue' : f.agentName === 'Vox' ? 'bg-neo-pink' : 'bg-neo-yellow';
              return (
                <motion.div
                  key={f.agentName}
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={clsx(
                    "px-6 py-3 border-4 border-neo-black flex items-center gap-4 shadow-neo font-space font-bold uppercase",
                    baseColor,
                    "text-neo-black"
                  )}
                >
                  <div className="w-4 h-4 bg-white border-2 border-neo-black rounded-full"></div>
                  <span className="text-sm md:text-base tracking-wide">{f.agentName}</span>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        <div className="h-32 flex justify-center items-center text-center w-full max-w-2xl">
          {phase >= 2 && (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-lg md:text-2xl font-bold font-display text-neo-black bg-white border-4 border-neo-black p-6 shadow-neo">
              "{res.judgment.agreementSummary}"
            </motion.div>
          )}
        </div>

        <div className="flex justify-center mt-12 h-40">
          <AnimatePresence>
            {phase >= 3 && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-8 neo-panel p-8 bg-white"
              >
                <div className="text-right text-neo-black font-space font-bold uppercase text-sm">
                  <div>Base <span className="text-xl bg-neo-black text-white px-2 py-1 ml-2">{res.judgment.breakdown.baseScore}</span></div>
                  <div className="mt-3">Bonus <span className="text-xl bg-neo-green text-neo-black border-2 border-neo-black px-2 py-1 ml-2">+{res.judgment.breakdown.consistencyBonus}</span></div>
                </div>
                <div className="text-5xl font-black text-neo-black/20">=</div>
                <div className="flex flex-col items-center">
                  <div className={clsx(
                    "text-7xl font-black font-space flex items-center gap-2 drop-shadow-[4px_4px_0_rgba(17,17,17,1)]",
                    score >= 85 ? "text-neo-green" : score >= 50 ? "text-neo-yellow" : "text-neo-pink"
                  )}>
                    {score}%
                    {score === targetScore && <ShieldCheck className="w-12 h-12 text-neo-black drop-shadow-none ml-2" strokeWidth={4} />}
                  </div>
                  <div className="text-sm font-black font-space uppercase tracking-widest text-neo-black mt-2 bg-neo-bg border-2 border-neo-black px-3 py-1">Confidence</div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
