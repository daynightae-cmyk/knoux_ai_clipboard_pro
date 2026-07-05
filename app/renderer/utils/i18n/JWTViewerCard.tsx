import React, { useState, useMemo } from 'react';
import { Copy, X, Lock, AlertTriangle } from 'lucide-react';
import i18n from '../../utils/i18n';

// Helper to decode Base64Url
function base64UrlDecode(str: string): string {
  let output = str.replace(/-/g, '+').replace(/_/g, '/');
  switch (output.length % 4) {
    case 0:
      break;
    case 2:
      output += '==';
      break;
    case 3:
      output += '=';
      break;
    default:
      throw new Error('Illegal base64url string!');
  }
  try {
    return decodeURIComponent(
      atob(output)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
  } catch (e) {
    return atob(output); // Fallback for non-UTF8 strings
  }
}

export function JWTViewerCard() {
  const t = (key: string, fallback: string) => i18n.t(key, fallback);
  const [jwt, setJwt] = useState('');
  const [error, setError] = useState('');

  const decoded = useMemo(() => {
    if (!jwt.trim()) {
      setError('');
      return null;
    }
    const parts = jwt.split('.');
    if (parts.length !== 3) {
      setError(t('studio.jwtViewer.errorInvalid', 'Invalid JWT structure. It must have 3 parts separated by dots.'));
      return null;
    }
    try {
      const header = JSON.parse(base64UrlDecode(parts[0]));
      const payload = JSON.parse(base64UrlDecode(parts[1]));
      setError('');
      return { header, payload, signature: parts[2] };
    } catch (e) {
      setError(t('studio.jwtViewer.errorDecode', 'Failed to decode or parse JWT. Check if it is a valid token.'));
      return null;
    }
  }, [jwt, t]);

  const handleClear = () => {
    setJwt('');
    setError('');
  };

  const handleCopy = (content: object) => {
    navigator.clipboard.writeText(JSON.stringify(content, null, 2));
  };

  return (
    <div className="bg-white/60 dark:bg-slate-800/50 backdrop-blur-xl border border-slate-200 dark:border-slate-700/80 rounded-3xl shadow-sm transition-all hover:shadow-lg hover:border-violet-200 dark:hover:border-violet-700">
      <div className="p-6">
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">{t('studio.jwtViewer.title', 'JWT Viewer')}</h3>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{t('studio.jwtViewer.description', 'Decode and inspect JSON Web Tokens locally.')}</p>
      </div>
      <div className="px-6 pb-6 space-y-4">
        <div>
          <label htmlFor="jwt-input" className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400">{t('studio.jwtViewer.inputLabel', 'JWT Token')}</label>
          <textarea id="jwt-input" value={jwt} onChange={(e) => setJwt(e.target.value)} placeholder={t('studio.jwtViewer.placeholder', 'Paste your JWT here...')} className="mt-2 w-full h-24 p-3 rounded-lg bg-white dark:bg-slate-900/50 border border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition text-sm font-mono" />
        </div>
        {error && (
          <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800/50 text-xs text-rose-800 dark:text-rose-300 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {decoded && (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 flex justify-between items-center">
                <span>{t('studio.jwtViewer.headerLabel', 'Header')}</span>
                <button onClick={() => handleCopy(decoded.header)} className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200" title={t('common.copy', 'Copy')}><Copy className="w-4 h-4" /></button>
              </label>
              <pre className="mt-2 w-full p-3 rounded-lg bg-slate-100 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-700 font-mono text-sm overflow-auto"><code>{JSON.stringify(decoded.header, null, 2)}</code></pre>
            </div>
            <div>
              <label className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 flex justify-between items-center">
                <span>{t('studio.jwtViewer.payloadLabel', 'Payload')}</span>
                <button onClick={() => handleCopy(decoded.payload)} className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200" title={t('common.copy', 'Copy')}><Copy className="w-4 h-4" /></button>
              </label>
              <pre className="mt-2 w-full p-3 rounded-lg bg-slate-100 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-700 font-mono text-sm overflow-auto max-h-60"><code>{JSON.stringify(decoded.payload, null, 2)}</code></pre>
            </div>
            <div className="p-3 rounded-lg bg-sky-50 dark:bg-sky-900/20 border border-sky-200 dark:border-sky-800/50 text-xs text-sky-800 dark:text-sky-300 flex items-center gap-2">
              <Lock className="w-4 h-4 shrink-0" />
              <span>{t('studio.jwtViewer.signatureNotice', 'Signature verification is a guarded action and requires a secret key. This tool only decodes the token.')}</span>
            </div>
          </div>
        )}
      </div>
      <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700/80 flex items-center justify-end gap-3 bg-slate-50/50 dark:bg-slate-800/20 rounded-b-3xl">
        <button onClick={handleClear} className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-sm font-bold flex items-center justify-center gap-2 hover:bg-slate-200 dark:hover:bg-slate-600 transition-all" title={t('common.clear', 'Clear')}><X className="w-4 h-4" /></button>
      </div>
    </div>
  );
}