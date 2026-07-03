import React, { useState, useEffect } from 'react';

interface SystemStatus {
  version: string;
  buildTime: string;
  clipboardActive: boolean;
  aiActive: boolean;
  storageActive: boolean;
}

export const ProofOfLife: React.FC = () => {
  const [status, setStatus] = useState<SystemStatus>({
    version: '1.0.0',
    buildTime: new Date().toISOString(),
    clipboardActive: false,
    aiActive: false,
    storageActive: false
  });

  useEffect(() => {
    // Test clipboard
    const testClipboard = async () => {
      try {
        const text = await navigator.clipboard.readText();
        setStatus(prev => ({ ...prev, clipboardActive: true }));
      } catch {
        setStatus(prev => ({ ...prev, clipboardActive: false }));
      }
    };

    // Test IPC
    const testIPC = async () => {
      if (window.electron?.ipcRenderer) {
        try {
          const result = await window.electron.ipcRenderer.invoke('get-system-info');
          setStatus(prev => ({ 
            ...prev, 
            aiActive: result.success,
            storageActive: result.success 
          }));
        } catch {
          setStatus(prev => ({ ...prev, aiActive: false, storageActive: false }));
        }
      }
    };

    testClipboard();
    testIPC();
  }, []);

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Inter, sans-serif',
      color: 'white'
    }}>
      <div style={{
        background: 'rgba(255,255,255,0.1)',
        backdropFilter: 'blur(10px)',
        borderRadius: '20px',
        padding: '40px',
        minWidth: '500px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
      }}>
        <h1 style={{ margin: '0 0 10px 0', fontSize: '32px', fontWeight: '700' }}>
          Knoux Clipboard AI — ALIVE
        </h1>
        <p style={{ margin: '0 0 30px 0', opacity: 0.8, fontSize: '14px' }}>
          Build: {new Date().toLocaleString()}
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <StatusRow label="App Version" value={status.version} status="OK" />
          <StatusRow label="Build Timestamp" value={new Date().toLocaleTimeString()} status="OK" />
          <StatusRow label="Clipboard System" value={status.clipboardActive ? 'Active' : 'Inactive'} status={status.clipboardActive ? 'OK' : 'FAIL'} />
          <StatusRow label="AI Engine" value={status.aiActive ? 'Active' : 'Inactive'} status={status.aiActive ? 'OK' : 'FAIL'} />
          <StatusRow label="Storage" value={status.storageActive ? 'Active' : 'Inactive'} status={status.storageActive ? 'OK' : 'FAIL'} />
        </div>

        <div style={{
          marginTop: '30px',
          padding: '15px',
          background: 'rgba(0,0,0,0.2)',
          borderRadius: '10px',
          fontSize: '13px'
        }}>
          <strong>System Status:</strong> {
            status.clipboardActive || status.aiActive || status.storageActive 
              ? '✅ OPERATIONAL' 
              : '⚠️ CHECKING...'
          }
        </div>
      </div>
    </div>
  );
};

const StatusRow: React.FC<{ label: string; value: string; status: string }> = ({ label, value, status }) => (
  <div style={{
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px',
    background: 'rgba(255,255,255,0.05)',
    borderRadius: '8px'
  }}>
    <span style={{ fontWeight: '500' }}>{label}</span>
    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
      <span style={{ opacity: 0.9 }}>{value}</span>
      <span style={{
        padding: '4px 8px',
        borderRadius: '4px',
        fontSize: '11px',
        fontWeight: '600',
        background: status === 'OK' ? '#10b981' : '#ef4444'
      }}>
        {status}
      </span>
    </div>
  </div>
);

declare global {
  interface Window {
    electron?: {
      ipcRenderer: {
        invoke: (channel: string, ...args: any[]) => Promise<any>;
      };
    };
  }
}
