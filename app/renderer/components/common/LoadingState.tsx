/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { RefreshCw } from "lucide-react";

interface LoadingStateProps {
  message?: string;
  className?: string;
}

export default function LoadingState({
  message = "Syncing local database...",
  className = "",
}: LoadingStateProps) {
  return (
    <div className={`p-8 flex flex-col items-center justify-center space-y-3 ${className}`}>
      <RefreshCw className="w-6 h-6 text-knoux-purple animate-spin" />
      <span className="text-xs font-semibold text-knoux-muted-text font-mono animate-pulse">
        {message}
      </span>
    </div>
  );
}
