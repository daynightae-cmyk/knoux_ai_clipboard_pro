/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

interface TagChipProps {
  label: string;
  onClick?: () => void;
  className?: string;
  active?: boolean;
}

export default function TagChip({
  label,
  onClick,
  className = "",
  active = false,
}: TagChipProps) {
  const activeClass = active
    ? "bg-knoux-purple text-white border-transparent"
    : "bg-knoux-purple/5 text-knoux-purple border-knoux-purple/10 hover:border-knoux-purple/20";

  return (
    <button
      onClick={onClick}
      disabled={!onClick}
      className={`px-2.5 py-1 rounded-lg border text-[10px] font-bold uppercase tracking-wider transition-all select-none ${activeClass} ${
        onClick ? "cursor-pointer hover:scale-[1.03] active:scale-95" : ""
      } ${className}`}
    >
      {label}
    </button>
  );
}
