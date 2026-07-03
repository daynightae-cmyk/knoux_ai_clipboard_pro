/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { motion } from "motion/react";

interface KnouxButtonProps {
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  className?: string;
  variant?: "primary" | "secondary" | "danger" | "ghost";
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
}

export default function KnouxButton({
  children,
  onClick,
  className = "",
  variant = "primary",
  disabled = false,
  type = "button",
}: KnouxButtonProps) {
  let styleClass = "";
  switch (variant) {
    case "primary":
      styleClass = "bg-gradient-to-r from-knoux-purple to-knoux-neon text-white shadow-knoux-glow hover:brightness-110";
      break;
    case "secondary":
      styleClass = "border border-knoux-purple/20 bg-white text-knoux-purple hover:bg-knoux-purple/5";
      break;
    case "danger":
      styleClass = "bg-rose-500 hover:bg-rose-600 text-white shadow-sm";
      break;
    case "ghost":
      styleClass = "text-knoux-muted-text hover:text-knoux-purple hover:bg-knoux-purple/5";
      break;
  }

  return (
    <motion.button
      type={type}
      disabled={disabled}
      whileTap={disabled ? {} : { scale: 0.98 }}
      onClick={onClick}
      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none ${styleClass} ${className}`}
    >
      {children}
    </motion.button>
  );
}
