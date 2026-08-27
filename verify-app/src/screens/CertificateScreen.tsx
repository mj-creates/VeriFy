import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAppContext } from '../AppContext';
import { Download, Share2 } from 'lucide-react';

export const CertificateScreen: React.FC = () => {
  const { state, dispatch } = useAppContext();
  const [showStamp, setShowStamp] = useState(false);

  const res = state.verifyResult!;
  const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  useEffect(() => {
    const t = setTimeout(() => setShowStamp(true), 800);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const saveCert = async () => {
      try {
        await fetch('http://localhost:8000/api/certificates', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'X-API-Key': 'verify-secret-static-key-2024'
          },
          body: JSON.stringify({
            question: res.question,
            final_answer: res.finalAnswer,
            confidence_score: res.judgment.confidenceScore,
            trust_explanation: res.trustExplanation
          })
        });
      } catch (e) {
        console.error("Failed to save certificate:", e);
      }
    };
    saveCert();
  }, [res]);

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center p-4 bg-neo-bg">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl relative z-10 flex flex-col items-center"
      >
        <div className="text-center mb-10 bg-neo-green border-4 border-neo-black px-8 py-3 shadow-neo rotate-[-2deg]">
          <h2 className="text-3xl font-black font-space text-neo-black uppercase tracking-widest">Verification Complete</h2>
        </div>

        <div className="w-full bg-white border-4 border-neo-black p-8 shadow-neo relative overflow-hidden">
          {/* Halftone texture overlay */}
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#111_2px,transparent_2px)] [background-size:16px_16px]"></div>
          
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-10 border-b-4 border-neo-black pb-6">
              <div className="text-6xl font-black font-space uppercase tracking-tighter text-neo-black drop-shadow-[4px_4px_0_rgba(17,17,17,1)]">
                VERIFY.
              </div>
              <div className="text-right bg-neo-yellow text-neo-black px-4 py-2 border-4 border-neo-black shadow-neo">
                <div className="text-xs uppercase font-space font-black tracking-widest mb-1">Date Issued</div>
                <div className="font-black font-display text-xl">{dateStr}</div>
              </div>
            </div>

            <div className="mb-12">
              <div className="inline-block bg-neo-black text-white px-3 py-1 text-sm font-space uppercase tracking-widest font-black mb-4">
                Verified Claim
              </div>
              <div className="text-2xl font-bold font-display uppercase leading-relaxed text-neo-black">
                "{res.question}"
              </div>
            </div>

            <div className="flex justify-between items-end">
              <div className="bg-neo-blue text-white border-4 border-neo-black p-6 shadow-neo rotate-[2deg]">
                <div className="text-sm uppercase font-space font-black tracking-widest mb-2">Confidence Score</div>
                <div className="text-6xl font-black font-space drop-shadow-[4px_4px_0_rgba(17,17,17,1)]">{res.judgment.confidenceScore}%</div>
              </div>

              <div className="relative w-40 h-40 flex items-center justify-center">
                <motion.div
                  initial={{ scale: 3, opacity: 0, rotate: -45 }}
                  animate={showStamp ? { scale: 1, opacity: 1, rotate: -15 } : {}}
                  transition={{ type: 'spring', bounce: 0.5, duration: 0.6 }}
                  className="absolute inset-0 border-[6px] border-neo-pink rounded-full flex items-center justify-center text-neo-pink font-black font-space text-3xl uppercase tracking-widest opacity-0 bg-transparent shadow-neo"
                  style={{ opacity: showStamp ? 1 : 0 }}
                >
                  <span className="rotate-[-10deg]">VERIFIED</span>
                </motion.div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-6 mt-10 w-full">
          <button className="flex-1 py-4 text-xl bg-white text-neo-black border-4 border-neo-black shadow-neo hover:-translate-y-1 hover:shadow-neo-lg active:translate-y-1 active:translate-x-1 active:shadow-neo-active transition-all font-space font-bold uppercase flex items-center justify-center gap-3">
            <Download className="w-6 h-6" strokeWidth={3} /> Download
          </button>
          <button className="flex-1 py-4 text-xl bg-neo-pink text-neo-black border-4 border-neo-black shadow-neo hover:-translate-y-1 hover:shadow-neo-lg active:translate-y-1 active:translate-x-1 active:shadow-neo-active transition-all font-space font-bold uppercase flex items-center justify-center gap-3">
            <Share2 className="w-6 h-6" strokeWidth={3} /> Share
          </button>
        </div>
        
        <button 
          onClick={() => {
            dispatch({ type: 'SET_QUESTION', payload: '' });
            dispatch({ type: 'SET_RESULT', payload: null as any });
            dispatch({ type: 'GO_TO_STEP', payload: 2 });
          }} 
          className="mt-12 text-neo-black font-space font-bold uppercase hover:underline text-lg"
        >
          Verify Another Claim
        </button>
      </motion.div>
    </div>
  );
};
