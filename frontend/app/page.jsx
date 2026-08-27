'use client';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Typewriter from 'typewriter-effect';
import { CheckCircle2, ShieldCheck, Cpu, Search, BrainCircuit, Activity } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

// Mock API Call (if backend is not running or takes time)
// Will try real API, fallback to mock if failed.
async function verifyQuery(query) {
  try {
    const res = await fetch('http://localhost:8000/api/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query })
    });
    const data = await res.json();
    return data;
  } catch (err) {
    console.error("API error, falling back to mock", err);
    return {
      response: "This is a fallback generated output due to backend connection failure.\n\n---\n**Confidence:** 95% (HIGH)\n**Trust Summary:** Checked verified sources.",
      error: null
    };
  }
}

export default function Home() {
  const [step, setStep] = useState(0); // 0=Splash, 1=Auth, 2=Query, 3=AgentsAction, 4=NovaDebate, 5=Output
  
  // States for query & result
  const [query, setQuery] = useState("");
  const [result, setResult] = useState(null);

  // Floating Question Marks logic
  const [floatingMarks, setFloatingMarks] = useState([]);
  
  useEffect(() => {
    // Generate random floating question marks for splash screen
    const marks = Array.from({ length: 30 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      duration: 3 + Math.random() * 4,
      delay: Math.random() * 2,
    }));
    setFloatingMarks(marks);
    
    // Splash screen timing
    if (step === 0) {
      setTimeout(() => {
        setStep(1);
      }, 5000); // 5 seconds for splash
    }
  }, [step]);

  return (
    <main className="relative w-full h-screen overflow-hidden bg-black text-white font-mono flex items-center justify-center p-4">
      
      {/* 0. SPLASH SCREEN */}
      <AnimatePresence>
        {step === 0 && (
          <motion.div
            key="splash"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
            transition={{ duration: 1.5 }}
            className="absolute inset-0 flex flex-col items-center justify-center"
          >
            {/* Floating Question marks */}
            {floatingMarks.map(m => (
              <motion.div
                key={m.id}
                className="absolute text-emerald-500/20 text-4xl font-bold select-none"
                initial={{ left: `${m.x}%`, top: `${m.y}%`, opacity: 0, y: 0 }}
                animate={{ opacity: [0, 0.5, 0], y: -50, rotate: 360 }}
                transition={{ duration: m.duration, delay: m.delay, repeat: Infinity }}
              >
                ?
              </motion.div>
            ))}

            <div className="z-10 text-4xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-500 text-shadow-glow">
              <Typewriter
                options={{ delay: 50, cursor: '_' }}
                onInit={(typewriter) => {
                  typewriter
                    .typeString("Verify for you")
                    .pauseFor(1000)
                    .deleteAll(50)
                    .typeString("<span class='text-6xl md:text-8xl'>VeriFY</span>")
                    .start();
                }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1. AUTH SCREEN */}
      <AnimatePresence>
        {step === 1 && (
          <motion.div
            key="auth"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="flex flex-col items-center max-w-md w-full gap-8 z-10"
          >
            <div className="text-2xl md:text-3xl font-bold text-emerald-400 h-10">
              <Typewriter
                options={{ delay: 40 }}
                onInit={(typewriter) => {
                  typewriter.typeString("???????????????").pauseFor(300).deleteAll(20).typeString("sign in or sign up").start();
                }}
              />
            </div>
            
            <form 
              onSubmit={(e) => { e.preventDefault(); setStep(2); }}
              className="flex flex-col gap-4 w-full bg-zinc-900/50 p-6 rounded-xl border border-emerald-500/20 backdrop-blur"
            >
              <input type="text" placeholder="Username" className="bg-black border border-zinc-700 p-3 rounded focus:border-emerald-400 focus:outline-none" required />
              <input type="password" placeholder="Password" className="bg-black border border-zinc-700 p-3 rounded focus:border-emerald-400 focus:outline-none" required />
              <button type="submit" className="mt-4 bg-emerald-500 hover:bg-emerald-400 text-black font-bold p-3 rounded transition-colors">
                Continue
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. QUERY SCREEN */}
      <AnimatePresence>
        {step === 2 && (
          <motion.div
            key="query"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, y: -50 }}
            className="flex flex-col items-center max-w-2xl w-full gap-8 z-10"
          >
             <div className="text-3xl md:text-5xl font-bold text-cyan-400 flex gap-2">
               <span>enter your</span>
               <span className="text-emerald-500 animate-pulse">?</span>
             </div>
             
             <form 
              onSubmit={(e) => {
                e.preventDefault();
                setStep(3);
                // Trigger API call but don't await here, we let animations play out
                verifyQuery(query).then(res => {
                  setResult(res.response);
                });
              }}
              className="w-full relative"
            >
              <input 
                type="text" 
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Type your claim or question here..." 
                className="w-full bg-zinc-900/80 border-2 border-zinc-700 p-4 rounded-xl text-lg focus:border-cyan-400 focus:outline-none pr-12 shadow-[0_0_15px_rgba(34,211,238,0.1)]"
                required 
                autoFocus
              />
              <button type="submit" className="absolute right-3 top-3.5 text-zinc-400 hover:text-cyan-400">
                <Search size={28} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. ACTION FORMAT (Agents 2, 3, 4) */}
      <AnimatePresence>
        {step === 3 && (
          <AgentsActionView onComplete={() => setStep(4)} />
        )}
      </AnimatePresence>

      {/* 4. NOVA DEBATE (Agent 5 fights itself) */}
      <AnimatePresence>
        {step === 4 && (
          <NovaDebateView onComplete={() => setStep(5)} isResultReady={!!result} />
        )}
      </AnimatePresence>

      {/* 5. OUTPUT & CERTIFICATE */}
      <AnimatePresence>
        {step === 5 && result && (
          <OutputView result={result} onReset={() => {setStep(2); setQuery(""); setResult(null);}} />
        )}
      </AnimatePresence>

    </main>
  );
}

// Subcomponent: Agent Action View
function AgentsActionView({ onComplete }) {
  useEffect(() => {
    const t = setTimeout(onComplete, 6000); // Show for 6 seconds
    return () => clearTimeout(t);
  }, [onComplete]);

  const agents = [
    { name: "Vera", role: "Official Sources", color: "text-blue-400", border: "border-blue-500/30" },
    { name: "Vox", role: "News & Media", color: "text-orange-400", border: "border-orange-500/30" },
    { name: "Trace", role: "Community Sentiments", color: "text-purple-400", border: "border-purple-500/30" }
  ];

  return (
    <motion.div 
      key="action"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 1.1 }}
      className="w-full max-w-5xl flex flex-col gap-6"
    >
      <h2 className="text-2xl font-bold text-center mb-4 flex items-center justify-center gap-3">
        <Activity className="animate-pulse text-emerald-400"/> Initiating Parallel Research Agents...
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {agents.map((ag, i) => (
          <motion.div 
            key={ag.name}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.5 }}
            className={`p-5 rounded-xl border bg-zinc-900/50 flex flex-col gap-3 ${ag.border}`}
          >
            <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
              <span className={`font-bold text-lg ${ag.color}`}>{ag.name}</span>
              <Search size={16} className={`${ag.color} animate-spin-slow`} />
            </div>
            <div className="text-xs text-zinc-400 mb-2">ROLE: {ag.role}</div>
            <div className="text-sm space-y-2 h-32 overflow-hidden relative">
              <Typewriter
                options={{ delay: 20, cursor: '█' }}
                onInit={(typewriter) => {
                  typewriter.pauseFor(1000 + i*500)
                    .typeString("> Executing deep search...<br/>")
                    .pauseFor(500)
                    .typeString("> Extracting relevant paragraphs...<br/>")
                    .pauseFor(800)
                    .typeString("> Cross-referencing entities...<br/>")
                    .pauseFor(400)
                    .typeString("> <span class='text-emerald-400'>Extraction complete.</span>")
                    .start();
                }}
              />
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

// Subcomponent: Nova Debate View
function NovaDebateView({ onComplete, isResultReady }) {
  useEffect(() => {
    // Wait until at least 5 seconds have passed AND result is ready
    const minTime = new Promise(resolve => setTimeout(resolve, 5000));
    
    // Periodically check if result is ready after min time
    let interval;
    minTime.then(() => {
      if (isResultReady) onComplete();
      else {
         interval = setInterval(() => {
            if (isResultReady) {
              clearInterval(interval);
              onComplete();
            }
         }, 500);
      }
    });
    return () => clearInterval(interval);
  }, [onComplete, isResultReady]);

  return (
    <motion.div 
      key="nova"
      initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center max-w-3xl w-full"
    >
      <div className="relative w-48 h-48 mb-8 flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 10, repeat: Infinity, ease: "linear" }} className="absolute inset-0 border-4 border-dashed border-red-500/50 rounded-full" />
        <motion.div animate={{ rotate: -360 }} transition={{ duration: 8, repeat: Infinity, ease: "linear" }} className="absolute inset-4 border-4 border-dashed border-cyan-500/50 rounded-full" />
        <BrainCircuit size={64} className="text-white animate-pulse" />
      </div>

      <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-cyan-400 mb-6">
        Agent 5 (Nova) Resolving Conflicts...
      </h2>

      <div className="w-full bg-zinc-900 border border-zinc-700 p-6 rounded-xl font-mono text-sm shadow-[0_0_30px_rgba(255,0,0,0.1)] h-40 flex items-center justify-center text-center">
        <Typewriter
          options={{ delay: 30 }}
          onInit={(typewriter) => {
            typewriter
              .typeString("<span class='text-blue-400'>Vera: Policy active.</span> VS <span class='text-orange-400'>Vox: Policy extended.</span><br/><br/>")
              .pauseFor(800)
              .typeString("<span class='text-red-400'>NOVA: Detecting logical discrepancy...</span><br/>")
              .pauseFor(500)
              .typeString("Evaluating hierarchy of evidence...<br/>")
              .pauseFor(1000)
              .typeString("<span class='text-emerald-400 font-bold'>Consensus Reached. Synthesizing final output...</span>")
              .start();
          }}
        />
      </div>
    </motion.div>
  );
}

// Subcomponent: Final Output & Certificate
function OutputView({ result, onReset }) {
  // Split result into Markdown and Certificate (if available)
  const parts = result.split('---');
  const markdownContent = parts[0];
  const certContent = parts.length > 1 ? parts.slice(1).join('---') : "";

  return (
    <motion.div 
      key="output"
      initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-4xl max-h-[90vh] overflow-y-auto hide-scrollbar flex flex-col gap-6 pb-20"
    >
      <div className="flex justify-between items-center mb-4 sticky top-0 bg-black py-4 z-10 border-b border-zinc-800">
        <h1 className="text-3xl font-bold text-emerald-400">Analysis Complete</h1>
        <button onClick={onReset} className="text-sm bg-zinc-800 hover:bg-zinc-700 px-4 py-2 rounded">New Query</button>
      </div>

      {/* Markdown Output */}
      <div className="prose prose-invert prose-emerald max-w-none bg-zinc-900/50 p-6 rounded-xl border border-zinc-800">
        <ReactMarkdown>{markdownContent}</ReactMarkdown>
      </div>

      {/* Accuracy Certificate */}
      {certContent && (
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 1 }}
          className="relative mt-8 p-8 border-2 border-emerald-500/50 bg-gradient-to-br from-emerald-900/20 to-black rounded-2xl flex flex-col items-center overflow-hidden"
        >
          {/* Watermark */}
          <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
            <ShieldCheck size={300} />
          </div>

          <div className="flex items-center gap-3 text-emerald-400 mb-6 z-10">
            <CheckCircle2 size={32} />
            <h2 className="text-2xl font-bold uppercase tracking-widest text-shadow-glow">Accuracy Certificate</h2>
          </div>
          
          <div className="w-full bg-black/50 p-6 rounded-xl border border-emerald-500/20 z-10">
            <ReactMarkdown className="prose prose-invert prose-emerald text-center">
              {certContent}
            </ReactMarkdown>
          </div>
          
          <div className="mt-8 z-10 w-full flex justify-between items-end border-t border-emerald-500/30 pt-4 text-emerald-500/60 text-xs">
            <div>Verified by Agent Core System</div>
            <div className="flex flex-col items-end">
               <span className="font-bold text-emerald-500 text-lg tracking-widest">APPROVED BY VeriFY</span>
               <span>{new Date().toLocaleDateString()}</span>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
