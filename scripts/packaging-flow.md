# 📦 دليل التعبئة والتوزيع لـ KNOUX Clipboard AI

## 📋 نظرة عامة

يصف هذا الدليل عملية تعبئة وتوزيع تطبيق KNOUX Clipboard AI لمنصات متعددة مع الحفاظ على الجودة والأمان.

## 🎯 أهداف التعبئة

### المعايير الأساسية
```
✅ حجم معقول: < 100 MB
✅ أداء جيد: وقت بدء < 3 ثواني
✅ أمان قوي: توقيع وتحقق
✅ توافق كامل: Windows 10+/macOS 10.15+/Linux
✅ سهولة التثبيت: خطوات واضحة
```

### بنود الجودة
1. **الموثوقية**: تشغيل مستقر بدون أعطال
2. **الأمان**: توقيع رقمي وحماية من العبث
3. **الأداء**: استخدام مثالي للموارد
4. **التجربة**: تثبيت وتشغيل سلس
5. **الدعم**: تحديثات وإصلاحات سريعة

## 🏗️ هيكل الحزمة النهائية

### Windows (NSIS)
```
KNOUX_Clipboard_AI_Setup.exe  (85 MB)
├── $PLUGINSDIR/              # مكتبات النظام
├── app-64/                   # ملفات التطبيق
│   ├── resources/           # موارد Electron
│   ├── locales/             # ملفات الترجمة
│   ├── swiftshader/         # محسن الرسوم
│   └── *.dll                # مكتبات Windows
├── Uninstall.exe            # أداة الإلغاء
└── [Setup Icon]             # أيقونة التثبيت
```

### macOS (DMG)
```
KNOUX Clipboard AI.dmg  (90 MB)
└── KNOUX Clipboard AI.app/   (حزمة التطبيق)
    ├── Contents/
    │   ├── MacOS/           # التنفيذي الرئيسي
    │   ├── Resources/       # الموارد والأيقونات
    │   ├── Frameworks/      # إطارات العمل
    │   └── Info.plist       # معلومات التطبيق
    └── [App Icon]           # أيقونة التطبيق
```

### Linux (AppImage)
```
KNOUX_Clipboard_AI-x86_64.AppImage  (95 MB)
├── squashfs-root/          # نظام ملفات مضغوط
│   ├── usr/               # ملفات النظام
│   ├── opt/               # ملفات التطبيق
│   └── [Desktop Entry]    # إدخال سطح المكتب
└── [Executable Header]    # رأس التنفيذ
```

## 🔄 عملية التعبئة

### الخطوة 1: التحضير
```bash
# التأكد من بناء أحدث نسخة
npm run build

# تنظيف ملفات التعبئة القديمة
npm run clean:packages

# التحقق من التوافق
npm run check:compatibility
```

### الخطوة 2: التعبئة الأساسية
```bash
# تعبئة لجميع المنصات
npm run package:all

# أو تعبئة لمنصات محددة
npm run package:win
npm run package:mac
npm run package:linux
```

### الخطوة 3: التوقيع والتحقق
```bash
# توقيع الحزم (يتطلب شهادات)
npm run sign:packages

# التحقق من التوقيع
npm run verify:signatures

# إنشاء رموز التحقق (checksums)
npm run generate:checksums
```

### الخطوة 4: التجميع النهائي
```bash
# إنشاء مجلد الإصدار
npm run assemble:release

# نسخ الوثائق والتراخيص
npm run copy:docs

# إنشاء أرشيف النسخ الاحتياطي
npm run create:backup
```

## ⚙️ تكوين التعبئة

### electron-builder.yml
```yaml
# الإعدادات الأساسية
appId: com.knoux.clipboardai
productName: KNOUX Clipboard AI
copyright: Copyright © 2024 KNOUX Team
version: 1.0.0

# الدلائل
directories:
  output: release/${version}
  buildResources: build

# الملفات المضمنة
files:
  - "dist/**/*"
  - "app/**/*"
  - "assets/**/*"
  - "!**/node_modules/**/*"
  - "!**/.git/**/*"
  - "!**/*.map"

# موارد إضافية
extraResources:
  - "assets/icons/**"
  - "assets/sounds/**"
  - "LICENSE"
  - "THIRD-PARTY-LICENSES.txt"
```

### إعدادات النظام
```yaml
# Windows
win:
  target: 
    - target: nsis
      arch: [x64]
    - target: portable
      arch: [x64]
  icon: assets/icons/win/icon.ico
  publisherName: KNOUX Technologies
  verifyUpdateCodeSignature: true

# macOS
mac:
  target: dmg
  category: public.app-category.productivity
  icon: assets/icons/mac/icon.icns
  hardenedRuntime: true
  gatekeeperAssess: false

# Linux
linux:
  target: AppImage
  category: Utility
  icon: assets/icons/linux/icon.png
  maintainer: support@knoux.ai
```

## 🔐 التوقيع الرقمي

### شهادات التوقيع
```bash
# Windows (Code Signing Certificate)
export CSC_LINK="file://certs/knoux.pfx"
export CSC_KEY_PASSWORD="secure_password"

# macOS (Developer ID)
export APPLE_ID="developer@knoux.ai"
export APPLE_ID_PASSWORD="@keychain:knoux-app"
export APPLE_TEAM_ID="TEAM123456"

# Linux (GPG)
export GPG_PRIVATE_KEY="file://certs/private.key"
export GPG_PASSPHRASE="secure_passphrase"
```

### عملية التوقيع
```bash
# توقيع Windows
npm run sign:win -- \
  --csc-link="$CSC_LINK" \
  --csc-key-password="$CSC_KEY_PASSWORD"

# توقيع macOS
npm run sign:mac -- \
  --apple-id="$APPLE_ID" \
  --apple-id-password="$APPLE_ID_PASSWORD" \
  --apple-team-id="$APPLE_TEAM_ID"

# توقيع Linux
npm run sign:linux -- \
  --gpg-private-key="$GPG_PRIVATE_KEY" \
  --gpg-passphrase="$GPG_PASSPHRASE"
```

## 📊 تحليل الحزمة

### فحص المحتويات
```bash
# قائمة ملفات الحزمة
npm run inspect:package -- <package-file>

# تحليل حجم الملفات
npm run analyze:size -- <package-file>

# التحقق من الأذونات
npm run check:permissions -- <package-file>
```

### مقاييس الجودة
```json
{
  "package": {
    "platform": "windows",
    "size": "85.3 MB",
    "compressedSize": "42.1 MB",
    "compressionRatio": "50.6%",
    "fileCount": 1247,
    "executableCount": 3,
    "libraryCount": 48,
    "resourceCount": 89
  },
  "security": {
    "signed": true,
    "verified": true,
    "tampered": false,
    "permissions": "appropriate"
  },
  "performance": {
    "launchTime": "2.3s",
    "memoryUsage": "145 MB",
    "diskUsage": "210 MB",
    "cpuUsage": "5-15%"
  }
}
```

## 🧪 اختبارات ما بعد التعبئة

### الاختبارات التلقائية
```bash
# اختبار التثبيت
npm run test:install -- <package-file>

# اختبار التشغيل
npm run test:run -- <package-file>

# اختبار الإلغاء
npm run test:uninstall -- <package-file>
```

### الاختبارات اليدوية
1. **تثبيت على نظام نظيف**
2. **تشغيل جميع الميزات**
3. **اختبار التحديثات**
4. **اختبار الإلغاء**
5. **اختبار التوافق مع برامج أخرى**

### اختبارات النظام
```bash
# اختبار Windows
npm run test:win -- --vm windows-11

# اختبار macOS
npm run test:mac -- --vm macos-ventura

# اختبار Linux
npm run test:linux -- --vm ubuntu-22.04
```

## 🚀 التوزيع

### قنوات التوزيع
```yaml
channels:
  stable:
    - github: releases/latest
    - website: downloads/stable
    - stores: official
  
  beta:
    - github: releases/prerelease
    - website: downloads/beta
    - testers: internal
  
  nightly:
    - github: releases/nightly
    - developers: automated
```

### النشر التلقائي
```bash
# النشر لـ GitHub Releases
npm run publish:github -- \
  --token "$GITHUB_TOKEN" \
  --release stable

# النشر لموقع الويب
npm run publish:website -- \
  --api-key "$WEB_API_KEY" \
  --channel stable

# النشر للمتاجر
npm run publish:stores -- \
  --windows-store \
  --mac-app-store \
  --linux-repos
```

### ملفات التوزيع
```
release/1.0.0/
├── KNOUX_Clipboard_AI_Setup_1.0.0.exe      # Windows Installer
├── KNOUX_Clipboard_AI_1.0.0_x64_portable.zip # Windows Portable
├── KNOUX_Clipboard_AI-1.0.0.dmg            # macOS Disk Image
├── KNOUX_Clipboard_AI-1.0.0-arm64.dmg      # macOS Apple Silicon
├── KNOUX_Clipboard_AI-1.0.0-x86_64.AppImage # Linux AppImage
├── KNOUX_Clipboard_AI-1.0.0-amd64.deb      # Linux Debian
├── KNOUX_Clipboard_AI-1.0.0-x86_64.rpm     # Linux RPM
├── SHA256SUMS.txt                          # تحقق التمام
├── SHA256SUMS.txt.sig                      # توقيع التحقق
└── RELEASE_NOTES.md                        # ملاحظات الإصدار
```

## 🔄 تحديثات التطبيق

### نظام التحديث التلقائي
```typescript
interface AutoUpdater {
  // التحقق من التحديثات
  checkForUpdates(): Promise<UpdateInfo>;
  
  // تنزيل التحديث
  downloadUpdate(): Promise<string>;
  
  // تثبيت التحديث
  installUpdate(): Promise<void>;
  
  // معالجة الأخطاء
  handleUpdateError(error: Error): void;
}
```

### ملف التحديث
```xml
<!-- تحديثات Windows -->
<update>
  <version>1.0.1</version>
  <releaseDate>2024-01-15</releaseDate>
  <files>
    <file name="KNOUX_Clipboard_AI_Setup_1.0.1.exe" size="85300000" />
  </files>
  <changelog>
    <change>إصلاح مشكلة في النسخ</change>
    <change>تحسين أداء الذكاء الاصطناعي</change>
  </changelog>
</update>
```

## 📈 مراقبة التوزيع

### إحصائيات التثبيت
```typescript
interface InstallMetrics {
  // التثبيتات
  totalInstalls: number;
  activeInstalls: number;
  platformDistribution: Record<string, number>;
  versionDistribution: Record<string, number>;
  
  // الأخطاء
  installErrors: number;
  updateErrors: number;
  crashReports: number;
  
  // الأداء
  averageLaunchTime: number;
  memoryUsageStats: Stats;
  cpuUsageStats: Stats;
}
```

### تقارير الأعطال
```json
{
  "crashReport": {
    "version": "1.0.0",
    "platform": "windows",
    "timestamp": "2024-01-15T10:30:00Z",
    "error": "ACCESS_VIOLATION",
    "stackTrace": "...",
    "userActions": ["copy", "paste", "ai_enhance"],
    "systemInfo": {
      "os": "Windows 11 Pro",
      "ram": "16 GB",
      "cpu": "Intel i7",
      "gpu": "NVIDIA RTX 3060"
    }
  }
}
```

## 🛡️ الأمان

### حماية الحزمة
1. **التوقيع الرقمي**: التحقق من المصدر
2. **التحقق من التمام**: منع العبث
3. **فحص الفيروسات**: قبل التوزيع
4. **تحليل الثغرات**: فحص التبعيات
5. **التشفير**: حماية البيانات الحساسة

### أفضل الممارسات
```bash
# فحص الأمان قبل التوزيع
npm run security:scan

# تحديث التبعيات الأمنية
npm audit
npm audit fix

# فحص الثغرات
npx snyk test
npx snyk monitor
```

## 📝 التوثيق

### ملفات التوزيع
```markdown
# RELEASE_NOTES.md
## الإصدار 1.0.0
### جديد
- إدارة حافظة ذكية
- تحسينات بالذكاء الاصطناعي
- نظام أمان متقدم

### إصلاحات
- إصلاح مشكلة النسخ
- تحسين الأداء

### معروف
- لا توجد مشاكل معروفة

# INSTALL_GUIDE.md
## دليل التثبيت
### Windows
1. انقر نقراً مزدوجاً على الملف .exe
2. اتبع خطوات التثبيت

### macOS
1. افتح ملف .dmg
2. اسحب التطبيق إلى مجلد التطبيقات
```

## 🔧 استكشاف الأخطاء

### مشاكل شائعة
```bash
# خطأ في التوقيع
export CSC_LINK="file://certs/cert.pfx"
export CSC_KEY_PASSWORD="correct_password"

# خطأ في الذاكرة
export NODE_OPTIONS="--max-old-space-size=8192"

# خطأ في التبعيات
rm -rf node_modules package-lock.json
npm ci

# خطأ في النظام
npm run doctor
npm run fix:dependencies
```

### سجلات التعبئة
```bash
# تمكين السجلات التفصيلية
export DEBUG=electron-builder,electron-updater

# حفظ السجلات
npm run package:all 2>&1 | tee packaging.log

# تحليل الأخطاء
grep -i "error\|fail\|warn" packaging.log
```

## 🎯 أفضل الممارسات

### 1. إدارة الإصدارات
```bash
# إصدار دلالي (SemVer)
npm version patch  # 1.0.0 → 1.0.1 (إصلاحات)
npm version minor  # 1.0.1 → 1.1.0 (ميزات)
npm version major  # 1.1.0 → 2.0.0 (تغييرات كسرية)
```

### 2. التحكم في الجودة
```bash
# سير عمل متكامل
npm run quality:pipeline  # build → test → package → sign
```

### 3. المراقبة المستمرة
```bash
# مراقبة التوزيع
npm run monitor:distribution

# تحديث التقارير
npm run update:metrics

# التحليل الدوري
npm run analyze:trends
```

### 4. التوثيق الشامل
```bash
# تحديث جميع الوثائق
npm run docs:all

# التحقق من الاكتمال
npm run docs:check
```

---

*دليل التعبئة والتوزيع - الإصدار 1.0*  
*آخر تحديث: $(Get-Date -Format "yyyy-MM-dd")*

[التنفيذ](../electron-builder.yml) | [البناء](./build-flow.md) | [التوزيع](../docs/RELEASE_GUIDE.md)
