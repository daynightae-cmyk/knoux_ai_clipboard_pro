/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export default function SectionHeader({
  title,
  subtitle,
  icon,
  action,
  className = "",
}: SectionHeaderProps) {
  return (
    <div className={`flex items-center justify-between px-1 ${className}`}>
      <div className="space-y-0.5">
        <h3 className="text-sm font-bold text-knoux-dark-text tracking-tight flex items-center gap-1.5">
          {icon}
          <span>{title}</span>
        </h3>
        {subtitle && (
          <p className="text-[11px] text-knoux-muted-text/80 leading-snug">
            {subtitle}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
