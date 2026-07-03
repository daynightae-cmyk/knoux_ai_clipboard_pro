import React, { useState, useEffect } from "react";

interface PatternRecognitionDashboardProps {
  userId: string;
}

export const PatternRecognitionDashboard: React.FC<
  PatternRecognitionDashboardProps
> = ({ userId }) => {
  const [behaviorAnalysis, setBehaviorAnalysis] = useState<any>(null);
  const [patternInsights, setPatternInsights] = useState<any>(null);
  const [monitoringDashboard, setMonitoringDashboard] = useState<any>(null);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPatternData();
    setupMonitoring();
  }, [userId]);

  const loadPatternData = async () => {
    try {
      setLoading(true);
      const [analysis, insights] = await Promise.all([
        window.knox.invoke("patternRecognizer:analyzeBehavior", userId),
        window.knox.invoke("patternRecognizer:getPatternInsights", userId),
      ]);

      setBehaviorAnalysis(analysis);
      setPatternInsights(insights);
    } catch (error) {
      console.error("Error loading pattern data:", error);
    } finally {
      setLoading(false);
    }
  };

  const setupMonitoring = async () => {
    try {
      const dashboard = await window.knox.invoke(
        "patternRecognizer:setupPatternMonitoring",
        userId,
      );
      setMonitoringDashboard(dashboard);
    } catch (error) {
      console.error("Error setting up monitoring:", error);
    }
  };

  const toggleMonitoring = async () => {
    if (!monitoringDashboard) return;

    try {
      if (isMonitoring) {
        await monitoringDashboard.stop();
        setIsMonitoring(false);
      } else {
        await monitoringDashboard.start();
        setIsMonitoring(true);
      }
    } catch (error) {
      console.error("Error toggling monitoring:", error);
    }
  };

  const getRiskColor = (risk: number) => {
    if (risk > 0.7) return "text-red-600 bg-red-100";
    if (risk > 0.4) return "text-yellow-600 bg-yellow-100";
    return "text-green-600 bg-green-100";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading pattern analysis...</div>
      </div>
    );
  }

  return (
    <div className="pattern-recognition-dashboard p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">🔍 Pattern Recognition Dashboard</h1>
        <button
          onClick={toggleMonitoring}
          className={`px-4 py-2 rounded-lg font-medium ${
            isMonitoring
              ? "bg-red-600 text-white hover:bg-red-700"
              : "bg-green-600 text-white hover:bg-green-700"
          }`}
        >
          {isMonitoring ? "⏹️ Stop Monitoring" : "▶️ Start Monitoring"}
        </button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Overall Risk</h3>
          <div
            className={`text-2xl font-bold px-2 py-1 rounded ${getRiskColor(behaviorAnalysis?.overallRisk || 0)}`}
          >
            {Math.round((behaviorAnalysis?.overallRisk || 0) * 100)}%
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">
            Improvement Potential
          </h3>
          <div className="text-2xl font-bold text-blue-600">
            {Math.round((behaviorAnalysis?.improvementPotential || 0) * 100)}%
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Diversity Score</h3>
          <div className="text-2xl font-bold text-purple-600">
            {Math.round((behaviorAnalysis?.diversityScore || 0) * 100)}%
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">
            Monitoring Status
          </h3>
          <div
            className={`text-lg font-bold ${isMonitoring ? "text-green-600" : "text-gray-400"}`}
          >
            {isMonitoring ? "🟢 Active" : "🔴 Inactive"}
          </div>
        </div>
      </div>

      {/* Harmful Patterns */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">🚨 Harmful Patterns Detected</h2>
        {behaviorAnalysis?.harmfulPatterns?.harmfulPatterns?.length > 0 ? (
          <div className="space-y-3">
            {behaviorAnalysis.harmfulPatterns.harmfulPatterns
              .slice(0, 5)
              .map((pattern: any, index: number) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 border rounded"
                >
                  <div>
                    <div className="font-medium">{pattern.pattern.name}</div>
                    <div className="text-sm text-gray-600">
                      {pattern.pattern.description}
                    </div>
                  </div>
                  <div className="text-right">
                    <div
                      className={`px-2 py-1 rounded text-sm font-medium ${getRiskColor(pattern.severity.score)}`}
                    >
                      {pattern.severity.label}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Confidence: {Math.round(pattern.pattern.confidence * 100)}
                      %
                    </div>
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No harmful patterns detected
          </div>
        )}
      </div>

      {/* Work Simplifications */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">
          📊 Work Simplification Suggestions
        </h2>
        {behaviorAnalysis?.simplifications?.simplificationSolutions?.length >
        0 ? (
          <div className="space-y-3">
            {behaviorAnalysis.simplifications.simplificationSolutions
              .slice(0, 3)
              .map((solution: any, index: number) => (
                <div key={index} className="p-3 border rounded">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">{solution.title}</div>
                    <div className="text-sm text-blue-600 font-medium">
                      {Math.round(solution.expectedBenefit * 100)}% improvement
                    </div>
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    {solution.description}
                  </div>
                  <div className="flex items-center mt-2 space-x-4">
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                      Effort: {solution.effort}
                    </span>
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      Time: {solution.estimatedTime}h
                    </span>
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No simplification opportunities found
          </div>
        )}
      </div>

      {/* Overconcentration Analysis */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">
          🎯 Content Concentration Analysis
        </h2>
        {behaviorAnalysis?.overconcentration?.overconcentrations?.length > 0 ? (
          <div className="space-y-3">
            {behaviorAnalysis.overconcentration.overconcentrations.map(
              (concentration: any, index: number) => (
                <div key={index} className="p-3 border rounded">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">
                        Category: {concentration.category}
                      </div>
                      <div className="text-sm text-gray-600">
                        You're copying{" "}
                        {Math.round(concentration.percentage * 100)}% from this
                        category
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-orange-600">
                        {Math.round(concentration.concentration * 100)}%
                      </div>
                      <div className="text-xs text-gray-500">Concentration</div>
                    </div>
                  </div>
                </div>
              ),
            )}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            Good content diversity detected
          </div>
        )}
      </div>

      {/* Pattern Evolution */}
      {patternInsights?.evolution && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">📈 Pattern Evolution</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {patternInsights.evolution.evolutionStages?.length || 0}
              </div>
              <div className="text-sm text-gray-600">Evolution Stages</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {Math.round(
                  (patternInsights.evolution.metadata?.evolutionRate || 0) *
                    100,
                )}
                %
              </div>
              <div className="text-sm text-gray-600">Evolution Rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {Math.round(
                  (patternInsights.evolution.metadata?.projectionConfidence ||
                    0) * 100,
                )}
                %
              </div>
              <div className="text-sm text-gray-600">Prediction Confidence</div>
            </div>
          </div>
        </div>
      )}

      {/* Future Predictions */}
      {patternInsights?.predictions && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">
            🎯 Future Pattern Predictions
          </h2>
          {patternInsights.predictions.futurePredictions?.length > 0 ? (
            <div className="space-y-3">
              {patternInsights.predictions.futurePredictions
                .slice(0, 3)
                .map((prediction: any, index: number) => (
                  <div key={index} className="p-3 border rounded">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{prediction.pattern}</div>
                        <div className="text-sm text-gray-600">
                          {prediction.description}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-indigo-600">
                          {Math.round(prediction.probability * 100)}%
                        </div>
                        <div className="text-xs text-gray-500">Probability</div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No significant future patterns predicted
            </div>
          )}
        </div>
      )}

      {/* Action Items */}
      {patternInsights?.actionItems?.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">✅ Recommended Actions</h2>
          <div className="space-y-2">
            {patternInsights.actionItems
              .slice(0, 5)
              .map((action: any, index: number) => (
                <div
                  key={index}
                  className="flex items-center p-2 hover:bg-gray-50 rounded"
                >
                  <div className="w-4 h-4 border-2 border-gray-300 rounded mr-3"></div>
                  <div className="flex-1">
                    <div className="font-medium">{action.title}</div>
                    <div className="text-sm text-gray-600">
                      {action.description}
                    </div>
                  </div>
                  <div className="text-sm text-blue-600 font-medium">
                    Priority: {action.priority}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Export Options */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-medium mb-2">Export Data</h3>
        <div className="flex space-x-2">
          <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">
            Export PDF Report
          </button>
          <button className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700">
            Export CSV Data
          </button>
          <button className="px-3 py-1 bg-purple-600 text-white text-sm rounded hover:bg-purple-700">
            Export JSON
          </button>
        </div>
      </div>
    </div>
  );
};
