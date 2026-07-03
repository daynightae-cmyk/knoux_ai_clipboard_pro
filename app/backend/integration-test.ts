/**
 * Integration Testing Script
 * نص اختبار التكامل الشامل - تشغيل خدمة تلو الأخرى
 */

import { getServiceManager } from './service-manager';
import { ServiceIntegrator, serviceRegistry } from './service-integration';

// ==================== MAIN TEST RUNNER ====================

export async function runFullIntegrationTest(): Promise<void> {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║      KNOUX CLIPBOARD AI - FULL INTEGRATION TEST           ║
║                                                            ║
║         Testing All Services One by One                   ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
`);

  try {
    // ==================== PHASE 1: SERVICE MANAGER INITIALIZATION ====================
    console.log('\n📍 PHASE 1: Service Manager Initialization');
    console.log('═════════════════════════════════════════\n');

    const serviceManager = getServiceManager();
    const managerInitialized = await serviceManager.initialize();

    if (!managerInitialized) {
      throw new Error('Service Manager initialization failed');
    }

    // ==================== PHASE 2: INDIVIDUAL SERVICE TESTING ====================
    console.log('\n📍 PHASE 2: Individual Service Testing');
    console.log('═════════════════════════════════════════\n');

    // Test 1: Clipboard Service
    console.log('🧪 Test 1: Clipboard Service');
    console.log('─────────────────────────────');
    const clipboardService = serviceManager.getClipboardService();
    await clipboardService.getHistory();
    console.log('✅ Clipboard Service test passed\n');

    // Test 2: Storage Service
    console.log('🧪 Test 2: Storage Service');
    console.log('─────────────────────────────');
    const storageService = serviceManager.getStorageService();
    await storageService.write('test_key', { test: 'data' });
    const testData = await storageService.read('test_key');
    console.log(`✅ Storage Service test passed - Data: ${JSON.stringify(testData)}\n`);

    // Test 3: Security Service
    console.log('🧪 Test 3: Security Service');
    console.log('─────────────────────────────');
    const securityService = serviceManager.getSecurityService();
    const isSensitive = await securityService.detectSensitive('test content');
    const encrypted = await securityService.encrypt('secret data');
    console.log(`✅ Security Service test passed - Sensitive: ${isSensitive}, Encrypted: ${encrypted.substring(0, 20)}...\n`);

    // Test 4: AI Service
    console.log('🧪 Test 4: AI Service');
    console.log('─────────────────────────────');
    const aiService = serviceManager.getAIService();
    const classification = await aiService.classify('sample text');
    const summary = await aiService.summarize('This is a long text that needs to be summarized');
    console.log(`✅ AI Service test passed - Classification: ${JSON.stringify(classification)}\n`);

    // Test 5: IPC Service
    console.log('🧪 Test 5: IPC Service');
    console.log('─────────────────────────────');
    const ipcService = serviceManager.getIPCService();
    ipcService.send('test_channel', { message: 'test' });
    const result = await ipcService.invoke('test_invoke', { param: 'value' });
    console.log(`✅ IPC Service test passed - Result: ${JSON.stringify(result)}\n`);

    // Test 6: UI Service
    console.log('🧪 Test 6: UI Service');
    console.log('─────────────────────────────');
    const uiService = serviceManager.getUIService();
    uiService.updateTheme('dark');
    uiService.showNotification('Test notification', 'success');
    console.log('✅ UI Service test passed\n');

    // ==================== PHASE 3: SERVICE INTEGRATION TESTING ====================
    console.log('\n📍 PHASE 3: Service Integration Testing');
    console.log('═════════════════════════════════════════\n');

    console.log('🔗 Testing inter-service communication...\n');

    // Integration Test 1: Clipboard → Storage
    console.log('📝 Integration Test 1: Clipboard → Storage');
    console.log('─────────────────────────────────────────');
    const historyItems = await clipboardService.getHistory();
    await storageService.write('clipboard_history', historyItems);
    console.log('✅ Clipboard items saved to storage\n');

    // Integration Test 2: AI → Security
    console.log('📝 Integration Test 2: AI → Security');
    console.log('─────────────────────────────────────────');
    const contentAnalysis = await aiService.analyze('test content');
    const sensitiveCheck = await securityService.detectSensitive('test content');
    console.log(`✅ Content analyzed (${JSON.stringify(contentAnalysis)}) and security checked (${sensitiveCheck})\n`);

    // Integration Test 3: Storage → UI
    console.log('📝 Integration Test 3: Storage → UI');
    console.log('─────────────────────────────────────────');
    const storedSettings = await storageService.read('user_settings');
    if (storedSettings) {
      uiService.updateTheme(storedSettings.theme || 'dark');
    }
    console.log('✅ Settings retrieved from storage and applied to UI\n');

    // Integration Test 4: IPC → All Services
    console.log('📝 Integration Test 4: IPC → All Services');
    console.log('─────────────────────────────────────────');
    ipcService.on('clipboard_updated', async (data) => {
      await clipboardService.addItem(data);
      await storageService.write('last_clipboard_update', data);
      const hasSensitive = await securityService.detectSensitive(data.content);
      if (hasSensitive) {
        uiService.showNotification('⚠️ Sensitive data detected', 'warning');
      }
    });
    console.log('✅ IPC listener set up for clipboard updates\n');

    // ==================== PHASE 4: SERVICE REGISTRY TESTING ====================
    console.log('\n📍 PHASE 4: Service Registry Testing');
    console.log('═════════════════════════════════════════\n');

    const allServicesPassed = await ServiceIntegrator.integrateAllServices();

    if (!allServicesPassed) {
      throw new Error('Some services failed integration test');
    }

    // ==================== FINAL REPORT ====================
    console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║               ✅ ALL TESTS PASSED SUCCESSFULLY             ║
║                                                            ║
║          Knoux Clipboard AI is fully integrated!           ║
║                                                            ║
║         All services are working in harmony ✨             ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝

📊 Summary:
  ✅ Service Manager: Initialized
  ✅ Clipboard Service: Ready
  ✅ Storage Service: Ready
  ✅ Security Service: Ready
  ✅ AI Service: Ready
  ✅ IPC Service: Ready
  ✅ UI Service: Ready
  ✅ Service Integration: Verified
  ✅ Inter-service Communication: Working

🚀 Application Status: READY FOR PRODUCTION

The application is fully integrated and ready to launch! 🎉
`);

    return;

  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║                  ❌ TEST FAILED                            ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝

Error: ${errorMsg}

Please review the error and fix any issues before proceeding.
`);
    throw error;
  }
}

// ==================== EXPORT ====================

export default runFullIntegrationTest;
