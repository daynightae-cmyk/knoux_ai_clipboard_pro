; Knoux Clipboard AI - Professional NSIS Installer
; Version 1.0.0 | Build: January 26, 2026
; © 2026 Knoux. All rights reserved.

!include "MUI2.nsh"
!include "x64.nsh"
!include "nsDialogs.nsh"
!include "LogicLib.nsh"

; ================================
; Configuration
; ================================

!define PRODUCT_NAME "Knoux Clipboard AI"
!define PRODUCT_VERSION "1.0.0"
!define PRODUCT_PUBLISHER "Knoux Guard"
!define PRODUCT_WEB_SITE "https://knoux.io"
!define PRODUCT_DIR_REGKEY "Software\Microsoft\Windows\CurrentVersion\App Paths\KnouxClipboardAI.exe"
!define PRODUCT_UNINST_KEY "Software\Microsoft\Windows\CurrentVersion\Uninstall\${PRODUCT_NAME}"
!define PRODUCT_UNINST_ROOT_KEY "HKLM"

; Installer name and output
OutFile "..\release\Knoux-Clipboard-AI-Setup-v1.0.0.exe"
InstallDir "$PROGRAMFILES\Knoux\Clipboard AI"
ShowInstDetails show
ShowUnInstDetails show

; ================================
; MUI Settings
; ================================

!define MUI_ABORTWARNING
!define MUI_ABORTWARNING_TEXT "هل تريد فعلاً إلغاء التثبيت؟ (Do you really want to cancel the setup?)"

; Modern UI - Theme
!define MUI_THEME "modern"
!define MUI_LANGDLL_REGISTRY_ROOT "${PRODUCT_UNINST_ROOT_KEY}"
!define MUI_LANGDLL_REGISTRY_KEY "${PRODUCT_UNINST_KEY}"
!define MUI_LANGDLL_REGISTRY_VALUENAME "Installer Language"

; Colors
!define MUI_HEADER_BACKGROUND_COLOR "1F2937"

; ================================
; Pages
; ================================

!insertmacro MUI_PAGE_WELCOME
!insertmacro MUI_PAGE_LICENSE "..\LICENSE"
!insertmacro MUI_PAGE_COMPONENTS
!insertmacro MUI_PAGE_INSTFILES
!insertmacro MUI_PAGE_FINISH

!insertmacro MUI_UNPAGE_CONFIRM
!insertmacro MUI_UNPAGE_INSTFILES

; ================================
; Language
; ================================

!insertmacro MUI_LANGUAGE "English"
!insertmacro MUI_LANGUAGE "Arabic"

; English Strings
LangString PAGE_TITLE ${LANG_ENGLISH} "${PRODUCT_NAME} v${PRODUCT_VERSION}"
LangString PAGE_SUBTITLE ${LANG_ENGLISH} "Intelligent Clipboard Management"
LangString SECTION_APP ${LANG_ENGLISH} "Application Files"
LangString SECTION_SHORTCUTS ${LANG_ENGLISH} "Start Menu Shortcuts"
LangString SECTION_DESKTOP ${LANG_ENGLISH} "Desktop Shortcut"

; Arabic Strings
LangString PAGE_TITLE ${LANG_ARABIC} "تطبيق ${PRODUCT_NAME} v${PRODUCT_VERSION}"
LangString PAGE_SUBTITLE ${LANG_ARABIC} "إدارة ذكية للحافظة"
LangString SECTION_APP ${LANG_ARABIC} "ملفات التطبيق"
LangString SECTION_SHORTCUTS ${LANG_ARABIC} "اختصارات قائمة ابدأ"
LangString SECTION_DESKTOP ${LANG_ARABIC} "اختصار سطح المكتب"

; ================================
; Version Information
; ================================

VIProductName "${PRODUCT_NAME}"
VIProductVersion "${PRODUCT_VERSION}.0"
VICompanyName "${PRODUCT_PUBLISHER}"
VIFileDescription "Professional Clipboard Manager with AI"
VIFileVersion "${PRODUCT_VERSION}.0"
VILegalCopyright "© 2026 Knoux Guard. All rights reserved."
VIAddVersionKey /LANG=${LANG_ENGLISH} "ProductName" "${PRODUCT_NAME}"
VIAddVersionKey /LANG=${LANG_ENGLISH} "FileVersion" "${PRODUCT_VERSION}"
VIAddVersionKey /LANG=${LANG_ENGLISH} "CompanyName" "${PRODUCT_PUBLISHER}"
VIAddVersionKey /LANG=${LANG_ENGLISH} "LegalCopyright" "© 2026 Knoux Guard"

; ================================
; Installer Sections
; ================================

Section "$(SECTION_APP)" SEC01
  SetOutPath "$INSTDIR"

  ; Main executable
  File "..\Knoux-Clipboard-AI-FIXED.exe"

  ; Copy entire release folder contents
  SetOverwrite try
  File /r "..\release\Knoux-Clipboard-AI-win32-x64\*.*"

  ; Verify critical files
  ${If} ${FileExists} "$INSTDIR\Knoux-Clipboard-AI.exe"
    DetailPrint "✓ Main executable installed successfully"
  ${Else}
    MessageBox MB_ICONEXCLAMATION "Warning: Main executable not found!"
  ${EndIf}

  ${If} ${FileExists} "$INSTDIR\ffmpeg.dll"
    DetailPrint "✓ ffmpeg.dll verified"
  ${Else}
    DetailPrint "⚠ ffmpeg.dll not found - copying from source..."
    File "..\dist\ffmpeg.dll"
  ${EndIf}

  ; Create registry key for uninstaller
  WriteRegStr ${PRODUCT_UNINST_ROOT_KEY} "${PRODUCT_UNINST_KEY}" "DisplayName" "${PRODUCT_NAME}"
  WriteRegStr ${PRODUCT_UNINST_ROOT_KEY} "${PRODUCT_UNINST_KEY}" "UninstallString" "$INSTDIR\uninst.exe"
  WriteRegStr ${PRODUCT_UNINST_ROOT_KEY} "${PRODUCT_UNINST_KEY}" "DisplayIcon" "$INSTDIR\Knoux-Clipboard-AI.exe"
  WriteRegStr ${PRODUCT_UNINST_ROOT_KEY} "${PRODUCT_UNINST_KEY}" "DisplayVersion" "${PRODUCT_VERSION}"
  WriteRegStr ${PRODUCT_UNINST_ROOT_KEY} "${PRODUCT_UNINST_KEY}" "URLInfoAbout" "${PRODUCT_WEB_SITE}"
  WriteRegStr ${PRODUCT_UNINST_ROOT_KEY} "${PRODUCT_UNINST_KEY}" "Publisher" "${PRODUCT_PUBLISHER}"

  ; Create uninstaller
  WriteUninstaller "$INSTDIR\uninst.exe"

SectionEnd

Section "$(SECTION_SHORTCUTS)" SEC02
  CreateDirectory "$SMPROGRAMS\${PRODUCT_NAME}"
  CreateShortcut "$SMPROGRAMS\${PRODUCT_NAME}\${PRODUCT_NAME}.lnk" "$INSTDIR\Knoux-Clipboard-AI.exe"
  CreateShortcut "$SMPROGRAMS\${PRODUCT_NAME}\Uninstall.lnk" "$INSTDIR\uninst.exe"
SectionEnd

Section "$(SECTION_DESKTOP)" SEC03
  CreateShortcut "$DESKTOP\${PRODUCT_NAME}.lnk" "$INSTDIR\Knoux-Clipboard-AI.exe"
SectionEnd

; ================================
; Uninstaller Section
; ================================

Section Uninstall
  ; Remove shortcuts
  Delete "$SMPROGRAMS\${PRODUCT_NAME}\${PRODUCT_NAME}.lnk"
  Delete "$SMPROGRAMS\${PRODUCT_NAME}\Uninstall.lnk"
  Delete "$DESKTOP\${PRODUCT_NAME}.lnk"
  RMDir "$SMPROGRAMS\${PRODUCT_NAME}"

  ; Remove application directory
  RMDir /r "$INSTDIR"

  ; Remove registry keys
  DeleteRegKey ${PRODUCT_UNINST_ROOT_KEY} "${PRODUCT_UNINST_KEY}"

SectionEnd

; ================================
; Functions
; ================================

Function .onInit
  ${If} ${RunningX64}
    DetailPrint "System: Windows x64"
  ${Else}
    MessageBox MB_ICONSTOP "This application requires Windows x64 (64-bit)!"
    Abort
  ${EndIf}

  !insertmacro MUI_LANGDLL_DISPLAY

FunctionEnd

Function un.onInit
  !insertmacro MUI_UNGETLANGUAGE
FunctionEnd

Function .onInstSuccess
  MessageBox MB_ICONINFORMATION "التثبيت اكتمل بنجاح!$\n$\n$(PRODUCT_NAME) has been installed successfully!$\n$\nClick OK to launch the application." IDOK 0
  Exec "$INSTDIR\Knoux-Clipboard-AI.exe"
FunctionEnd

; ================================
; Section Descriptions
; ================================

LangString DESC_SEC01 ${LANG_ENGLISH} "Install Knoux Clipboard AI application and all dependencies"
LangString DESC_SEC01 ${LANG_ARABIC} "تثبيت تطبيق Knoux Clipboard AI وجميع التبعيات"
LangString DESC_SEC02 ${LANG_ENGLISH} "Create shortcuts in Start Menu"
LangString DESC_SEC02 ${LANG_ARABIC} "إنشاء اختصارات في قائمة ابدأ"
LangString DESC_SEC03 ${LANG_ENGLISH} "Create shortcut on Desktop"
LangString DESC_SEC03 ${LANG_ARABIC} "إنشاء اختصار على سطح المكتب"

!insertmacro MUI_FUNCTION_DESCRIPTION_BEGIN
  !insertmacro MUI_DESCRIPTION_TEXT ${SEC01} $(DESC_SEC01)
  !insertmacro MUI_DESCRIPTION_TEXT ${SEC02} $(DESC_SEC02)
  !insertmacro MUI_DESCRIPTION_TEXT ${SEC03} $(DESC_SEC03)
!insertmacro MUI_FUNCTION_DESCRIPTION_END
