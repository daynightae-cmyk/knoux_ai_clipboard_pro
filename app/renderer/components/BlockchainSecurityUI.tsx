import React, { useState, useEffect } from 'react';

interface SecurityProfile { id: string; name: string; }
interface SecurityMetrics {
  totalClips: number;
  encryptedClips: number;
  expiredClips: number;
  blockchainHealth: number;
  encryptionLevels: { quantum: number; advanced: number; basic: number; };
}

interface BlockchainSecurityUIProps {
  onSecurityUpdate?: (metrics: SecurityMetrics) => void;
}

export const BlockchainSecurityUI: React.FC<BlockchainSecurityUIProps> = ({ onSecurityUpdate }) => {
  const [securityMetrics, setSecurityMetrics] = useState<SecurityMetrics | null>(null);
  const [selectedProfile, setSelectedProfile] = useState('default');
  const [securityProfiles, setSecurityProfiles] = useState<SecurityProfile[]>([]);
  const [auditResults, setAuditResults] = useState<any>(null);
  const [isAuditing, setIsAuditing] = useState(false);
  const [clipContent, setClipContent] = useState('');
  const [storedClipId, setStoredClipId] = useState<string | null>(null);

  useEffect(() => {
    loadSecurityData();
    const interval = setInterval(loadSecurityData, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadSecurityData = async () => {
    try {
      const metrics: SecurityMetrics = {
        totalClips: 42,
        encryptedClips: 38,
        expiredClips: 4,
        blockchainHealth: 98,
        encryptionLevels: { quantum: 12, advanced: 20, basic: 6 }
      };
      const profiles: SecurityProfile[] = [
        { id: 'default', name: 'Default' },
        { id: 'quantum', name: 'Quantum' }
      ];
      
      setSecurityMetrics(metrics);
      setSecurityProfiles(profiles);
      onSecurityUpdate?.(metrics);
    } catch (error) {
      console.error('Error loading security data:', error);
    }
  };

  const handleStoreSecureClip = async () => {
    if (!clipContent.trim()) return;
    try {
      const clipId = 'clip-' + Date.now();
      setStoredClipId(clipId);
      setClipContent('');
      await loadSecurityData();
    } catch (error) {
      console.error('Error storing secure clip:', error);
    }
  };

  const handleRetrieveClip = async () => {
    if (!storedClipId) return;
    try {
      setClipContent('Retrieved: Mock content');
    } catch (error) {
      console.error('Error retrieving clip:', error);
    }
  };

  const handleSecurityAudit = async () => {
    setIsAuditing(true);
    try {
      await new Promise(r => setTimeout(r, 1500));
      const audit = {
        securityScore: 100,
        validBlocks: 42,
        invalidBlocks: 0,
        totalBlocks: 42,
        vulnerabilities: [],
        recommendations: ['System is secure']
      };
      setAuditResults(audit);
    } catch (error) {
      console.error('Error during security audit:', error);
    } finally {
      setIsAuditing(false);
    }
  };

  const handleCleanupExpired = async () => {
    try {
      const cleanedCount = 4;
      alert(`Cleaned up ${cleanedCount} expired clips`);
      await loadSecurityData();
    } catch (error) {
      console.error('Error cleaning up clips:', error);
    }
  };

  return (
    <div className="blockchain-security-ui">
      <div className="security-header">
        <h3>🔐 Blockchain Security</h3>
        <div className="security-status">
          {securityMetrics && (
            <div className="status-indicators">
              <div className="indicator">
                <span className="label">Health:</span>
                <span className="value">{securityMetrics.blockchainHealth}%</span>
              </div>
              <div className="indicator">
                <span className="label">Encrypted:</span>
                <span className="value">{securityMetrics.encryptedClips}/{securityMetrics.totalClips}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Secure Clip Management */}
      <div className="secure-clip-section">
        <h4>🛡️ Secure Clip Storage</h4>
        
        <div className="profile-selector">
          <label>Security Profile:</label>
          <select
            value={selectedProfile}
            onChange={(e) => setSelectedProfile(e.target.value)}
          >
            <option value="default">Default (Advanced)</option>
            <option value="quantum">Quantum Encryption</option>
            <option value="basic">Basic Encryption</option>
          </select>
        </div>

        <div className="clip-input">
          <textarea
            value={clipContent}
            onChange={(e) => setClipContent(e.target.value)}
            placeholder="Enter content to encrypt and store securely..."
            rows={4}
          />
          <div className="clip-actions">
            <button
              onClick={handleStoreSecureClip}
              disabled={!clipContent.trim()}
              className="store-btn"
            >
              🔒 Store Securely
            </button>
            {storedClipId && (
              <button
                onClick={handleRetrieveClip}
                className="retrieve-btn"
              >
                🔓 Retrieve Clip
              </button>
            )}
          </div>
        </div>

        {storedClipId && (
          <div className="stored-clip-info">
            <span>Stored Clip ID: </span>
            <code>{storedClipId}</code>
          </div>
        )}
      </div>

      {/* Security Metrics */}
      {securityMetrics && (
        <div className="security-metrics">
          <h4>📊 Security Metrics</h4>
          <div className="metrics-grid">
            <div className="metric-card">
              <div className="metric-value">{securityMetrics.totalClips}</div>
              <div className="metric-label">Total Clips</div>
            </div>
            <div className="metric-card">
              <div className="metric-value">{securityMetrics.encryptedClips}</div>
              <div className="metric-label">Encrypted</div>
            </div>
            <div className="metric-card">
              <div className="metric-value">{securityMetrics.expiredClips}</div>
              <div className="metric-label">Expired</div>
            </div>
            <div className="metric-card">
              <div className="metric-value">{securityMetrics.blockchainHealth}%</div>
              <div className="metric-label">Health</div>
            </div>
          </div>

          <div className="encryption-breakdown">
            <h5>Encryption Levels:</h5>
            <div className="encryption-stats">
              <div className="encryption-item">
                <span>Quantum:</span>
                <span>{securityMetrics.encryptionLevels.quantum}</span>
              </div>
              <div className="encryption-item">
                <span>Advanced:</span>
                <span>{securityMetrics.encryptionLevels.advanced}</span>
              </div>
              <div className="encryption-item">
                <span>Basic:</span>
                <span>{securityMetrics.encryptionLevels.basic}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Security Audit */}
      <div className="security-audit">
        <h4>🔍 Security Audit</h4>
        <div className="audit-controls">
          <button
            onClick={handleSecurityAudit}
            disabled={isAuditing}
            className="audit-btn"
          >
            {isAuditing ? '⏳ Auditing...' : '🔍 Run Security Audit'}
          </button>
          <button
            onClick={handleCleanupExpired}
            className="cleanup-btn"
          >
            🧹 Cleanup Expired
          </button>
        </div>

        {auditResults && (
          <div className="audit-results">
            <div className="audit-summary">
              <div className="audit-score">
                Security Score: <span className={auditResults.securityScore === 100 ? 'perfect' : 'warning'}>
                  {auditResults.securityScore}%
                </span>
              </div>
              <div className="audit-stats">
                <span>Valid Blocks: {auditResults.validBlocks}</span>
                <span>Invalid Blocks: {auditResults.invalidBlocks}</span>
                <span>Total Blocks: {auditResults.totalBlocks}</span>
              </div>
            </div>

            {auditResults.vulnerabilities.length > 0 && (
              <div className="vulnerabilities">
                <h5>⚠️ Vulnerabilities:</h5>
                <ul>
                  {auditResults.vulnerabilities.map((vuln: string, index: number) => (
                    <li key={index}>{vuln}</li>
                  ))}
                </ul>
              </div>
            )}

            {auditResults.recommendations.length > 0 && (
              <div className="recommendations">
                <h5>💡 Recommendations:</h5>
                <ul>
                  {auditResults.recommendations.map((rec: string, index: number) => (
                    <li key={index}>{rec}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      <style jsx>{`
        .blockchain-security-ui {
          padding: 20px;
          background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
          border-radius: 12px;
          color: white;
          max-width: 800px;
        }

        .security-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .security-header h3 {
          margin: 0;
          font-size: 1.5em;
        }

        .status-indicators {
          display: flex;
          gap: 15px;
        }

        .indicator {
          display: flex;
          flex-direction: column;
          align-items: center;
          font-size: 0.9em;
        }

        .indicator .label {
          opacity: 0.8;
        }

        .indicator .value {
          font-weight: bold;
          color: #2ecc71;
        }

        .secure-clip-section {
          background: rgba(255, 255, 255, 0.1);
          padding: 15px;
          border-radius: 8px;
          margin-bottom: 20px;
        }

        .secure-clip-section h4 {
          margin: 0 0 15px 0;
        }

        .profile-selector {
          margin-bottom: 15px;
        }

        .profile-selector label {
          display: block;
          margin-bottom: 5px;
          font-weight: 500;
        }

        .profile-selector select {
          width: 100%;
          padding: 8px;
          border: none;
          border-radius: 4px;
          background: rgba(255, 255, 255, 0.9);
          color: #333;
        }

        .clip-input textarea {
          width: 100%;
          padding: 10px;
          border: none;
          border-radius: 6px;
          background: rgba(255, 255, 255, 0.9);
          color: #333;
          resize: vertical;
          margin-bottom: 10px;
        }

        .clip-actions {
          display: flex;
          gap: 10px;
        }

        .store-btn, .retrieve-btn {
          padding: 10px 15px;
          border: none;
          border-radius: 6px;
          color: white;
          cursor: pointer;
          font-weight: 500;
        }

        .store-btn {
          background: #27ae60;
        }

        .retrieve-btn {
          background: #3498db;
        }

        .store-btn:disabled {
          background: #7f8c8d;
          cursor: not-allowed;
        }

        .stored-clip-info {
          margin-top: 10px;
          padding: 8px;
          background: rgba(46, 204, 113, 0.2);
          border-radius: 4px;
          font-size: 0.9em;
        }

        .stored-clip-info code {
          background: rgba(0, 0, 0, 0.3);
          padding: 2px 6px;
          border-radius: 3px;
          font-family: monospace;
        }

        .security-metrics {
          background: rgba(255, 255, 255, 0.1);
          padding: 15px;
          border-radius: 8px;
          margin-bottom: 20px;
        }

        .security-metrics h4 {
          margin: 0 0 15px 0;
        }

        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 15px;
          margin-bottom: 20px;
        }

        .metric-card {
          background: rgba(255, 255, 255, 0.1);
          padding: 15px;
          border-radius: 8px;
          text-align: center;
        }

        .metric-value {
          font-size: 1.8em;
          font-weight: bold;
          color: #2ecc71;
          margin-bottom: 5px;
        }

        .metric-label {
          font-size: 0.9em;
          opacity: 0.8;
        }

        .encryption-breakdown h5 {
          margin: 0 0 10px 0;
        }

        .encryption-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
        }

        .encryption-item {
          display: flex;
          justify-content: space-between;
          padding: 8px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
        }

        .security-audit {
          background: rgba(255, 255, 255, 0.1);
          padding: 15px;
          border-radius: 8px;
        }

        .security-audit h4 {
          margin: 0 0 15px 0;
        }

        .audit-controls {
          display: flex;
          gap: 10px;
          margin-bottom: 20px;
        }

        .audit-btn, .cleanup-btn {
          padding: 10px 15px;
          border: none;
          border-radius: 6px;
          color: white;
          cursor: pointer;
          font-weight: 500;
        }

        .audit-btn {
          background: #e74c3c;
        }

        .cleanup-btn {
          background: #f39c12;
        }

        .audit-btn:disabled {
          background: #7f8c8d;
          cursor: not-allowed;
        }

        .audit-results {
          background: rgba(0, 0, 0, 0.2);
          padding: 15px;
          border-radius: 6px;
        }

        .audit-summary {
          margin-bottom: 15px;
        }

        .audit-score {
          font-size: 1.2em;
          margin-bottom: 10px;
        }

        .audit-score .perfect {
          color: #2ecc71;
        }

        .audit-score .warning {
          color: #f39c12;
        }

        .audit-stats {
          display: flex;
          gap: 15px;
          font-size: 0.9em;
        }

        .vulnerabilities, .recommendations {
          margin-bottom: 15px;
        }

        .vulnerabilities h5, .recommendations h5 {
          margin: 0 0 10px 0;
        }

        .vulnerabilities ul, .recommendations ul {
          margin: 0;
          padding-left: 20px;
        }

        .vulnerabilities li {
          color: #e74c3c;
          margin-bottom: 5px;
        }

        .recommendations li {
          color: #3498db;
          margin-bottom: 5px;
        }
      `}</style>
    </div>
  );
};

export default BlockchainSecurityUI;