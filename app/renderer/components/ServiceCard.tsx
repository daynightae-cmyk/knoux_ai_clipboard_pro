import React, { useState } from 'react';
import { ProductionService, ServiceStatus } from '../services/productionCatalog';
import { CheckCircle, AlertTriangle, Zap, Settings, Copy, Play, XCircle, Clock, ShieldOff, Loader } from 'lucide-react';
import i18n from '../utils/i18n';
import { copyToClipboard } from '../../shared/clipboard-utils';

interface ServiceCardProps {
  service: ProductionService;
  onAction: (serviceId: string, action: string) => Promise<{ success: boolean; message: string }>;
}

const statusConfig: Record<ServiceStatus, { icon: React.ElementType; color: string; labelKey: string }> = {
    Active: { icon: Zap, color: 'text-emerald-500', labelKey: 'labs.cards.active' },
    Ready: { icon: CheckCircle, color: 'text-sky-500', labelKey: 'labs.cards.ready' },
    Guarded: { icon: ShieldOff, color: 'text-amber-500', labelKey: 'labs.cards.guarded' },
    Planned: { icon: Clock, color: 'text-slate-500', labelKey: 'labs.cards.planned' },
    Missing: { icon: XCircle, color: 'text-rose-500', labelKey: 'labs.cards.missing' },
    Disabled: { icon: XCircle, color: 'text-slate-400', labelKey: 'labs.cards.disabled' },
};

export function ServiceCard({ service, onAction }: ServiceCardProps) {
  const [output, setOutput] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const t = (key: string, fallback: string) => i18n.t(key, fallback);

  const handlePrimaryAction = async () => {
    setIsRunning(true);
    setOutput(null);
    setError(null);
    try {
      const result = await onAction(service.id, 'execute');
      if (result.success) {
        setOutput(result.message);
      } else {
        setError(result.message);
      }
    } catch (e: any) {
        setError(e.message || 'An unknown error occurred.');
    }
    setIsRunning(false);
  };

  const config = statusConfig[service.status] || statusConfig.Disabled;
  const Icon = config.icon;

  const isActionable = service.status === 'Active' || service.status === 'Ready';

  return (
    <div className="bg-white/60 dark:bg-slate-800/50 backdrop-blur-xl border border-slate-200 dark:border-slate-700/80 rounded-3xl p-6 shadow-sm transition-all hover:shadow-lg hover:border-violet-200 dark:hover:border-violet-700">
      <div className="flex flex-col h-full">
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">{service.displayName}</h3>
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold border ${config.color.replace('text-', 'border-').replace('500', '200 dark:border-slate-700')} ${config.color.replace('text-', 'bg-').replace('500', '50 dark:bg-slate-800')} ${config.color}`}>
            <Icon className={`w-4 h-4`} />
            <span>{t(config.labelKey, service.status)}</span>
          </div>
        </div>

        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 flex-grow">{service.description}</p>

        {(service.status === 'Guarded' || service.status === 'Planned' || service.status === 'Disabled') && (
          <div className="mt-4 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 text-xs text-amber-800 dark:text-amber-300 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{service.userFallback}</span>
          </div>
        )}

        {(output || error) && (
          <div className="mt-4 font-mono text-xs p-3 rounded-lg border bg-slate-50 dark:bg-slate-900/50 max-h-40 overflow-y-auto">
            {output && <pre className="text-emerald-600 dark:text-emerald-400 whitespace-pre-wrap">{output}</pre>}
            {error && <pre className="text-rose-600 dark:text-rose-400 whitespace-pre-wrap">{error}</pre>}
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700/80 flex items-center gap-3">
          <button onClick={handlePrimaryAction} disabled={!isActionable || isRunning} className="flex-1 px-4 py-2 rounded-lg bg-violet-600 text-white text-sm font-bold flex items-center justify-center gap-2 hover:bg-violet-700 transition-all shadow-md hover:shadow-lg disabled:bg-slate-300 dark:disabled:bg-slate-600 disabled:text-slate-500 disabled:cursor-not-allowed disabled:shadow-none">
            {isRunning ? <Loader className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            <span>{isRunning ? t('common.running', 'Running...') : t('common.execute', 'Execute')}</span>
          </button>
          <button disabled={!isActionable} className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-sm font-bold flex items-center justify-center gap-2 hover:bg-slate-200 dark:hover:bg-slate-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"><Settings className="w-4 h-4" /></button>
          <button disabled={!output} onClick={() => copyToClipboard(output || '')} className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-sm font-bold flex items-center justify-center gap-2 hover:bg-slate-200 dark:hover:bg-slate-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"><Copy className="w-4 h-4" /></button>
        </div>
      </div>
    </div>
  );
}