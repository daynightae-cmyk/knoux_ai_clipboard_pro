const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');

async function startVite() {
  const { createServer } = require('vite');
  // Let Vite load its full config (vite.config.ts) which sets root to app/renderer
  // and respects server.port (3000) and other settings.
  const server = await createServer();
  await server.listen();
  // Try to read the actual bound port from the http server if available.
  let actualPort = null;
  try {
    if (server.httpServer && server.httpServer.address) {
      const addr = server.httpServer.address();
      actualPort = (addr && addr.port) || null;
    }
  } catch (e) {
    actualPort = null;
  }
  // Fallback to configured port if we couldn't detect one
  const cfgPort = server.config && server.config.server && server.config.server.port;
  if (!actualPort && cfgPort) actualPort = cfgPort;
  console.log('Vite dev server started on port', actualPort || '(unknown)');
  return { server, port: actualPort };
}

function findElectronExe() {
  try {
    const pkgPath = require.resolve('electron/package.json', { paths: [process.cwd()] });
    const pkgDir = path.dirname(pkgPath);
    // common location for electron binary in npm package
    const candidates = [
      path.join(pkgDir, 'dist', 'electron.exe'),
      path.join(pkgDir, 'dist', 'electron'),
      path.join(pkgDir, 'dist', 'Electron.exe'),
      path.join(pkgDir, 'electron.exe')
    ];
    for (const c of candidates) {
      if (fs.existsSync(c)) return c;
    }
    // fallback: use npx electron
    return null;
  } catch (e) {
    return null;
  }
}

async function startElectron(devUrl) {
  const electronExe = findElectronExe();
  const env = Object.assign({}, process.env);
  if (devUrl) env.DEV_SERVER_URL = devUrl;
  // Ensure Electron runs in development mode so electron.js uses the DEV_SERVER_URL
  env.NODE_ENV = env.NODE_ENV || 'development';
  if (electronExe) {
    console.log('Launching Electron from', electronExe, 'with DEV_SERVER_URL=', env.DEV_SERVER_URL);
    const child = spawn(electronExe, ['.'], { stdio: 'inherit', env });
    child.on('exit', (code) => process.exit(code));
  } else {
    console.log('Electron binary not found in node_modules. Falling back to npx electron .');
    const child = spawn(process.execPath, [require.resolve('npx/bin/npx-cli.js'), 'electron', '.'], { stdio: 'inherit', env });
    child.on('exit', (code) => process.exit(code));
  }
}

(async () => {
  // Ensure COMSPEC exists on Windows
  if (process.platform === 'win32' && !process.env.ComSpec) {
    const system32 = path.join(process.env.WINDIR || 'C:\\Windows', 'System32', 'cmd.exe');
    if (fs.existsSync(system32)) process.env.ComSpec = system32;
  }

  try {
    const result = await startVite();
    // determine actual port used by Vite (config override or actual server port)
    // `startVite` returns { server, port }
    const server = result && result.server;
    const detectedPort = result && result.port;
    const cfgPort = server && server.config && server.config.server && server.config.server.port;
    const candidatePorts = [detectedPort, cfgPort, 5173, 3000, 3001, 8080].filter(Boolean);
    const http = require('http');

    const checkPort = (port) => new Promise((resolve) => {
      const req = http.request({ method: 'GET', host: '127.0.0.1', port, path: '/' , timeout: 1000 }, (res) => {
        resolve(true);
      });
      req.on('error', () => resolve(false));
      req.on('timeout', () => { req.destroy(); resolve(false); });
      req.end();
    });

    let actualPort = null;
    for (const p of candidatePorts) {
      // try a few times in case server is still warming up
      const ok = await checkPort(p);
      if (ok) { actualPort = p; break; }
    }
    if (!actualPort) actualPort = candidatePorts[0] || 3000;
    const devUrl = `http://localhost:${actualPort}`;
    await startElectron(devUrl);
  } catch (err) {
    console.error('Dev runner error:', err);
    process.exit(1);
  }
})();
