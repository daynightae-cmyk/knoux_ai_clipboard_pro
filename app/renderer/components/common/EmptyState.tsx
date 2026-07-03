/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export default function EmptyState({
  title,
  description,
  icon,
  action,
  className = "",
}: EmptyStateProps) {
  return (
    <div className={`p-8 text-center border border-dashed border-knoux-purple/15 rounded-3xl bg-white/40 flex flex-col items-center justify-center ${className}`}>
      {icon && <div className="mb-3 text-knoux-purple/40">{icon}</div>}
      <span className="text-xs font-bold text-knoux-dark-text block">{title}</span>
      <p className="text-[10px] text-knoux-muted-text mt-1 max-w-xs mx-auto leading-relaxed">
        {description}
      </p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
