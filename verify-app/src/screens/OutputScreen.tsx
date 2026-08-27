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
    if (isHighConf) return 'bg-[#B5EAD7]';
    if (isMidConf) return 'bg-[#FFDAC1]';
    return 'bg-[#FF9AA2]';
  };

  const getScoreIcon = () => {
    if (isHighConf) return <ShieldCheck className="w-16 h-16 mb-2 text-white drop-shadow-md" strokeWidth={3} />;
    if (isMidConf) return <ShieldAlert className="w-16 h-16 mb-2 text-white drop-shadow-md" strokeWidth={3} />;
    return <ShieldQuestion className="w-16 h-16 mb-2 text-white drop-shadow-md" strokeWidth={3} />;
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center p-4">
      <motion.div
        initial={skipAnim ? {} : { scale: 0.9, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', bounce: 0.5 }}
        className="w-full max-w-3xl flex flex-col items-center relative z-10"
      >
        <div className="relative mb-12">
          <div className="absolute inset-0 bg-[#FFDAC1] border-[6px] border-white rounded-full scale-[1.25] shadow-bubbly opacity-80"></div>
          <CharacterAvatar name="Sol" className="w-40 h-40 md:w-56 md:h-56 drop-shadow-xl relative z-10 hover:scale-105 transition-transform" />
        </div>

        <div className="candy-panel w-full p-8 md:p-10 relative overflow-hidden bg-white/90">
          <div className="absolute top-0 left-0 right-0 h-6 bg-[#FFDAC1] border-b-[4px] border-white"></div>

          <div className="flex flex-col md:flex-row items-center md:items-start gap-10 mt-6">
            <div className={clsx(
              "flex-shrink-0 flex flex-col items-center justify-center p-8 rounded-[2.5rem] border-[4px] border-white shadow-sm", 
              getScoreColor()
            )}>
              {getScoreIcon()}
              <div className="text-7xl font-black text-white title-stroke drop-shadow-md">{score}%</div>
              <div className="text-sm font-black uppercase tracking-wider mt-4 bg-white/90 text-candy-text px-4 py-1.5 rounded-full shadow-sm">Confidence</div>
            </div>

            <div className="flex-1 w-full bg-[#F4F4F4]/50 p-8 rounded-[2.5rem] border-[4px] border-white shadow-inner">
              <h3 className="text-sm font-black uppercase mb-3 bg-white text-candy-text border-[3px] border-white shadow-sm inline-block px-4 py-1.5 rounded-full">Question</h3>
              <p className="text-xl font-bold mb-8 text-candy-text">"{res.question}"</p>
              
              <h3 className="text-sm font-black uppercase mb-3 bg-[#7BDFF2] text-white border-[3px] border-white shadow-sm inline-block px-4 py-1.5 rounded-full title-stroke">Final Answer</h3>
              <div className="text-2xl md:text-3xl font-black leading-tight text-candy-text mb-6 uppercase tracking-wide drop-shadow-sm">
                {res.finalAnswer}
              </div>

              <div className="inline-block px-5 py-3 rounded-2xl bg-[#FFDAC1]/40 border-[3px] border-white font-bold shadow-sm">
                <span className="uppercase text-sm mr-2 font-black text-[#FF9AA2]">Reason:</span>
                <span className="text-candy-text">{res.trustExplanation}</span>
              </div>
            </div>
          </div>

          <div className="mt-10 border-t-[4px] border-white/50 pt-8 flex flex-col items-center">
            <button 
              onClick={() => setSourcesOpen(!sourcesOpen)}
              className="flex items-center gap-3 text-sm font-black uppercase text-candy-text hover:bg-white transition-colors border-[3px] border-white bg-white/50 px-6 py-3 rounded-full shadow-sm active:scale-95"
            >
              <ChevronDown className={clsx("w-5 h-5 transition-transform bg-white rounded-full p-0.5", sourcesOpen ? "rotate-180" : "")} />
              {sourcesOpen ? 'Hide' : 'View'} Verification Sources
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
                      <a key={f.agentName} href={`https://${f.sourceUrl}`} target="_blank" rel="noreferrer" className="flex items-center justify-between p-5 rounded-[2rem] bg-white hover:bg-[#F4F4F4] transition-colors border-[3px] border-white shadow-sm">
                        <div className="flex items-center gap-4">
                          <div className={clsx("w-5 h-5 rounded-full border-2 border-white shadow-sm", `bg-agent-${f.agentName.toLowerCase()}`)}></div>
                          <span className="font-bold text-base md:text-lg text-candy-text">{f.sourceUrl}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs px-3 py-1.5 bg-candy-text text-white font-black rounded-full uppercase tracking-wider">{f.sourceTier}</span>
                          <ExternalLink className="w-5 h-5 text-candy-text/50" strokeWidth={3} />
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
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: skipAnim ? 0 : 0.4, type: "spring" }}
          onClick={() => dispatch({ type: 'NEXT_STEP' })}
          className="mt-12 px-12 py-6 text-2xl bg-[#C7CEEA] text-white candy-button-color title-stroke"
        >
          View Certificate ✨
        </motion.button>
      </motion.div>

      {!skipAnim && (
        <button onClick={() => setSkipAnim(true)} className="absolute bottom-8 right-8 text-candy-text font-bold text-sm uppercase tracking-widest z-50 bg-white/80 border-4 border-white px-5 py-3 rounded-full shadow-bubbly hover:bg-white transition-all">
          Skip animation
        </button>
      )}
    </div>
  );
};
