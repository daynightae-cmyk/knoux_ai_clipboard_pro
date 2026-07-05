/**
 * Knoux AI Clipboard Pro — Status-color mapping utilities
 *
 * Consolidates the getStatusColor / getStatusBg switch blocks that were
 * duplicated across Dashboard, SystemBar, ServiceTester, etc.
 */

const SERVICE_STATUS_TEXT: Record<string, string> = {
  active: 'text-green-400',
  healthy: 'text-green-400',
  ready: 'text-green-400',
  success: 'text-green-500',
  idle: 'text-yellow-400',
  warning: 'text-yellow-400',
  testing: 'text-yellow-500',
  error: 'text-red-400',
  critical: 'text-red-400',
  failed: 'text-red-500',
};

const SERVICE_STATUS_BG: Record<string, string> = {
  active: 'bg-green-500/10 border-green-500/30',
  healthy: 'bg-green-500/10 border-green-500/30',
  ready: 'bg-green-500/10 border-green-500/30',
  success: 'bg-green-500/10 border-green-500/30',
  idle: 'bg-yellow-500/10 border-yellow-500/30',
  warning: 'bg-yellow-500/10 border-yellow-500/30',
  testing: 'bg-yellow-500/10 border-yellow-500/30',
  error: 'bg-red-500/10 border-red-500/30',
  critical: 'bg-red-500/10 border-red-500/30',
  failed: 'bg-red-500/10 border-red-500/30',
};

const SERVICE_STATUS_ICON: Record<string, string> = {
  success: '✓',
  failed: '✗',
  testing: '⟳',
};

export function getStatusColor(status: string): string {
  return SERVICE_STATUS_TEXT[status] ?? 'text-gray-400';
}

export function getStatusBg(status: string): string {
  return SERVICE_STATUS_BG[status] ?? 'bg-gray-500/10 border-gray-500/30';
}

export function getStatusIcon(status: string): string {
  return SERVICE_STATUS_ICON[status] ?? '○';
}
