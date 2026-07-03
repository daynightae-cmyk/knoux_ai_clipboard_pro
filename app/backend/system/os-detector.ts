import * as os from 'os';

export interface SystemDetails {
  platform: NodeJS.Platform;
  release: string;
  arch: string;
  hostname: string;
  isWindows: boolean;
  isMac: boolean;
  isLinux: boolean;
}

export const getSystemDetails = (): SystemDetails => {
  const platform = os.platform();
  
  return {
    platform,
    release: os.release(),
    arch: os.arch(),
    hostname: os.hostname(),
    isWindows: platform === 'win32',
    isMac: platform === 'darwin',
    isLinux: platform === 'linux',
  };
};

export const getShortcutModifier = (): string => {
  return os.platform() === 'darwin' ? 'Command' : 'Ctrl';
};
