/**
 * Global TypeScript Definitions - Knoux Clipboard AI
 * Fixes missing type definitions for window.electron and other globals
 */

declare global {
    interface Window {
        electron?: {
            ipcRenderer?: {
                invoke: (channel: string, ...args: any[]) => Promise<any>;
                on: (channel: string, listener: (...args: any[]) => void) => void;
                off: (channel: string, listener: (...args: any[]) => void) => void;
                send: (channel: string, ...args: any[]) => void;
            };
            shell?: {
                openExternal: (url: string) => Promise<void>;
            };
        };
        knoux?: {
            analyzeContent: (content: string, options?: any) => Promise<any>;
            classifyContent: (content: string) => Promise<any>;
            enhanceContent: (content: string, options?: any) => Promise<any>;
            getSuggestions: (content: string, options?: any) => Promise<any>;
        };
    }

    namespace JSX {
        interface IntrinsicElements {
            [tagName: string]: any;
        }
    }

    var process: {
        versions: {
            electron: string;
            node: string;
            chrome: string;
        };
        platform: string;
    };
}

export {};
