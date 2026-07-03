import React, { useState, useEffect } from "react";
import { useClipboard } from "../hooks/useClipboard";
import { useAI } from "../hooks/useAI-simple";

// Import ALL components
import CreativeStudio from "./CreativeStudio";
import UniversalTranslator from "./UniversalTranslator";
import VoiceCommands from "./VoiceCommands";
import VoiceStudio from "./VoiceStudio";
import InstantSearch from "./InstantSearch";
import GamifiedClipboard from "./GamifiedClipboard";
import OfflineAI from "./OfflineAI";
import AIMemoryDashboard from "./AIMemoryDashboard";
import AnalyticsDashboardUI from "./AnalyticsDashboardUI";
import ProductivityDashboard from "./ProductivityDashboard";
import PatternRecognitionDashboard from "./PatternRecognitionDashboard";
import QuantumPredictions from "./QuantumPredictions";
import QuantumSecurity from "./QuantumSecurity";
import BlockchainSecurityUI from "./BlockchainSecurityUI";
import NeuralStyleTransferUI from "./NeuralStyleTransferUI";
import ARVRIntegrationUI from "./ARVRIntegrationUI";
import UIMorpherUI from "./UIMorpherUI";
import VoiceCustomizerUI from "./VoiceCustomizerUI";
import ProductivityScorerUI from "./ProductivityScorerUI";
import RevolutionaryFeatures from "./RevolutionaryFeatures";
import SuperDashboard from "./SuperDashboard";
import FeatureManager from "./FeatureManager";
import ClipboardView from "./ClipboardView";
import ClipboardList from "./ClipboardList";
import HistoryTimeline from "./HistoryTimeline";
import FilterPanel from "./FilterPanel";
import TagManager from "./TagManager";
import SearchBar from "./SearchBar";
import { ServiceTester } from "./ServiceTester";

export const MainDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState("home");
  const {
    items: clipboardItems,
    isLoading: clipboardLoading,
    error: clipboardError,
    refresh: refreshClipboard,
  } = useClipboard();
  const {
    isProcessing: aiProcessing,
    error: aiError,
    summarize,
    enhance,
  } = useAI();
  const [testResults, setTestResults] = useState<any>({});

  // Test IPC connections on mount
  useEffect(() => {
    const testConnections = async () => {
      const results: any = {};

      // Test clipboard
      try {
        if (window.knoux?.clipboard?.read) {
          const clipResult = await window.knoux.clipboard.read();
          results.clipboard = clipResult.ok ? "Connected" : "Error";
        } else {
          results.clipboard = "Not Available";
        }
      } catch {
        results.clipboard = "Failed";
      }

      // Test AI
      try {
        if (window.knoux?.ai?.summarize) {
          const aiResult = await window.knoux.ai.summarize("Test text");
          results.ai = aiResult.ok ? "Connected" : "Error";
        } else {
          results.ai = "Not Available";
        }
      } catch {
        results.ai = "Failed";
      }

      // Test storage
      try {
        if (window.knoux?.storage?.get) {
          const storageResult = await window.knoux.storage.get("test");
          results.storage = storageResult.ok ? "Connected" : "Error";
        } else {
          results.storage = "Not Available";
        }
      } catch {
        results.storage = "Failed";
      }

      setTestResults(results);
    };

    testConnections();
  }, []);

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        display: "flex",
        fontFamily: "Inter, sans-serif",
        color: "white",
      }}
    >
      {/* Sidebar */}
      <div
        style={{
          width: "280px",
          background: "rgba(0,0,0,0.3)",
          padding: "20px",
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          overflowY: "auto",
        }}
      >
        <h2 style={{ margin: "0 0 20px 0", fontSize: "20px" }}>🚀 Knoux AI</h2>

        {/* Core Features */}
        <div style={{ marginBottom: "15px" }}>
          <h3 style={{ fontSize: "12px", opacity: 0.7, margin: "0 0 8px 0" }}>CORE</h3>
          <NavButton active={activeTab === "home"} onClick={() => setActiveTab("home")}>🏠 Dashboard</NavButton>
          <NavButton active={activeTab === "clipboard"} onClick={() => setActiveTab("clipboard")}>📋 Clipboard</NavButton>
          <NavButton active={activeTab === "clipboardview"} onClick={() => setActiveTab("clipboardview")}>📄 Clipboard View</NavButton>
          <NavButton active={activeTab === "history"} onClick={() => setActiveTab("history")}>📚 History Timeline</NavButton>
          <NavButton active={activeTab === "search"} onClick={() => setActiveTab("search")}>🔍 Instant Search</NavButton>
        </div>

        {/* AI Features */}
        <div style={{ marginBottom: "15px" }}>
          <h3 style={{ fontSize: "12px", opacity: 0.7, margin: "0 0 8px 0" }}>AI POWERED</h3>
          <NavButton active={activeTab === "creative"} onClick={() => setActiveTab("creative")}>🎭 Creative Studio</NavButton>
          <NavButton active={activeTab === "ai"} onClick={() => setActiveTab("ai")}>🧠 Offline AI</NavButton>
          <NavButton active={activeTab === "aimemory"} onClick={() => setActiveTab("aimemory")}>🧩 AI Memory</NavButton>
          <NavButton active={activeTab === "analytics"} onClick={() => setActiveTab("analytics")}>📊 Analytics</NavButton>
          <NavButton active={activeTab === "patterns"} onClick={() => setActiveTab("patterns")}>🔮 Pattern Recognition</NavButton>
          <NavButton active={activeTab === "productivity"} onClick={() => setActiveTab("productivity")}>⚡ Productivity</NavButton>
          <NavButton active={activeTab === "scorer"} onClick={() => setActiveTab("scorer")}>🎯 Productivity Scorer</NavButton>
        </div>

        {/* Advanced Features */}
        <div style={{ marginBottom: "15px" }}>
          <h3 style={{ fontSize: "12px", opacity: 0.7, margin: "0 0 8px 0" }}>ADVANCED</h3>
          <NavButton active={activeTab === "translator"} onClick={() => setActiveTab("translator")}>🌐 Translator</NavButton>
          <NavButton active={activeTab === "voice"} onClick={() => setActiveTab("voice")}>🎤 Voice Commands</NavButton>
          <NavButton active={activeTab === "voicestudio"} onClick={() => setActiveTab("voicestudio")}>🎵 Voice Studio</NavButton>
          <NavButton active={activeTab === "voicecustomizer"} onClick={() => setActiveTab("voicecustomizer")}>🎛️ Voice Customizer</NavButton>
          <NavButton active={activeTab === "gamification"} onClick={() => setActiveTab("gamification")}>🎮 Gamification</NavButton>
        </div>

        {/* Quantum & Security */}
        <div style={{ marginBottom: "15px" }}>
          <h3 style={{ fontSize: "12px", opacity: 0.7, margin: "0 0 8px 0" }}>QUANTUM & SECURITY</h3>
          <NavButton active={activeTab === "quantum"} onClick={() => setActiveTab("quantum")}>⚛️ Quantum Predictions</NavButton>
          <NavButton active={activeTab === "quantumsec"} onClick={() => setActiveTab("quantumsec")}>🔐 Quantum Security</NavButton>
          <NavButton active={activeTab === "blockchain"} onClick={() => setActiveTab("blockchain")}>⛓️ Blockchain Security</NavButton>
        </div>

        {/* Neural & AR/VR */}
        <div style={{ marginBottom: "15px" }}>
          <h3 style={{ fontSize: "12px", opacity: 0.7, margin: "0 0 8px 0" }}>NEURAL & IMMERSIVE</h3>
          <NavButton active={activeTab === "neural"} onClick={() => setActiveTab("neural")}>🧬 Neural Style Transfer</NavButton>
          <NavButton active={activeTab === "arvr"} onClick={() => setActiveTab("arvr")}>🥽 AR/VR Integration</NavButton>
          <NavButton active={activeTab === "uimorpher"} onClick={() => setActiveTab("uimorpher")}>🎨 UI Morpher</NavButton>
        </div>

        {/* Management */}
        <div>
          <h3 style={{ fontSize: "12px", opacity: 0.7, margin: "0 0 8px 0" }}>MANAGEMENT</h3>
          <NavButton active={activeTab === "tester"} onClick={() => setActiveTab("tester")}>🧪 Service Tester</NavButton>
          <NavButton active={activeTab === "features"} onClick={() => setActiveTab("features")}>⚙️ Feature Manager</NavButton>
          <NavButton active={activeTab === "revolutionary"} onClick={() => setActiveTab("revolutionary")}>🚀 Revolutionary</NavButton>
          <NavButton active={activeTab === "super"} onClick={() => setActiveTab("super")}>💎 Super Dashboard</NavButton>
          <NavButton active={activeTab === "tags"} onClick={() => setActiveTab("tags")}>🏷️ Tag Manager</NavButton>
          <NavButton active={activeTab === "filter"} onClick={() => setActiveTab("filter")}>🔧 Filter Panel</NavButton>
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, padding: "20px", overflow: "auto" }}>
        {activeTab === "home" && (
          <HomeView
            testResults={testResults}
            clipboardItems={clipboardItems}
            aiProcessing={aiProcessing}
            onRefreshClipboard={refreshClipboard}
            onSummarize={summarize}
            clipboardError={clipboardError}
            aiError={aiError}
          />
        )}
        {activeTab === "clipboard" && <GamifiedClipboard />}
        {activeTab === "clipboardview" && <ClipboardView />}
        {activeTab === "history" && <HistoryTimeline />}
        {activeTab === "creative" && <CreativeStudio />}
        {activeTab === "translator" && <UniversalTranslator />}
        {activeTab === "voice" && <VoiceCommands />}
        {activeTab === "voicestudio" && <VoiceStudio />}
        {activeTab === "voicecustomizer" && <VoiceCustomizerUI />}
        {activeTab === "search" && <InstantSearch />}
        {activeTab === "gamification" && <GamifiedClipboard />}
        {activeTab === "ai" && <OfflineAI />}
        {activeTab === "aimemory" && <AIMemoryDashboard />}
        {activeTab === "analytics" && <AnalyticsDashboardUI />}
        {activeTab === "productivity" && <ProductivityDashboard />}
        {activeTab === "patterns" && <PatternRecognitionDashboard />}
        {activeTab === "scorer" && <ProductivityScorerUI />}
        {activeTab === "quantum" && <QuantumPredictions />}
        {activeTab === "quantumsec" && <QuantumSecurity />}
        {activeTab === "blockchain" && <BlockchainSecurityUI />}
        {activeTab === "neural" && <NeuralStyleTransferUI />}
        {activeTab === "arvr" && <ARVRIntegrationUI />}
        {activeTab === "uimorpher" && <UIMorpherUI />}
        {activeTab === "features" && <FeatureManager />}
        {activeTab === "revolutionary" && <RevolutionaryFeatures />}
        {activeTab === "super" && <SuperDashboard />}
        {activeTab === "tester" && <ServiceTester />}
        {activeTab === "tags" && <TagManager />}
        {activeTab === "filter" && <FilterPanel />}
      </div>
    </div>
  );
};

const NavButton: React.FC<{
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}> = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    style={{
      padding: "8px 12px",
      background: active ? "rgba(255,255,255,0.2)" : "transparent",
      border: "none",
      color: "white",
      textAlign: "left",
      borderRadius: "6px",
      cursor: "pointer",
      fontSize: "12px",
      fontWeight: active ? "600" : "400",
      transition: "all 0.2s",
      width: "100%",
      marginBottom: "2px",
    }}
  >
    {children}
  </button>
);

const HomeView: React.FC<{
  testResults: any;
  clipboardItems: any[];
  aiProcessing: boolean;
  onRefreshClipboard: () => void;
  onSummarize: (text: string) => Promise<string | null>;
  clipboardError: string | null;
  aiError: string | null;
}> = ({
  testResults,
  clipboardItems,
  aiProcessing,
  onRefreshClipboard,
  onSummarize,
  clipboardError,
  aiError,
}) => (
  <div>
    <h1 style={{ fontSize: "32px", margin: "0 0 20px 0" }}>
      Knoux Clipboard AI — INTEGRATED
    </h1>
    <p style={{ fontSize: "14px", opacity: 0.8, marginBottom: "30px" }}>
      Build: {new Date().toLocaleString()} | IPC Status:{" "}
      {Object.keys(testResults).length > 0 ? "✅ Connected" : "⏳ Testing..."}
    </p>

    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: "20px",
        marginBottom: "30px",
      }}
    >
      <StatCard
        title="Clipboard Items"
        value={clipboardItems.length.toString()}
        icon="📋"
        status={testResults.clipboard || "Testing..."}
      />
      <StatCard
        title="AI Engine"
        value={aiProcessing ? "Processing..." : "Ready"}
        icon="🧠"
        status={testResults.ai || "Testing..."}
      />
      <StatCard
        title="Storage"
        value="Active"
        icon="💾"
        status={testResults.storage || "Testing..."}
      />
    </div>

    <div
      style={{
        background: "rgba(255,255,255,0.1)",
        padding: "20px",
        borderRadius: "12px",
      }}
    >
      <h3 style={{ margin: "0 0 15px 0", fontSize: "18px" }}>
        🧪 Live IPC Tests
      </h3>
      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
        <TestButton
          onClick={async () => {
            const result = await onSummarize(
              "This is a test text for AI summarization.",
            );
            alert(result ? `Summary: ${result}` : "AI test failed");
          }}
        >
          Test AI Summarize
        </TestButton>

        <TestButton onClick={onRefreshClipboard}>Refresh Clipboard</TestButton>

        <TestButton
          onClick={async () => {
            if (window.knoux?.storage?.set) {
              await window.knoux.storage.set("test-key", "test-value");
              const result = await window.knoux.storage.get("test-key");
              alert(
                result?.ok
                  ? `Storage test: ${result.data}`
                  : "Storage test failed",
              );
            }
          }}
        >
          Test Storage
        </TestButton>
      </div>
    </div>

    {(clipboardError || aiError) && (
      <div
        style={{
          marginTop: "20px",
          padding: "15px",
          background: "rgba(255,0,0,0.2)",
          borderRadius: "8px",
          border: "1px solid rgba(255,0,0,0.3)",
        }}
      >
        <strong>⚠️ Errors:</strong>
        {clipboardError && <div>Clipboard: {clipboardError}</div>}
        {aiError && <div>AI: {aiError}</div>}
      </div>
    )}
  </div>
);

const TestButton: React.FC<{
  onClick: () => void;
  children: React.ReactNode;
}> = ({ onClick, children }) => (
  <button
    onClick={onClick}
    style={{
      padding: "8px 16px",
      background: "rgba(255,255,255,0.2)",
      border: "1px solid rgba(255,255,255,0.3)",
      color: "white",
      borderRadius: "6px",
      cursor: "pointer",
      fontSize: "12px",
      fontWeight: "500",
    }}
  >
    {children}
  </button>
);

const StatCard: React.FC<{
  title: string;
  value: string;
  icon: string;
  status?: string;
}> = ({ title, value, icon, status }) => (
  <div
    style={{
      background: "rgba(255,255,255,0.1)",
      padding: "20px",
      borderRadius: "12px",
      backdropFilter: "blur(10px)",
      position: "relative",
    }}
  >
    <div style={{ fontSize: "32px", marginBottom: "10px" }}>{icon}</div>
    <div style={{ fontSize: "28px", fontWeight: "700", marginBottom: "5px" }}>
      {value}
    </div>
    <div style={{ fontSize: "12px", opacity: 0.8 }}>{title}</div>
    {status && (
      <div
        style={{
          position: "absolute",
          top: "10px",
          right: "10px",
          padding: "4px 8px",
          borderRadius: "4px",
          fontSize: "10px",
          fontWeight: "600",
          background:
            status === "Connected"
              ? "#10b981"
              : status === "Error" || status === "Failed"
                ? "#ef4444"
                : "#f59e0b",
          color: "white",
        }}
      >
        {status}
      </div>
    )}
  </div>
);
