import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TypewriterText } from '../components/TypewriterText';
import { useAppContext } from '../AppContext';
import { mockAgreementResult, mockConflictResult } from '../mockData';
import { CharacterAvatar } from '../components/CharacterAvatar';
import clsx from 'clsx';
import { CheckCircle2, AlertTriangle, ExternalLink } from 'lucide-react';

const agentConfig = {
  Vera: { color: 'bg-agent-vera text-agent-vera', border: 'border-agent-vera', role: 'Official Source', messages: ["Querying official portals...", "Extracting policy docs...", "Verified official status."] },
  Vox: { color: 'bg-agent-vox text-agent-vox', border: 'border-agent-vox', role: 'News Source', messages: ["Scanning news sites...", "Cross-checking articles...", "News consensus found."] },
  Trace: { color: 'bg-agent-trace text-agent-trace', border: 'border-agent-trace', role: 'Secondary Source', messages: ["Scanning forums...", "Checking social media...", "Anecdotal evidence compiled."] },
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

    // Simulate progressive loading per agent
    ['Vera', 'Vox', 'Trace'].forEach((agent, i) => {
      setTimeout(() => setAgentStates(prev => ({ ...prev, [agent]: { stage: 1, done: false } })), 1500 + i * 400);
      setTimeout(() => setAgentStates(prev => ({ ...prev, [agent]: { stage: 2, done: true } })), 4000 + i * 500);
    });

    const timeout = setTimeout(() => {
      setAllDone(true);
    }, 6000);

    // Fail safe error after 8s if not all done (though mocked it will be)
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
      <div className="min-h-screen flex items-center justify-center flex-col gap-4 text-red-400">
        <AlertTriangle className="w-16 h-16" />
        <h2 className="text-2xl font-bold">Agent processing failed</h2>
        <button onClick={() => dispatch({ type: 'GO_TO_STEP', payload: 3 })} className="px-6 py-2 bg-red-900/50 rounded-full mt-4 text-white">Retry</button>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center p-4 overflow-hidden">
      <div className="w-full max-w-6xl flex flex-col md:flex-row gap-6 justify-center items-stretch relative z-10">
        {/* Animated Connector lines (desktop) */}
        {!skipAnim && (
          <div className="hidden md:block absolute top-1/2 left-0 right-0 h-0 border-t-2 border-dashed border-white/20 -z-10 animate-[pulse_2s_ease-in-out_infinite]" />
        )}

        {findings.map((f, i) => {
          const config = agentConfig[f.agentName];
          const st = agentStates[f.agentName];
          const isDone = st.done;

          return (
            <motion.div
              key={f.agentName}
              initial={skipAnim ? {} : { opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: skipAnim ? 0 : i * 0.2, type: 'spring' }}
              className={clsx(
                "flex-1 glass-panel rounded-3xl p-6 flex flex-col items-center relative transition-all duration-500",
                isDone ? `bg-${f.agentName.toLowerCase()}/10 border-${f.agentName.toLowerCase()}/50 shadow-[0_0_30px_-5px] shadow-${f.agentName.toLowerCase()}/30` : ""
              )}
              style={isDone ? { borderColor: `var(--color-agent-${f.agentName.toLowerCase()})` } : {}}
            >
              <CharacterAvatar name={f.agentName} className="w-24 h-24 mb-4 object-contain" />
              
              <h3 className={clsx("text-xl font-bold mb-1", config.color.split(' ')[1])}>
                {f.agentName}
              </h3>
              <div className="text-xs text-white/50 uppercase tracking-widest mb-6">
                {config.role}
              </div>

              {!isDone ? (
                <div className="flex flex-col items-center w-full mt-auto">
                  <div className="h-[40px] text-center text-sm text-white/80">
                    <TypewriterText key={st.stage} text={config.messages[st.stage]} cursorColor={`bg-${f.agentName.toLowerCase()}`} />
                  </div>
                  <div className={clsx("mt-4 w-8 h-8 rounded-full border-t-2 border-r-2 animate-spin", config.border)} />
                </div>
              ) : (
                <motion.div 
                  initial={{ rotateX: 90, opacity: 0 }}
                  animate={{ rotateX: 0, opacity: 1 }}
                  className="mt-auto w-full flex flex-col items-center text-center bg-black/40 rounded-xl p-4 border border-white/10 relative"
                >
                  <CheckCircle2 className={clsx("absolute -top-3 -right-3 w-6 h-6 bg-black rounded-full", config.color.split(' ')[1])} />
                  <span className="text-xs uppercase bg-white/10 px-2 py-1 rounded mb-2 inline-flex items-center gap-1">
                    <ExternalLink className="w-3 h-3" /> {f.sourceUrl}
                  </span>
                  <p className="text-sm line-clamp-3 text-white/90">"{f.answer}"</p>
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>

      {!skipAnim && (
        <button onClick={() => setSkipAnim(true)} className="absolute bottom-8 right-8 text-white/50 hover:text-white text-sm uppercase tracking-widest z-50">
          Skip animation
        </button>
      )}
    </div>
  );
};
