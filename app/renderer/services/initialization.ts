export async function initializeApp() {
  try {
    console.log('🚀 Initializing renderer app...');

    // Check if IPC is available
    if (!window.electron?.ipcRenderer && !window.electronAPI) {
      console.warn('⚠️ IPC not available, running in fallback mode');
      return true; // Continue without IPC
    }

    const ipc = window.electronAPI || window.electron?.ipcRenderer;

    // Test IPC connection
    try {
      const testResult = await ipc.invoke('system:get-platform-info');
      if (testResult?.success) {
        console.log('✅ IPC connection verified');
      }
    } catch (error) {
      console.warn('⚠️ IPC test failed:', error);
    }

    // Load settings
    try {
      const settingsResult = await ipc.invoke('settings:get-all');
      if (settingsResult?.success) {
        console.log('✅ Settings loaded:', Object.keys(settingsResult.data || {}));
      } else {
        console.warn('⚠️ Settings not loaded:', settingsResult?.error);
      }
    } catch (error) {
      console.warn('⚠️ Settings loading failed:', error);
    }

    // Load language
    try {
      const langResult = await ipc.invoke('language:get');
      if (langResult?.success) {
        console.log('✅ Language loaded:', langResult.data);
      }
    } catch (error) {
      console.warn('⚠️ Language loading failed:', error);
    }

    // Load theme
    try {
      const themeResult = await ipc.invoke('theme:get');
      if (themeResult?.success) {
        console.log('✅ Theme loaded:', themeResult.data?.mode);
      }
    } catch (error) {
      console.warn('⚠️ Theme loading failed:', error);
    }

    // Test clipboard functionality
    try {
      const clipboardResult = await ipc.invoke('clipboard:get-items', 5, 0);
      if (clipboardResult?.success) {
        console.log('✅ Clipboard service ready, items:', clipboardResult.data?.length || 0);
      }
    } catch (error) {
      console.warn('⚠️ Clipboard test failed:', error);
    }

    console.log('✅ Renderer initialization complete');
    return true;
  } catch (error) {
    console.error('❌ Renderer initialization failed:', error);
    return false; // Don't fail completely, allow app to continue
  }
}
