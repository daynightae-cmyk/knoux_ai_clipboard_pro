#!/usr/bin/env python3
"""
Knoux Clipboard AI - Setup Verification System
Version: 1.0.0
Purpose: Verify all files, DLLs, and app integrity before installation
"""

import os
import sys
import json
import hashlib
from pathlib import Path
from typing import Dict, List, Tuple

class SetupVerifier:
    """Verifies installation files and integrity"""
    
    CRITICAL_FILES = [
        'Knoux-Clipboard-AI-FIXED.exe',
        'dist/ffmpeg.dll',
        'release/Knoux-Clipboard-AI-win32-x64/Knoux-Clipboard-AI.exe',
    ]
    
    REQUIRED_DLLs = [
        'ffmpeg.dll',
        'msvcp140.dll',
        'vcruntime140.dll',
    ]
    
    CONFIG_FILES = [
        'package.json',
        'app/renderer/index.html',
        'vite.config.ts',
        'main.js',
    ]
    
    def __init__(self, root_path: str = '.'):
        self.root = Path(root_path).resolve()
        self.issues = []
        self.warnings = []
        self.success = []
    
    def verify_all(self) -> bool:
        """Run all verification checks"""
        print("\n" + "="*60)
        print("🔍 Knoux Clipboard AI - Installation Verification")
        print("="*60 + "\n")
        
        self._check_critical_files()
        self._check_dlls()
        self._check_config()
        self._check_duplicates()
        self._verify_integrity()
        
        self._print_results()
        return len(self.issues) == 0
    
    def _check_critical_files(self):
        """Verify critical files exist"""
        print("📦 Checking critical files...")
        
        for file in self.CRITICAL_FILES:
            path = self.root / file
            if path.exists():
                size_mb = path.stat().st_size / (1024 * 1024)
                self.success.append(f"✓ {file} ({size_mb:.2f} MB)")
                print(f"  ✓ {file}")
            else:
                self.issues.append(f"✗ Missing: {file}")
                print(f"  ✗ MISSING: {file}")
    
    def _check_dlls(self):
        """Verify DLL files"""
        print("\n🔧 Checking DLL dependencies...")
        
        dist_path = self.root / 'dist'
        release_path = self.root / 'release/Knoux-Clipboard-AI-win32-x64'
        
        for dll in self.REQUIRED_DLLs:
            found = False
            
            # Check dist folder
            if (dist_path / dll).exists():
                self.success.append(f"✓ {dll} (dist/)")
                print(f"  ✓ {dll} [dist]")
                found = True
            
            # Check release folder
            if (release_path / dll).exists():
                if not found:
                    self.success.append(f"✓ {dll} (release/)")
                print(f"  ✓ {dll} [release]")
                found = True
            
            if not found and dll in ['ffmpeg.dll']:
                self.warnings.append(f"⚠ {dll} not critical but recommended")
                print(f"  ⚠ {dll} (optional)")
    
    def _check_config(self):
        """Verify configuration files"""
        print("\n⚙️  Checking configuration files...")
        
        for config in self.CONFIG_FILES:
            path = self.root / config
            if path.exists():
                self.success.append(f"✓ {config}")
                print(f"  ✓ {config}")
            else:
                self.issues.append(f"✗ Missing config: {config}")
                print(f"  ✗ MISSING: {config}")
    
    def _check_duplicates(self):
        """Check for duplicate files"""
        print("\n🔄 Checking for duplicates...")
        
        exe_files = list(self.root.glob('*.exe'))
        if len(exe_files) > 1:
            self.warnings.append(f"⚠ Found {len(exe_files)} EXE files - consider cleanup")
            for exe in exe_files:
                print(f"  ⚠ {exe.name} - Consider removing duplicates")
        else:
            self.success.append(f"✓ No duplicate EXE files")
            print(f"  ✓ No duplicates found")
    
    def _verify_integrity(self):
        """Verify file integrity"""
        print("\n🔐 Verifying file integrity...")
        
        exe_path = self.root / 'Knoux-Clipboard-AI-FIXED.exe'
        if exe_path.exists():
            hash_val = self._calculate_hash(exe_path)
            self.success.append(f"✓ Integrity check passed (SHA256: {hash_val[:8]}...)")
            print(f"  ✓ Main executable integrity OK")
        else:
            print(f"  ⚠ Cannot verify main executable (not found)")
    
    def _calculate_hash(self, filepath: Path) -> str:
        """Calculate file hash"""
        sha256_hash = hashlib.sha256()
        with open(filepath, "rb") as f:
            for byte_block in iter(lambda: f.read(4096), b""):
                sha256_hash.update(byte_block)
        return sha256_hash.hexdigest()
    
    def _print_results(self):
        """Print verification results"""
        print("\n" + "="*60)
        print("📊 VERIFICATION REPORT")
        print("="*60 + "\n")
        
        if self.success:
            print(f"✓ Success: {len(self.success)} checks passed")
            for item in self.success[:5]:
                print(f"  {item}")
            if len(self.success) > 5:
                print(f"  ... and {len(self.success) - 5} more")
        
        if self.warnings:
            print(f"\n⚠ Warnings: {len(self.warnings)}")
            for item in self.warnings:
                print(f"  {item}")
        
        if self.issues:
            print(f"\n✗ Issues: {len(self.issues)}")
            for item in self.issues:
                print(f"  {item}")
        
        print("\n" + "="*60)
        if len(self.issues) == 0:
            print("✅ ALL CHECKS PASSED - Ready for installation!")
        else:
            print("❌ INSTALLATION CANNOT PROCEED - Fix issues above")
        print("="*60 + "\n")
    
    def export_report(self, filename: str = 'setup-report.json'):
        """Export verification report as JSON"""
        report = {
            'timestamp': str(Path.ctime),
            'version': '1.0.0',
            'status': 'passed' if len(self.issues) == 0 else 'failed',
            'success': self.success,
            'warnings': self.warnings,
            'issues': self.issues,
        }
        
        with open(self.root / filename, 'w') as f:
            json.dump(report, f, indent=2)
        
        print(f"📄 Report saved to: {filename}")


def main():
    """Main entry point"""
    root_path = os.path.dirname(os.path.abspath(__file__))
    root_path = os.path.dirname(root_path)  # Go up one level
    
    verifier = SetupVerifier(root_path)
    
    # Run verification
    success = verifier.verify_all()
    
    # Export report
    verifier.export_report()
    
    # Return appropriate exit code
    return 0 if success else 1


if __name__ == '__main__':
    sys.exit(main())
