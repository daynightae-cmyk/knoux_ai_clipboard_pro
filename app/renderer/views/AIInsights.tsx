/**
 * AI Insights View - Advanced AI Analysis and Pattern Recognition
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useAI } from '../hooks/useAI';
import { useTheme } from '../contexts/ThemeContext';
import { logger } from '../../shared/logger';
import {
  Brain,
  TrendingUp,
  BarChart3,
  PieChart,
  LineChart,
  Target,
  Filter,
  Download,
  RefreshCw,
  Calendar,
  Clock,
  Zap,
  Cpu,
  Sparkles,
  Lightbulb,
  AlertCircle,
  CheckCircle,
  XCircle,
  ChevronRight,
  ChevronDown,
  Search,
  Hash,
  Type,
  Image as ImageIcon,
  Code,
  Link,
  FileText,
  Mail,
  MessageSquare,
  Database,
  Layers
} from 'lucide-react';
import type { AIInsight, ContentPattern, AIPerformance } from '../../shared/types';

interface InsightCategory {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  color: string;
}

const AIInsights: React.FC = () => {
  const { theme } = useTheme();
  const { getInsights, analyzePatterns, getPerformanceMetrics } = useAI();
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('overview');
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month' | 'year'>('week');
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [patterns, setPatterns] = useState<ContentPattern[]>([]);
  const [performance, setPerformance] = useState<AIPerformance | null>(null);
  const [expandedInsights, setExpandedInsights] = useState<Set<string>>(new Set());

  const categories: InsightCategory[] = [
    { 
      id: 'overview', 
      name: 'Overview', 
      icon: <BarChart3 className="w-5 h-5" />, 
      description: 'AI performance summary',
      color: 'from-blue-500 to-cyan-500'
    },
    { 
      id: 'patterns', 
      name: 'Patterns', 
      icon: <Target className="w-5 h-5" />, 
      description: 'Content patterns detected',
      color: 'from-purple-500 to-pink-500'
    },
    { 
      id: 'efficiency', 
      name: 'Efficiency', 
      icon: <Zap className="w-5 h-5" />, 
      description: 'Processing efficiency metrics',
      color: 'from-green-500 to-emerald-500'
    },
    { 
      id: 'accuracy', 
      name: 'Accuracy', 
      icon: <Brain className="w-5 h-5" />, 
      description: 'AI model accuracy',
      color: 'from-orange-500 to-red-500'
    },
    { 
      id: 'trends', 
      name: 'Trends', 
      icon: <TrendingUp className="w-5 h-5" />, 
      description: 'Usage trends over time',
      color: 'from-indigo-500 to-blue-500'
    },
    { 
      id: 'recommendations', 
      name: 'Recommendations', 
      icon: <Lightbulb className="w-5 h-5" />, 
      description: 'AI-powered suggestions',
      color: 'from-yellow-500 to-orange-500'
    },
  ];

  // Load insights data
  useEffect(() => {
    loadInsightsData();
  }, [timeRange]);

  const loadInsightsData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch all insights data in parallel
      const [insightsData, patternsData, performanceData] = await Promise.all([
        getInsights(timeRange),
        analyzePatterns(timeRange),
        getPerformanceMetrics(timeRange)
      ]);

      setInsights(insightsData);
      setPatterns(patternsData);
      setPerformance(performanceData);
      
      logger.info('AI insights loaded', { 
        insights: insightsData.length, 
        patterns: patternsData.length 
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load insights';
      logger.error('Failed to load AI insights:', error);
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [timeRange, getInsights, analyzePatterns, getPerformanceMetrics]);

  const toggleInsight = (id: string) => {
    setExpandedInsights(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const exportInsights = useCallback(async (format: 'json' | 'csv') => {
    try {
      const data = { insights, patterns, performance, exportedAt: new Date().toISOString() };
      let content: string;
      let filename: string;
      
      if (format === 'json') {
        content = JSON.stringify(data, null, 2);
        filename = `ai-insights-${Date.now()}.json`;
      } else {
        // Convert to CSV
        const insightsCSV = insights.map(i => 
          `${i.id},${i.type},${i.title},${i.description},${i.confidence},${i.timestamp}`
        ).join('\n');
        const headers = 'ID,Type,Title,Description,Confidence,Timestamp\n';
        content = headers + insightsCSV;
        filename = `ai-insights-${Date.now()}.csv`;
      }
      
      const blob = new Blob([content], { type: format === 'json' ? 'application/json' : 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
      
      logger.info('Insights exported', { format, insights: insights.length });
    } catch (error) {
      logger.error('Failed to export insights:', error);
    }
  }, [insights, patterns, performance]);

  const formatConfidence = (confidence: number) => {
    const percentage = (confidence * 100).toFixed(1);
    let color = 'text-green-600 dark:text-green-400';
    
    if (confidence < 0.7) color = 'text-yellow-600 dark:text-yellow-400';
    if (confidence < 0.5) color = 'text-red-600 dark:text-red-400';
    
    return <span className={`font-bold ${color}`}>{percentage}%</span>;
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Performance Summary */}
      {performance && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl p-5 text-white">
            <div className="flex items-center justify-between mb-3">
              <Zap className="w-8 h-8 opacity-80" />
              <span className="text-2xl font-bold">{performance.totalOperations}</span>
            </div>
            <h4 className="font-semibold mb-1">Total Operations</h4>
            <p className="text-sm opacity-90">AI processes executed</p>
          </div>
          
          <div className="bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl p-5 text-white">
            <div className="flex items-center justify-between mb-3">
              <Cpu className="w-8 h-8 opacity-80" />
              <span className="text-2xl font-bold">{performance.avgProcessingTime}ms</span>
            </div>
            <h4 className="font-semibold mb-1">Avg Processing</h4>
            <p className="text-sm opacity-90">Time per operation</p>
          </div>
          
          <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl p-5 text-white">
            <div className="flex items-center justify-between mb-3">
              <Brain className="w-8 h-8 opacity-80" />
              <span className="text-2xl font-bold">{(performance.accuracy * 100).toFixed(1)}%</span>
            </div>
            <h4 className="font-semibold mb-1">Accuracy Rate</h4>
            <p className="text-sm opacity-90">Successful operations</p>
          </div>
          
          <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-xl p-5 text-white">
            <div className="flex items-center justify-between mb-3">
              <Sparkles className="w-8 h-8 opacity-80" />
              <span className="text-2xl font-bold">{performance.tokensProcessed}</span>
            </div>
            <h4 className="font-semibold mb-1">Tokens Processed</h4>
            <p className="text-sm opacity-90">Total AI tokens</p>
          </div>
        </div>
      )}

      {/* Top Insights */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
          <Lightbulb className="w-6 h-6 text-yellow-500 mr-2" />
          Key Insights
        </h3>
        <div className="space-y-4">
          {insights.slice(0, 5).map(insight => (
            <div 
              key={insight.id}
              className={`p-4 rounded-lg border ${
                insight.severity === 'high' 
                  ? 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20'
                  : insight.severity === 'medium'
                  ? 'border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20'
                  : 'border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    {insight.type === 'performance' && <Zap className="w-4 h-4 text-blue-500 mr-2" />}
                    {insight.type === 'pattern' && <Target className="w-4 h-4 text-purple-500 mr-2" />}
                    {insight.type === 'recommendation' && <Lightbulb className="w-4 h-4 text-yellow-500 mr-2" />}
                    {insight.type === 'anomaly' && <AlertCircle className="w-4 h-4 text-red-500 mr-2" />}
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      {insight.title}
                    </h4>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 text-sm mb-2">
                    {insight.description}
                  </p>
                  <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                    <Clock className="w-3 h-3 mr-1" />
                    {formatTimestamp(insight.timestamp)}
                    <span className="mx-2">•</span>
                    Confidence: {formatConfidence(insight.confidence)}
                  </div>
                </div>
                {insight.actions && (
                  <button
                    onClick={() => toggleInsight(insight.id)}
                    className="ml-4 p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                  >
                    {expandedInsights.has(insight.id) ? 
                      <ChevronDown className="w-5 h-5" /> : 
                      <ChevronRight className="w-5 h-5" />
                    }
                  </button>
                )}
              </div>
              
              {expandedInsights.has(insight.id) && insight.actions && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex space-x-3">
                    {insight.actions.map((action, idx) => (
                      <button
                        key={idx}
                        onClick={() => action.handler()}
                        className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                      >
                        {action.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderPatterns = () => (
    <div className="space-y-6">
      {/* Pattern Categories */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {['text', 'code', 'links', 'images'].map((type, idx) => {
          const patternCount = patterns.filter(p => p.contentType === type).length;
          const icons = {
            text: <Type className="w-6 h-6" />,
            code: <Code className="w-6 h-6" />,
            links: <Link className="w-6 h-6" />,
            images: <ImageIcon className="w-6 h-6" />
          };
          const colors = {
            text: 'from-blue-500 to-cyan-500',
            code: 'from-purple-500 to-pink-500',
            links: 'from-green-500 to-emerald-500',
            images: 'from-orange-500 to-red-500'
          };
          
          return (
            <div 
              key={idx}
              className={`bg-gradient-to-br ${colors[type as keyof typeof colors]} rounded-xl p-5 text-white`}
            >
              <div className="flex items-center justify-between mb-3">
                {icons[type as keyof typeof icons]}
                <span className="text-2xl font-bold">{patternCount}</span>
              </div>
              <h4 className="font-semibold mb-1 capitalize">{type}</h4>
              <p className="text-sm opacity-90">Patterns detected</p>
            </div>
          );
        })}
      </div>

      {/* Pattern List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
          <Target className="w-6 h-6 text-purple-500 mr-2" />
          Detected Patterns
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">Type</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">Pattern</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">Frequency</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">Confidence</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">Last Seen</th>
              </tr>
            </thead>
            <tbody>
              {patterns.map(pattern => (
                <tr 
                  key={pattern.id}
                  className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center">
                      {pattern.contentType === 'text' && <Type className="w-4 h-4 text-blue-500 mr-2" />}
                      {pattern.contentType === 'code' && <Code className="w-4 h-4 text-purple-500 mr-2" />}
                      {pattern.contentType === 'links' && <Link className="w-4 h-4 text-green-500 mr-2" />}
                      {pattern.contentType === 'images' && <ImageIcon className="w-4 h-4 text-orange-500 mr-2" />}
                      <span className="capitalize">{pattern.contentType}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="max-w-xs truncate" title={pattern.pattern}>
                      {pattern.pattern}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center">
                      <Hash className="w-4 h-4 text-gray-400 mr-2" />
                      {pattern.frequency}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    {formatConfidence(pattern.confidence)}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                    {formatTimestamp(pattern.lastSeen)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderEfficiency = () => (
    <div className="space-y-6">
      {/* Efficiency Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Processing Speed</h4>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Average</span>
              <span className="font-bold text-gray-900 dark:text-white">
                {performance?.avgProcessingTime || 0}ms
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Fastest</span>
              <span className="font-bold text-green-600 dark:text-green-400">
                {performance?.minProcessingTime || 0}ms
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Slowest</span>
              <span className="font-bold text-red-600 dark:text-red-400">
                {performance?.maxProcessingTime || 0}ms
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Resource Usage</h4>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Memory</span>
              <span className="font-bold text-gray-900 dark:text-white">
                {(performance?.memoryUsage || 0).toFixed(1)} MB
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">CPU</span>
              <span className="font-bold text-gray-900 dark:text-white">
                {(performance?.cpuUsage || 0).toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Cache Hit</span>
              <span className="font-bold text-gray-900 dark:text-white">
                {(performance?.cacheHitRate || 0).toFixed(1)}%
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Operation Types</h4>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Enhancements</span>
              <span className="font-bold text-blue-600 dark:text-blue-400">
                {performance?.operationCounts?.enhance || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Summaries</span>
              <span className="font-bold text-purple-600 dark:text-purple-400">
                {performance?.operationCounts?.summarize || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Classifications</span>
              <span className="font-bold text-green-600 dark:text-green-400">
                {performance?.operationCounts?.classify || 0}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Chart Placeholder */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Performance Trends</h4>
        <div className="h-64 flex items-center justify-center text-gray-500 dark:text-gray-400">
          <div className="text-center">
            <LineChart className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Performance chart visualization would appear here</p>
            <p className="text-sm mt-2">Showing data for the past {timeRange}</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (selectedCategory) {
      case 'overview': return renderOverview();
      case 'patterns': return renderPatterns();
      case 'efficiency': return renderEfficiency();
      case 'accuracy': return renderAccuracy();
      case 'trends': return renderTrends();
      case 'recommendations': return renderRecommendations();
      default: return renderOverview();
    }
  };

  const renderAccuracy = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Model Accuracy Analysis</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Success Rates by Operation</h4>
            <div className="space-y-4">
              {[
                { operation: 'Text Enhancement', rate: 0.92, color: 'bg-blue-500' },
                { operation: 'Code Analysis', rate: 0.88, color: 'bg-purple-500' },
                { operation: 'Image Processing', rate: 0.78, color: 'bg-orange-500' },
                { operation: 'Language Detection', rate: 0.96, color: 'bg-green-500' },
                { operation: 'Sentiment Analysis', rate: 0.85, color: 'bg-pink-500' },
              ].map((item, idx) => (
                <div key={idx} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700 dark:text-gray-300">{item.operation}</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {(item.rate * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${item.color}`}
                      style={{ width: `${item.rate * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Confidence Distribution</h4>
            <div className="space-y-4">
              {[
                { range: '90-100%', count: 45, color: 'bg-green-500' },
                { range: '70-89%', count: 32, color: 'bg-blue-500' },
                { range: '50-69%', count: 15, color: 'bg-yellow-500' },
                { range: 'Below 50%', count: 8, color: 'bg-red-500' },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full ${item.color} mr-3`} />
                    <span className="text-gray-700 dark:text-gray-300">{item.range}</span>
                  </div>
                  <span className="font-semibold text-gray-900 dark:text-white">{item.count} operations</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTrends = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Usage Trends</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
            <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {performance?.dailyAverage || 0}
            </div>
            <p className="text-gray-600 dark:text-gray-400">Daily Operations</p>
          </div>
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
            <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {Math.round((performance?.growthRate || 0) * 100)}%
            </div>
            <p className="text-gray-600 dark:text-gray-400">Growth Rate</p>
          </div>
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
            <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {performance?.peakHour || 'N/A'}
            </div>
            <p className="text-gray-600 dark:text-gray-400">Peak Usage Hour</p>
          </div>
        </div>
        <div className="h-64 flex items-center justify-center text-gray-500 dark:text-gray-400 border border-dashed border-gray-300 dark:border-gray-700 rounded-xl">
          <div className="text-center">
            <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Trend visualization would appear here</p>
            <p className="text-sm mt-2">Showing trends for the past {timeRange}</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderRecommendations = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">AI Recommendations</h3>
        <div className="space-y-4">
          {insights
            .filter(i => i.type === 'recommendation')
            .map(insight => (
              <div key={insight.id} className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-xl">
                <div className="flex items-start">
                  <Lightbulb className="w-6 h-6 text-yellow-500 mt-1 mr-3 flex-shrink-0" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                      {insight.title}
                    </h4>
                    <p className="text-gray-700 dark:text-gray-300 mb-3">
                      {insight.description}
                    </p>
                    {insight.actions && (
                      <div className="flex space-x-3">
                        {insight.actions.map((action, idx) => (
                          <button
                            key={idx}
                            onClick={() => action.handler()}
                            className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors font-medium"
                          >
                            {action.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center">
              <Brain className="w-8 h-8 text-purple-500 mr-3" />
              AI Insights & Analytics
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Advanced analysis, pattern recognition, and performance metrics
            </p>
          </div>
          
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <div className="flex items-center bg-white dark:bg-gray-800 rounded-lg px-4 py-2">
              <Calendar className="w-5 h-5 text-gray-500 mr-2" />
              <select 
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as any)}
                className="bg-transparent text-gray-900 dark:text-white focus:outline-none"
              >
                <option value="day">Last 24 Hours</option>
                <option value="week">Last Week</option>
                <option value="month">Last Month</option>
                <option value="year">Last Year</option>
              </select>
            </div>
            
            <button
              onClick={loadInsightsData}
              disabled={isLoading}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 flex items-center"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            
            <button
              onClick={() => exportInsights('json')}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 flex items-center"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </button>
          </div>
        </div>

        {/* Loading/Error States */}
        {isLoading && (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mb-4">
                <Brain className="w-8 h-8 text-white animate-pulse" />
              </div>
              <p className="text-gray-600 dark:text-gray-400">Analyzing AI insights...</p>
            </div>
          </div>
        )}

        {error && !isLoading && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 mb-6">
            <div className="flex items-center">
              <AlertCircle className="w-6 h-6 text-red-500 mr-3" />
              <div>
                <h3 className="font-semibold text-red-800 dark:text-red-300">Error Loading Insights</h3>
                <p className="text-red-700 dark:text-red-400 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        {!isLoading && !error && (
          <>
            {/* Category Navigation */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
              {categories.map(category => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`p-4 rounded-xl text-left transition-all duration-300 ${
                    selectedCategory === category.id
                      ? `bg-gradient-to-br ${category.color} text-white shadow-lg transform scale-105`
                      : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white hover:shadow-md'
                  }`}
                >
                  <div className="flex items-center mb-2">
                    <div className={`p-2 rounded-lg ${
                      selectedCategory === category.id 
                        ? 'bg-white/20' 
                        : 'bg-gray-100 dark:bg-gray-700'
                    }`}>
                      {category.icon}
                    </div>
                  </div>
                  <h3 className="font-semibold mb-1">{category.name}</h3>
                  <p className={`text-xs ${
                    selectedCategory === category.id 
                      ? 'text-white/90' 
                      : 'text-gray-600 dark:text-gray-400'
                  }`}>
                    {category.description}
                  </p>
                </button>
              ))}
            </div>

            {/* Content Area */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
              {renderContent()}
            </div>

            {/* Stats Footer */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                  {insights.length}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Insights</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                  {patterns.length}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Patterns Found</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                  {performance?.totalOperations || 0}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">AI Operations</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                  {(performance?.accuracy || 0 * 100).toFixed(1)}%
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Overall Accuracy</p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AIInsights;
