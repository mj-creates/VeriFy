import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { TypewriterText } from '../components/TypewriterText';
import { useAppContext } from '../AppContext';
import { CharacterAvatar } from '../components/CharacterAvatar';
import { mockAgreementResult, mockConflictResult } from '../mockData';
import { Star } from 'lucide-react';

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
        initial={skipAnim ? {} : { opacity: 0, y: 50, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", bounce: 0.5 }}
        className="w-full max-w-2xl candy-panel p-8 md:p-12 relative z-10"
      >
        <div className="absolute -top-24 left-1/2 -translate-x-1/2">
          <CharacterAvatar name="Quinn" className="w-48 h-48 drop-shadow-xl hover:scale-110 hover:-rotate-6 transition-transform duration-300" />
        </div>

        <div className="bg-white/90 border-[4px] border-white rounded-[2rem] p-6 mt-16 mb-8 shadow-sm">
          <h2 className="text-3xl md:text-4xl font-black text-center h-[48px] uppercase text-[#FFB7B2] title-stroke drop-shadow-md">
            {skipAnim ? "What's Your Question?" : (
              <TypewriterText text="What's Your Question?" cursorColor="bg-[#FFB7B2]" />
            )}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="e.g. Am I eligible for the AICTE Pragati Scholarship?"
            className="w-full h-40 bg-white border-[4px] border-white shadow-inner rounded-[2rem] p-6 text-candy-text font-bold text-xl placeholder-candy-text/30 focus:outline-none focus:shadow-bubbly transition-all resize-none"
          />

          <div className="flex flex-wrap gap-4 justify-center mt-2">
            <button 
              type="button" 
              onClick={() => handleDemoPath('agreement')}
              className="px-6 py-3 candy-button-color bg-[#B5EAD7] text-white text-sm title-stroke"
            >
              ✨ Demo: Agreement
            </button>
            <button 
              type="button" 
              onClick={() => handleDemoPath('conflict')}
              className="px-6 py-3 candy-button-color bg-[#FF9AA2] text-white text-sm title-stroke"
            >
              🔥 Demo: Conflict
            </button>
          </div>

          <button
            type="submit"
            disabled={!question.trim()}
            className="mt-4 w-full py-5 text-2xl bg-[#FFDAC1] text-white candy-button-color flex items-center justify-center gap-3 disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed title-stroke"
          >
            Verify It! <Star className="w-8 h-8 text-white" fill="white" strokeWidth={2} />
          </button>
        </form>
      </motion.div>

      {!skipAnim && (
        <button onClick={() => setSkipAnim(true)} className="absolute bottom-8 right-8 text-candy-text font-bold text-sm uppercase tracking-widest z-50 bg-white/80 border-4 border-white px-5 py-3 rounded-full shadow-bubbly hover:bg-white transition-all">
          Skip animation
        </button>
      )}
    </div>
  );
};
