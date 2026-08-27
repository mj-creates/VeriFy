import React from 'react';
import { useAppContext } from './AppContext';
import { LandingScreen } from './screens/LandingScreen';
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
      case 2: return <QuestionScreen key="2" />;
      case 3: return <AgentProcessingScreen key="3" />;
      case 4: return <JudgmentScreen key="4" />;
      case 5: return <OutputScreen key="5" />;
      case 6: return <CertificateScreen key="6" />;
      default: return <LandingScreen key="1" />;
    }
  };

  return (
    <div className="relative min-h-screen font-display selection:bg-neo-blue selection:text-white">
      <AnimatePresence mode="wait">
        <motion.div
          key={state.currentStep}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="w-full min-h-screen"
        >
          {renderStep()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
