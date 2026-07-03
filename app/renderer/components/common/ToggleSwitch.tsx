/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from "motion/react";

interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
  activeColor?: string;
}

export default function ToggleSwitch({
  checked,
  onChange,
  className = "",
  activeColor = "bg-knoux-purple",
}: ToggleSwitchProps) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`w-11 h-6 rounded-full transition-all flex items-center cursor-pointer p-0.5 ${
        checked ? activeColor : "bg-knoux-purple/20"
      } ${className}`}
    >
      <motion.div
        layout
        className="w-5 h-5 rounded-full bg-white shadow-sm"
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      />
    </button>
  );
}
