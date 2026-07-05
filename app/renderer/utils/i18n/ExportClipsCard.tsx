import React from 'react';
import { Download } from 'lucide-react';
import i18n from '../../utils/i18n';
import { exportClipsToMarkdown, triggerDownload } from '../../services/exportService';
import { ClipboardItem } from '../../types';

// Dummy data for demonstration as we don't have access to real state
const dummyClips: Partial<ClipboardItem>[] = [
  {
    content: 'console.log("Hello, World!");',
    type: 'text',
    source: 'VS Code',
    createdAt: new Date().toISOString(),
    // classifiedType: { language: 'javascript' } // This structure is not in the provided types
  },
  {
    content: 'This is a sample text clip for markdown export.',
    type: 'text',
    source: 'Notepad',
    createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
  }
];

export function ExportClipsCard() {
  const t = (key: string, fallback: string) => i18n.t(key, fallback);

  const handleExport = () => {
    // In a real app, you would get selected clips from state
    const markdownContent = exportClipsToMarkdown(dummyClips);
    triggerDownload(markdownContent, `knoux-export-${Date.now()}.md`, 'text/markdown');
  };

  return (
    <div className="bg-white/60 dark:bg-slate-800/50 backdrop-blur-xl border border-slate-200 dark:border-slate-700/80 rounded-3xl shadow-sm transition-all hover:shadow-lg hover:border-violet-200 dark:hover:border-violet-700">
      <div className="p-6">
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">{t('export.clips.title', 'Export Clips')}</h3>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{t('export.clips.description', 'Export your selected clipboard items to various formats.')}</p>
      </div>
      <div className="px-6 pb-6">
        <button onClick={handleExport} className="w-full h-14 rounded-xl border border-violet-200 dark:border-violet-800 text-violet-600 dark:text-violet-300 text-sm font-bold flex items-center justify-center gap-3 bg-violet-50 dark:bg-violet-500/10 hover:bg-violet-100 dark:hover:bg-violet-500/20 transition-all">
          <Download className="w-5 h-5" />
          <span>{t('export.clips.toMarkdown', 'Export to Markdown')}</span>
        </button>
      </div>
    </div>
  );
}