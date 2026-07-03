/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { motion } from "motion/react";

interface GlassPanelProps {
  children: React.ReactNode;
  className?: string;
  variant?: "white" | "lavender";
  onClick?: () => void;
  hoverable?: boolean;
}

export default function GlassPanel({
  children,
  className = "",
  variant = "white",
  onClick,
  hoverable = false,
}: GlassPanelProps) {
  const baseClass = variant === "lavender" ? "knoux-glass-lavender" : "knoux-glass-panel";
  const hoverClass = hoverable ? "knoux-card-hover cursor-pointer" : "";

  return (
    <motion.div
      whileHover={hoverable ? { scale: 1.006, y: -1 } : {}}
      onClick={onClick}
      className={`${baseClass} ${hoverClass} p-5 rounded-3xl ${className}`}
    >
      {children}
    </motion.div>
  );
}
