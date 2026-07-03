import React, { useState, useEffect } from 'react';

interface ServiceTest {
  name: string;
  category: string;
  status: 'pending' | 'testing' | 'success' | 'failed';
  result?: string;
  error?: string;
  duration?: number;
}

export const ServiceTester: React.FC = () => {
  const [tests, setTests] = useState<ServiceTest[]>([]);
  const [testing, setTesting] = useState(false);
  const [progress, setProgress] = useState(0);

  const serviceTests: Omit<ServiceTest, 'status'>[] = [
    // AI Core Services
    { name: 'aiEngine.summarize', category: 'AI Core' },
    { name: 'aiEngine.classify', category: 'AI Core' },
    { name: 'aiEngine.enhance', category: 'AI Core' },
    { name: 'classifier.classify', category: 'AI Core' },
    { name: 'classifier.getStats', category: 'AI Core' },
    { name: 'summarizer.summarize', category: 'AI Core' },
    { name: 'summarizer.getCacheStats', category: 'AI Core' },
    
    // Clipboard Services
    { name: 'clipboard.getHistory', category: 'Clipboard' },
    { name: 'clipboard.addItem', category: 'Clipboard' },
    { name: 'clipboard.deleteItem', category: 'Clipboard' },
    { name: 'clipboard.search', category: 'Clipboard' },
    { name: 'clipboard.startMonitoring', category: 'Clipboard' },
    { name: 'clipboard.getStats', category: 'Clipboard' },
    
    // AI Services
    { name: 'ai.chat', category: 'AI' },
    { name: 'ai.summarize', category: 'AI' },
    { name: 'ai.enhance', category: 'AI' },
    { name: 'ai.translate', category: 'AI' },
    { name: 'ai.analyze', category: 'AI' },
    { name: 'ai.classify', category: 'AI' },
    
    // Creative Services
    { name: 'creative.generate', category: 'Creative' },
    { name: 'creative.enhance', category: 'Creative' },
    { name: 'creative.analyze', category: 'Creative' },
    
    // Pattern Recognition
    { name: 'patterns.detect', category: 'Patterns' },
    { name: 'patterns.analyze', category: 'Patterns' },
    
    // Security Services
    { name: 'security.encrypt', category: 'Security' },
    { name: 'security.decrypt', category: 'Security' },
    { name: 'security.checkPassword', category: 'Security' },
    { name: 'security.lock', category: 'Security' },
    
    // Storage Services
    { name: 'storage.save', category: 'Storage' },
    { name: 'storage.load', category: 'Storage' },
    { name: 'storage.export', category: 'Storage' },
    { name: 'storage.getStats', category: 'Storage' },
    
    // System Services
    { name: 'system.getInfo', category: 'System' },
    { name: 'system.getStats', category: 'System' },
    { name: 'system.checkHealth', category: 'System' },
    
    // Settings
    { name: 'settings.get', category: 'Settings' },
    { name: 'settings.update', category: 'Settings' },
    
    // Theme & Language
    { name: 'theme.get', category: 'UI' },
    { name: 'language.get', category: 'UI' },
  ];

  const runTest = async (test: Omit<ServiceTest, 'status'>): Promise<ServiceTest> => {
    const start = Date.now();
    try {
      const [category, method] = test.name.split('.');
      const api = (window as any).knoux;
      
      if (!api || !api[category] || !api[category][method]) {
        throw new Error(`API not found: ${test.name}`);
      }

      let result;
      switch (test.name) {
        // AI Core Services
        case 'aiEngine.summarize':
          result = await api.aiEngine.summarize('This is test text for summarization');
          break;
        case 'aiEngine.classify':
          result = await api.aiEngine.classify('function test() { return true; }');
          break;
        case 'aiEngine.enhance':
          result = await api.aiEngine.enhance('test text');
          break;
        case 'classifier.classify':
          result = await api.classifier.classify('test content', {});
          break;
        case 'classifier.getStats':
          result = await api.classifier.getStats();
          break;
        case 'summarizer.summarize':
          result = await api.summarizer.summarize('Long text to summarize', {});
          break;
        case 'summarizer.getCacheStats':
          result = await api.summarizer.getCacheStats();
          break;
        
        // Clipboard Services
        case 'clipboard.getHistory':
          result = await api.clipboard.getHistory();
          break;
        case 'clipboard.addItem':
          result = await api.clipboard.addItem({ content: 'Test', type: 'text' });
          break;
        case 'clipboard.deleteItem':
          result = await api.clipboard.deleteItem('test-id');
          break;
        case 'clipboard.search':
          result = await api.clipboard.search('test');
          break;
        case 'clipboard.startMonitoring':
          result = await api.clipboard.startMonitoring();
          break;
        case 'clipboard.getStats':
          result = await api.clipboard.getStats();
          break;
        case 'ai.chat':
          result = await api.ai.chat('Hello');
          break;
        case 'ai.summarize':
          result = await api.ai.summarize('This is a test text for summarization');
          break;
        case 'ai.enhance':
          result = await api.ai.enhance('test text');
          break;
        case 'ai.translate':
          result = await api.ai.translate('Hello', 'ar');
          break;
        case 'ai.analyze':
          result = await api.ai.analyze('test content');
          break;
        case 'ai.classify':
          result = await api.ai.classify('test content');
          break;
        case 'creative.generate':
          result = await api.features.creative.generate({ prompt: 'test' });
          break;
        case 'creative.enhance':
          result = await api.features.creative.enhance('test');
          break;
        case 'creative.analyze':
          result = await api.features.creative.analyze('test');
          break;
        case 'patterns.detect':
          result = await api.features.patterns.detect('test pattern');
          break;
        case 'patterns.analyze':
          result = await api.features.patterns.analyze(['test']);
          break;
        case 'security.encrypt':
          result = await api.security.encrypt('test data');
          break;
        case 'security.decrypt':
          result = await api.security.decrypt('encrypted');
          break;
        case 'security.checkPassword':
          result = await api.security.checkPassword('test123');
          break;
        case 'security.lock':
          result = await api.security.lock();
          break;
        case 'storage.save':
          result = await api.storage.save('test-key', { data: 'test' });
          break;
        case 'storage.load':
          result = await api.storage.load('test-key');
          break;
        case 'storage.export':
          result = await api.storage.export();
          break;
        case 'storage.getStats':
          result = await api.storage.getStats();
          break;
        case 'system.getInfo':
          result = await api.system.getInfo();
          break;
        case 'system.getStats':
          result = await api.system.getStats();
          break;
        case 'system.checkHealth':
          result = await api.system.checkHealth();
          break;
        case 'settings.get':
          result = await api.settings.get();
          break;
        case 'settings.update':
          result = await api.settings.update({ theme: 'dark' });
          break;
        case 'theme.get':
          result = await api.theme.get();
          break;
        case 'language.get':
          result = await api.language.get();
          break;
        default:
          throw new Error('Unknown test');
      }

      const duration = Date.now() - start;
      return {
        ...test,
        status: 'success',
        result: JSON.stringify(result).substring(0, 100),
        duration
      };
    } catch (error: any) {
      const duration = Date.now() - start;
      return {
        ...test,
        status: 'failed',
        error: error.message,
        duration
      };
    }
  };

  const runAllTests = async () => {
    setTesting(true);
    setProgress(0);
    const results: ServiceTest[] = [];

    for (let i = 0; i < serviceTests.length; i++) {
      const test = serviceTests[i];
      setTests(prev => [...prev.filter(t => t.name !== test.name), { ...test, status: 'testing' }]);
      
      const result = await runTest(test);
      results.push(result);
      
      setTests(prev => [...prev.filter(t => t.name !== test.name), result]);
      setProgress(((i + 1) / serviceTests.length) * 100);
      
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    setTesting(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-500';
      case 'failed': return 'text-red-500';
      case 'testing': return 'text-yellow-500';
      default: return 'text-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return '✓';
      case 'failed': return '✗';
      case 'testing': return '⟳';
      default: return '○';
    }
  };

  const categories = [...new Set(serviceTests.map(t => t.category))];
  const summary = {
    total: tests.length,
    success: tests.filter(t => t.status === 'success').length,
    failed: tests.filter(t => t.status === 'failed').length,
    pending: tests.filter(t => t.status === 'pending').length,
  };

  return (
    <div className="p-6 bg-gray-900 text-white min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">🧪 Service Testing Dashboard</h1>
          <p className="text-gray-400">اختبار شامل لجميع خدمات Knoux</p>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-800 p-4 rounded-lg">
            <div className="text-2xl font-bold">{summary.total}</div>
            <div className="text-gray-400">Total Tests</div>
          </div>
          <div className="bg-green-900/30 p-4 rounded-lg">
            <div className="text-2xl font-bold text-green-500">{summary.success}</div>
            <div className="text-gray-400">Passed</div>
          </div>
          <div className="bg-red-900/30 p-4 rounded-lg">
            <div className="text-2xl font-bold text-red-500">{summary.failed}</div>
            <div className="text-gray-400">Failed</div>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg">
            <div className="text-2xl font-bold text-yellow-500">{summary.pending}</div>
            <div className="text-gray-400">Pending</div>
          </div>
        </div>

        <div className="mb-6">
          <button
            onClick={runAllTests}
            disabled={testing}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 px-6 py-3 rounded-lg font-semibold"
          >
            {testing ? `Testing... ${progress.toFixed(0)}%` : 'Run All Tests'}
          </button>
        </div>

        {testing && (
          <div className="mb-6 bg-gray-800 rounded-lg p-4">
            <div className="w-full bg-gray-700 rounded-full h-4">
              <div
                className="bg-blue-600 h-4 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {categories.map(category => {
          const categoryTests = tests.filter(t => t.category === category);
          if (categoryTests.length === 0) return null;

          return (
            <div key={category} className="mb-6">
              <h2 className="text-xl font-bold mb-3 text-blue-400">{category} Services</h2>
              <div className="bg-gray-800 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-700">
                    <tr>
                      <th className="px-4 py-2 text-left">Status</th>
                      <th className="px-4 py-2 text-left">Service</th>
                      <th className="px-4 py-2 text-left">Result</th>
                      <th className="px-4 py-2 text-left">Duration</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categoryTests.map(test => (
                      <tr key={test.name} className="border-t border-gray-700">
                        <td className="px-4 py-2">
                          <span className={`text-xl ${getStatusColor(test.status)}`}>
                            {getStatusIcon(test.status)}
                          </span>
                        </td>
                        <td className="px-4 py-2 font-mono text-sm">{test.name}</td>
                        <td className="px-4 py-2 text-sm">
                          {test.error ? (
                            <span className="text-red-400">{test.error}</span>
                          ) : test.result ? (
                            <span className="text-green-400">{test.result}</span>
                          ) : (
                            <span className="text-gray-500">-</span>
                          )}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-400">
                          {test.duration ? `${test.duration}ms` : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
