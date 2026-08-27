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
    const t = setTimeout(() => setShowStamp(true), 1500);
    return () => clearTimeout(t);
  }, [skipAnim]);

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center p-4">
      <motion.div
        initial={skipAnim ? {} : { opacity: 0, scale: 0.8, rotate: -2 }}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        transition={{ type: "spring", bounce: 0.5 }}
        className="w-full max-w-2xl relative z-10 flex flex-col items-center"
      >
        <div className="text-center mb-8 bg-white border-4 border-black p-4 rounded-2xl shadow-[6px_6px_0px_0px_#000] rotate-2">
          <h2 className="text-4xl font-black text-black uppercase mb-1">Verification Complete!</h2>
          <p className="text-black font-bold uppercase">Your claim has been officially certified.</p>
        </div>

        <div className="w-full relative cartoon-panel p-[6px] bg-[#FFD93D]">
          {!skipAnim && (
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: '200%' }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
              className="absolute top-0 bottom-0 w-[100px] bg-white/50 skew-x-[45deg] z-20 pointer-events-none"
            />
          )}

          <div className="bg-white rounded-xl p-8 border-4 border-black relative overflow-hidden h-full w-full shadow-inner">
            <div className="absolute inset-0 opacity-[0.1] bg-[radial-gradient(#000_2px,transparent_2px)] [background-size:16px_16px]"></div>
            
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-8 border-b-4 border-black pb-6 border-dashed">
                <div className="flex items-center gap-2 text-4xl font-black uppercase tracking-tighter">
                  <Sparkles className="w-10 h-10 text-[#FF6B6B]" strokeWidth={3} fill="#FF6B6B" />
                  VeriFY
                </div>
                <div className="text-right bg-black text-white px-4 py-2 rounded-lg border-2 border-black rotate-[-2deg]">
                  <div className="text-xs uppercase tracking-widest font-bold">Date</div>
                  <div className="font-black text-lg">{dateStr}</div>
                </div>
              </div>

              <div className="mb-12">
                <div className="inline-block bg-[#4D96FF] text-white px-3 py-1 text-sm uppercase tracking-widest font-black rounded-md border-2 border-black mb-4 rotate-[1deg]">Verified Claim</div>
                <div className="text-2xl font-black uppercase leading-tight text-black bg-[#F4F4F4] border-4 border-black p-4 rounded-xl shadow-[4px_4px_0px_0px_#000] rotate-[-1deg]">
                  "{res.question}"
                </div>
              </div>

              <div className="flex justify-between items-end">
                <div className="bg-[#6BCB77] text-white border-4 border-black p-4 rounded-xl shadow-[4px_4px_0px_0px_#000] rotate-[2deg]">
                  <div className="text-sm uppercase tracking-widest font-black mb-1">Confidence Score</div>
                  <div className="text-6xl font-black" style={{ WebkitTextStroke: '2px black' }}>{res.judgment.confidenceScore}%</div>
                </div>

                <div className="relative w-36 h-36 flex items-center justify-center">
                  <motion.div
                    initial={skipAnim ? { scale: 1, opacity: 1, rotate: -15 } : { scale: 4, opacity: 0, rotate: -45 }}
                    animate={showStamp ? { scale: 1, opacity: 1, rotate: -15 } : {}}
                    transition={{ type: 'spring', bounce: 0.7, duration: 0.6 }}
                    className="absolute inset-0 border-8 border-[#FF6B6B] rounded-full flex items-center justify-center text-[#FF6B6B] font-black text-3xl uppercase tracking-widest opacity-0 bg-white"
                    style={{ opacity: showStamp ? 1 : 0, WebkitTextStroke: '1px #FF6B6B', boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)' }}
                  >
                    <span className="rotate-[-10deg]">Verified</span>
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-4 mt-8 w-full">
          <button className="flex-1 py-4 text-xl bg-white text-black cartoon-button flex items-center justify-center gap-2">
            <Download className="w-6 h-6" strokeWidth={3} /> Download
          </button>
          <button className="flex-1 py-4 text-xl bg-[#4D96FF] text-white cartoon-button flex items-center justify-center gap-2" style={{ WebkitTextStroke: '1px black' }}>
            <Share2 className="w-6 h-6 text-black" strokeWidth={3} /> Share Proof
          </button>
        </div>
        
        <button 
          onClick={() => {
            dispatch({ type: 'SET_QUESTION', payload: '' });
            dispatch({ type: 'SET_RESULT', payload: null as any });
            dispatch({ type: 'GO_TO_STEP', payload: 3 });
          }} 
          className="mt-8 text-black font-black uppercase hover:underline text-lg bg-white border-4 border-black px-6 py-2 shadow-[4px_4px_0px_0px_#000] rounded-xl hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[6px_6px_0px_0px_#000] active:translate-y-0 active:translate-x-0 active:shadow-none transition-all"
        >
          Verify Another Claim!
        </button>

      </motion.div>

      {!skipAnim && !showStamp && (
        <button onClick={() => setSkipAnim(true)} className="absolute bottom-8 right-8 text-black font-bold text-sm uppercase tracking-widest z-50 bg-white border-2 border-black px-4 py-2 shadow-[2px_2px_0px_0px_#000] hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[4px_4px_0px_0px_#000] active:translate-y-0 active:translate-x-0 active:shadow-none transition-all">
          Skip animation
        </button>
      )}
    </div>
  );
};
