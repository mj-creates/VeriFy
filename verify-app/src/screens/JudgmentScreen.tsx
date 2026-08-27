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

    const t1 = setTimeout(() => setPhase(1), 1000); // Chips appear
    const t2 = setTimeout(() => setPhase(2), 3000); // Chips merge or conflict shake
    const t3 = setTimeout(() => setPhase(3), 5000); // Math/score builds
    const t4 = setTimeout(() => setPhase(4), 7500); // Done, ready to move

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
        {/* Nova Avatar Center Top */}
        <motion.div 
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', bounce: 0.5 }}
          className="flex flex-col items-center z-20 relative"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-agent-nova opacity-20 blur-3xl rounded-full scale-150 animate-pulse"></div>
            <CharacterAvatar name="Nova" className="w-40 h-40 md:w-56 md:h-56 drop-shadow-[0_0_20px_rgba(139,92,246,0.5)]" />
          </div>
          <h2 className="text-3xl font-black mt-4 text-agent-nova tracking-wide">NOVA</h2>
          <div className="text-sm uppercase tracking-widest text-white/50 mb-12">Debate & Judgment</div>
        </motion.div>

        {/* Source Chips */}
        <div className="flex flex-wrap justify-center gap-4 relative h-32 w-full max-w-2xl mx-auto">
          <AnimatePresence>
            {phase >= 1 && res.findings.map((f: any, i: number) => (
              <motion.div
                key={f.agentName}
                initial={{ opacity: 0, y: 50, scale: 0.8 }}
                animate={
                  phase === 1 ? { opacity: 1, y: 0, scale: 1, x: 0 } :
                  phase >= 2 ? {
                    opacity: isConflict && f.agentName !== 'Vera' ? 0 : 1,
                    scale: phase >= 3 ? 1.1 : 1,
                    x: phase >= 2 && !isConflict ? 0 : (isConflict && f.agentName !== 'Vera' ? (i === 1 ? 50 : -50) : 0),
                    y: phase >= 2 && !isConflict ? -20 : (isConflict && f.agentName !== 'Vera' ? 20 : -20),
                    backgroundColor: isConflict && f.agentName !== 'Vera' && phase === 2 ? '#F59E0B' : undefined
                  } : {}
                }
                transition={{ type: 'spring', bounce: 0.4 }}
                className={clsx(
                  "px-4 py-3 rounded-xl border flex items-center gap-3 backdrop-blur-md z-10 transition-colors duration-500",
                  phase >= 2 && !isConflict ? "bg-teal-500/20 border-teal-500/50" :
                  isConflict && f.agentName !== 'Vera' && phase === 2 ? "bg-amber-500/20 border-amber-500/50 animate-[shake_0.5s_ease-in-out_infinite]" : "bg-black/50 border-white/20"
                )}
              >
                <div className={clsx("w-3 h-3 rounded-full", `bg-agent-${f.agentName.toLowerCase()}`)}></div>
                <span className="text-sm font-medium">{f.agentName}: {f.sourceTier}</span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Resolution Note */}
        <div className="h-20 flex justify-center items-center mt-4 text-center">
          {phase >= 2 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-lg md:text-xl font-medium text-white/90 max-w-xl">
              <TypewriterText text={res.judgment.agreementSummary} cursorColor="bg-agent-nova" delay={40} />
            </motion.div>
          )}
        </div>

        {/* Score Math */}
        <div className="flex justify-center mt-8 h-32">
          <AnimatePresence>
            {phase >= 3 && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.5, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="flex items-center gap-6 glass-panel px-8 py-4 rounded-3xl border-agent-nova/30 shadow-[0_0_40px_-10px_rgba(139,92,246,0.3)]"
              >
                <div className="text-right text-white/70 text-sm">
                  <div>Base Tier: <span className="text-white font-mono">{res.judgment.breakdown.baseScore}</span></div>
                  <div>Bonus: <span className="text-agent-trace font-mono">+{res.judgment.breakdown.consistencyBonus}</span></div>
                </div>
                <div className="text-3xl text-white/20">=</div>
                <div className="flex flex-col items-center">
                  <div className={clsx(
                    "text-5xl font-black flex items-center gap-2",
                    score >= 85 ? "text-teal-400 drop-shadow-[0_0_15px_rgba(45,212,191,0.5)]" : 
                    score >= 50 ? "text-amber-400 drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]" : 
                    "text-red-400"
                  )}>
                    {score}%
                    {score === targetScore && <ShieldCheck className="w-8 h-8" />}
                  </div>
                  <div className="text-xs uppercase tracking-widest text-white/50 mt-1">Confidence</div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {!skipAnim && (
        <button onClick={() => setSkipAnim(true)} className="absolute bottom-8 right-8 text-white/50 hover:text-white text-sm uppercase tracking-widest z-50">
          Skip animation
        </button>
      )}
    </div>
  );
};
