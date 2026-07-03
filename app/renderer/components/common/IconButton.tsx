/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { motion } from "motion/react";

interface IconButtonProps {
  icon: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  className?: string;
  variant?: "primary" | "secondary" | "danger" | "ghost";
  disabled?: boolean;
  title?: string;
}

export default function IconButton({
  icon,
  onClick,
  className = "",
  variant = "ghost",
  disabled = false,
  title,
}: IconButtonProps) {
  let styleClass = "";
  switch (variant) {
    case "primary":
      styleClass = "bg-knoux-purple text-white hover:bg-knoux-deep-purple shadow-sm";
      break;
    case "secondary":
      styleClass = "bg-knoux-purple/5 text-knoux-purple hover:bg-knoux-purple/10 border border-knoux-purple/10";
      break;
    case "danger":
      styleClass = "bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-100";
      break;
    case "ghost":
      styleClass = "text-knoux-muted-text hover:text-knoux-purple hover:bg-knoux-purple/5";
      break;
  }

  return (
    <motion.button
      disabled={disabled}
      title={title}
      whileTap={disabled ? {} : { scale: 0.95 }}
      onClick={onClick}
      className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none ${styleClass} ${className}`}
    >
      {icon}
    </motion.button>
  );
}
