// Test script to verify all IPC handlers are working
// Run this in the renderer console after app starts

async function testAllIPCHandlers() {
  console.log('🧪 Testing IPC Handlers...\n');
  
  const results = {
    passed: 0,
    failed: 0,
    tests: []
  };

  // Test Voice API
  try {
    console.log('Testing Voice API...');
    const profiles = await window.backendAPI.voice.getProfiles();
    console.log('✅ voice.getProfiles:', profiles);
    results.passed++;
    results.tests.push({ name: 'voice.getProfiles', status: 'PASS' });
  } catch (error) {
    console.error('❌ voice.getProfiles failed:', error);
    results.failed++;
    results.tests.push({ name: 'voice.getProfiles', status: 'FAIL', error: error.message });
  }

  // Test Quantum API
  try {
    console.log('Testing Quantum API...');
    const secureResult = await window.backendAPI.quantum.secureClip({ data: 'test' }, 'high');
    console.log('✅ quantum.secureClip:', secureResult);
    results.passed++;
    results.tests.push({ name: 'quantum.secureClip', status: 'PASS' });
  } catch (error) {
    console.error('❌ quantum.secureClip failed:', error);
    results.failed++;
    results.tests.push({ name: 'quantum.secureClip', status: 'FAIL', error: error.message });
  }

  try {
    const analytics = await window.backendAPI.quantum.getAnalytics();
    console.log('✅ quantum.getAnalytics:', analytics);
    results.passed++;
    results.tests.push({ name: 'quantum.getAnalytics', status: 'PASS' });
  } catch (error) {
    console.error('❌ quantum.getAnalytics failed:', error);
    results.failed++;
    results.tests.push({ name: 'quantum.getAnalytics', status: 'FAIL', error: error.message });
  }

  // Test Security API
  try {
    console.log('Testing Security API...');
    const storeResult = await window.backendAPI.security.storeClip({ content: 'test' });
    console.log('✅ security.storeClip:', storeResult);
    results.passed++;
    results.tests.push({ name: 'security.storeClip', status: 'PASS' });
  } catch (error) {
    console.error('❌ security.storeClip failed:', error);
    results.failed++;
    results.tests.push({ name: 'security.storeClip', status: 'FAIL', error: error.message });
  }

  try {
    const metrics = await window.backendAPI.security.getMetrics();
    console.log('✅ security.getMetrics:', metrics);
    results.passed++;
    results.tests.push({ name: 'security.getMetrics', status: 'PASS' });
  } catch (error) {
    console.error('❌ security.getMetrics failed:', error);
    results.failed++;
    results.tests.push({ name: 'security.getMetrics', status: 'FAIL', error: error.message });
  }

  // Test AR/VR API
  try {
    console.log('Testing AR/VR API...');
    const vrClip = await window.backendAPI.arvr.createVRClip({ content: 'test' }, {});
    console.log('✅ arvr.createVRClip:', vrClip);
    results.passed++;
    results.tests.push({ name: 'arvr.createVRClip', status: 'PASS' });
  } catch (error) {
    console.error('❌ arvr.createVRClip failed:', error);
    results.failed++;
    results.tests.push({ name: 'arvr.createVRClip', status: 'FAIL', error: error.message });
  }

  try {
    const arvrMetrics = await window.backendAPI.arvr.getMetrics();
    console.log('✅ arvr.getMetrics:', arvrMetrics);
    results.passed++;
    results.tests.push({ name: 'arvr.getMetrics', status: 'PASS' });
  } catch (error) {
    console.error('❌ arvr.getMetrics failed:', error);
    results.failed++;
    results.tests.push({ name: 'arvr.getMetrics', status: 'FAIL', error: error.message });
  }

  // Test UI API
  try {
    console.log('Testing UI API...');
    const uiProfiles = await window.backendAPI.ui.getProfiles();
    console.log('✅ ui.getProfiles:', uiProfiles);
    results.passed++;
    results.tests.push({ name: 'ui.getProfiles', status: 'PASS' });
  } catch (error) {
    console.error('❌ ui.getProfiles failed:', error);
    results.failed++;
    results.tests.push({ name: 'ui.getProfiles', status: 'FAIL', error: error.message });
  }

  try {
    const morphResult = await window.backendAPI.ui.morph('auto', {});
    console.log('✅ ui.morph:', morphResult);
    results.passed++;
    results.tests.push({ name: 'ui.morph', status: 'PASS' });
  } catch (error) {
    console.error('❌ ui.morph failed:', error);
    results.failed++;
    results.tests.push({ name: 'ui.morph', status: 'FAIL', error: error.message });
  }

  // Print summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(50));
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`📈 Total: ${results.passed + results.failed}`);
  console.log(`🎯 Success Rate: ${((results.passed / (results.passed + results.failed)) * 100).toFixed(1)}%`);
  console.log('='.repeat(50));
  
  console.table(results.tests);
  
  return results;
}

// Auto-run test
console.log('🚀 Starting IPC Handler Tests...\n');
testAllIPCHandlers().then(results => {
  if (results.failed === 0) {
    console.log('\n🎉 All IPC handlers are working correctly!');
  } else {
    console.log('\n⚠️ Some IPC handlers failed. Check the logs above.');
  }
});
