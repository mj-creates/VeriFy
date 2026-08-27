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
    if (isHighConf) return 'bg-[#6BCB77]';
    if (isMidConf) return 'bg-[#FFD93D]';
    return 'bg-[#FF6B6B]';
  };

  const getScoreIcon = () => {
    if (isHighConf) return <ShieldCheck className="w-16 h-16 mb-2 text-white drop-shadow-[2px_2px_0_rgba(0,0,0,1)]" strokeWidth={3} />;
    if (isMidConf) return <ShieldAlert className="w-16 h-16 mb-2 text-white drop-shadow-[2px_2px_0_rgba(0,0,0,1)]" strokeWidth={3} />;
    return <ShieldQuestion className="w-16 h-16 mb-2 text-white drop-shadow-[2px_2px_0_rgba(0,0,0,1)]" strokeWidth={3} />;
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center p-4">
      <motion.div
        initial={skipAnim ? {} : { scale: 0.5, opacity: 0, y: 100, rotate: -3 }}
        animate={{ scale: 1, opacity: 1, y: 0, rotate: 0 }}
        transition={{ type: 'spring', bounce: 0.5 }}
        className="w-full max-w-3xl flex flex-col items-center relative z-10"
      >
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-[#FFD93D] border-4 border-black rounded-full scale-[1.2] shadow-[8px_8px_0px_0px_#000]"></div>
          <CharacterAvatar name="Sol" className="w-32 h-32 md:w-48 md:h-48 drop-shadow-[0_10px_0_rgba(0,0,0,1)] relative z-10 hover:scale-110 transition-transform" />
        </div>

        <div className="cartoon-panel w-full p-8 relative overflow-hidden bg-[#F4F4F4]">
          <div className="absolute top-0 left-0 right-0 h-4 bg-[#FF9F43] border-b-4 border-black"></div>

          <div className="flex flex-col md:flex-row items-start gap-8 mt-4">
            <div className={clsx(
              "flex-shrink-0 flex flex-col items-center justify-center p-6 rounded-2xl border-4 border-black shadow-[6px_6px_0px_0px_#000] rotate-[-3deg]", 
              getScoreColor()
            )}>
              {getScoreIcon()}
              <div className="text-6xl font-black text-white" style={{ WebkitTextStroke: '2px black' }}>{score}%</div>
              <div className="text-sm font-black uppercase tracking-wider mt-2 bg-white text-black px-2 py-1 rounded-md border-2 border-black">Confidence</div>
            </div>

            <div className="flex-1 bg-white p-6 rounded-2xl border-4 border-black shadow-[6px_6px_0px_0px_#000]">
              <h3 className="text-sm font-black uppercase mb-2 bg-black text-white inline-block px-3 py-1 rounded-md rotate-[2deg]">Question</h3>
              <p className="text-xl font-bold mb-6 text-black">"{res.question}"</p>
              
              <h3 className="text-sm font-black uppercase mb-2 bg-[#4D96FF] text-white border-2 border-black inline-block px-3 py-1 rounded-md rotate-[-2deg]">Final Answer</h3>
              <div className="text-2xl md:text-3xl font-black leading-tight text-black mb-4 uppercase">
                {res.finalAnswer}
              </div>

              <div className="inline-block px-4 py-2 rounded-xl bg-[#FFD93D] border-4 border-black font-bold shadow-[2px_2px_0px_0px_#000] mb-2 rotate-[1deg]">
                <span className="uppercase text-sm mr-2 font-black">Reason:</span>
                <span>{res.trustExplanation}</span>
              </div>
            </div>
          </div>

          <div className="mt-8 border-t-4 border-black pt-6">
            <button 
              onClick={() => setSourcesOpen(!sourcesOpen)}
              className="flex items-center gap-2 text-sm font-black uppercase text-black hover:bg-black hover:text-white transition-colors border-2 border-black px-4 py-2 rounded-md shadow-[2px_2px_0px_0px_#000] active:translate-y-1 active:translate-x-1 active:shadow-none"
            >
              <ChevronDown className={clsx("w-5 h-5 transition-transform border-2 rounded-full", sourcesOpen ? "rotate-180" : "")} />
              {sourcesOpen ? 'Hide' : 'Show'} sources
            </button>

            <AnimatePresence>
              {sourcesOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="flex flex-col gap-3 mt-4">
                    {res.findings.map((f: any) => (
                      <a key={f.agentName} href={`https://${f.sourceUrl}`} target="_blank" rel="noreferrer" className="flex items-center justify-between p-4 rounded-xl bg-white hover:bg-gray-100 transition-colors border-4 border-black shadow-[4px_4px_0px_0px_#000]">
                        <div className="flex items-center gap-3">
                          <div className={clsx("w-4 h-4 rounded-full border-2 border-black", `bg-agent-${f.agentName.toLowerCase()}`)}></div>
                          <span className="font-bold text-base md:text-lg">{f.sourceUrl}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs px-2 py-1 bg-black text-white font-black rounded-md uppercase">{f.sourceTier}</span>
                          <ExternalLink className="w-5 h-5 text-black" strokeWidth={3} />
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
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: skipAnim ? 0 : 0.5, type: "spring" }}
          onClick={() => dispatch({ type: 'NEXT_STEP' })}
          className="mt-8 px-10 py-5 text-2xl bg-[#9D4EDD] text-white cartoon-button"
          style={{ WebkitTextStroke: '1px black' }}
        >
          Generate Certificate!
        </motion.button>
      </motion.div>

      {!skipAnim && (
        <button onClick={() => setSkipAnim(true)} className="absolute bottom-8 right-8 text-black font-bold text-sm uppercase tracking-widest z-50 bg-white border-2 border-black px-4 py-2 shadow-[2px_2px_0px_0px_#000] hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[4px_4px_0px_0px_#000] active:translate-y-0 active:translate-x-0 active:shadow-none transition-all">
          Skip animation
        </button>
      )}
    </div>
  );
};
