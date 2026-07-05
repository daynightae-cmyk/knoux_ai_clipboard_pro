import React, { useState } from 'react';
import { Shield, Scan, AlertTriangle, X } from 'lucide-react';
import i18n from '../../utils/i18n';

interface FoundIssue {
  type: string;
  value: string;
  location: {
    line: number;
    column: number;
  };
}

const SENSITIVE_PATTERNS = [
  { type: 'api_key', regex: /(sk|pk)_[a-zA-Z0-9]{20,}/g },
  { type: 'private_key', regex: /-----BEGIN (RSA|EC|OPENSSH) PRIVATE KEY-----[\s\S]*?-----END (RSA|EC|OPENSSH) PRIVATE KEY-----/g },
  { type: 'credit_card', regex: /\b(?:\d[ -]*?){13,16}\b/g },
  { type: 'jwt', regex: /eyJ[a-zA-Z0-9_-]{5,}\.eyJ[a-zA-Z0-9_-]{5,}\.[a-zA-Z0-9_-]*/g },
];

export function SensitiveDataScannerCard() {
  const t = (key: string, fallback: string, params?: any) => i18n.t(key, fallback, params);
  const [input, setInput] = useState('');
  const [issues, setIssues] = useState<FoundIssue[]>([]);
  const [isScanned, setIsScanned] = useState(false);

  const getLineAndColumn = (text: string, index: number) => {
    const precedingText = text.substring(0, index);
    const lines = precedingText.split('\n');
    const line = lines.length;
    const column = lines[lines.length - 1].length + 1;
    return { line, column };
  };

  const handleScan = () => {
    const found: FoundIssue[] = [];
    SENSITIVE_PATTERNS.forEach(pattern => {
      let match;
      while ((match = pattern.regex.exec(input)) !== null) {
        found.push({
          type: pattern.type,
          value: match[0].length > 50 ? `${match[0].substring(0, 25)}...${match[0].substring(match[0].length - 25)}` : match[0],
          location: getLineAndColumn(input, match.index),
        });
      }
    });
    setIssues(found);
    setIsScanned(true);
  };

  const handleClear = () => {
    setInput('');
    setIssues([]);
    setIsScanned(false);
  };

  return (
    <div className="bg-white/60 dark:bg-slate-800/50 backdrop-blur-xl border border-slate-200 dark:border-slate-700/80 rounded-3xl shadow-sm transition-all hover:shadow-lg hover:border-violet-200 dark:hover:border-violet-700">
      <div className="p-6">
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">{t('security.scanner.title', 'Sensitive Data Scanner')}</h3>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{t('security.scanner.description', 'Scan text for potential secrets like API keys, private keys, or credit card numbers.')}</p>
      </div>
      <div className="px-6 pb-6 space-y-4">
        <div>
          <label htmlFor="scanner-input" className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400">{t('security.scanner.inputLabel', 'Text to Scan')}</label>
          <textarea id="scanner-input" value={input} onChange={(e) => setInput(e.target.value)} placeholder={t('security.scanner.placeholder', 'Paste text here to scan for sensitive data...')} className="mt-2 w-full h-40 p-3 rounded-lg bg-white dark:bg-slate-900/50 border border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition text-sm font-mono" />
        </div>
        
        {isScanned && (
          <div>
            <h4 className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400">{t('security.scanner.results', 'Scan Results')}</h4>
            {issues.length > 0 ? (
              <div className="mt-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50">
                <p className="text-sm font-bold text-amber-800 dark:text-amber-300 flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> {t('security.scanner.found', 'Found {count} potential issue(s).', { count: issues.length })}</p>
                <div className="mt-3 max-h-60 overflow-y-auto pr-2">
                  <table className="w-full text-xs">
                    <thead><tr className="text-left text-slate-500 dark:text-slate-400"><th className="py-1 pr-2">{t('security.scanner.issueType', 'Type')}</th><th className="py-1 pr-2">{t('security.scanner.issueValue', 'Matched Value')}</th><th className="py-1">{t('security.scanner.issueLocation', 'Location')}</th></tr></thead>
                    <tbody>{issues.map((issue, index) => (<tr key={index} className="border-t border-amber-200 dark:border-amber-800/50 font-mono text-amber-700 dark:text-amber-400"><td className="py-2 pr-2 capitalize">{t(`security.types.${issue.type}`, issue.type.replace('_', ' '))}</td><td className="py-2 pr-2 break-all">{issue.value}</td><td className="py-2">L{issue.location.line}:C{issue.location.column}</td></tr>))}</tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="mt-2 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/50 text-sm text-emerald-800 dark:text-emerald-300 flex items-center gap-2"><Shield className="w-4 h-4" /><span>{t('security.scanner.noData', 'No sensitive data found.')}</span></div>
            )}
          </div>
        )}
      </div>
      <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700/80 flex items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-800/20 rounded-b-3xl">
        <button onClick={handleScan} disabled={!input} className="flex-1 px-4 py-2 rounded-lg bg-violet-600 text-white text-sm font-bold flex items-center justify-center gap-2 hover:bg-violet-700 transition-all shadow-md hover:shadow-lg disabled:bg-slate-300 dark:disabled:bg-slate-600 disabled:cursor-not-allowed disabled:shadow-none"><Scan className="w-4 h-4" /><span>{t('security.scanner.scan', 'Scan Text')}</span></button>
        <button onClick={handleClear} className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-sm font-bold flex items-center justify-center gap-2 hover:bg-slate-200 dark:hover:bg-slate-600 transition-all" title={t('common.clear', 'Clear')}><X className="w-4 h-4" /></button>
      </div>
    </div>
  );
}