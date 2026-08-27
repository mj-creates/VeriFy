import React, { useState } from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';

interface CharacterAvatarProps {
  name: "Vera" | "Vox" | "Trace" | "Nova" | "Sol" | "Quinn";
  className?: string;
}

const colorMap = {
  Vera: "bg-agent-vera",
  Vox: "bg-agent-vox",
  Trace: "bg-agent-trace",
  Nova: "bg-agent-nova",
  Sol: "bg-agent-sol",
  Quinn: "bg-agent-quinn",
};

export const CharacterAvatar: React.FC<CharacterAvatarProps> = ({ name, className }) => {
  const [hasError, setHasError] = useState(false);
  const lowerName = name.toLowerCase();

  if (hasError) {
    return (
      <div className={clsx(`flex items-center justify-center rounded-full text-white font-bold text-2xl border-4 border-white/20 shadow-lg ${colorMap[name]}`, className)}>
        {name.charAt(0)}
      </div>
    );
  }

  return (
    <motion.img
      src={`/assets/characters/${lowerName}.png`}
      alt={name}
      onError={() => setHasError(true)}
      className={clsx("object-contain drop-shadow-2xl", className)}
    />
  );
};
