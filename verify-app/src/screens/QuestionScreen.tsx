import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { TypewriterText } from '../components/TypewriterText';
import { useAppContext } from '../AppContext';
import { CharacterAvatar } from '../components/CharacterAvatar';
import { mockAgreementResult, mockConflictResult } from '../mockData';
import { Send } from 'lucide-react';

export const QuestionScreen: React.FC = () => {
  const { dispatch } = useAppContext();
  const [question, setQuestion] = useState('');
  const [skipAnim, setSkipAnim] = useState(false);

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
    <div className="relative min-h-screen flex flex-col items-center justify-center p-4">
      <motion.div 
        initial={skipAnim ? {} : { opacity: 0, y: 100, rotate: 2 }}
        animate={{ opacity: 1, y: 0, rotate: 0 }}
        transition={{ type: "spring", bounce: 0.5 }}
        className="w-full max-w-2xl cartoon-panel p-8 relative z-10 bg-[#4D96FF]"
      >
        <div className="absolute -top-20 left-1/2 -translate-x-1/2">
          <CharacterAvatar name="Quinn" className="w-40 h-40 drop-shadow-[0_10px_0_rgba(0,0,0,1)] hover:scale-110 hover:-rotate-6 transition-transform duration-300" />
        </div>

        <div className="bg-white border-4 border-black rounded-xl p-4 mt-16 mb-6 shadow-[4px_4px_0px_0px_#000] rotate-1">
          <h2 className="text-3xl md:text-4xl font-black text-center h-[48px] uppercase">
            {skipAnim ? "What's Your Question?" : (
              <TypewriterText text="What's Your Question?" cursorColor="bg-black" />
            )}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="e.g. Am I eligible for the AICTE Pragati Scholarship?"
            className="w-full h-40 bg-white border-4 border-black shadow-[6px_6px_0px_0px_#000] rounded-2xl p-6 text-black font-bold text-xl placeholder-black/30 focus:outline-none focus:translate-y-1 focus:translate-x-1 focus:shadow-[2px_2px_0px_0px_#000] resize-none transition-all"
          />

          <div className="flex flex-wrap gap-4 justify-center mt-4">
            <button 
              type="button" 
              onClick={() => handleDemoPath('agreement')}
              className="px-4 py-2 cartoon-button bg-[#6BCB77] text-white"
              style={{ WebkitTextStroke: '1px black' }}
            >
              Demo: Agreement
            </button>
            <button 
              type="button" 
              onClick={() => handleDemoPath('conflict')}
              className="px-4 py-2 cartoon-button bg-[#FF6B6B] text-white"
              style={{ WebkitTextStroke: '1px black' }}
            >
              Demo: Conflict
            </button>
          </div>

          <button
            type="submit"
            disabled={!question.trim()}
            className="mt-6 w-full py-5 text-2xl bg-[#FFD93D] text-white cartoon-button flex items-center justify-center gap-3 disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed"
            style={{ WebkitTextStroke: '1px black' }}
          >
            Verify It! <Send className="w-8 h-8 text-black" strokeWidth={3} />
          </button>
        </form>
      </motion.div>

      {!skipAnim && (
        <button onClick={() => setSkipAnim(true)} className="absolute bottom-8 right-8 text-black font-bold text-sm uppercase tracking-widest z-50 bg-white border-2 border-black px-4 py-2 shadow-[2px_2px_0px_0px_#000] hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[4px_4px_0px_0px_#000] active:translate-y-0 active:translate-x-0 active:shadow-none transition-all">
          Skip animation
        </button>
      )}
    </div>
  );
};
