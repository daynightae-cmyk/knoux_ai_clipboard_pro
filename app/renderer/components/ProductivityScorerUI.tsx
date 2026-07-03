import React, { useState, useEffect } from 'react';

interface ProductivityScorerUIProps {
  onScoreUpdate?: (score: number) => void;
}

export const ProductivityScorerUI: React.FC<ProductivityScorerUIProps> = ({ onScoreUpdate }) => {
  const [currentScore, setCurrentScore] = useState<any>(null);
  const [scoreSummary, setScoreSummary] = useState<any>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  useEffect(() => {
    loadMockData();
  }, []);

  const loadMockData = () => {
    const mockSummary = {
      overall: 75,
      trend: 'increasing',
      improvementNeeded: false,
      categories: {
        efficiency: 0.8,
        quality: 0.75,
        diversity: 0.7,
        learning: 0.72,
        focus: 0.78,
        innovation: 0.68
      }
    };
    setScoreSummary(mockSummary);
    onScoreUpdate?.(mockSummary.overall);
  };

  const handleCalculateScore = () => {
    setIsCalculating(true);
    setTimeout(() => {
      loadMockData();
      setIsCalculating(false);
    }, 1000);
  };

  const renderCategoryScore = (category: string, score: number, icon: string) => {
    const percentage = Math.round(score * 100);
    const color = percentage >= 80 ? 'excellent' : percentage >= 60 ? 'good' : percentage >= 40 ? 'fair' : 'poor';
    
    return (
      <div key={category} className={`category-score ${color}`}>
        <div className="category-icon">{icon}</div>
        <div className="category-info">
          <div className="category-name">{category}</div>
          <div className="category-percentage">{percentage}%</div>
        </div>
        <div className="category-bar">
          <div className="category-fill" style={{ width: `${percentage}%` }} />
        </div>
      </div>
    );
  };

  return (
    <div className="productivity-scorer-ui">
      <div className="scorer-header">
        <h3>🎯 Productivity Scorer</h3>
        <div className="controls">
          <select
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
          >
            {availableUsers.map(user => (
              <option key={user} value={user}>{user}</option>
            ))}
          </select>
          <select
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e.target.value)}
          >
            <option value="1d">Last Day</option>
            <option value="7d">Last Week</option>
            <option value="30d">Last Month</option>
          </select>
          <button
            onClick={handleCalculateScore}
            disabled={isCalculating}
            className="calculate-btn"
          >
            {isCalculating ? '⏳ Calculating...' : '🎯 Calculate Score'}
          </button>
        </div>
      </div>

      {/* Overall Score Display */}
      {scoreSummary && (
        <div className="overall-score-section">
          <div className="score-display">
            <div className="score-circle">
              <div className="score-number">{scoreSummary.overall}</div>
              <div className="score-label">Overall Score</div>
            </div>
            <div className="score-trend">
              <span className={`trend-indicator ${scoreSummary.trend}`}>
                {scoreSummary.trend === 'increasing' ? '📈' : 
                 scoreSummary.trend === 'decreasing' ? '📉' : '➡️'}
              </span>
              <span className="trend-text">{scoreSummary.trend}</span>
            </div>
          </div>
          
          {scoreSummary.improvementNeeded && (
            <div className="improvement-alert">
              ⚠️ Your productivity score could use some improvement. Check the recommendations below!
            </div>
          )}
        </div>
      )}

      {/* Category Scores */}
      {scoreSummary && (
        <div className="category-scores-section">
          <h4>📊 Category Breakdown</h4>
          <div className="categories-grid">
            {renderCategoryScore('Efficiency', scoreSummary.categories.efficiency, '⚡')}
            {renderCategoryScore('Quality', scoreSummary.categories.quality, '✨')}
            {renderCategoryScore('Diversity', scoreSummary.categories.diversity, '🌈')}
            {renderCategoryScore('Learning', scoreSummary.categories.learning, '📚')}
            {renderCategoryScore('Focus', scoreSummary.categories.focus, '🎯')}
            {renderCategoryScore('Innovation', scoreSummary.categories.innovation, '💡')}
          </div>
        </div>
      )}

      {/* Daily Challenge */}
      {dailyChallenge && (
        <div className="daily-challenge-section">
          <div className="section-header">
            <h4>🏆 Daily Challenge</h4>
            <button onClick={handleRefreshChallenge} className="refresh-btn">
              🔄 New Challenge
            </button>
          </div>
          
          <div className="challenge-info">
            <div className="challenge-meta">
              <span className="challenge-difficulty">{dailyChallenge.difficulty}</span>
              <span className="challenge-time">{dailyChallenge.metadata.estimatedTime}</span>
              <span className="challenge-energy">{dailyChallenge.metadata.energyRequired} energy</span>
            </div>
            
            <div className="challenge-progress">
              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{ 
                    width: `${(dailyChallenge.progress.completed / dailyChallenge.progress.total) * 100}%` 
                  }}
                />
              </div>
              <span className="progress-text">
                {dailyChallenge.progress.completed}/{dailyChallenge.progress.total} tasks
              </span>
            </div>
            
            <div className="challenge-tasks">
              {dailyChallenge.design.tasks.map((task: any, index: number) => (
                <div key={index} className="task-item">
                  <span className="task-name">{task.name}</span>
                  <span className="task-points">{task.points} pts</span>
                </div>
              ))}
            </div>
            
            <div className="streak-info">
              <span>Current Streak: <strong>{dailyChallenge.progress.currentStreak} days</strong></span>
              <span>Best Streak: <strong>{dailyChallenge.progress.bestStreak} days</strong></span>
            </div>
          </div>
        </div>
      )}

      {/* Improvement Plan */}
      {improvementPlan && (
        <div className="improvement-plan-section">
          <h4>💡 Improvement Plan</h4>
          <div className="plan-summary">
            <div className="plan-stat">
              <span className="stat-value">{improvementPlan.totalSteps}</span>
              <span className="stat-label">Steps</span>
            </div>
            <div className="plan-stat">
              <span className="stat-value">{improvementPlan.estimatedTime}</span>
              <span className="stat-label">Daily Time</span>
            </div>
            <div className="plan-stat">
              <span className="stat-value">+{improvementPlan.expectedImprovement}%</span>
              <span className="stat-label">Expected Gain</span>
            </div>
          </div>
          
          <div className="first-step">
            <h5>🚀 Next Step:</h5>
            <div className="step-content">
              <div className="step-action">{improvementPlan.firstStep?.action}</div>
              <div className="step-timeline">Timeline: {improvementPlan.firstStep?.timeline}</div>
              <div className="step-impact">Impact: +{Math.round((improvementPlan.firstStep?.impact || 0) * 100)}%</div>
            </div>
          </div>
          
          <div className="motivation">
            <div className="motivation-text">{improvementPlan.motivation}</div>
          </div>
        </div>
      )}

      {/* Insights and Recommendations */}
      {currentScore && (
        <div className="insights-recommendations">
          <div className="insights-section">
            <h4>💡 Key Insights</h4>
            <div className="insights-list">
              {currentScore.insights.map((insight, index) => renderInsight(insight, index))}
            </div>
          </div>
          
          <div className="recommendations-section">
            <h4>🎯 Recommendations</h4>
            <div className="recommendations-list">
              {currentScore.recommendations.map((rec, index) => renderRecommendation(rec, index))}
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .productivity-scorer-ui {
          padding: 20px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 12px;
          color: white;
          max-width: 1000px;
        }

        .scorer-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .scorer-header h3 {
          margin: 0;
          font-size: 1.5em;
        }

        .controls {
          display: flex;
          gap: 10px;
          align-items: center;
        }

        .controls select {
          padding: 8px 12px;
          border: none;
          border-radius: 6px;
          background: rgba(255, 255, 255, 0.9);
          color: #333;
        }

        .calculate-btn {
          padding: 10px 15px;
          border: none;
          border-radius: 6px;
          background: #e74c3c;
          color: white;
          cursor: pointer;
          font-weight: 500;
        }

        .calculate-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .overall-score-section {
          background: rgba(255, 255, 255, 0.1);
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 20px;
          text-align: center;
        }

        .score-display {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 30px;
        }

        .score-circle {
          width: 120px;
          height: 120px;
          border-radius: 50%;
          background: conic-gradient(from 0deg, #2ecc71 0%, #f39c12 70%, #e74c3c 100%);
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          position: relative;
        }

        .score-circle::before {
          content: '';
          position: absolute;
          width: 90px;
          height: 90px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 50%;
        }

        .score-number {
          font-size: 2em;
          font-weight: bold;
          z-index: 1;
        }

        .score-label {
          font-size: 0.9em;
          opacity: 0.8;
          z-index: 1;
        }

        .score-trend {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 5px;
        }

        .trend-indicator {
          font-size: 2em;
        }

        .trend-text {
          font-weight: 500;
          text-transform: capitalize;
        }

        .improvement-alert {
          margin-top: 15px;
          padding: 10px;
          background: rgba(241, 196, 15, 0.2);
          border-radius: 6px;
          border-left: 4px solid #f1c40f;
        }

        .category-scores-section {
          background: rgba(255, 255, 255, 0.1);
          padding: 15px;
          border-radius: 8px;
          margin-bottom: 20px;
        }

        .category-scores-section h4 {
          margin: 0 0 15px 0;
        }

        .categories-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 15px;
        }

        .category-score {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 6px;
        }

        .category-score.excellent { border-left: 4px solid #2ecc71; }
        .category-score.good { border-left: 4px solid #3498db; }
        .category-score.fair { border-left: 4px solid #f39c12; }
        .category-score.poor { border-left: 4px solid #e74c3c; }

        .category-icon {
          font-size: 1.5em;
        }

        .category-info {
          flex: 1;
        }

        .category-name {
          font-weight: 500;
          margin-bottom: 4px;
        }

        .category-percentage {
          font-size: 1.2em;
          font-weight: bold;
        }

        .category-bar {
          width: 60px;
          height: 8px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 4px;
          overflow: hidden;
        }

        .category-fill {
          height: 100%;
          background: linear-gradient(90deg, #e74c3c 0%, #f39c12 50%, #2ecc71 100%);
          transition: width 0.3s ease;
        }

        .daily-challenge-section {
          background: rgba(255, 255, 255, 0.1);
          padding: 15px;
          border-radius: 8px;
          margin-bottom: 20px;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
        }

        .section-header h4 {
          margin: 0;
        }

        .refresh-btn {
          padding: 6px 12px;
          border: none;
          border-radius: 4px;
          background: rgba(255, 255, 255, 0.2);
          color: white;
          cursor: pointer;
          font-size: 0.9em;
        }

        .challenge-meta {
          display: flex;
          gap: 15px;
          margin-bottom: 15px;
        }

        .challenge-difficulty,
        .challenge-time,
        .challenge-energy {
          padding: 4px 8px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 4px;
          font-size: 0.9em;
        }

        .challenge-progress {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 15px;
        }

        .progress-bar {
          flex: 1;
          height: 8px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 4px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: #2ecc71;
          transition: width 0.3s ease;
        }

        .progress-text {
          font-size: 0.9em;
          font-weight: 500;
        }

        .challenge-tasks {
          margin-bottom: 15px;
        }

        .task-item {
          display: flex;
          justify-content: space-between;
          padding: 8px;
          background: rgba(0, 0, 0, 0.2);
          border-radius: 4px;
          margin-bottom: 5px;
        }

        .task-points {
          color: #f1c40f;
          font-weight: 500;
        }

        .streak-info {
          display: flex;
          justify-content: space-between;
          font-size: 0.9em;
        }

        .improvement-plan-section {
          background: rgba(255, 255, 255, 0.1);
          padding: 15px;
          border-radius: 8px;
          margin-bottom: 20px;
        }

        .improvement-plan-section h4 {
          margin: 0 0 15px 0;
        }

        .plan-summary {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 15px;
          margin-bottom: 20px;
        }

        .plan-stat {
          text-align: center;
          padding: 15px;
          background: rgba(0, 0, 0, 0.2);
          border-radius: 6px;
        }

        .stat-value {
          display: block;
          font-size: 1.5em;
          font-weight: bold;
          color: #2ecc71;
          margin-bottom: 5px;
        }

        .stat-label {
          font-size: 0.9em;
          opacity: 0.8;
        }

        .first-step {
          margin-bottom: 15px;
        }

        .first-step h5 {
          margin: 0 0 10px 0;
          color: #f39c12;
        }

        .step-content {
          background: rgba(0, 0, 0, 0.2);
          padding: 12px;
          border-radius: 6px;
        }

        .step-action {
          font-weight: 500;
          margin-bottom: 8px;
        }

        .step-timeline,
        .step-impact {
          font-size: 0.9em;
          opacity: 0.8;
          margin-bottom: 4px;
        }

        .motivation {
          text-align: center;
          font-style: italic;
          color: #3498db;
        }

        .insights-recommendations {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        .insights-section,
        .recommendations-section {
          background: rgba(255, 255, 255, 0.1);
          padding: 15px;
          border-radius: 8px;
        }

        .insights-section h4,
        .recommendations-section h4 {
          margin: 0 0 15px 0;
        }

        .insight-item,
        .recommendation-item {
          background: rgba(0, 0, 0, 0.2);
          padding: 12px;
          border-radius: 6px;
          margin-bottom: 10px;
        }

        .insight-header,
        .rec-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }

        .insight-title,
        .rec-title {
          font-weight: 500;
        }

        .insight-impact {
          color: #f39c12;
          font-size: 0.9em;
        }

        .rec-difficulty {
          padding: 2px 6px;
          border-radius: 3px;
          font-size: 0.8em;
        }

        .rec-difficulty.easy { background: #2ecc71; }
        .rec-difficulty.medium { background: #f39c12; }
        .rec-difficulty.hard { background: #e74c3c; }

        .insight-description,
        .rec-description {
          font-size: 0.9em;
          opacity: 0.9;
          margin-bottom: 5px;
        }

        .rec-impact {
          font-size: 0.8em;
          color: #2ecc71;
        }
      `}</style>
    </div>
  );
};

export default ProductivityScorerUI;