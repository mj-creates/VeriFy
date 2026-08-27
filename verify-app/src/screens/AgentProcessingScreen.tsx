import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TypewriterText } from '../components/TypewriterText';
import { useAppContext } from '../AppContext';
import { CharacterAvatar } from '../components/CharacterAvatar';
import { mockAgreementResult, mockConflictResult } from '../mockData';
import clsx from 'clsx';
import { Check, AlertTriangle, ExternalLink } from 'lucide-react';

const agentConfig = {
  Vera: { color: 'bg-[#7BDFF2]', role: 'Official Source', messages: ["Querying official portals...", "Extracting policy docs...", "Verified official status."] },
  Vox: { color: 'bg-[#FF9AA2]', role: 'News Source', messages: ["Scanning news sites...", "Cross-checking articles...", "News consensus found."] },
  Trace: { color: 'bg-[#B5EAD7]', role: 'Secondary Source', messages: ["Scanning forums...", "Checking social media...", "Anecdotal evidence compiled."] },
};

export const AgentProcessingScreen: React.FC = () => {
  const { state, dispatch } = useAppContext();
  const [skipAnim, setSkipAnim] = useState(false);
  const [agentStates, setAgentStates] = useState<Record<string, { stage: number, done: boolean }>>({
    Vera: { stage: 0, done: false },
    Vox: { stage: 0, done: false },
    Trace: { stage: 0, done: false }
  });
  const [allDone, setAllDone] = useState(false);
  const [hasError, setHasError] = useState(false);

  const findings = state.isMockConflict ? mockConflictResult.findings : mockAgreementResult.findings;

  useEffect(() => {
    if (skipAnim) {
      setAgentStates({
        Vera: { stage: 2, done: true },
        Vox: { stage: 2, done: true },
        Trace: { stage: 2, done: true }
      });
      setAllDone(true);
      return;
    }

    ['Vera', 'Vox', 'Trace'].forEach((agent, i) => {
      setTimeout(() => setAgentStates(prev => ({ ...prev, [agent]: { stage: 1, done: false } })), 1500 + i * 400);
      setTimeout(() => setAgentStates(prev => ({ ...prev, [agent]: { stage: 2, done: true } })), 4000 + i * 500);
    });

    const timeout = setTimeout(() => {
      setAllDone(true);
    }, 6000);

    const errTimeout = setTimeout(() => {
      if (!allDone) setHasError(true);
    }, 8000);

    return () => { clearTimeout(timeout); clearTimeout(errTimeout); };
  }, [skipAnim, allDone]);

  useEffect(() => {
    if (allDone) {
      const t = setTimeout(() => {
        dispatch({ 
          type: 'SET_RESULT', 
          payload: state.isMockConflict ? mockConflictResult : mockAgreementResult 
        });
        dispatch({ type: 'NEXT_STEP' });
      }, 2000);
      return () => clearTimeout(t);
    }
  }, [allDone, dispatch, state.isMockConflict]);

  if (hasError) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col gap-4 text-candy-text">
        <AlertTriangle className="w-24 h-24 text-[#FF9AA2]" strokeWidth={3} />
        <h2 className="text-4xl font-black uppercase title-stroke drop-shadow-md text-[#FF9AA2]">Oops! Agent failed.</h2>
        <button onClick={() => dispatch({ type: 'GO_TO_STEP', payload: 3 })} className="px-10 py-4 bg-white candy-button mt-6 text-candy-text">Retry</button>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center p-4 overflow-hidden">
      <div className="w-full max-w-7xl flex flex-col md:flex-row gap-8 justify-center items-stretch relative z-10">
        {findings.map((f, i) => {
          const config = agentConfig[f.agentName];
          const st = agentStates[f.agentName];
          const isDone = st.done;

          return (
            <motion.div
              key={f.agentName}
              initial={skipAnim ? {} : { opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: skipAnim ? 0 : i * 0.2, type: 'spring', bounce: 0.5 }}
              className={clsx(
                "flex-1 candy-panel p-8 flex flex-col items-center relative transition-all duration-700",
                isDone ? config.color : "bg-white/80"
              )}
            >
              <div className="bg-white/90 border-[6px] border-white rounded-[2.5rem] w-36 h-36 flex items-center justify-center mb-6 shadow-sm overflow-hidden p-2">
                <CharacterAvatar name={f.agentName} className="w-full h-full object-contain hover:scale-110 transition-transform" />
              </div>
              
              <h3 className="text-4xl font-black uppercase mb-2 title-stroke drop-shadow-sm" style={{ color: isDone ? 'white' : 'var(--tw-colors-candy-text)' }}>
                {f.agentName}
              </h3>
              <div className="text-sm font-bold uppercase tracking-widest mb-8 bg-white/90 text-candy-text px-4 py-2 rounded-full border-2 border-white shadow-sm">
                {config.role}
              </div>

              {!isDone ? (
                <div className="flex flex-col items-center w-full mt-auto bg-white/60 border-4 border-white p-6 rounded-[2rem] shadow-sm">
                  <div className="h-[40px] text-center text-sm font-bold text-candy-text uppercase tracking-wide">
                    <TypewriterText key={st.stage} text={config.messages[st.stage]} cursorColor="bg-candy-text" />
                  </div>
                  <div className="mt-4 w-12 h-12 border-[6px] border-white/50 rounded-full border-t-white animate-spin shadow-sm" />
                </div>
              ) : (
                <motion.div 
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", bounce: 0.6 }}
                  className="mt-auto w-full flex flex-col items-center text-center bg-white/95 rounded-[2rem] p-6 border-4 border-white shadow-bubbly relative"
                >
                  <div className="absolute -top-6 -right-6 w-14 h-14 bg-[#B5EAD7] rounded-full border-4 border-white flex items-center justify-center shadow-sm">
                    <Check className="w-8 h-8 text-white" strokeWidth={4} />
                  </div>
                  <span className="text-xs font-black uppercase bg-[#F4F4F4] text-candy-text px-3 py-1.5 rounded-full mb-4 inline-flex items-center gap-2 border-2 border-white">
                    <ExternalLink className="w-4 h-4" /> {f.sourceUrl}
                  </span>
                  <p className="text-base font-bold text-candy-text leading-relaxed">"{f.answer}"</p>
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>

      {!skipAnim && (
        <button onClick={() => setSkipAnim(true)} className="absolute bottom-8 right-8 text-candy-text font-bold text-sm uppercase tracking-widest z-50 bg-white/80 border-4 border-white px-5 py-3 rounded-full shadow-bubbly hover:bg-white transition-all">
          Skip animation
        </button>
      )}
    </div>
  );
};
