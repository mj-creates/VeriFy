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
    // Mock login
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
      {/* Faint background Qs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-1/4 left-1/4 text-6xl text-agent-vera rotate-12">?</div>
        <div className="absolute top-1/3 right-1/3 text-8xl text-agent-nova -rotate-12">?</div>
        <div className="absolute bottom-1/4 left-1/3 text-5xl text-agent-sol rotate-45">?</div>
      </div>

      <motion.div 
        initial={skipAnim ? {} : { opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass-panel rounded-3xl p-8 md:p-12 w-full max-w-md z-10"
      >
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold primary-gradient-text h-[40px]">
            {skipAnim ? (mode === 'signin' ? 'Sign In' : 'Sign Up') : (
              <TypewriterText 
                key={mode} 
                text={mode === 'signin' ? 'Sign In' : 'Sign Up'} 
                cursorColor="bg-agent-vox"
              />
            )}
          </h2>
          <button 
            type="button"
            onClick={() => setMode(m => m === 'signin' ? 'signup' : 'signin')}
            className="text-sm text-agent-vera hover:text-white transition-colors"
          >
            Toggle to {mode === 'signin' ? 'Sign Up' : 'Sign In'}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {formFields.map((field, i) => (
            <motion.div
              key={`${mode}-${field}`}
              initial={skipAnim ? {} : { opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: skipAnim ? 0 : i * 0.08 }}
            >
              <input 
                type={field.includes('Password') ? 'password' : field === 'Email' ? 'email' : 'text'}
                placeholder={field}
                required
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-agent-nova transition-all"
              />
            </motion.div>
          ))}
          
          <motion.button
            transition={{ duration: 0.4 }}
            disabled={isLoading}
            className="mt-6 w-full py-4 rounded-xl primary-gradient-bg text-white font-bold hover:scale-[1.02] active:scale-[0.98] transition-transform disabled:opacity-70 disabled:hover:scale-100 flex items-center justify-center gap-2"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (mode === 'signin' ? 'Login' : 'Create Account')}
          </motion.button>
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
