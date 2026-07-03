# Knoux Clipboard AI - Professional Installation Guide

## 📦 Installation System Overview

This directory contains everything needed to create a professional installer for **Knoux Clipboard AI v1.0.0**.

### System Features:

✅ **Multi-language Support** (English & Arabic - RTL)
✅ **Professional UI** with custom branding
✅ **DLL Verification** - Ensures all dependencies are included
✅ **Duplicate File Cleanup** - Removes old/redundant versions
✅ **File Integrity Checks** - Verifies installation completeness
✅ **Registry Management** - Proper Windows integration
✅ **Auto-launch on Install** - Optional first-run experience
✅ **Uninstaller** - Complete removal support

---

## 📁 Directory Structure

```
setup/
├── knoux.nsi              # NSIS installer script (main)
├── build.bat              # Windows batch builder
├── prepare.ps1            # PowerShell preparation script
├── verify.py              # Python verification tool
├── README.md              # This file
├── assets/                # Installation assets
│   ├── favicon.ico        # Application icon
│   ├── LICENSE            # License text
│   └── wizard.bmp         # Installer background
```

---

## 🚀 How to Build the Installer

### Option 1: Automated (Recommended)

**On Windows:**

```powershell
cd setup
.\prepare.ps1 -Build
```

### Option 2: Manual Build with NSIS

1. **Install NSIS**
   - Download from: https://nsis.sourceforge.io/Main_Page
   - Install to default location

2. **Run Builder**

   ```batch
   cd setup
   build.bat
   ```

3. **Output**
   - Creates: `../release/Knoux-Clipboard-AI-Setup-v1.0.0.exe`
   - Size: ~160 MB (includes all dependencies)

---

## 🔍 Verification Steps

Before building, verify all files:

```powershell
# Run verification
python verify.py

# Or use PowerShell
.\prepare.ps1 -Verify
```

### Checklist:

- [ ] Main EXE exists: `../Knoux-Clipboard-AI-FIXED.exe`
- [ ] ffmpeg.dll in: `../dist/ffmpeg.dll`
- [ ] Release folder: `../release/Knoux-Clipboard-AI-win32-x64/`
- [ ] Config files: `package.json`, `vite.config.ts`
- [ ] No duplicate EXE files

---

## 📋 Installation Flow

```
1. Welcome Page
   ├─ Product Name & Version
   ├─ System Requirements
   └─ Next Button

2. License Agreement
   ├─ Display LICENSE file
   ├─ Accept/Decline
   └─ Next Button

3. Component Selection
   ├─ [✓] Application Files (Required)
   ├─ [✓] Start Menu Shortcuts
   ├─ [✓] Desktop Shortcut
   └─ Next Button

4. Installation Progress
   ├─ Copy files
   ├─ Verify DLLs
   ├─ Create shortcuts
   └─ Register in Windows

5. Completion
   ├─ Success message
   ├─ Launch application
   └─ Finish
```

---

## 🔧 NSIS Script Details

### Included Sections:

1. **SEC01 - Application Files**
   - Copies main executable
   - Copies entire release package
   - Verifies DLLs
   - Creates registry entries
   - Generates uninstaller

2. **SEC02 - Start Menu Shortcuts**
   - Creates "Knoux Clipboard AI" folder
   - Adds application shortcut
   - Adds uninstall shortcut

3. **SEC03 - Desktop Shortcut**
   - Places icon on desktop
   - Links to main executable

### Registry Keys Created:

```
HKLM\Software\Microsoft\Windows\CurrentVersion\Uninstall\Knoux Clipboard AI
├─ DisplayName: Knoux Clipboard AI
├─ UninstallString: C:\Program Files\Knoux\Clipboard AI\uninst.exe
├─ DisplayIcon: C:\Program Files\Knoux\Clipboard AI\Knoux-Clipboard-AI.exe
├─ DisplayVersion: 1.0.0
├─ Publisher: Knoux Guard
└─ URLInfoAbout: https://knoux.io
```

---

## 🛡️ System Requirements

The installer will verify:

- **OS**: Windows 10 or later (64-bit required)
- **RAM**: 2 GB minimum
- **Disk Space**: 200 MB
- **Framework**: .NET 4.5+ (usually pre-installed)

---

## 📝 File Verification Process

The installer:

1. ✅ **Checks ffmpeg.dll**
   - Looks in: `dist/`
   - Fallback: `release/` folder
   - Warning if missing

2. ✅ **Verifies Main Executable**
   - Ensures binary integrity
   - Checks SHA256 hash
   - Calculates file size

3. ✅ **Validates Configuration**
   - package.json syntax
   - Main entry points
   - Asset paths

4. ✅ **Detects Duplicates**
   - Removes old EXE files
   - Cleans obsolete builds
   - Preserves latest version

---

## 🌍 Multi-Language Support

### Supported Languages:

- **English** (Default)
- **العربية** (Arabic with RTL support)

### Customizing Text:

Edit `knoux.nsi`:

```nsis
LangString MY_STRING ${LANG_ENGLISH} "English text"
LangString MY_STRING ${LANG_ARABIC} "النص العربي"
```

---

## 🚨 Troubleshooting

### "NSIS not found"

- Install NSIS: https://nsis.sourceforge.io/
- Verify installation path: `C:\Program Files (x86)\NSIS\`

### "ffmpeg.dll missing"

- Copy from: `node_modules/electron/dist/ffmpeg.dll`
- Or: `release/Knoux-Clipboard-AI-win32-x64/ffmpeg.dll`
- Place in: `dist/ffmpeg.dll`

### "Installation fails"

- Run as Administrator
- Check disk space (needs 500 MB free)
- Disable antivirus temporarily
- Check Windows logs for errors

### "Shortcut doesn't work"

- Verify paths in registry
- Check file permissions
- Ensure icons exist in assets folder

---

## 📊 Build Output Example

```
Building installer...

Γ£ô NSIS v3.10
Γ£ô Processing: knoux.nsi
Γ£ô Checking: assets/wizard.bmp
Γ£ô Installing: Application Files
  ✓ Knoux-Clipboard-AI.exe (156 MB)
  ✓ ffmpeg.dll (42 MB)
  ✓ All dependencies
Γ£ô Creating: Start Menu shortcuts
Γ£ô Creating: Desktop shortcut
Γ£ô Compressing: EXE installer
Γ£ô Build complete!

Output: ../release/Knoux-Clipboard-AI-Setup-v1.0.0.exe (158 MB)
Status: SUCCESS ✓
```

---

## 📦 Distribution

### Final Deliverables:

```
Knoux-Clipboard-AI-Setup-v1.0.0.exe  (160 MB)
└─ Installer archive containing:
   ├─ Knoux-Clipboard-AI-FIXED.exe
   ├─ ffmpeg.dll
   ├─ All runtime dependencies
   ├─ Windows registry entries
   └─ Uninstaller
```

### Distribution Methods:

1. **Direct Download**
   - Host on: https://knoux.io/download
   - Include hash verification

2. **Microsoft Store** (Future)
   - Convert to MSIX format
   - Automatic updates

3. **Portable Version**
   - No installer needed
   - Just run EXE directly

---

## 🔄 Update Mechanism

For future updates:

1. Update version in `knoux.nsi`:

   ```nsis
   !define PRODUCT_VERSION "1.1.0"
   ```

2. Rebuild installer:

   ```powershell
   .\prepare.ps1 -Build
   ```

3. Old versions auto-detected and removed

---

## 📞 Support

For issues:

- Email: knouxguard@gmail.com
- WhatsApp: +971503281920
- Website: https://knoux.io

---

## 📄 Version History

- **v1.0.0** (Jan 26, 2026)
  - Initial professional installer
  - Multi-language support
  - DLL verification
  - Registry integration

---

**Made with ❤️ for professional application deployment**
