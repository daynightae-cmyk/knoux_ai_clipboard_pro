/**
 * Loading Overlay Component
 * Shows a loading spinner during app initialization
 */

import React from 'react';

export function LoadingOverlay({ visible }: { visible?: boolean }) {
  if (!visible) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4 text-center text-gray-700">Loading...</p>
      </div>
    </div>
  );
}
