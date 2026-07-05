process.env.ESLINT_USE_FLAT_CONFIG = 'false';

const { spawnSync } = require('child_process');
const path = require('path');

const eslintBin = process.platform === 'win32'
  ? path.join('node_modules', '.bin', 'eslint.cmd')
  : path.join('node_modules', '.bin', 'eslint');

const args = [
  'app/renderer/components/ClipboardWorkspace.tsx',
  'app/renderer/components/StudioPage.tsx',
  'app/renderer/hooks/useVirtualList.ts',
  'app/renderer/hooks/useWorker.ts',
  'app/renderer/performance/taskClient.ts',
  'app/renderer/services/developerTools.ts',
  'app/renderer/services/developerToolWorkers.ts',
  'app/renderer/workers',
  '--ext',
  '.ts,.tsx',
];

const result = spawnSync(eslintBin, args, { stdio: 'inherit', shell: false });
process.exit(result.status ?? 1);
