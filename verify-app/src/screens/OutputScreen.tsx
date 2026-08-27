import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppContext } from '../AppContext';
import { CharacterAvatar } from '../components/CharacterAvatar';
import clsx from 'clsx';
import { ChevronDown, ExternalLink, ShieldCheck, ShieldAlert, ShieldQuestion } from 'lucide-react';

export const OutputScreen: React.FC = () => {
  const { state, dispatch } = useAppContext();
  const [sourcesOpen, setSourcesOpen] = useState(false);

  const res = state.verifyResult!;
  const score = res.judgment.confidenceScore;
  const isHighConf = score >= 85;
  const isMidConf = score >= 50 && score < 85;

  const getScoreColor = () => {
    if (isHighConf) return 'bg-neo-green';
    if (isMidConf) return 'bg-neo-yellow';
    return 'bg-neo-pink';
  };

  const getScoreIcon = () => {
    if (isHighConf) return <ShieldCheck className="w-12 h-12 text-neo-black mb-2" strokeWidth={4} />;
    if (isMidConf) return <ShieldAlert className="w-12 h-12 text-neo-black mb-2" strokeWidth={4} />;
    return <ShieldQuestion className="w-12 h-12 text-neo-black mb-2" strokeWidth={4} />;
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center p-4 bg-neo-bg">
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="w-full max-w-4xl flex flex-col items-center relative z-10"
      >
        <div className="relative mb-12">
          <div className="absolute inset-0 bg-neo-orange border-4 border-neo-black rounded-full scale-[1.25] shadow-neo"></div>
          <CharacterAvatar name="Sol" className="w-32 h-32 md:w-48 md:h-48 relative z-10 hover:scale-105 transition-transform" />
        </div>

        <div className="neo-panel w-full p-8 md:p-10 bg-white">
          <div className="absolute top-0 left-0 right-0 h-4 bg-neo-orange border-b-4 border-neo-black"></div>

          <div className="flex flex-col md:flex-row items-center md:items-start gap-10 mt-6">
            <div className={clsx(
              "flex-shrink-0 flex flex-col items-center justify-center p-8 border-4 border-neo-black shadow-neo", 
              getScoreColor()
            )}>
              {getScoreIcon()}
              <div className="text-7xl font-black font-space text-neo-black drop-shadow-[4px_4px_0_rgba(255,255,255,1)]">{score}%</div>
              <div className="text-sm font-black font-space uppercase mt-4 bg-white border-2 border-neo-black text-neo-black px-4 py-1 shadow-neo">Confidence</div>
            </div>

            <div className="flex-1 w-full bg-neo-bg p-8 border-4 border-neo-black shadow-neo">
              <h3 className="text-sm font-black font-space uppercase mb-3 bg-neo-black text-white inline-block px-3 py-1">Question</h3>
              <p className="text-xl font-bold font-display mb-8 text-neo-black">"{res.question}"</p>
              
              <h3 className="text-sm font-black font-space uppercase mb-3 bg-neo-blue text-white inline-block px-3 py-1 border-2 border-neo-black shadow-neo">Final Answer</h3>
              <div className="text-3xl md:text-4xl font-black font-space leading-tight text-neo-black mb-6 uppercase tracking-wide">
                {res.finalAnswer}
              </div>

              <div className="inline-block p-4 bg-white border-4 border-neo-black font-bold shadow-neo">
                <span className="uppercase text-sm mr-2 font-black font-space text-neo-pink">Reason:</span>
                <span className="text-neo-black font-display">{res.trustExplanation}</span>
              </div>
            </div>
          </div>

          <div className="mt-10 border-t-4 border-neo-black pt-8 flex flex-col items-center">
            <button 
              onClick={() => setSourcesOpen(!sourcesOpen)}
              className="flex items-center gap-3 text-sm font-black font-space uppercase text-neo-black bg-neo-yellow border-4 border-neo-black px-6 py-3 shadow-neo active:translate-y-1 active:translate-x-1 active:shadow-neo-active transition-all"
            >
              <ChevronDown className={clsx("w-5 h-5 transition-transform", sourcesOpen ? "rotate-180" : "")} strokeWidth={4} />
              {sourcesOpen ? 'Hide' : 'View'} Sources
            </button>

            <AnimatePresence>
              {sourcesOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden w-full"
                >
                  <div className="flex flex-col gap-4 mt-6">
                    {res.findings.map((f: any) => (
                      <a key={f.agentName} href={`https://${f.sourceUrl}`} target="_blank" rel="noreferrer" className="flex items-center justify-between p-4 bg-white border-4 border-neo-black shadow-neo hover:-translate-y-1 hover:shadow-neo-lg transition-all">
                        <div className="flex items-center gap-4">
                          <div className={clsx("w-4 h-4 border-2 border-neo-black", `bg-neo-blue`)}></div>
                          <span className="font-bold font-display text-base md:text-lg text-neo-black">{f.sourceUrl}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs px-3 py-1 bg-neo-black text-white font-black font-space uppercase tracking-widest">{f.sourceTier}</span>
                          <ExternalLink className="w-5 h-5 text-neo-black" strokeWidth={3} />
                        </div>
                      </a>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <button
          onClick={() => dispatch({ type: 'NEXT_STEP' })}
          className="mt-12 w-full max-w-sm py-6 text-xl bg-neo-purple text-white neo-button"
        >
          View Receipt
        </button>
      </motion.div>
    </div>
  );
};
