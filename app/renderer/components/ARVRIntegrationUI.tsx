import React, { useState, useEffect, useRef } from 'react';

interface VRClipboard {
  id: string;
  content: string;
  type: string;
  position: { x: number; y: number; z: number };
  metadata: { createdAt: number };
}

interface AROverlay {
  id: string;
  visible: boolean;
  screenPosition: { x: number; y: number };
}

interface ImmersiveMetrics {
  vrClips: number;
  arOverlays: number;
  gestureAccuracy: number;
  userEngagement: number;
}

interface ARVRIntegrationUIProps {
  onImmersiveUpdate?: (metrics: ImmersiveMetrics) => void;
}

export const ARVRIntegrationUI: React.FC<ARVRIntegrationUIProps> = ({ onImmersiveUpdate }) => {
  const [vrClips, setVRClips] = useState<VRClipboard[]>([]);
  const [arOverlays, setAROverlays] = useState<AROverlay[]>([]);
  const [immersiveMetrics, setImmersiveMetrics] = useState<ImmersiveMetrics | null>(null);
  const [isVRMode, setIsVRMode] = useState(false);
  const [isARMode, setIsARMode] = useState(false);
  const [selectedClip, setSelectedClip] = useState<VRClipboard | null>(null);
  const [newClipContent, setNewClipContent] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any>(null);
  const [gestureMode, setGestureMode] = useState<'grab' | 'pinch' | 'point' | 'voice'>('point');
  
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    loadImmersiveData();
    const interval = setInterval(loadImmersiveData, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isVRMode || isARMode) {
      initializeImmersiveView();
    }
  }, [isVRMode, isARMode, vrClips]);

  const loadImmersiveData = async () => {
    try {
      // Mock data
      const clips: VRClipboard[] = [
        { id: '1', content: 'Test VR Clip', type: 'text', position: { x: 0, y: 1.5, z: -2 }, metadata: { createdAt: Date.now() } }
      ];
      const overlays: AROverlay[] = [
        { id: '1', visible: true, screenPosition: { x: 300, y: 200 } }
      ];
      const metrics: ImmersiveMetrics = {
        vrClips: 5,
        arOverlays: 3,
        gestureAccuracy: 92.5,
        userEngagement: 78.3
      };
      
      setVRClips(clips);
      setAROverlays(overlays);
      setImmersiveMetrics(metrics);
      onImmersiveUpdate?.(metrics);
    } catch (error) {
      console.error('Error loading immersive data:', error);
    }
  };

  const initializeImmersiveView = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (isVRMode) {
      drawVREnvironment(ctx);
    } else if (isARMode) {
      drawAROverlays(ctx);
    }
  };

  const drawVREnvironment = (ctx: CanvasRenderingContext2D) => {
    const canvas = ctx.canvas;
    
    // Draw 3D grid background
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    
    for (let i = 0; i < canvas.width; i += 50) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, canvas.height);
      ctx.stroke();
    }
    
    for (let i = 0; i < canvas.height; i += 50) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(canvas.width, i);
      ctx.stroke();
    }

    // Draw VR clips as 3D objects
    vrClips.forEach((clip, index) => {
      const x = 100 + (index % 4) * 150;
      const y = 100 + Math.floor(index / 4) * 120;
      
      drawVRClip(ctx, clip, x, y);
    });

    // Draw spatial zones
    drawSpatialZones(ctx);
  };

  const drawVRClip = (ctx: CanvasRenderingContext2D, clip: VRClipboard, x: number, y: number) => {
    const isSelected = selectedClip?.id === clip.id;
    
    // Draw clip container
    ctx.fillStyle = isSelected ? '#3498db' : getClipColor(clip.type);
    ctx.fillRect(x, y, 120, 80);
    
    // Draw clip border
    ctx.strokeStyle = isSelected ? '#2980b9' : '#34495e';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, 120, 80);
    
    // Draw clip content preview
    ctx.fillStyle = 'white';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    
    const preview = clip.content.length > 20 ? clip.content.substring(0, 17) + '...' : clip.content;
    ctx.fillText(preview, x + 60, y + 25);
    
    // Draw clip type icon
    ctx.font = '16px Arial';
    ctx.fillText(getClipIcon(clip.type), x + 60, y + 50);
    
    // Draw position indicator
    ctx.font = '10px Arial';
    ctx.fillStyle = '#bdc3c7';
    ctx.fillText(`(${clip.position.x.toFixed(1)}, ${clip.position.y.toFixed(1)}, ${clip.position.z.toFixed(1)})`, x + 60, y + 70);
  };

  const drawAROverlays = (ctx: CanvasRenderingContext2D) => {
    // Draw camera view background
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    
    // Draw AR overlays
    arOverlays.forEach((overlay, index) => {
      if (overlay.visible) {
        drawAROverlay(ctx, overlay);
      }
    });
    
    // Draw AR UI elements
    drawARInterface(ctx);
  };

  const drawAROverlay = (ctx: CanvasRenderingContext2D, overlay: AROverlay) => {
    const x = overlay.screenPosition.x;
    const y = overlay.screenPosition.y;
    
    // Draw overlay background
    ctx.fillStyle = 'rgba(52, 152, 219, 0.8)';
    ctx.fillRect(x - 50, y - 30, 100, 60);
    
    // Draw overlay border
    ctx.strokeStyle = '#3498db';
    ctx.lineWidth = 2;
    ctx.strokeRect(x - 50, y - 30, 100, 60);
    
    // Draw overlay content
    ctx.fillStyle = 'white';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('AR Clip', x, y - 10);
    ctx.fillText(overlay.id.substring(0, 8), x, y + 10);
  };

  const drawARInterface = (ctx: CanvasRenderingContext2D) => {
    // Draw AR controls
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(10, 10, 200, 100);
    
    ctx.fillStyle = 'white';
    ctx.font = '14px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('AR Mode Active', 20, 30);
    ctx.fillText(`Overlays: ${arOverlays.length}`, 20, 50);
    ctx.fillText(`Gesture: ${gestureMode}`, 20, 70);
  };

  const drawSpatialZones = (ctx: CanvasRenderingContext2D) => {
    const zones = [
      { name: 'Text Zone', x: 50, y: 50, width: 200, height: 150, color: '#2ecc71' },
      { name: 'Image Zone', x: 300, y: 50, width: 200, height: 150, color: '#e74c3c' },
      { name: 'File Zone', x: 50, y: 250, width: 200, height: 150, color: '#f39c12' },
      { name: 'Object Zone', x: 300, y: 250, width: 200, height: 150, color: '#9b59b6' }
    ];
    
    zones.forEach(zone => {
      ctx.strokeStyle = zone.color;
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.strokeRect(zone.x, zone.y, zone.width, zone.height);
      
      ctx.fillStyle = zone.color;
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(zone.name, zone.x + zone.width / 2, zone.y - 10);
    });
    
    ctx.setLineDash([]);
  };

  const getClipColor = (type: string): string => {
    const colors = {
      'text': '#2ecc71',
      'image': '#e74c3c',
      'file': '#f39c12',
      '3d-object': '#9b59b6'
    };
    return colors[type as keyof typeof colors] || '#34495e';
  };

  const getClipIcon = (type: string): string => {
    const icons = {
      'text': '📝',
      'image': '🖼️',
      'file': '📁',
      '3d-object': '🎲'
    };
    return icons[type as keyof typeof icons] || '📄';
  };

  const handleCreateVRClip = async () => {
    if (!newClipContent.trim()) return;
    
    try {
      // Mock create
      console.log('Creating VR clip:', newClipContent);
      setNewClipContent('');
      await loadImmersiveData();
    } catch (error) {
      console.error('Error creating VR clip:', error);
    }
  };

  const handleImmersiveSearch = async () => {
    if (!searchQuery.trim()) return;
    
    try {
      // Mock search
      const results = {
        query: searchQuery,
        matchCount: 2,
        clips: [
          { content: 'Result 1', position: { x: 1, y: 1.5, z: -2 }, relevance: 95 },
          { content: 'Result 2', position: { x: -1, y: 1.5, z: -2 }, relevance: 87 }
        ]
      };
      setSearchResults(results);
    } catch (error) {
      console.error('Error performing immersive search:', error);
    }
  };

  const handleGestureSimulation = async (gestureType: string) => {
    try {
      // Mock gesture
      console.log('Gesture simulated:', gestureType);
    } catch (error) {
      console.error('Error handling gesture:', error);
    }
  };

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // Find clicked clip
    vrClips.forEach((clip, index) => {
      const clipX = 100 + (index % 4) * 150;
      const clipY = 100 + Math.floor(index / 4) * 120;
      
      if (x >= clipX && x <= clipX + 120 && y >= clipY && y <= clipY + 80) {
        setSelectedClip(clip);
      }
    });
  };

  return (
    <div className="arvr-integration-ui">
      <div className="arvr-header">
        <h3>🥽 AR/VR Integration</h3>
        <div className="mode-toggles">
          <button
            onClick={() => { setIsVRMode(!isVRMode); setIsARMode(false); }}
            className={`mode-btn ${isVRMode ? 'active' : ''}`}
          >
            🥽 VR Mode
          </button>
          <button
            onClick={() => { setIsARMode(!isARMode); setIsVRMode(false); }}
            className={`mode-btn ${isARMode ? 'active' : ''}`}
          >
            📱 AR Mode
          </button>
        </div>
      </div>

      {/* Immersive Metrics */}
      {immersiveMetrics && (
        <div className="immersive-metrics">
          <div className="metrics-row">
            <div className="metric">
              <span className="metric-value">{immersiveMetrics.vrClips}</span>
              <span className="metric-label">VR Clips</span>
            </div>
            <div className="metric">
              <span className="metric-value">{immersiveMetrics.arOverlays}</span>
              <span className="metric-label">AR Overlays</span>
            </div>
            <div className="metric">
              <span className="metric-value">{immersiveMetrics.gestureAccuracy.toFixed(1)}%</span>
              <span className="metric-label">Gesture Accuracy</span>
            </div>
            <div className="metric">
              <span className="metric-value">{immersiveMetrics.userEngagement.toFixed(1)}%</span>
              <span className="metric-label">Engagement</span>
            </div>
          </div>
        </div>
      )}

      {/* Immersive Canvas */}
      <div className="immersive-canvas-container">
        <canvas
          ref={canvasRef}
          width={600}
          height={400}
          onClick={handleCanvasClick}
          className="immersive-canvas"
        />
        
        {(isVRMode || isARMode) && (
          <div className="canvas-overlay">
            <div className="mode-indicator">
              {isVRMode ? '🥽 VR Environment' : '📱 AR Camera View'}
            </div>
          </div>
        )}
      </div>

      {/* Clip Creation */}
      <div className="clip-creation">
        <h4>➕ Create VR Clip</h4>
        <div className="creation-controls">
          <input
            type="text"
            value={newClipContent}
            onChange={(e) => setNewClipContent(e.target.value)}
            placeholder="Enter content for VR clip..."
            className="clip-input"
          />
          <button
            onClick={handleCreateVRClip}
            disabled={!newClipContent.trim()}
            className="create-btn"
          >
            🎲 Create in VR
          </button>
        </div>
      </div>

      {/* Gesture Controls */}
      <div className="gesture-controls">
        <h4>👋 Gesture Controls</h4>
        <div className="gesture-buttons">
          <button
            onClick={() => handleGestureSimulation('grab')}
            className="gesture-btn"
          >
            ✋ Grab
          </button>
          <button
            onClick={() => handleGestureSimulation('pinch')}
            className="gesture-btn"
          >
            🤏 Pinch
          </button>
          <button
            onClick={() => handleGestureSimulation('point')}
            className="gesture-btn"
          >
            👉 Point
          </button>
          <button
            onClick={() => handleGestureSimulation('voice')}
            className="gesture-btn"
          >
            🎤 Voice
          </button>
        </div>
      </div>

      {/* Immersive Search */}
      <div className="immersive-search">
        <h4>🔍 Spatial Search</h4>
        <div className="search-controls">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search in 3D space..."
            className="search-input"
          />
          <button
            onClick={handleImmersiveSearch}
            disabled={!searchQuery.trim()}
            className="search-btn"
          >
            🔍 Search VR
          </button>
        </div>
        
        {searchResults && (
          <div className="search-results">
            <div className="results-summary">
              Found {searchResults.matchCount} clips for "{searchResults.query}"
            </div>
            <div className="results-list">
              {searchResults.clips.map((clip: any, index: number) => (
                <div key={index} className="result-item">
                  <div className="result-content">{clip.content}</div>
                  <div className="result-meta">
                    Position: ({clip.position.x.toFixed(1)}, {clip.position.y.toFixed(1)}, {clip.position.z.toFixed(1)}) | 
                    Relevance: {clip.relevance.toFixed(1)}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Selected Clip Details */}
      {selectedClip && (
        <div className="selected-clip">
          <h4>📋 Selected Clip</h4>
          <div className="clip-details">
            <div className="detail-row">
              <span>Type:</span>
              <span>{getClipIcon(selectedClip.type)} {selectedClip.type}</span>
            </div>
            <div className="detail-row">
              <span>Position:</span>
              <span>({selectedClip.position.x.toFixed(2)}, {selectedClip.position.y.toFixed(2)}, {selectedClip.position.z.toFixed(2)})</span>
            </div>
            <div className="detail-row">
              <span>Content:</span>
              <span className="clip-content">{selectedClip.content}</span>
            </div>
            <div className="detail-row">
              <span>Created:</span>
              <span>{new Date(selectedClip.metadata.createdAt).toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .arvr-integration-ui {
          padding: 20px;
          background: linear-gradient(135deg, #8e44ad 0%, #3498db 100%);
          border-radius: 12px;
          color: white;
          max-width: 900px;
        }

        .arvr-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .arvr-header h3 {
          margin: 0;
          font-size: 1.5em;
        }

        .mode-toggles {
          display: flex;
          gap: 10px;
        }

        .mode-btn {
          padding: 8px 15px;
          border: none;
          border-radius: 6px;
          background: rgba(255, 255, 255, 0.2);
          color: white;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .mode-btn.active {
          background: rgba(255, 255, 255, 0.3);
          transform: scale(1.05);
        }

        .immersive-metrics {
          background: rgba(255, 255, 255, 0.1);
          padding: 15px;
          border-radius: 8px;
          margin-bottom: 20px;
        }

        .metrics-row {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 15px;
        }

        .metric {
          text-align: center;
        }

        .metric-value {
          display: block;
          font-size: 1.5em;
          font-weight: bold;
          color: #f1c40f;
        }

        .metric-label {
          font-size: 0.9em;
          opacity: 0.8;
        }

        .immersive-canvas-container {
          position: relative;
          background: rgba(0, 0, 0, 0.3);
          border-radius: 8px;
          margin-bottom: 20px;
          overflow: hidden;
        }

        .immersive-canvas {
          width: 100%;
          height: 400px;
          cursor: pointer;
          border-radius: 8px;
        }

        .canvas-overlay {
          position: absolute;
          top: 10px;
          left: 10px;
          background: rgba(0, 0, 0, 0.7);
          padding: 8px 12px;
          border-radius: 4px;
        }

        .mode-indicator {
          font-size: 0.9em;
          font-weight: bold;
        }

        .clip-creation, .gesture-controls, .immersive-search, .selected-clip {
          background: rgba(255, 255, 255, 0.1);
          padding: 15px;
          border-radius: 8px;
          margin-bottom: 15px;
        }

        .clip-creation h4, .gesture-controls h4, .immersive-search h4, .selected-clip h4 {
          margin: 0 0 15px 0;
        }

        .creation-controls, .search-controls {
          display: flex;
          gap: 10px;
        }

        .clip-input, .search-input {
          flex: 1;
          padding: 10px;
          border: none;
          border-radius: 6px;
          background: rgba(255, 255, 255, 0.9);
          color: #333;
        }

        .create-btn, .search-btn {
          padding: 10px 15px;
          border: none;
          border-radius: 6px;
          background: #27ae60;
          color: white;
          cursor: pointer;
          font-weight: 500;
        }

        .create-btn:disabled, .search-btn:disabled {
          background: #7f8c8d;
          cursor: not-allowed;
        }

        .gesture-buttons {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 10px;
        }

        .gesture-btn {
          padding: 12px;
          border: none;
          border-radius: 6px;
          background: rgba(255, 255, 255, 0.2);
          color: white;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .gesture-btn:hover {
          background: rgba(255, 255, 255, 0.3);
          transform: translateY(-2px);
        }

        .search-results {
          margin-top: 15px;
        }

        .results-summary {
          font-weight: bold;
          margin-bottom: 10px;
          color: #f1c40f;
        }

        .results-list {
          max-height: 200px;
          overflow-y: auto;
        }

        .result-item {
          background: rgba(0, 0, 0, 0.2);
          padding: 10px;
          border-radius: 4px;
          margin-bottom: 8px;
        }

        .result-content {
          font-weight: 500;
          margin-bottom: 5px;
        }

        .result-meta {
          font-size: 0.8em;
          opacity: 0.8;
        }

        .clip-details {
          background: rgba(0, 0, 0, 0.2);
          padding: 15px;
          border-radius: 6px;
        }

        .detail-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 10px;
          padding-bottom: 8px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .detail-row:last-child {
          border-bottom: none;
          margin-bottom: 0;
        }

        .clip-content {
          max-width: 300px;
          word-wrap: break-word;
          font-family: monospace;
          background: rgba(0, 0, 0, 0.3);
          padding: 4px 8px;
          border-radius: 3px;
        }
      `}</style>
    </div>
  );
};

export default ARVRIntegrationUI;