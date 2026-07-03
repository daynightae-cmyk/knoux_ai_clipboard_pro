/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

interface FilterChipProps {
  label: string;
  selected: boolean;
  onClick: () => void;
  className?: string;
  count?: number;
}

export default function FilterChip({
  label,
  selected,
  onClick,
  className = "",
  count,
}: FilterChipProps) {
  const selectedClass = selected
    ? "bg-gradient-to-r from-knoux-purple to-knoux-neon text-white border-transparent font-bold"
    : "border-knoux-purple/5 bg-[#FCFAFF] hover:border-knoux-purple/15 text-knoux-muted-text hover:text-knoux-purple";

  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-xl border text-xs transition-all cursor-pointer active:scale-95 flex items-center gap-1.5 select-none ${selectedClass} ${className}`}
    >
      <span>{label}</span>
      {count !== undefined && (
        <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full ${
          selected ? "bg-white/20 text-white" : "bg-knoux-purple/5 text-knoux-purple"
        }`}>
          {count}
        </span>
      )}
    </button>
  );
}
