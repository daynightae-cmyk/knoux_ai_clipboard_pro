/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

interface StatusPillProps {
  label: string;
  status?: "success" | "warning" | "error" | "info" | "brand";
  className?: string;
}

export default function StatusPill({
  label,
  status = "info",
  className = "",
}: StatusPillProps) {
  let styleClass = "";
  switch (status) {
    case "success":
      styleClass = "bg-emerald-50 text-emerald-700 border-emerald-100";
      break;
    case "warning":
      styleClass = "bg-amber-50 text-amber-700 border-amber-100";
      break;
    case "error":
      styleClass = "bg-rose-50 text-rose-700 border-rose-100";
      break;
    case "info":
      styleClass = "bg-blue-50 text-blue-700 border-blue-100";
      break;
    case "brand":
      styleClass = "bg-knoux-purple/5 text-knoux-purple border-knoux-purple/10";
      break;
  }

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold border uppercase tracking-wider ${styleClass} ${className}`}>
      {label}
    </span>
  );
}
