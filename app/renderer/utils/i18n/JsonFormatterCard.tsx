import React, { useState } from 'react';
import { Copy, X, Wand2, AlertTriangle } from 'lucide-react';
import i18n from '../../utils/i18n';
import { copyToClipboard } from '../../../shared/clipboard-utils';

export function JsonFormatterCard() {
  const t = (key: string, fallback: string) => i18n.t(key, fallback);
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');

  const handleFormat = () => {
    setError('');
    setOutput('');
    if (!input.trim()) {
      return;
    }
    try {
      const parsed = JSON.parse(input);
      const formatted = JSON.stringify(parsed, null, 2);
      setOutput(formatted);
    } catch (e: any) {
      setError(t('studio.jsonFormatter.error', 'Invalid JSON format.'));
    }
  };

  const handleClear = () => {
    setInput('');
    setOutput('');
    setError('');
  };

  const handleCopy = () => {
    if (output) {
      copyToClipboard(output);
    }
  };

  return (
    <div className="bg-white/60 dark:bg-slate-800/50 backdrop-blur-xl border border-slate-200 dark:border-slate-700/80 rounded-3xl shadow-sm transition-all hover:shadow-lg hover:border-violet-200 dark:hover:border-violet-700">
      <div className="p-6">
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">{t('studio.jsonFormatter.title', 'JSON Formatter')}</h3>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{t('studio.jsonFormatter.description', 'Paste your JSON data to format it beautifully.')}</p>
      </div>
      <div className="px-6 pb-6 space-y-4">
        <div>
          <label htmlFor="json-input" className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400">{t('studio.jsonFormatter.inputLabel', 'Input')}</label>
          <textarea id="json-input" value={input} onChange={(e) => setInput(e.target.value)} placeholder={t('studio.jsonFormatter.placeholder', 'Paste JSON here...')} className="mt-2 w-full h-32 p-3 rounded-lg bg-white dark:bg-slate-900/50 border border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition text-sm font-mono" />
        </div>
        {error && (
          <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800/50 text-xs text-rose-800 dark:text-rose-300 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {output && (
          <div>
            <label htmlFor="json-output" className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400">{t('studio.jsonFormatter.outputLabel', 'Formatted Output')}</label>
            <textarea id="json-output" value={output} readOnly className="mt-2 w-full h-48 p-3 rounded-lg bg-slate-100 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-700 font-mono text-sm" />
          </div>
        )}
      </div>
      <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700/80 flex items-center gap-3 bg-slate-50/50 dark:bg-slate-800/20 rounded-b-3xl">
        <button onClick={handleFormat} className="flex-1 px-4 py-2 rounded-lg bg-violet-600 text-white text-sm font-bold flex items-center justify-center gap-2 hover:bg-violet-700 transition-all shadow-md hover:shadow-lg disabled:bg-slate-300 dark:disabled:bg-slate-600 disabled:cursor-not-allowed disabled:shadow-none"><Wand2 className="w-4 h-4" /><span>{t('studio.jsonFormatter.format', 'Format')}</span></button>
        <button onClick={handleCopy} disabled={!output} className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-sm font-bold flex items-center justify-center gap-2 hover:bg-slate-200 dark:hover:bg-slate-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed" title={t('common.copy', 'Copy')}><Copy className="w-4 h-4" /></button>
        <button onClick={handleClear} className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-sm font-bold flex items-center justify-center gap-2 hover:bg-slate-200 dark:hover:bg-slate-600 transition-all" title={t('common.clear', 'Clear')}><X className="w-4 h-4" /></button>
      </div>
    </div>
  );
}