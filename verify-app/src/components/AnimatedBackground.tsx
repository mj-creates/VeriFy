import React from 'react';

export const AnimatedBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 z-[-1] pointer-events-none">
      {/* Background is handled by body CSS (polka dots) */}
    </div>
  );
};
