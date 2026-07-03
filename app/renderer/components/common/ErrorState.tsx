/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AlertTriangle } from "lucide-react";

interface ErrorStateProps {
  title?: string;
  message: string;
  className?: string;
}

export default function ErrorState({
  title = "System Security Breach Prevention Triggered",
  message,
  className = "",
}: ErrorStateProps) {
  return (
    <div className={`p-6 border border-rose-100 bg-rose-50/50 rounded-2xl flex items-start gap-3 text-left ${className}`}>
      <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
      <div className="space-y-1">
        <span className="text-xs font-extrabold text-rose-800 uppercase tracking-wide">
          {title}
        </span>
        <p className="text-[11px] text-rose-700 leading-normal">
          {message}
        </p>
      </div>
    </div>
  );
}
