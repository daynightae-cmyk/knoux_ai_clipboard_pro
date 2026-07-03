import React, { useState, useEffect } from "react";

interface AnalyticsDashboardUIProps {
  onInsightGenerated?: (insight: string) => void;
}

export const AnalyticsDashboardUI: React.FC<AnalyticsDashboardUIProps> = ({
  onInsightGenerated,
}) => {
  const [dashboard, setDashboard] = useState<AnalyticsDashboard | null>(null);
  const [metrics, setMetrics] = useState<UsageMetrics | null>(null);
  const [realTimeMetrics, setRealTimeMetrics] =
    useState<RealTimeMetrics | null>(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState("7d");
  const [analysisResults, setAnalysisResults] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    loadDashboard();
    loadRealTimeMetrics();

    const interval = setInterval(loadRealTimeMetrics, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadDashboard = async () => {
    try {
      const dashboardData = await window.knox.invoke(
        "analyticsDashboard:getDashboardData",
      );
      setDashboard(dashboardData.dashboard);
      setMetrics(dashboardData.metrics);
    } catch (error) {
      console.error("Error loading dashboard:", error);
    }
  };

  const loadRealTimeMetrics = async () => {
    try {
      const rtMetrics = await window.knox.invoke(
        "analyticsDashboard:getRealTimeMetrics",
      );
      setRealTimeMetrics(rtMetrics);
    } catch (error) {
      console.error("Error loading real-time metrics:", error);
    }
  };

  const handleQuickAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const analysis = await window.knox.invoke(
        "analyticsDashboard:quickAnalyze",
        selectedTimeframe,
      );
      setAnalysisResults(analysis);

      if (analysis.recommendations.length > 0) {
        onInsightGenerated?.(analysis.recommendations[0]);
      }
    } catch (error) {
      console.error("Error performing analysis:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCopyHabitsAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const habits = await window.knox.invoke(
        "analyticsDashboard:analyzeCopyHabits",
        selectedTimeframe,
      );
      setAnalysisResults({ type: "habits", data: habits });
    } catch (error) {
      console.error("Error analyzing copy habits:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleProductivityAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const productivity = await window.knox.invoke(
        "analyticsDashboard:detectProductivityPeaks",
        selectedTimeframe,
      );
      setAnalysisResults({ type: "productivity", data: productivity });
    } catch (error) {
      console.error("Error analyzing productivity:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleInterestGraph = async () => {
    setIsAnalyzing(true);
    try {
      const interests = await window.knox.invoke(
        "analyticsDashboard:createInterestGraph",
        selectedTimeframe,
      );
      setAnalysisResults({ type: "interests", data: interests });
    } catch (error) {
      console.error("Error creating interest graph:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSemanticSearch = async () => {
    if (!searchQuery.trim()) return;

    try {
      const results = await window.knox.invoke(
        "analyticsDashboard:semanticSearch",
        searchQuery,
      );
      setSearchResults(results);
    } catch (error) {
      console.error("Error performing semantic search:", error);
    }
  };

  const renderMetricCard = (
    title: string,
    value: string | number,
    icon: string,
    color: string,
  ) => (
    <div className={`metric-card ${color}`}>
      <div className="metric-icon">{icon}</div>
      <div className="metric-content">
        <div className="metric-value">{value}</div>
        <div className="metric-title">{title}</div>
      </div>
    </div>
  );

  const renderAnalysisResults = () => {
    if (!analysisResults) return null;

    switch (analysisResults.type) {
      case "habits":
        return (
          <div className="analysis-results">
            <h4>📈 Copy Habits Analysis</h4>
            <div className="habits-summary">
              <div className="productivity-score">
                Productivity Score:{" "}
                <span className="score">
                  {(analysisResults.data.productivity.score * 100).toFixed(1)}%
                </span>
              </div>
              <div className="patterns-count">
                Patterns Identified:{" "}
                <span className="count">
                  {analysisResults.data.patterns.length}
                </span>
              </div>
            </div>

            <div className="insights-section">
              <h5>💡 Key Insights:</h5>
              <ul>
                {analysisResults.data.insights.map(
                  (insight: string, index: number) => (
                    <li key={index}>{insight}</li>
                  ),
                )}
              </ul>
            </div>

            <div className="recommendations-section">
              <h5>🎯 Recommendations:</h5>
              <ul>
                {analysisResults.data.recommendations.map(
                  (rec: string, index: number) => (
                    <li key={index}>{rec}</li>
                  ),
                )}
              </ul>
            </div>
          </div>
        );

      case "productivity":
        return (
          <div className="analysis-results">
            <h4>⏰ Productivity Peaks Analysis</h4>
            <div className="peaks-summary">
              <div className="peaks-count">
                Peak Hours Identified:{" "}
                <span className="count">
                  {analysisResults.data.peaks.length}
                </span>
              </div>
              <div className="data-points">
                Data Points:{" "}
                <span className="count">
                  {analysisResults.data.totalDataPoints}
                </span>
              </div>
            </div>

            <div className="peaks-list">
              <h5>🔥 Peak Times:</h5>
              {analysisResults.data.peaks.map((peak: any, index: number) => (
                <div key={index} className="peak-item">
                  <span className="peak-time">{peak.time}:00</span>
                  <span className="peak-intensity">
                    {(peak.intensity * 100).toFixed(0)}% intensity
                  </span>
                  <span className="peak-duration">{peak.duration}min</span>
                </div>
              ))}
            </div>

            <div className="recommendations-section">
              <h5>📋 Recommendations:</h5>
              <ul>
                {analysisResults.data.recommendations.map(
                  (rec: string, index: number) => (
                    <li key={index}>{rec}</li>
                  ),
                )}
              </ul>
            </div>
          </div>
        );

      case "interests":
        return (
          <div className="analysis-results">
            <h4>📊 Interest Graph</h4>
            <div className="graph-summary">
              <div className="nodes-count">
                Topics:{" "}
                <span className="count">{analysisResults.data.nodes}</span>
              </div>
              <div className="edges-count">
                Connections:{" "}
                <span className="count">{analysisResults.data.edges}</span>
              </div>
            </div>

            <div className="topics-section">
              <h5>🏷️ Main Topics:</h5>
              <div className="topics-list">
                {analysisResults.data.topics.map(
                  (topic: string, index: number) => (
                    <span key={index} className="topic-tag">
                      {topic}
                    </span>
                  ),
                )}
              </div>
            </div>

            <div className="insights-section">
              <h5>🔍 Graph Insights:</h5>
              <ul>
                {analysisResults.data.insights.map(
                  (insight: string, index: number) => (
                    <li key={index}>{insight}</li>
                  ),
                )}
              </ul>
            </div>
          </div>
        );

      default:
        return (
          <div className="analysis-results">
            <h4>⚡ Quick Analysis Results</h4>
            <div className="quick-summary">
              <p>
                <strong>Timeframe:</strong> {analysisResults.timeframe}
              </p>
              <p>
                <strong>Summary:</strong> {analysisResults.summary}
              </p>
            </div>

            <div className="recommendations-section">
              <h5>💡 Top Recommendations:</h5>
              <ul>
                {analysisResults.recommendations.map(
                  (rec: string, index: number) => (
                    <li key={index}>{rec}</li>
                  ),
                )}
              </ul>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="analytics-dashboard-ui">
      <div className="dashboard-header">
        <h3>📊 Clipboard Analytics Dashboard</h3>
        <div className="timeframe-selector">
          <select
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e.target.value)}
          >
            <option value="1d">Last Day</option>
            <option value="7d">Last Week</option>
            <option value="30d">Last Month</option>
            <option value="90d">Last 3 Months</option>
          </select>
        </div>
      </div>

      {/* Real-time Metrics */}
      {realTimeMetrics && (
        <div className="realtime-section">
          <h4>⚡ Real-time Activity</h4>
          <div className="metrics-grid">
            {renderMetricCard(
              "Current Activity",
              realTimeMetrics.currentActivity,
              "🔥",
              "orange",
            )}
            {renderMetricCard(
              "Copies/Min",
              realTimeMetrics.copiesPerMinute.toFixed(1),
              "📋",
              "blue",
            )}
            {renderMetricCard(
              "Active Apps",
              realTimeMetrics.activeApps,
              "💻",
              "green",
            )}
            {renderMetricCard(
              "Productivity",
              `${(realTimeMetrics.productivityScore * 100).toFixed(0)}%`,
              "📈",
              "purple",
            )}
          </div>
        </div>
      )}

      {/* Overall Metrics */}
      {metrics && (
        <div className="metrics-section">
          <h4>📊 Usage Overview</h4>
          <div className="metrics-grid">
            {renderMetricCard(
              "Total Copies",
              metrics.totalCopies,
              "📋",
              "blue",
            )}
            {renderMetricCard(
              "Unique Content",
              metrics.uniqueContent,
              "🎯",
              "green",
            )}
            {renderMetricCard("Apps Used", metrics.appsUsed, "💻", "orange")}
            {renderMetricCard(
              "Productivity Score",
              `${(metrics.productivityScore * 100).toFixed(0)}%`,
              "📈",
              "purple",
            )}
          </div>
        </div>
      )}

      {/* Analysis Controls */}
      <div className="analysis-controls">
        <h4>🔍 Analysis Tools</h4>
        <div className="control-buttons">
          <button
            onClick={handleQuickAnalysis}
            disabled={isAnalyzing}
            className="analysis-btn quick"
          >
            {isAnalyzing ? "⏳ Analyzing..." : "⚡ Quick Analysis"}
          </button>

          <button
            onClick={handleCopyHabitsAnalysis}
            disabled={isAnalyzing}
            className="analysis-btn habits"
          >
            📈 Copy Habits
          </button>

          <button
            onClick={handleProductivityAnalysis}
            disabled={isAnalyzing}
            className="analysis-btn productivity"
          >
            ⏰ Productivity Peaks
          </button>

          <button
            onClick={handleInterestGraph}
            disabled={isAnalyzing}
            className="analysis-btn interests"
          >
            📊 Interest Graph
          </button>
        </div>
      </div>

      {/* Semantic Search */}
      <div className="search-section">
        <h4>🔍 Semantic Search</h4>
        <div className="search-controls">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search your clipboard history..."
            className="search-input"
          />
          <button
            onClick={handleSemanticSearch}
            disabled={!searchQuery.trim()}
            className="search-btn"
          >
            🔍 Search
          </button>
        </div>

        {searchResults && (
          <div className="search-results">
            <div className="results-summary">
              Found {searchResults.totalResults} results (Relevance:{" "}
              {(searchResults.relevanceScore * 100).toFixed(1)}%)
            </div>
            <div className="results-list">
              {searchResults.results
                .slice(0, 5)
                .map((result: any, index: number) => (
                  <div key={index} className="result-item">
                    <div className="result-content">{result.content}</div>
                    <div className="result-meta">
                      Relevance: {(result.relevance * 100).toFixed(0)}% |
                      {new Date(result.timestamp).toLocaleString()}
                    </div>
                  </div>
                ))}
            </div>

            {searchResults.suggestions.length > 0 && (
              <div className="search-suggestions">
                <h5>💡 Suggested Searches:</h5>
                <div className="suggestions-list">
                  {searchResults.suggestions.map(
                    (suggestion: string, index: number) => (
                      <button
                        key={index}
                        onClick={() => setSearchQuery(suggestion)}
                        className="suggestion-btn"
                      >
                        {suggestion}
                      </button>
                    ),
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Analysis Results */}
      {renderAnalysisResults()}

      <style jsx>{`
        .analytics-dashboard-ui {
          padding: 20px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 12px;
          color: white;
          max-width: 1200px;
        }

        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .dashboard-header h3 {
          margin: 0;
          font-size: 1.5em;
        }

        .timeframe-selector select {
          padding: 8px 12px;
          border: none;
          border-radius: 6px;
          background: rgba(255, 255, 255, 0.9);
          color: #333;
        }

        .realtime-section,
        .metrics-section {
          background: rgba(255, 255, 255, 0.1);
          padding: 15px;
          border-radius: 8px;
          margin-bottom: 20px;
        }

        .realtime-section h4,
        .metrics-section h4 {
          margin: 0 0 15px 0;
        }

        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 15px;
        }

        .metric-card {
          display: flex;
          align-items: center;
          padding: 15px;
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.1);
        }

        .metric-card.blue {
          border-left: 4px solid #3498db;
        }
        .metric-card.green {
          border-left: 4px solid #2ecc71;
        }
        .metric-card.orange {
          border-left: 4px solid #f39c12;
        }
        .metric-card.purple {
          border-left: 4px solid #9b59b6;
        }

        .metric-icon {
          font-size: 1.5em;
          margin-right: 12px;
        }

        .metric-value {
          font-size: 1.8em;
          font-weight: bold;
          margin-bottom: 4px;
        }

        .metric-title {
          font-size: 0.9em;
          opacity: 0.8;
        }

        .analysis-controls {
          background: rgba(255, 255, 255, 0.1);
          padding: 15px;
          border-radius: 8px;
          margin-bottom: 20px;
        }

        .analysis-controls h4 {
          margin: 0 0 15px 0;
        }

        .control-buttons {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 10px;
        }

        .analysis-btn {
          padding: 12px 15px;
          border: none;
          border-radius: 6px;
          color: white;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.3s ease;
        }

        .analysis-btn.quick {
          background: #e74c3c;
        }
        .analysis-btn.habits {
          background: #3498db;
        }
        .analysis-btn.productivity {
          background: #f39c12;
        }
        .analysis-btn.interests {
          background: #9b59b6;
        }

        .analysis-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .analysis-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        }

        .search-section {
          background: rgba(255, 255, 255, 0.1);
          padding: 15px;
          border-radius: 8px;
          margin-bottom: 20px;
        }

        .search-section h4 {
          margin: 0 0 15px 0;
        }

        .search-controls {
          display: flex;
          gap: 10px;
          margin-bottom: 15px;
        }

        .search-input {
          flex: 1;
          padding: 10px;
          border: none;
          border-radius: 6px;
          background: rgba(255, 255, 255, 0.9);
          color: #333;
        }

        .search-btn {
          padding: 10px 15px;
          border: none;
          border-radius: 6px;
          background: #27ae60;
          color: white;
          cursor: pointer;
          font-weight: 500;
        }

        .search-btn:disabled {
          background: #7f8c8d;
          cursor: not-allowed;
        }

        .search-results {
          background: rgba(0, 0, 0, 0.2);
          padding: 15px;
          border-radius: 6px;
        }

        .results-summary {
          font-weight: bold;
          margin-bottom: 15px;
          color: #f1c40f;
        }

        .results-list {
          margin-bottom: 15px;
        }

        .result-item {
          background: rgba(255, 255, 255, 0.1);
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

        .search-suggestions h5 {
          margin: 0 0 10px 0;
        }

        .suggestions-list {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .suggestion-btn {
          padding: 6px 12px;
          border: none;
          border-radius: 4px;
          background: rgba(255, 255, 255, 0.2);
          color: white;
          cursor: pointer;
          font-size: 0.9em;
        }

        .suggestion-btn:hover {
          background: rgba(255, 255, 255, 0.3);
        }

        .analysis-results {
          background: rgba(255, 255, 255, 0.1);
          padding: 15px;
          border-radius: 8px;
        }

        .analysis-results h4 {
          margin: 0 0 15px 0;
          color: #f1c40f;
        }

        .habits-summary,
        .peaks-summary,
        .graph-summary,
        .quick-summary {
          display: flex;
          gap: 20px;
          margin-bottom: 15px;
          padding: 10px;
          background: rgba(0, 0, 0, 0.2);
          border-radius: 4px;
        }

        .productivity-score .score,
        .patterns-count .count,
        .peaks-count .count,
        .data-points .count,
        .nodes-count .count,
        .edges-count .count {
          font-weight: bold;
          color: #2ecc71;
        }

        .insights-section,
        .recommendations-section {
          margin-bottom: 15px;
        }

        .insights-section h5,
        .recommendations-section h5 {
          margin: 0 0 10px 0;
          color: #3498db;
        }

        .insights-section ul,
        .recommendations-section ul {
          margin: 0;
          padding-left: 20px;
        }

        .insights-section li,
        .recommendations-section li {
          margin-bottom: 5px;
        }

        .peaks-list h5 {
          margin: 0 0 10px 0;
          color: #e74c3c;
        }

        .peak-item {
          display: flex;
          justify-content: space-between;
          padding: 8px;
          background: rgba(0, 0, 0, 0.2);
          border-radius: 4px;
          margin-bottom: 5px;
        }

        .peak-time {
          font-weight: bold;
          color: #f39c12;
        }

        .peak-intensity {
          color: #e74c3c;
        }

        .peak-duration {
          color: #3498db;
        }

        .topics-section h5 {
          margin: 0 0 10px 0;
          color: #9b59b6;
        }

        .topics-list {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 15px;
        }

        .topic-tag {
          padding: 4px 8px;
          background: rgba(155, 89, 182, 0.3);
          border-radius: 12px;
          font-size: 0.9em;
          border: 1px solid rgba(155, 89, 182, 0.5);
        }
      `}</style>
    </div>
  );
};

export default AnalyticsDashboardUI;
