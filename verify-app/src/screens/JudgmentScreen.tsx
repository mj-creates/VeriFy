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
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', bounce: 0.6 }}
          className="flex flex-col items-center z-20 relative"
        >
          <div className="relative bg-white border-4 border-black rounded-full shadow-[8px_8px_0px_0px_#000] p-4 bg-gradient-to-br from-[#9D4EDD] to-purple-400">
            <CharacterAvatar name="Nova" className="w-40 h-40 md:w-56 md:h-56 drop-shadow-[0_10px_0_rgba(0,0,0,1)] hover:scale-110 transition-transform" />
          </div>
          <div className="bg-black text-white px-6 py-2 mt-6 rounded-xl border-4 border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)] rotate-[-2deg]">
            <h2 className="text-4xl font-black tracking-wide">NOVA</h2>
          </div>
          <div className="text-sm font-black uppercase tracking-widest text-black mt-2 mb-12 bg-white border-2 border-black px-3 py-1 shadow-[2px_2px_0px_0px_#000] rotate-[1deg]">Debate & Judgment</div>
        </motion.div>

        <div className="flex flex-wrap justify-center gap-6 relative h-32 w-full max-w-2xl mx-auto">
          <AnimatePresence>
            {phase >= 1 && res.findings.map((f: any, i: number) => (
              <motion.div
                key={f.agentName}
                initial={{ opacity: 0, y: 50, scale: 0.8 }}
                animate={
                  phase === 1 ? { opacity: 1, y: 0, scale: 1, x: 0 } :
                  phase >= 2 ? {
                    opacity: isConflict && f.agentName !== 'Vera' ? 0 : 1,
                    scale: phase >= 3 ? 1.2 : 1,
                    x: phase >= 2 && !isConflict ? 0 : (isConflict && f.agentName !== 'Vera' ? (i === 1 ? 50 : -50) : 0),
                    y: phase >= 2 && !isConflict ? -30 : (isConflict && f.agentName !== 'Vera' ? 30 : -30),
                    rotate: phase >= 2 && !isConflict ? (i === 1 ? 0 : i === 0 ? -10 : 10) : 0,
                  } : {}
                }
                transition={{ type: 'spring', bounce: 0.5 }}
                className={clsx(
                  "px-5 py-3 rounded-xl border-4 border-black flex items-center gap-3 shadow-[4px_4px_0px_0px_#000] z-10 transition-colors duration-500 font-bold uppercase",
                  phase >= 2 && !isConflict ? "bg-[#6BCB77] text-white" :
                  isConflict && f.agentName !== 'Vera' && phase === 2 ? "bg-[#FF6B6B] text-white animate-[shake_0.5s_ease-in-out_infinite]" : "bg-white text-black"
                )}
              >
                <div className={clsx("w-4 h-4 rounded-full border-2 border-black", `bg-agent-${f.agentName.toLowerCase()}`)}></div>
                <span className="text-sm md:text-base">{f.agentName}: {f.sourceTier}</span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <div className="h-24 flex justify-center items-center mt-4 text-center">
          {phase >= 2 && (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }} className="text-lg md:text-2xl font-black text-black max-w-xl bg-white border-4 border-black p-4 rounded-2xl shadow-[6px_6px_0px_0px_#000] relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-t-4 border-l-4 border-black rotate-45"></div>
              <TypewriterText text={res.judgment.agreementSummary} cursorColor="bg-black" delay={30} />
            </motion.div>
          )}
        </div>

        <div className="flex justify-center mt-8 h-40">
          <AnimatePresence>
            {phase >= 3 && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.2, rotate: -15 }}
                animate={{ opacity: 1, scale: 1, rotate: 2 }}
                transition={{ type: "spring", bounce: 0.6 }}
                className="flex items-center gap-8 cartoon-panel px-10 py-6 bg-[#FFD93D]"
              >
                <div className="text-right text-black font-black uppercase text-sm">
                  <div>Base: <span className="text-xl">{res.judgment.breakdown.baseScore}</span></div>
                  <div>Bonus: <span className="text-[#6BCB77] text-xl">+{res.judgment.breakdown.consistencyBonus}</span></div>
                </div>
                <div className="text-5xl font-black text-black">=</div>
                <div className="flex flex-col items-center">
                  <div className={clsx(
                    "text-7xl font-black flex items-center gap-2 drop-shadow-[4px_4px_0_rgba(0,0,0,1)]",
                    score >= 85 ? "text-[#6BCB77]" : 
                    score >= 50 ? "text-[#FF9F43]" : 
                    "text-[#FF6B6B]"
                  )}>
                    {score}%
                    {score === targetScore && <ShieldCheck className="w-12 h-12 text-black ml-2" strokeWidth={3} fill="currentColor" />}
                  </div>
                  <div className="text-sm font-black uppercase tracking-widest text-black mt-2 bg-white border-2 border-black px-2 py-1 shadow-[2px_2px_0px_0px_#000]">Confidence</div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {!skipAnim && (
        <button onClick={() => setSkipAnim(true)} className="absolute bottom-8 right-8 text-black font-bold text-sm uppercase tracking-widest z-50 bg-white border-2 border-black px-4 py-2 shadow-[2px_2px_0px_0px_#000] hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[4px_4px_0px_0px_#000] active:translate-y-0 active:translate-x-0 active:shadow-none transition-all">
          Skip animation
        </button>
      )}
    </div>
  );
};
