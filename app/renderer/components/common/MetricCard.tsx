/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { motion } from "motion/react";

interface MetricCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  colorClass?: string;
  className?: string;
}

export default function MetricCard({
  label,
  value,
  icon,
  colorClass = "text-knoux-purple bg-knoux-purple/5 border-knoux-purple/10",
  className = "",
}: MetricCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-4 rounded-2xl bg-white border border-knoux-purple/5 shadow-sm flex flex-col justify-between min-h-[100px] ${className}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-medium text-knoux-muted-text/80 tracking-wide">
          {label}
        </span>
        {icon && (
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center border ${colorClass}`}>
            {icon}
          </div>
        )}
      </div>
      <div className="text-xl sm:text-2xl font-black text-knoux-dark-text mt-2 font-mono">
        {value}
      </div>
    </motion.div>
  );
}
