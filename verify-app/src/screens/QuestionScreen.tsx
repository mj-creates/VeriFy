import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAppContext } from '../AppContext';
import { CharacterAvatar } from '../components/CharacterAvatar';
import { Search } from 'lucide-react';
import { mockAgreementResult, mockConflictResult } from '../mockData';

export const QuestionScreen: React.FC = () => {
  const { dispatch } = useAppContext();
  const [question, setQuestion] = useState('');

  const handleDemoPath = (type: 'agreement' | 'conflict') => {
    const isConflict = type === 'conflict';
    const q = isConflict ? mockConflictResult.question : mockAgreementResult.question;
    setQuestion(q);
    dispatch({ type: 'SET_QUESTION', payload: q });
    dispatch({ type: 'SET_MOCK_CONFLICT', payload: isConflict });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;
    dispatch({ type: 'SET_QUESTION', payload: question });
    dispatch({ type: 'NEXT_STEP' });
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center p-4 bg-neo-bg">
      <motion.div 
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-3xl neo-panel p-8 md:p-12 bg-neo-yellow/20"
      >
        <div className="flex flex-col md:flex-row items-center gap-8 mb-10">
          <CharacterAvatar name="Quinn" className="w-32 h-32 md:w-40 md:h-40 shrink-0 rotate-[-5deg]" />
          <div>
            <div className="inline-block bg-neo-black text-white px-4 py-1 font-space font-bold uppercase text-sm mb-4">
              Agent Quinn [Router]
            </div>
            <h2 className="text-3xl md:text-5xl font-black font-space text-neo-black uppercase leading-tight drop-shadow-[4px_4px_0_rgba(255,255,255,1)]">
              Submit your claim.
            </h2>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="relative">
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="e.g. Has the Federal Reserve raised interest rates recently?"
              className="w-full h-40 bg-white border-4 border-neo-black shadow-neo p-6 text-neo-black font-display font-bold text-xl placeholder-neo-black/30 focus:outline-none focus:shadow-neo-lg transition-all resize-none"
            />
          </div>

          <div className="flex flex-wrap gap-4 mt-2">
            <button 
              type="button" 
              onClick={() => handleDemoPath('agreement')}
              className="neo-button bg-neo-green text-white px-6 py-2 text-sm uppercase"
            >
              Load Demo 1
            </button>
            <button 
              type="button" 
              onClick={() => handleDemoPath('conflict')}
              className="neo-button bg-neo-orange text-white px-6 py-2 text-sm uppercase"
            >
              Load Demo 2
            </button>
          </div>

          <button
            type="submit"
            disabled={!question.trim()}
            className="mt-4 w-full py-6 text-2xl bg-neo-blue text-white neo-button flex items-center justify-center gap-4 disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed uppercase"
          >
            <span>Analyze</span>
            <Search className="w-8 h-8" strokeWidth={4} />
          </button>
        </form>
      </motion.div>
    </div>
  );
};
