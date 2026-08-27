import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppContext } from '../AppContext';
import { CharacterAvatar } from '../components/CharacterAvatar';
import clsx from 'clsx';
import { ChevronDown, ExternalLink, ShieldAlert, ShieldCheck, ShieldQuestion } from 'lucide-react';

export const OutputScreen: React.FC = () => {
  const { state, dispatch } = useAppContext();
  const [sourcesOpen, setSourcesOpen] = useState(false);
  const [skipAnim, setSkipAnim] = useState(false);

  const res = state.verifyResult!;
  const score = res.judgment.confidenceScore;
  const isHighConf = score >= 85;
  const isMidConf = score >= 50 && score < 85;

  const getScoreColor = () => {
    if (isHighConf) return 'text-teal-400 border-teal-400/50 shadow-teal-400/20';
    if (isMidConf) return 'text-amber-400 border-amber-400/50 shadow-amber-400/20';
    return 'text-red-400 border-red-400/50 shadow-red-400/20';
  };

  const getScoreIcon = () => {
    if (isHighConf) return <ShieldCheck className="w-12 h-12 mb-2 text-teal-400" />;
    if (isMidConf) return <ShieldAlert className="w-12 h-12 mb-2 text-amber-400" />;
    return <ShieldQuestion className="w-12 h-12 mb-2 text-red-400" />;
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center p-4">
      <motion.div
        initial={skipAnim ? {} : { scale: 0.8, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', bounce: 0.3, duration: 0.8 }}
        className="w-full max-w-3xl flex flex-col items-center relative z-10"
      >
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-agent-sol opacity-30 blur-[60px] rounded-full scale-150"></div>
          <CharacterAvatar name="Sol" className="w-32 h-32 md:w-48 md:h-48 drop-shadow-[0_0_20px_rgba(245,196,81,0.5)] relative z-10" />
        </div>

        <div className="glass-panel w-full rounded-3xl p-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 primary-gradient-bg"></div>

          <div className="flex flex-col md:flex-row items-start gap-8">
            <div className={clsx(
              "flex-shrink-0 flex flex-col items-center justify-center p-6 rounded-2xl border bg-black/40 shadow-[0_0_30px_-5px]", 
              getScoreColor()
            )}>
              {getScoreIcon()}
              <div className="text-4xl font-black">{score}%</div>
              <div className="text-xs uppercase tracking-wider opacity-80 mt-1">Confidence</div>
            </div>

            <div className="flex-1">
              <h3 className="text-lg text-white/50 mb-2">Question</h3>
              <p className="text-xl font-medium mb-6">"{res.question}"</p>
              
              <h3 className="text-lg text-white/50 mb-2">Final Answer</h3>
              <div className="text-2xl md:text-3xl font-bold leading-tight primary-gradient-text mb-4">
                {res.finalAnswer}
              </div>

              <div className="inline-block px-4 py-2 rounded-full bg-white/5 text-sm font-medium border border-white/10 mb-6">
                <span className="opacity-60 mr-2">Reason:</span>
                <span className={isHighConf ? 'text-teal-400' : 'text-amber-400'}>{res.trustExplanation}</span>
              </div>
            </div>
          </div>

          <div className="mt-8 border-t border-white/10 pt-6">
            <button 
              onClick={() => setSourcesOpen(!sourcesOpen)}
              className="flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors"
            >
              <ChevronDown className={clsx("w-4 h-4 transition-transform", sourcesOpen ? "rotate-180" : "")} />
              {sourcesOpen ? 'Hide' : 'Show'} sources (Determined by VeriFY's 6-agent verification pipeline)
            </button>

            <AnimatePresence>
              {sourcesOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="flex flex-col gap-3 mt-4 pt-4 border-t border-white/5">
                    {res.findings.map((f: any) => (
                      <a key={f.agentName} href={`https://${f.sourceUrl}`} target="_blank" rel="noreferrer" className="flex items-center justify-between p-3 rounded-xl bg-black/20 hover:bg-black/40 transition-colors border border-white/5">
                        <div className="flex items-center gap-3">
                          <div className={clsx("w-2 h-2 rounded-full", `bg-agent-${f.agentName.toLowerCase()}`)}></div>
                          <span className="font-medium text-sm">{f.sourceUrl}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs px-2 py-1 bg-white/10 rounded text-white/60 uppercase">{f.sourceTier}</span>
                          <ExternalLink className="w-4 h-4 text-white/40" />
                        </div>
                      </a>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: skipAnim ? 0 : 1.5 }}
          onClick={() => dispatch({ type: 'NEXT_STEP' })}
          className="mt-8 px-8 py-4 rounded-xl primary-gradient-bg text-white font-bold text-lg hover:scale-[1.02] active:scale-[0.98] transition-transform shadow-lg shadow-agent-nova/30"
        >
          Generate Certificate
        </motion.button>
      </motion.div>

      {!skipAnim && (
        <button onClick={() => setSkipAnim(true)} className="absolute bottom-8 right-8 text-white/50 hover:text-white text-sm uppercase tracking-widest z-50">
          Skip animation
        </button>
      )}
    </div>
  );
};
