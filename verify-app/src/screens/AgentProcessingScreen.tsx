import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TypewriterText } from '../components/TypewriterText';
import { useAppContext } from '../AppContext';
import { CharacterAvatar } from '../components/CharacterAvatar';
import { mockAgreementResult, mockConflictResult } from '../mockData';
import clsx from 'clsx';
import { CheckCircle2, AlertTriangle, ExternalLink } from 'lucide-react';

const agentConfig = {
  Vera: { color: 'bg-agent-vera', role: 'Official Source', messages: ["Querying official portals...", "Extracting policy docs...", "Verified official status."] },
  Vox: { color: 'bg-agent-vox', role: 'News Source', messages: ["Scanning news sites...", "Cross-checking articles...", "News consensus found."] },
  Trace: { color: 'bg-agent-trace', role: 'Secondary Source', messages: ["Scanning forums...", "Checking social media...", "Anecdotal evidence compiled."] },
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
      <div className="min-h-screen flex items-center justify-center flex-col gap-4 text-black">
        <AlertTriangle className="w-24 h-24 text-[#FF6B6B]" strokeWidth={3} />
        <h2 className="text-4xl font-black uppercase">Oops! Agent failed.</h2>
        <button onClick={() => dispatch({ type: 'GO_TO_STEP', payload: 3 })} className="px-8 py-4 bg-white cartoon-button mt-4 text-black">Retry</button>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center p-4 overflow-hidden">
      <div className="w-full max-w-6xl flex flex-col md:flex-row gap-8 justify-center items-stretch relative z-10">
        {!skipAnim && (
          <div className="hidden md:block absolute top-1/2 left-0 right-0 h-0 border-t-8 border-dashed border-black -z-10" />
        )}

        {findings.map((f, i) => {
          const config = agentConfig[f.agentName];
          const st = agentStates[f.agentName];
          const isDone = st.done;

          return (
            <motion.div
              key={f.agentName}
              initial={skipAnim ? {} : { opacity: 0, scale: 0.5, rotate: i % 2 === 0 ? -5 : 5 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ delay: skipAnim ? 0 : i * 0.2, type: 'spring', bounce: 0.5 }}
              className={clsx(
                "flex-1 cartoon-panel p-6 flex flex-col items-center relative transition-all duration-500",
                isDone ? config.color : "bg-white"
              )}
            >
              <div className="bg-white border-4 border-black rounded-full w-32 h-32 flex items-center justify-center mb-6 shadow-[4px_4px_0px_0px_#000] overflow-hidden p-2 bg-gradient-to-br from-white to-gray-200">
                <CharacterAvatar name={f.agentName} className="w-full h-full object-contain hover:scale-110 transition-transform" />
              </div>
              
              <h3 className="text-3xl font-black uppercase mb-1" style={{ WebkitTextStroke: isDone ? '1px black' : '0px', color: isDone ? 'white' : 'black' }}>
                {f.agentName}
              </h3>
              <div className="text-sm font-bold uppercase tracking-widest mb-6 bg-black text-white px-3 py-1 rounded-md">
                {config.role}
              </div>

              {!isDone ? (
                <div className="flex flex-col items-center w-full mt-auto bg-[#F4F4F4] border-4 border-black p-4 rounded-xl shadow-[4px_4px_0px_0px_#000]">
                  <div className="h-[40px] text-center text-sm font-bold text-black uppercase">
                    <TypewriterText key={st.stage} text={config.messages[st.stage]} cursorColor="bg-black" />
                  </div>
                  <div className="mt-4 w-10 h-10 border-4 border-black rounded-full border-t-[#FF6B6B] border-r-[#4D96FF] border-b-[#FFD93D] border-l-[#6BCB77] animate-spin" />
                </div>
              ) : (
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", bounce: 0.6 }}
                  className="mt-auto w-full flex flex-col items-center text-center bg-white rounded-xl p-4 border-4 border-black shadow-[4px_4px_0px_0px_#000] relative"
                >
                  <CheckCircle2 className="absolute -top-4 -right-4 w-10 h-10 bg-white rounded-full text-[#6BCB77] border-2 border-black" />
                  <span className="text-xs font-black uppercase bg-black text-white px-2 py-1 rounded mb-3 inline-flex items-center gap-1">
                    <ExternalLink className="w-4 h-4" /> {f.sourceUrl}
                  </span>
                  <p className="text-sm font-bold line-clamp-3">"{f.answer}"</p>
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>

      {!skipAnim && (
        <button onClick={() => setSkipAnim(true)} className="absolute bottom-8 right-8 text-black font-bold text-sm uppercase tracking-widest z-50 bg-white border-2 border-black px-4 py-2 shadow-[2px_2px_0px_0px_#000] hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[4px_4px_0px_0px_#000] active:translate-y-0 active:translate-x-0 active:shadow-none transition-all">
          Skip animation
        </button>
      )}
    </div>
  );
};
