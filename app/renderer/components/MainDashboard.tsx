import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity,
  Brain,
  ClipboardList,
  FlaskConical,
  Gauge,
  Info,
  RefreshCcw,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Zap
} from 'lucide-react';
import { useClipboard } from '../hooks/useClipboard';
import { useAI } from '../hooks/useAI-simple';

type DashboardTab = 'overview' | 'clipboard' | 'ai' | 'labs';

type ServiceStatus = 'checking' | 'ready' | 'degraded' | 'offline';

const labs = [
  'Creative Studio',
  'Voice Commands',
  'Offline AI',
  'Analytics',
  'Pattern Recognition',
  'Quantum Security',
  'Blockchain Security',
  'AR/VR Workspace',
  'UI Morpher',
  'Service Tester'
];

export const MainDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview');
  const [status, setStatus] = useState<Record<string, ServiceStatus>>({
    clipboard: 'checking',
    ai: 'checking',
    storage: 'checking'
  });
  const [aiInput, setAiInput] = useState('Summarize this clipboard workspace into a productivity action list.');
  const [aiOutput, setAiOutput] = useState<string | null>(null);

  const {
    items: clipboardItems,
    isLoading: clipboardLoading,
    error: clipboardError,
    refresh: refreshClipboard
  } = useClipboard();

  const {
    isProcessing: aiProcessing,
    error: aiError,
    summarize,
    enhance
  } = useAI();

  useEffect(() => {
    const checkServices = async () => {
      const nextStatus: Record<string, ServiceStatus> = {
        clipboard: 'offline',
        ai: 'offline',
        storage: 'offline'
      };

      try {
        const response = await window.knoux?.clipboard?.read?.();
        nextStatus.clipboard = response?.ok || response?.success ? 'ready' : 'degraded';
      } catch {
        nextStatus.clipboard = 'offline';
      }

      try {
        const response = await window.knoux?.ai?.summarize?.('KNOUX health check');
        nextStatus.ai = response?.ok || response?.success ? 'ready' : 'degraded';
      } catch {
        nextStatus.ai = 'offline';
      }

      try {
        const response = await window.knoux?.storage?.get?.('knoux-health-check');
        nextStatus.storage = response?.ok || response?.success ? 'ready' : 'degraded';
      } catch {
        nextStatus.storage = 'offline';
      }

      setStatus(nextStatus);
    };

    checkServices();
  }, []);

  const latestItems = useMemo(() => clipboardItems.slice(0, 5), [clipboardItems]);
  const readyCount = Object.values(status).filter(value => value === 'ready').length;

  const runAiSummary = async () => {
    const result = await summarize(aiInput);
    setAiOutput(result);
  };

  const runAiEnhance = async () => {
    const result = await enhance(aiInput, { tone: 'professional', brand: 'KNOUX' });
    setAiOutput(result);
  };

  return (
    <div className="min-h-screen bg-[#090014] text-white">
      <div className="flex min-h-screen">
        <aside className="hidden w-72 shrink-0 border-r border-white/10 bg-white/[0.035] p-5 backdrop-blur-xl lg:block">
          <div className="mb-8 rounded-3xl border border-white/10 bg-gradient-to-br from-[#8A2BE2]/30 to-white/[0.04] p-5">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.28em] text-[#D8B8EC]">KNOUX</p>
            <h1 className="text-2xl font-black leading-tight">AI Clipboard Pro</h1>
            <p className="mt-3 text-sm leading-6 text-white/55">Production workspace for secure clipboard intelligence.</p>
          </div>

          <nav className="space-y-2">
            <NavButton icon={Gauge} label="Overview" active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
            <NavButton icon={ClipboardList} label="Clipboard" active={activeTab === 'clipboard'} onClick={() => setActiveTab('clipboard')} />
            <NavButton icon={Brain} label="AI Tools" active={activeTab === 'ai'} onClick={() => setActiveTab('ai')} />
            <NavButton icon={FlaskConical} label="Labs" active={activeTab === 'labs'} onClick={() => setActiveTab('labs')} />
          </nav>

          <div className="mt-8 space-y-2 border-t border-white/10 pt-5">
            <NavButton icon={Settings} label="Settings" active={false} onClick={() => navigate('/settings')} />
            <NavButton icon={Info} label="About KNOUX" active={false} onClick={() => navigate('/about')} />
          </div>
        </aside>

        <main className="flex-1 overflow-auto p-5 lg:p-8">
          <header className="mb-8 flex flex-col gap-4 rounded-[28px] border border-white/10 bg-white/[0.045] p-6 backdrop-blur-xl lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.32em] text-[#D8B8EC]">A KNOUX PRODUCT</p>
              <h2 className="text-3xl font-black">Production Dashboard</h2>
              <p className="mt-2 text-sm text-white/55">Stable core first. Experimental modules are isolated in Labs.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button onClick={refreshClipboard} className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-sm text-white/75 transition hover:bg-white/[0.1]">
                <RefreshCcw className="h-4 w-4" /> Refresh
              </button>
              <button onClick={() => navigate('/settings')} className="inline-flex items-center gap-2 rounded-2xl bg-[#8A2BE2] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#6F2DBD]">
                <Settings className="h-4 w-4" /> Settings
              </button>
            </div>
          </header>

          {activeTab === 'overview' && (
            <section className="space-y-6">
              <div className="grid gap-4 md:grid-cols-3">
                <MetricCard title="Clipboard Items" value={clipboardLoading ? 'Loading' : clipboardItems.length.toString()} icon={ClipboardList} detail="Local history entries" />
                <MetricCard title="Services Ready" value={`${readyCount}/3`} icon={Activity} detail="Clipboard, AI, Storage" />
                <MetricCard title="AI Status" value={aiProcessing ? 'Working' : 'Ready'} icon={Sparkles} detail="Summarize and enhance" />
              </div>

              <div className="grid gap-6 xl:grid-cols-[1.1fr_.9fr]">
                <Panel title="Service Health" subtitle="IPC channels currently exposed to renderer">
                  <div className="grid gap-3 md:grid-cols-3">
                    <StatusPill label="Clipboard" status={status.clipboard} />
                    <StatusPill label="AI" status={status.ai} />
                    <StatusPill label="Storage" status={status.storage} />
                  </div>
                </Panel>

                <Panel title="Production Notes" subtitle="Current hardening scope">
                  <ul className="space-y-3 text-sm text-white/65">
                    <li className="flex gap-3"><ShieldCheck className="h-5 w-5 text-[#D8B8EC]" /> Preload APIs now use explicit compatibility wrappers.</li>
                    <li className="flex gap-3"><Zap className="h-5 w-5 text-[#D8B8EC]" /> Demo-heavy modules moved behind Labs planning.</li>
                    <li className="flex gap-3"><Search className="h-5 w-5 text-[#D8B8EC]" /> Build Gate tracks install, doctor, renderer build, and package build.</li>
                  </ul>
                </Panel>
              </div>
            </section>
          )}

          {activeTab === 'clipboard' && (
            <Panel title="Clipboard Workspace" subtitle="Recent clipboard entries from the local backend">
              {clipboardError && <Alert tone="error" message={clipboardError} />}
              {!clipboardError && latestItems.length === 0 && (
                <EmptyState title="No clipboard items yet" message="Copy content on your device, then refresh to populate the secure local history." />
              )}
              <div className="space-y-3">
                {latestItems.map((item, index) => (
                  <article key={item?.id || index} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                    <div className="mb-2 flex items-center justify-between gap-4">
                      <span className="text-xs uppercase tracking-[0.24em] text-[#D8B8EC]">Clipboard #{index + 1}</span>
                      <span className="text-xs text-white/35">{item?.type || 'text'}</span>
                    </div>
                    <p className="line-clamp-3 text-sm leading-6 text-white/70">{String(item?.content || item?.text || item?.value || 'No preview available')}</p>
                  </article>
                ))}
              </div>
            </Panel>
          )}

          {activeTab === 'ai' && (
            <Panel title="AI Productivity" subtitle="Run stable AI actions without exposing experimental modules">
              {aiError && <Alert tone="error" message={aiError} />}
              <textarea
                value={aiInput}
                onChange={(event) => setAiInput(event.target.value)}
                className="min-h-36 w-full rounded-2xl border border-white/10 bg-black/25 p-4 text-sm leading-6 text-white outline-none transition focus:border-[#A678DD]"
              />
              <div className="mt-4 flex flex-wrap gap-3">
                <button disabled={aiProcessing} onClick={runAiSummary} className="rounded-2xl bg-[#8A2BE2] px-4 py-3 text-sm font-semibold transition hover:bg-[#6F2DBD] disabled:cursor-not-allowed disabled:opacity-50">Summarize</button>
                <button disabled={aiProcessing} onClick={runAiEnhance} className="rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-sm font-semibold transition hover:bg-white/[0.1] disabled:cursor-not-allowed disabled:opacity-50">Enhance</button>
              </div>
              {aiOutput && <div className="mt-5 rounded-2xl border border-[#A678DD]/30 bg-[#8A2BE2]/10 p-4 text-sm leading-6 text-white/75">{aiOutput}</div>}
            </Panel>
          )}

          {activeTab === 'labs' && (
            <Panel title="Labs" subtitle="Experimental modules are isolated here until individually verified">
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {labs.map((name) => (
                  <div key={name} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                    <p className="font-semibold text-white">{name}</p>
                    <p className="mt-2 text-xs leading-5 text-white/50">Disabled from the production shell until build, IPC, and UX verification are complete.</p>
                  </div>
                ))}
              </div>
            </Panel>
          )}
        </main>
      </div>
    </div>
  );
};

const NavButton: React.FC<{
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  active: boolean;
  onClick: () => void;
}> = ({ icon: Icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm transition ${
      active ? 'bg-[#8A2BE2] text-white shadow-lg shadow-[#8A2BE2]/20' : 'text-white/60 hover:bg-white/[0.06] hover:text-white'
    }`}
  >
    <Icon className="h-4 w-4" />
    <span>{label}</span>
  </button>
);

const MetricCard: React.FC<{
  title: string;
  value: string;
  detail: string;
  icon: React.ComponentType<{ className?: string }>;
}> = ({ title, value, detail, icon: Icon }) => (
  <div className="rounded-[24px] border border-white/10 bg-white/[0.045] p-5 backdrop-blur-xl">
    <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#8A2BE2]/20 text-[#D8B8EC] ring-1 ring-[#A678DD]/25">
      <Icon className="h-5 w-5" />
    </div>
    <p className="text-sm text-white/50">{title}</p>
    <p className="mt-2 text-3xl font-black text-white">{value}</p>
    <p className="mt-2 text-xs text-white/40">{detail}</p>
  </div>
);

const Panel: React.FC<{
  title: string;
  subtitle: string;
  children: React.ReactNode;
}> = ({ title, subtitle, children }) => (
  <section className="rounded-[28px] border border-white/10 bg-white/[0.045] p-6 backdrop-blur-xl">
    <div className="mb-5">
      <h3 className="text-xl font-bold text-white">{title}</h3>
      <p className="mt-1 text-sm text-white/45">{subtitle}</p>
    </div>
    {children}
  </section>
);

const StatusPill: React.FC<{ label: string; status: ServiceStatus }> = ({ label, status }) => {
  const color = status === 'ready' ? 'bg-emerald-400' : status === 'degraded' ? 'bg-amber-400' : status === 'checking' ? 'bg-sky-400' : 'bg-red-400';
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <div className="mb-2 flex items-center gap-2">
        <span className={`h-2.5 w-2.5 rounded-full ${color}`} />
        <span className="text-sm font-semibold text-white">{label}</span>
      </div>
      <p className="text-xs uppercase tracking-[0.2em] text-white/40">{status}</p>
    </div>
  );
};

const EmptyState: React.FC<{ title: string; message: string }> = ({ title, message }) => (
  <div className="rounded-2xl border border-dashed border-white/15 bg-black/20 p-8 text-center">
    <p className="text-lg font-bold text-white">{title}</p>
    <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-white/50">{message}</p>
  </div>
);

const Alert: React.FC<{ tone: 'error'; message: string }> = ({ message }) => (
  <div className="mb-4 rounded-2xl border border-red-400/30 bg-red-500/10 p-4 text-sm text-red-100">{message}</div>
);

export default MainDashboard;
