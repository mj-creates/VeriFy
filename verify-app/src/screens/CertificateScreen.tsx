import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAppContext } from '../AppContext';
import { Sparkles, Download, Share2 } from 'lucide-react';

export const CertificateScreen: React.FC = () => {
  const { state, dispatch } = useAppContext();
  const [skipAnim, setSkipAnim] = useState(false);
  const [showStamp, setShowStamp] = useState(false);

  const res = state.verifyResult!;
  const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  useEffect(() => {
    if (skipAnim) {
      setShowStamp(true);
      return;
    }
    const t = setTimeout(() => setShowStamp(true), 1200);
    return () => clearTimeout(t);
  }, [skipAnim]);

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center p-4">
      <motion.div
        initial={skipAnim ? {} : { opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", bounce: 0.5 }}
        className="w-full max-w-2xl relative z-10 flex flex-col items-center"
      >
        <div className="text-center mb-10 bg-white/90 border-[4px] border-white px-8 py-4 rounded-[2rem] shadow-bubbly">
          <h2 className="text-4xl font-black text-[#C7CEEA] uppercase mb-2 title-stroke drop-shadow-md">Verification Complete!</h2>
          <p className="text-candy-text font-bold uppercase tracking-wide">Your claim has been officially certified ✨</p>
        </div>

        <div className="w-full relative candy-panel p-2 bg-[#FFDAC1]">
          {!skipAnim && (
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: '200%' }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
              className="absolute top-0 bottom-0 w-[150px] bg-white/60 skew-x-[45deg] z-20 pointer-events-none filter blur-md"
            />
          )}

          <div className="bg-white/95 rounded-[2.2rem] p-10 border-[6px] border-white relative overflow-hidden h-full w-full shadow-inner">
            <div className="absolute inset-0 opacity-[0.2] bg-[radial-gradient(#FFDAC1_2px,transparent_2px)] [background-size:24px_24px]"></div>
            
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-10 border-b-[4px] border-white pb-6 border-dashed">
                <div className="flex items-center gap-3 text-5xl font-black uppercase tracking-tighter text-[#FF9AA2] title-stroke">
                  <Sparkles className="w-12 h-12 text-[#FFDAC1]" strokeWidth={3} fill="#FFDAC1" />
                  VeriFY
                </div>
                <div className="text-right bg-[#E6F4F1] text-candy-text px-5 py-3 rounded-2xl border-[3px] border-white shadow-sm rotate-[2deg]">
                  <div className="text-xs uppercase tracking-widest font-black mb-1">Date</div>
                  <div className="font-black text-xl">{dateStr}</div>
                </div>
              </div>

              <div className="mb-12">
                <div className="inline-block bg-[#7BDFF2] text-white px-4 py-1.5 text-sm uppercase tracking-widest font-black rounded-full border-[3px] border-white mb-4 rotate-[-1deg] shadow-sm title-stroke">Verified Claim</div>
                <div className="text-2xl font-black uppercase leading-relaxed text-candy-text bg-white border-[4px] border-white p-6 rounded-[2rem] shadow-sm">
                  "{res.question}"
                </div>
              </div>

              <div className="flex justify-between items-end">
                <div className="bg-[#B5EAD7] text-white border-[4px] border-white p-6 rounded-[2rem] shadow-sm rotate-[1deg]">
                  <div className="text-sm uppercase tracking-widest font-black mb-2">Confidence Score</div>
                  <div className="text-6xl font-black title-stroke drop-shadow-md">{res.judgment.confidenceScore}%</div>
                </div>

                <div className="relative w-40 h-40 flex items-center justify-center">
                  <motion.div
                    initial={skipAnim ? { scale: 1, opacity: 1, rotate: -15 } : { scale: 3, opacity: 0, rotate: -45 }}
                    animate={showStamp ? { scale: 1, opacity: 1, rotate: -15 } : {}}
                    transition={{ type: 'spring', bounce: 0.7, duration: 0.6 }}
                    className="absolute inset-0 border-[8px] border-[#FF9AA2] rounded-full flex items-center justify-center text-[#FF9AA2] font-black text-3xl uppercase tracking-widest opacity-0 bg-white/90 shadow-bubbly"
                    style={{ opacity: showStamp ? 1 : 0 }}
                  >
                    <span className="rotate-[-10deg] drop-shadow-sm">Verified</span>
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-6 mt-10 w-full">
          <button className="flex-1 py-5 text-xl bg-white text-candy-text candy-button-color flex items-center justify-center gap-3">
            <Download className="w-7 h-7 text-[#7BDFF2]" strokeWidth={3} /> Download
          </button>
          <button className="flex-1 py-5 text-xl bg-[#7BDFF2] text-white candy-button-color flex items-center justify-center gap-3 title-stroke">
            <Share2 className="w-7 h-7 text-white" strokeWidth={3} /> Share Proof
          </button>
        </div>
        
        <button 
          onClick={() => {
            dispatch({ type: 'SET_QUESTION', payload: '' });
            dispatch({ type: 'SET_RESULT', payload: null as any });
            dispatch({ type: 'GO_TO_STEP', payload: 3 });
          }} 
          className="mt-10 text-candy-text font-black uppercase hover:text-[#7BDFF2] text-lg bg-white/80 border-[4px] border-white px-8 py-3 rounded-full shadow-sm hover:-translate-y-1 hover:shadow-bubbly active:translate-y-0 active:shadow-sm transition-all"
        >
          Verify Another Claim ✨
        </button>

      </motion.div>

      {!skipAnim && !showStamp && (
        <button onClick={() => setSkipAnim(true)} className="absolute bottom-8 right-8 text-candy-text font-bold text-sm uppercase tracking-widest z-50 bg-white/80 border-4 border-white px-5 py-3 rounded-full shadow-bubbly hover:bg-white transition-all">
          Skip animation
        </button>
      )}
    </div>
  );
};
