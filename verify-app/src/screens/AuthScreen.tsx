import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { TypewriterText } from '../components/TypewriterText';
import { useAppContext } from '../AppContext';
import { Loader2 } from 'lucide-react';

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
        initial={skipAnim ? {} : { opacity: 0, scale: 0.8, rotate: -5 }}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        transition={{ type: "spring", bounce: 0.6 }}
        className="cartoon-panel p-8 md:p-12 w-full max-w-md z-10 bg-[#FFD93D]"
      >
        <div className="flex justify-between items-center mb-8 border-b-4 border-black pb-4">
          <h2 className="text-4xl font-black text-white h-[40px] uppercase" style={{ WebkitTextStroke: '2px black', textShadow: '4px 4px 0px #000' }}>
            {skipAnim ? (mode === 'signin' ? 'Sign In' : 'Sign Up') : (
              <TypewriterText 
                key={mode} 
                text={mode === 'signin' ? 'Sign In' : 'Sign Up'} 
                cursorColor="bg-black"
              />
            )}
          </h2>
          <button 
            type="button"
            onClick={() => setMode(m => m === 'signin' ? 'signup' : 'signin')}
            className="text-sm font-black uppercase underline hover:text-[#4D96FF] transition-colors"
          >
            Switch to {mode === 'signin' ? 'Sign Up' : 'Sign In'}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {formFields.map((field, i) => (
            <motion.div
              key={`${mode}-${field}`}
              initial={skipAnim ? {} : { opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: skipAnim ? 0 : i * 0.1, type: "spring" }}
            >
              <label className="block text-black font-black uppercase mb-1">{field}</label>
              <input 
                type={field.includes('Password') ? 'password' : field === 'Email' ? 'email' : 'text'}
                required
                className="w-full bg-white border-4 border-black shadow-[4px_4px_0px_0px_#000] rounded-xl px-4 py-3 text-black font-bold focus:outline-none focus:translate-y-1 focus:translate-x-1 focus:shadow-none transition-all"
              />
            </motion.div>
          ))}
          
          <motion.button
            disabled={isLoading}
            className="mt-6 w-full py-4 text-xl bg-[#FF6B6B] text-white cartoon-button flex items-center justify-center gap-2"
            style={{ WebkitTextStroke: '1px black' }}
          >
            {isLoading ? <Loader2 className="w-6 h-6 animate-spin text-black" /> : (mode === 'signin' ? 'Lets Go!' : 'Join Us!')}
          </motion.button>
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
