import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAppContext } from '../AppContext';
import { CharacterAvatar } from '../components/CharacterAvatar';
import clsx from 'clsx';
import { Check, AlertTriangle, ExternalLink, Loader2 } from 'lucide-react';
import type { VerifyResult } from '../types';

const agentConfig = {
  Vera: { color: 'bg-neo-blue', role: 'Official Source' },
  Vox: { color: 'bg-neo-pink', role: 'News Source' },
  Trace: { color: 'bg-neo-yellow', role: 'Secondary Source' },
};

export const AgentProcessingScreen: React.FC = () => {
  const { state, dispatch } = useAppContext();
  const [agentStates, setAgentStates] = useState<Record<string, { done: boolean }>>({
    Vera: { done: false },
    Vox: { done: false },
    Trace: { done: false }
  });
  const [allDone, setAllDone] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [fetchedResult, setFetchedResult] = useState<VerifyResult | null>(null);

  useEffect(() => {
    const runVerification = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/verify', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'X-API-Key': 'verify-secret-static-key-2024'
          },
          body: JSON.stringify({ query: state.question })
        });
        if (!res.ok) throw new Error('API Error');
        const data = await res.json();
        if (data.error) throw new Error(data.error);

        setFetchedResult(data.response);
      } catch (err: any) {
        console.error(err);
        setHasError(true);
        setErrorMsg(err.message);
      }
    };
    runVerification();
  }, [state.question]);

  useEffect(() => {
    if (fetchedResult) {
      ['Vera', 'Vox', 'Trace'].forEach((agent, i) => {
        setTimeout(() => setAgentStates(prev => ({ ...prev, [agent]: { done: true } })), 1000 + i * 800);
      });
      setTimeout(() => setAllDone(true), 3500);
    }
  }, [fetchedResult]);

  useEffect(() => {
    if (allDone && fetchedResult) {
      const t = setTimeout(() => {
        dispatch({ type: 'SET_RESULT', payload: fetchedResult });
        dispatch({ type: 'NEXT_STEP' });
      }, 1500);
      return () => clearTimeout(t);
    }
  }, [allDone, fetchedResult, dispatch]);

  if (hasError) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col gap-6 bg-neo-bg">
        <div className="neo-panel bg-neo-pink p-12 text-center max-w-xl">
          <AlertTriangle className="w-24 h-24 text-neo-black mx-auto mb-6" strokeWidth={3} />
          <h2 className="text-4xl font-black font-space text-neo-black uppercase mb-4">Error</h2>
          <p className="text-xl font-bold text-neo-black mb-8 border-4 border-neo-black bg-white p-4 shadow-neo">{errorMsg}</p>
          <button onClick={() => dispatch({ type: 'GO_TO_STEP', payload: 2 })} className="neo-button bg-white px-10 py-4 w-full">Retry</button>
        </div>
      </div>
    );
  }

  const dummyFindings = [
    { agentName: 'Vera', sourceUrl: '...', answer: 'Processing...' },
    { agentName: 'Vox', sourceUrl: '...', answer: 'Processing...' },
    { agentName: 'Trace', sourceUrl: '...', answer: 'Processing...' }
  ];

  const renderFindings = fetchedResult ? fetchedResult.findings : dummyFindings;

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center p-4 bg-neo-bg">
      <div className="w-full max-w-7xl grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
        {renderFindings.map((f, i) => {
          const config = agentConfig[f.agentName as keyof typeof agentConfig];
          const isDone = agentStates[f.agentName].done;

          return (
            <motion.div
              key={f.agentName}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.2 }}
              className={clsx(
                "neo-panel p-8 flex flex-col items-center transition-all duration-500 min-h-[400px]",
                isDone ? config.color : "bg-white"
              )}
            >
              <CharacterAvatar name={f.agentName as "Vera" | "Vox" | "Trace"} className="w-24 h-24 object-contain mb-4" />
              
              <h3 className="text-3xl font-black font-space text-neo-black uppercase mb-2">
                {f.agentName}
              </h3>
              <div className="text-xs font-bold uppercase tracking-widest mb-8 bg-neo-black text-white px-3 py-1">
                {config.role}
              </div>

              {!isDone ? (
                <div className="flex flex-col items-center justify-center w-full mt-auto flex-1">
                  <Loader2 className="w-12 h-12 text-neo-black animate-spin" strokeWidth={4} />
                  <p className="mt-4 font-space font-bold text-neo-black uppercase">Researching...</p>
                </div>
              ) : (
                <motion.div 
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="mt-auto w-full flex flex-col items-start bg-white border-4 border-neo-black p-4 shadow-neo relative"
                >
                  <div className="absolute -top-5 -right-5 w-10 h-10 bg-neo-green border-4 border-neo-black flex items-center justify-center shadow-neo">
                    <Check className="w-6 h-6 text-neo-black" strokeWidth={4} />
                  </div>
                  <a href={f.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-bold font-space uppercase text-neo-black flex items-center gap-2 mb-3 hover:underline">
                    <ExternalLink className="w-4 h-4" /> {f.sourceUrl.substring(0, 30)}...
                  </a>
                  <p className="text-sm font-bold text-neo-black font-display leading-relaxed line-clamp-4">"{f.answer}"</p>
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
