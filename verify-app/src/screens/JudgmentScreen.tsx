import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppContext } from '../AppContext';
import { CharacterAvatar } from '../components/CharacterAvatar';
import { TypewriterText } from '../components/TypewriterText';
import clsx from 'clsx';
import { ShieldCheck } from 'lucide-react';

export const JudgmentScreen: React.FC = () => {
  const { state, dispatch } = useAppContext();
  const [skipAnim, setSkipAnim] = useState(false);
  const [phase, setPhase] = useState<number>(0);
  const [score, setScore] = useState(0);

  const res = state.verifyResult!;
  const isConflict = state.isMockConflict;
  const targetScore = res.judgment.confidenceScore;

  useEffect(() => {
    if (skipAnim) {
      setPhase(4);
      setScore(targetScore);
      return;
    }

    const t1 = setTimeout(() => setPhase(1), 1000);
    const t2 = setTimeout(() => setPhase(2), 3000);
    const t3 = setTimeout(() => setPhase(3), 5000);
    const t4 = setTimeout(() => setPhase(4), 7500);

    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, [skipAnim, targetScore]);

  useEffect(() => {
    if (phase === 3 && !skipAnim) {
      let current = 0;
      const interval = setInterval(() => {
        current += 2;
        if (current >= targetScore) {
          setScore(targetScore);
          clearInterval(interval);
        } else {
          setScore(current);
        }
      }, 30);
      return () => clearInterval(interval);
    }
  }, [phase, targetScore, skipAnim]);

  useEffect(() => {
    if (phase === 4) {
      const t = setTimeout(() => dispatch({ type: 'NEXT_STEP' }), 2000);
      return () => clearTimeout(t);
    }
  }, [phase, dispatch]);

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-4xl relative">
        <motion.div 
          initial={{ scale: 0, opacity: 0, y: -20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ type: 'spring', bounce: 0.6 }}
          className="flex flex-col items-center z-20 relative"
        >
          <div className="relative bg-white/90 border-[6px] border-white rounded-full shadow-bubbly p-4 bg-gradient-to-br from-[#C7CEEA] to-[#FFEDFA]">
            <CharacterAvatar name="Nova" className="w-48 h-48 md:w-64 md:h-64 hover:scale-110 transition-transform duration-300" />
          </div>
          <div className="bg-[#C7CEEA] text-white px-8 py-3 mt-8 rounded-[2rem] border-4 border-white shadow-sm z-10">
            <h2 className="text-4xl font-black tracking-wide title-stroke">NOVA</h2>
          </div>
          <div className="text-sm font-black uppercase tracking-widest text-candy-text mt-3 mb-12 bg-white border-[3px] border-white px-4 py-2 rounded-full shadow-sm">Debate & Judgment</div>
        </motion.div>

        <div className="flex flex-wrap justify-center gap-6 relative h-32 w-full max-w-2xl mx-auto">
          <AnimatePresence>
            {phase >= 1 && res.findings.map((f: any, i: number) => {
              const baseColor = f.agentName === 'Vera' ? '#7BDFF2' : f.agentName === 'Vox' ? '#FF9AA2' : '#B5EAD7';
              return (
                <motion.div
                  key={f.agentName}
                  initial={{ opacity: 0, y: 50, scale: 0.8 }}
                  animate={
                    phase === 1 ? { opacity: 1, y: 0, scale: 1, x: 0 } :
                    phase >= 2 ? {
                      opacity: isConflict && f.agentName !== 'Vera' ? 0 : 1,
                      scale: phase >= 3 ? 1.15 : 1,
                      x: phase >= 2 && !isConflict ? 0 : (isConflict && f.agentName !== 'Vera' ? (i === 1 ? 50 : -50) : 0),
                      y: phase >= 2 && !isConflict ? -20 : (isConflict && f.agentName !== 'Vera' ? 30 : -20),
                    } : {}
                  }
                  transition={{ type: 'spring', bounce: 0.5 }}
                  className={clsx(
                    "px-6 py-4 rounded-[2rem] border-4 border-white flex items-center gap-3 shadow-bubbly z-10 transition-colors duration-500 font-bold uppercase",
                    phase >= 2 && !isConflict ? "bg-[#B5EAD7] text-white title-stroke" :
                    isConflict && f.agentName !== 'Vera' && phase === 2 ? "bg-[#FF9AA2] text-white title-stroke animate-[pulse_0.5s_ease-in-out_infinite]" : "bg-white/90 text-candy-text"
                  )}
                >
                  <div className="w-5 h-5 rounded-full border-2 border-white shadow-sm" style={{ backgroundColor: baseColor }}></div>
                  <span className="text-sm md:text-base tracking-wide">{f.agentName}: {f.sourceTier}</span>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        <div className="h-28 flex justify-center items-center mt-6 text-center z-20 relative">
          {phase >= 2 && (
            <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring" }} className="text-lg md:text-2xl font-black text-candy-text max-w-xl bg-white border-[4px] border-white p-6 rounded-[2rem] shadow-bubbly relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-white border-t-4 border-l-4 border-white rotate-45 rounded-tl-sm"></div>
              <TypewriterText text={res.judgment.agreementSummary} cursorColor="bg-candy-text" delay={30} />
            </motion.div>
          )}
        </div>

        <div className="flex justify-center mt-8 h-40">
          <AnimatePresence>
            {phase >= 3 && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.8, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ type: "spring", bounce: 0.6 }}
                className="flex items-center gap-8 candy-panel px-12 py-8 bg-white/90"
              >
                <div className="text-right text-candy-text font-black uppercase text-sm">
                  <div>Base: <span className="text-2xl text-[#C7CEEA] title-stroke drop-shadow-sm ml-2">{res.judgment.breakdown.baseScore}</span></div>
                  <div className="mt-2">Bonus: <span className="text-2xl text-[#B5EAD7] title-stroke drop-shadow-sm ml-2">+{res.judgment.breakdown.consistencyBonus}</span></div>
                </div>
                <div className="text-5xl font-black text-candy-text/30">=</div>
                <div className="flex flex-col items-center">
                  <div className={clsx(
                    "text-8xl font-black flex items-center gap-2 title-stroke drop-shadow-md",
                    score >= 85 ? "text-[#B5EAD7]" : 
                    score >= 50 ? "text-[#FFDAC1]" : 
                    "text-[#FF9AA2]"
                  )}>
                    {score}%
                    {score === targetScore && <ShieldCheck className="w-14 h-14 text-white ml-2 drop-shadow-sm" strokeWidth={3} />}
                  </div>
                  <div className="text-sm font-black uppercase tracking-widest text-candy-text mt-3 bg-white border-2 border-white px-4 py-1.5 rounded-full shadow-sm">Confidence</div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {!skipAnim && (
        <button onClick={() => setSkipAnim(true)} className="absolute bottom-8 right-8 text-candy-text font-bold text-sm uppercase tracking-widest z-50 bg-white/80 border-4 border-white px-5 py-3 rounded-full shadow-bubbly hover:bg-white transition-all">
          Skip animation
        </button>
      )}
    </div>
  );
};
