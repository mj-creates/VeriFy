import React from 'react';
import { useAppContext } from './AppContext';
import { AnimatedBackground } from './components/AnimatedBackground';
import { LandingScreen } from './screens/LandingScreen';
import { AuthScreen } from './screens/AuthScreen';
import { QuestionScreen } from './screens/QuestionScreen';
import { AgentProcessingScreen } from './screens/AgentProcessingScreen';
import { JudgmentScreen } from './screens/JudgmentScreen';
import { OutputScreen } from './screens/OutputScreen';
import { CertificateScreen } from './screens/CertificateScreen';
import { AnimatePresence, motion } from 'framer-motion';

export const VerifyFlow: React.FC = () => {
  const { state } = useAppContext();

  const renderStep = () => {
    switch (state.currentStep) {
      case 1: return <LandingScreen key="1" />;
      case 2: return <AuthScreen key="2" />;
      case 3: return <QuestionScreen key="3" />;
      case 4: return <AgentProcessingScreen key="4" />;
      case 5: return <JudgmentScreen key="5" />;
      case 6: return <OutputScreen key="6" />;
      case 7: return <CertificateScreen key="7" />;
      default: return <LandingScreen key="1" />;
    }
  };

  return (
    <div className="relative min-h-screen font-sans selection:bg-[#4D96FF] selection:text-white">
      <AnimatedBackground />
      <AnimatePresence mode="wait">
        <motion.div
          key={state.currentStep}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.4 }}
          className="w-full min-h-screen"
        >
          {renderStep()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
