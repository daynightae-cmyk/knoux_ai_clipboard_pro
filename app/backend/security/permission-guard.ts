/**
 * Permission Guard
 * Manages Access Control List (ACL) for clipboard operations.
 * Prevents blacklisted apps from logging to the history.
 */

import { logger } from '../../shared/logger';

export type AppPermission = 'allow' | 'block' | 'ask';

export interface ProcessRule {
  processName: string; // e.g., "password-manager.exe"
  rule: AppPermission;
}

export class PermissionGuard {
  private blacklistedApps: Set<string>;
  private whitelistedApps: Set<string>;

  constructor() {
    this.blacklistedApps = new Set([
      'password-manager.exe', 
      '1password.exe', 
      'keepass.exe',
      'lastpass.exe'
    ]);
    this.whitelistedApps = new Set([
      'code.exe',
      'notepad.exe',
      'chrome.exe',
      'msedge.exe'
    ]);
  }

  /**
   * Check if the source application is allowed to be recorded
   */
  public isAllowed(processName: string | undefined): boolean {
    if (!processName) return true; // Default allow if unknown source
    
    const proc = processName.toLowerCase();

    // Check strict blacklist
    if (this.blacklistedApps.has(proc)) {
      logger.info(`Blocked clipboard capture from sensitive app: ${proc}`);
      return false;
    }

    // Heuristic: Check for common "private" or "incognito" window titles
    // Note: Since this class only sees process names passed to it,
    // window title logic belongs in the 'watcher', but if passed here, checking helps.
    
    return true;
  }

  /**
   * Add an application to the blacklist at runtime
   */
  public blacklistApp(processName: string): void {
    this.blacklistedApps.add(processName.toLowerCase());
    this.whitelistedApps.delete(processName.toLowerCase());
    logger.info(`App blacklisted: ${processName}`);
  }

  /**
   * Add an application to the whitelist
   */
  public whitelistApp(processName: string): void {
    this.whitelistedApps.add(processName.toLowerCase());
    this.blacklistedApps.delete(processName.toLowerCase());
    logger.info(`App whitelisted: ${processName}`);
  }

  /**
   * Get all managed rules
   */
  public getRules(): ProcessRule[] {
    const rules: ProcessRule[] = [];
    
    this.blacklistedApps.forEach(app => rules.push({ processName: app, rule: 'block' }));
    this.whitelistedApps.forEach(app => rules.push({ processName: app, rule: 'allow' }));
    
    return rules;
  }
}
