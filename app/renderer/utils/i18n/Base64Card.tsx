import React, { useState } from 'react';
import { Copy, X, AlertTriangle } from 'lucide-react';
import i18n from '../../utils/i18n';
import { copyToClipboard } from '../../../shared/clipboard-utils';

export function Base64Card() {
  const t = (key: string, fallback: string) => i18n.t(key, fallback);
  const [plainText, setPlainText] = useState('');
  const [base64Text, setBase64Text] = useState('');
  const [error, setError] = useState('');

  const handleEncode = () => {
    setError('');
    if (!plainText.trim()) {
      setBase64Text('');
      return;
    }
    try {
      const encoded = btoa(unescape(encodeURIComponent(plainText)));
      setBase64Text(encoded);
    } catch (e) {
      setError('Could not encode text. Ensure it is valid UTF-8.');
    }
  };

  const handleDecode = () => {
    setError('');
    if (!base64Text.trim()) {
      setPlainText('');
      return;
    }
    try {
      const decoded = decodeURIComponent(escape(atob(base64Text)));
      setPlainText(decoded);
    } catch (e) {
      setError(t('studio.base64.error', 'Invalid Base64 string for decoding.'));
    }
  };

  const handleClear = () => {
    setPlainText('');
    setBase64Text('');
    setError('');
  };

  const handleCopy = (text: string) => {
    if (text) {
      copyToClipboard(text);
    }
  };

  return (
    <div className="bg-white/60 dark:bg-slate-800/50 backdrop-blur-xl border border-slate-200 dark:border-slate-700/80 rounded-3xl shadow-sm transition-all hover:shadow-lg hover:border-violet-200 dark:hover:border-violet-700">
      <div className="p-6"><h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">{t('studio.base64.title', 'Base64 Encoder / Decoder')}</h3><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{t('studio.base64.description', 'Encode text to Base64 or decode Base64 back to text.')}</p></div>
      <div className="px-6 pb-6 space-y-4">
        <div><label htmlFor="b64-plain" className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400">{t('studio.base64.plainLabel', 'Plain Text')}</label><div className="relative"><textarea id="b64-plain" value={plainText} onChange={(e) => setPlainText(e.target.value)} className="mt-2 w-full h-28 p-3 pr-10 rounded-lg bg-white dark:bg-slate-900/50 border border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition text-sm font-mono" /><button onClick={() => handleCopy(plainText)} disabled={!plainText} className="absolute top-4 right-2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 disabled:opacity-30" title={t('common.copy', 'Copy')}><Copy className="w-4 h-4" /></button></div></div>
        <div className="flex justify-center items-center gap-4"><button onClick={handleEncode} className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-sm font-bold flex items-center justify-center gap-2 hover:bg-slate-200 dark:hover:bg-slate-600 transition-all"><span>{t('studio.base64.encode', 'Encode')} &darr;</span></button><button onClick={handleDecode} className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-sm font-bold flex items-center justify-center gap-2 hover:bg-slate-200 dark:hover:bg-slate-600 transition-all"><span>&uarr; {t('studio.base64.decode', 'Decode')}</span></button></div>
        <div><label htmlFor="b64-encoded" className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400">{t('studio.base64.base64Label', 'Base64')}</label><div className="relative"><textarea id="b64-encoded" value={base64Text} onChange={(e) => setBase64Text(e.target.value)} className="mt-2 w-full h-28 p-3 pr-10 rounded-lg bg-white dark:bg-slate-900/50 border border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition text-sm font-mono" /><button onClick={() => handleCopy(base64Text)} disabled={!base64Text} className="absolute top-4 right-2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 disabled:opacity-30" title={t('common.copy', 'Copy')}><Copy className="w-4 h-4" /></button></div></div>
        {error && (<div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800/50 text-xs text-rose-800 dark:text-rose-300 flex items-center gap-2"><AlertTriangle className="w-4 h-4 shrink-0" /><span>{error}</span></div>)}
      </div>
      <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700/80 flex items-center justify-end gap-3 bg-slate-50/50 dark:bg-slate-800/20 rounded-b-3xl"><button onClick={handleClear} className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-sm font-bold flex items-center justify-center gap-2 hover:bg-slate-200 dark:hover:bg-slate-600 transition-all" title={t('common.clear', 'Clear')}><X className="w-4 h-4" /></button></div>
    </div>
  );
}