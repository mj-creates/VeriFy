import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAppContext } from '../AppContext';
import { Sparkles, Download, Share2 } from 'lucide-react';

export const CertificateScreen: React.FC = () => {
  const { state, dispatch } = useAppContext();
  const [skipAnim, setSkipAnim] = useState(false);
  const [showStamp, setShowStamp] = useState(false);

  const res = state.verifyResult!;
  const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  useEffect(() => {
    if (skipAnim) {
      setShowStamp(true);
      return;
    }
    const t = setTimeout(() => setShowStamp(true), 1500);
    return () => clearTimeout(t);
  }, [skipAnim]);

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center p-4">
      <motion.div
        initial={skipAnim ? {} : { opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-2xl relative z-10 flex flex-col items-center"
      >
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold primary-gradient-text mb-2">Verification Complete</h2>
          <p className="text-white/60">Your claim has been analyzed and certified.</p>
        </div>

        {/* Certificate Card */}
        <div className="w-full relative rounded-2xl p-[2px] primary-gradient-bg overflow-hidden shadow-[0_0_50px_-10px_rgba(245,196,81,0.4)]">
          {/* Shimmer effect */}
          {!skipAnim && (
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: '200%' }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
              className="absolute top-0 bottom-0 w-[200px] bg-white/20 skew-x-[45deg] z-20 pointer-events-none"
            />
          )}

          <div className="bg-slate-950 rounded-2xl p-8 relative overflow-hidden h-full w-full">
            {/* Background texture */}
            <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>
            
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-12 border-b border-white/10 pb-6">
                <div className="flex items-center gap-2 text-2xl font-black">
                  <Sparkles className="w-6 h-6 text-agent-sol" />
                  VeriFY
                </div>
                <div className="text-right">
                  <div className="text-sm text-white/50 uppercase tracking-widest mb-1">Date</div>
                  <div className="font-mono text-white/90">{dateStr}</div>
                </div>
              </div>

              <div className="mb-12">
                <div className="text-sm text-white/50 uppercase tracking-widest mb-2">Verified Claim</div>
                <div className="text-xl font-medium leading-relaxed italic text-white/90">
                  "{res.question}"
                </div>
              </div>

              <div className="flex justify-between items-end">
                <div>
                  <div className="text-sm text-white/50 uppercase tracking-widest mb-1">Confidence Score</div>
                  <div className="text-4xl font-black text-agent-sol">{res.judgment.confidenceScore}%</div>
                </div>

                {/* Stamp */}
                <div className="relative w-32 h-32 flex items-center justify-center">
                  <motion.div
                    initial={skipAnim ? { scale: 1, opacity: 1, rotate: -15 } : { scale: 3, opacity: 0, rotate: -45 }}
                    animate={showStamp ? { scale: 1, opacity: 1, rotate: -15 } : {}}
                    transition={{ type: 'spring', bounce: 0.6, duration: 0.8 }}
                    className="absolute inset-0 border-4 border-agent-sol rounded-full flex items-center justify-center text-agent-sol font-black text-xl uppercase tracking-widest opacity-0"
                    style={{ opacity: showStamp ? 1 : 0 }}
                  >
                    Verified
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4 mt-8 w-full">
          <button className="flex-1 py-4 rounded-xl bg-white/10 text-white font-bold hover:bg-white/20 transition-colors flex items-center justify-center gap-2">
            <Download className="w-5 h-5" /> Download
          </button>
          <button className="flex-1 py-4 rounded-xl primary-gradient-bg text-white font-bold hover:scale-[1.02] active:scale-[0.98] transition-transform flex items-center justify-center gap-2">
            <Share2 className="w-5 h-5" /> Share Proof
          </button>
        </div>
        
        <button 
          onClick={() => {
            dispatch({ type: 'SET_QUESTION', payload: '' });
            dispatch({ type: 'SET_RESULT', payload: null as any });
            dispatch({ type: 'GO_TO_STEP', payload: 3 });
          }} 
          className="mt-8 text-white/50 hover:text-white underline text-sm"
        >
          Verify another claim
        </button>

      </motion.div>

      {!skipAnim && !showStamp && (
        <button onClick={() => setSkipAnim(true)} className="absolute bottom-8 right-8 text-white/50 hover:text-white text-sm uppercase tracking-widest z-50">
          Skip animation
        </button>
      )}
    </div>
  );
};
