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
        initial={skipAnim ? {} : { opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl glass-panel rounded-3xl p-8 relative z-10"
      >
        <div className="absolute -top-16 left-1/2 -translate-x-1/2">
          <CharacterAvatar name="Quinn" className="w-32 h-32" />
        </div>

        <h2 className="text-3xl md:text-4xl font-bold text-center mt-12 mb-8 h-[48px]">
          {skipAnim ? "Enter your ?" : (
            <TypewriterText text="Enter your ?" cursorColor="bg-agent-quinn" />
          )}
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="e.g. Am I eligible for the AICTE Pragati Scholarship?"
            className="w-full h-32 bg-black/40 border border-white/20 rounded-2xl p-6 text-white text-lg placeholder-white/30 focus:outline-none focus:border-agent-quinn focus:ring-1 focus:ring-agent-quinn resize-none transition-all"
          />

          <div className="flex flex-wrap gap-2 justify-center mt-2">
            <button 
              type="button" 
              onClick={() => handleDemoPath('agreement')}
              className="px-4 py-2 rounded-full text-xs md:text-sm bg-agent-vera/20 text-agent-vera border border-agent-vera/30 hover:bg-agent-vera/40 transition-colors"
            >
              Demo: Agreement Path
            </button>
            <button 
              type="button" 
              onClick={() => handleDemoPath('conflict')}
              className="px-4 py-2 rounded-full text-xs md:text-sm bg-agent-vox/20 text-agent-vox border border-agent-vox/30 hover:bg-agent-vox/40 transition-colors"
            >
              Demo: Conflict Path
            </button>
          </div>

          <button
            type="submit"
            disabled={!question.trim()}
            className="mt-4 w-full py-4 rounded-xl primary-gradient-bg text-white font-bold text-lg hover:scale-[1.02] active:scale-[0.98] transition-transform disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2"
          >
            Verify Claim <Send className="w-5 h-5" />
          </button>
        </form>
      </motion.div>

      {!skipAnim && (
        <button onClick={() => setSkipAnim(true)} className="absolute bottom-8 right-8 text-white/50 hover:text-white text-sm uppercase tracking-widest z-50">
          Skip animation
        </button>
      )}
    </div>
  );
};
