/**
 * Knoux Doctor - Environment Diagnostic Tool
 * Run using: node scripts/doctor.js
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');

console.log('\x1b[36m%s\x1b[0m', '🩺 Starting Knoux System Diagnosis...\n');

const checks = {
    nodeVersion: () => {
        const version = process.version;
        const major = parseInt(version.substring(1).split('.')[0], 10);
        if (major < 16) throw new Error(`Node version ${version} is too old. Required: 16+`);
        return `Node.js ${version} (OK)`;
    },
    folderStructure: () => {
        const required = [
            'app/main.ts',
            'app/renderer/index.tsx',
            'package.json',
            'electron-builder.yml',
            'app/backend/security/encryptor.ts'
        ];
        
        required.forEach(file => {
            if (!fs.existsSync(path.resolve(__dirname, '..', file))) {
                throw new Error(`Missing critical file: ${file}`);
            }
        });
        return 'Critical file structure (OK)';
    },
    sqliteBinding: () => {
        try {
            require.resolve('sqlite3');
            return 'SQLite3 Native Module detected (OK)';
        } catch (e) {
            return 'WARNING: SQLite3 not found in node_modules (Run npm install)';
        }
    }
};

let errors = 0;

Object.entries(checks).forEach(([name, check]) => {
    try {
        const result = check();
        console.log(`✅ [${name}] ${result}`);
    } catch (e) {
        console.error(`❌ [${name}] FAILED: ${e.message}`);
        errors++;
    }
});

console.log('\n----------------------------------------');
if (errors === 0) {
    console.log('\x1b[32m%s\x1b[0m', '✨ All systems nominal. Ready to launch!');
    process.exit(0);
} else {
    console.log('\x1b[31m%s\x1b[0m', `⚠️  Found ${errors} issues. Please fix them before building.`);
    process.exit(1);
}
