import React, { useState } from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';

interface CharacterAvatarProps {
  name: "Vera" | "Vox" | "Trace" | "Nova" | "Sol" | "Quinn";
  className?: string;
}

const colorMap = {
  Vera: "bg-neo-blue",
  Vox: "bg-neo-pink",
  Trace: "bg-neo-yellow",
  Nova: "bg-neo-purple",
  Sol: "bg-neo-green",
  Quinn: "bg-neo-orange",
};

export const CharacterAvatar: React.FC<CharacterAvatarProps> = ({ name, className }) => {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div className={clsx(`flex items-center justify-center rounded-full text-neo-black font-space font-bold text-4xl border-[4px] border-neo-black shadow-neo ${colorMap[name]}`, className)}>
        {name.charAt(0)}
      </div>
    );
  }

  return (
    <motion.img
      src={`/assets/characters/${name}.png`}
      alt={name}
      onError={() => setHasError(true)}
      className={clsx("object-contain", className)}
    />
  );
};
