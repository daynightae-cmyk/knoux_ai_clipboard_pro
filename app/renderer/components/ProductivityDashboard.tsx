import React, { useState, useEffect } from 'react';

interface ProductivityDashboardProps {
  userId: string;
}

export const ProductivityDashboard: React.FC<ProductivityDashboardProps> = ({ userId }) => {
  const [score, setScore] = useState<any>(null);
  const [insights, setInsights] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [progress, setProgress] = useState<any>(null);

  useEffect(() => {
    loadProductivityData();
    const ws = new WebSocket('ws://localhost:8080');
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'score-updated' && data.userId === userId) {
        setScore(data.data);
      }
    };

    return () => ws.close();
  }, [userId]);

  const loadProductivityData = async () => {
    // Load current score
    const scoreResponse = await fetch('/api/productivity/score', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, timeframe: '7d' })
    });
    const scoreData = await scoreResponse.json();
    setScore(scoreData);
    setInsights(scoreData.insights || []);
    setRecommendations(scoreData.recommendations || []);

    // Load progress data
    const progressResponse = await fetch(`/api/productivity/${userId}/progress?start=${Date.now() - 7*24*60*60*1000}&end=${Date.now()}`);
    const progressData = await progressResponse.json();
    setProgress(progressData);
  };

  const applyRecommendation = async (recommendationId: string) => {
    await fetch(`/api/productivity/${userId}/recommendation/${recommendationId}/apply`, {
      method: 'POST'
    });
    loadProductivityData(); // Refresh data
  };

  if (!score) return <div>Loading...</div>;

  return (
    <div className="productivity-dashboard p-6 bg-gray-50 rounded-lg">
      <h2 className="text-2xl font-bold mb-6">Productivity Dashboard</h2>
      
      {/* Score Card */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium">Overall Score</h3>
            <div className="text-3xl font-bold text-blue-600">{score.overallScore}</div>
          </div>
          <div className="text-right">
            <div className={`text-sm ${score.trend?.direction === 'up' ? 'text-green-600' : 'text-red-600'}`}>
              {score.trend?.direction === 'up' ? '↗' : '↘'} {score.trend?.delta}
            </div>
            <div className="text-xs text-gray-500">vs last week</div>
          </div>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {Object.entries(score.categoryScores || {}).map(([category, value]) => (
          <div key={category} className="bg-white p-4 rounded-lg shadow">
            <h4 className="text-sm font-medium capitalize mb-2">{category}</h4>
            <div className="text-xl font-bold">{Math.round((value as number) * 100)}</div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className="bg-blue-600 h-2 rounded-full" 
                style={{ width: `${(value as number) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Insights */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h3 className="text-lg font-medium mb-4">Key Insights</h3>
        {insights.slice(0, 5).map((insight, index) => (
          <div key={index} className="flex items-center justify-between py-2 border-b last:border-b-0">
            <div>
              <div className="font-medium">{insight.title}</div>
              <div className="text-sm text-gray-600">{insight.description}</div>
            </div>
            <div className="text-sm font-medium">
              Impact: {Math.round(insight.impact * 100)}%
            </div>
          </div>
        ))}
      </div>

      {/* Recommendations */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium mb-4">Recommendations</h3>
        {recommendations.slice(0, 3).map((rec, index) => (
          <div key={index} className="flex items-center justify-between py-3 border-b last:border-b-0">
            <div className="flex-1">
              <div className="font-medium">{rec.title}</div>
              <div className="text-sm text-gray-600">{rec.description}</div>
              <div className="text-xs text-blue-600 mt-1">Priority: {rec.priority}/10</div>
            </div>
            <button
              onClick={() => applyRecommendation(rec.id)}
              className="ml-4 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
            >
              Apply
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};