import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { TypewriterText } from '../components/TypewriterText';
import { useAppContext } from '../AppContext';
import { Loader2, Heart } from 'lucide-react';

export const AuthScreen: React.FC = () => {
  const { dispatch } = useAppContext();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [isLoading, setIsLoading] = useState(false);
  const [skipAnim, setSkipAnim] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      dispatch({ type: 'NEXT_STEP' });
    }, 1500);
  };

  const formFields = mode === 'signup' 
    ? ['Name', 'Email', 'Password', 'Confirm Password'] 
    : ['Email', 'Password'];

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4">
      <motion.div 
        initial={skipAnim ? {} : { opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", bounce: 0.5 }}
        className="candy-panel p-8 md:p-12 w-full max-w-md z-10"
      >
        <div className="flex justify-between items-center mb-8 border-b-4 border-white/50 pb-4">
          <h2 className="text-4xl font-black text-[#FF9AA2] h-[40px] uppercase title-stroke drop-shadow-md">
            {skipAnim ? (mode === 'signin' ? 'Sign In' : 'Sign Up') : (
              <TypewriterText 
                key={mode} 
                text={mode === 'signin' ? 'Sign In' : 'Sign Up'} 
                cursorColor="bg-[#FF9AA2]"
              />
            )}
          </h2>
          <button 
            type="button"
            onClick={() => setMode(m => m === 'signin' ? 'signup' : 'signin')}
            className="text-sm font-black uppercase text-[#B5EAD7] hover:text-[#7BDFF2] transition-colors"
          >
            Switch to {mode === 'signin' ? 'Sign Up' : 'Sign In'}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {formFields.map((field, i) => (
            <motion.div
              key={`${mode}-${field}`}
              initial={skipAnim ? {} : { opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: skipAnim ? 0 : i * 0.1, type: "spring" }}
            >
              <label className="block text-candy-text font-bold uppercase mb-2 pl-2 text-sm">{field}</label>
              <input 
                type={field.includes('Password') ? 'password' : field === 'Email' ? 'email' : 'text'}
                required
                className="w-full bg-white/80 border-4 border-white shadow-sm rounded-2xl px-5 py-4 text-candy-text font-bold focus:outline-none focus:bg-white focus:shadow-bubbly transition-all"
              />
            </motion.div>
          ))}
          
          <motion.button
            disabled={isLoading}
            className="mt-6 w-full py-5 text-xl bg-[#B5EAD7] candy-button-color flex items-center justify-center gap-2 title-stroke"
          >
            {isLoading ? <Loader2 className="w-6 h-6 animate-spin text-white" /> : (mode === 'signin' ? 'Welcome Back!' : 'Join Us!')}
            {!isLoading && <Heart className="w-6 h-6 text-white" fill="white" />}
          </motion.button>
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
