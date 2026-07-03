# 🔨 دليل بناء مشروع KNOUX Clipboard AI

## 📋 نظرة عامة

يصف هذا الدليل عملية بناء وتوزيع تطبيق KNOUX Clipboard AI. يستخدم النظام Vite للبناء السريع و Electron Builder لتعبئة التطبيق.

## 🏗️ هيكل عملية البناء

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  كود المصدر    │───▶│  بناء React     │───▶│  حزمة Electron  │
│  TypeScript     │    │  مع Vite        │    │  مع Builder     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  التحقق النوعي  │    │  تحسين الأصول   │    │  التوقيع والتحقق│
│  TypeScript     │    │  Assets         │    │  التطبيق        │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🚀 خطوات البناء الكاملة

### الخطوة 1: التحضير المبدئي
```bash
# تنظيف البنيات السابقة
npm run clean

# التحقق من حالة المشروع
npm run doctor

# التحقق النوعي
npm run type-check

# فحص الكود
npm run lint
```

### الخطوة 2: بناء تطبيق React
```bash
# بناء وضع التطوير (مع خرائط المصدر)
npm run build -- --mode development

# بناء وضع الإنتاج (مضغوط ومحسن)
npm run build -- --mode production

# بناء مع تحليل الحزمة
npm run build -- --mode production --analyze
```

### الخطوة 3: بناء تطبيق Electron
```bash
# بناء لتطوير Electron
npm run electron:build -- --dir

# بناء حزمة تثبيت كاملة
npm run electron:build

# بناء لأنظمة محددة
npm run electron:build -- --win
npm run electron:build -- --mac
npm run electron:build -- --linux
```

## ⚙️ تكوينات البناء

### تكوين Vite (vite.config.ts)
```typescript
// الإعدادات الرئيسية
export default defineConfig({
  base: './',
  build: {
    outDir: 'dist',
    sourcemap: true,
    minify: 'esbuild',
    target: 'es2020',
    // إعدادات إضافية
    rollupOptions: { /* ... */ },
    chunkSizeWarningLimit: 1000
  }
})
```

### تكوين Electron Builder (electron-builder.yml)
```yaml
appId: com.knoux.clipboardai
productName: KNOUX Clipboard AI
directories:
  output: release
files:
  - dist/**/*
  - app/**/*
  - assets/**/*
extraResources:
  - assets/**
```

## 📦 أنواع الحزم

### حزم التطوير
```bash
# حزمة غير موقعة (للتطوير)
npm run electron:build -- --dir

# حزمة محلية (بدون توقيع)
npm run electron:build -- --publish never
```

### حزم الإنتاج
```bash
# حزمة موقعة (للإطلاق)
npm run electron:build -- --publish always

# حزمة محددة الإصدار
npm run electron:build -- --publish always -c.extraMetadata.version=1.0.0
```

### حزم المنصات المختلفة
```bash
# Windows
npm run electron:build -- --win nsis
npm run electron:build -- --win portable

# macOS
npm run electron:build -- --mac dmg
npm run electron:build -- --mac zip

# Linux
npm run electron:build -- --linux AppImage
npm run electron:build -- --linux snap
```

## 🔧 تحسينات البناء

### تقسيم الكود (Code Splitting)
```typescript
// تقسيم ديناميكي للمكونات
const Dashboard = React.lazy(() => import('@views/Dashboard'))
const AIInsights = React.lazy(() => import('@views/AIInsights'))
const ClipboardHistory = React.lazy(() => import('@views/ClipboardHistory'))
```

### تحسين الأصول
```typescript
// تحسين الصور
import.meta.glob('@assets/images/*.{png,jpg,jpeg,webp}', {
  eager: true,
  as: 'url'
})

// تحسين الخطوط
import.meta.glob('@assets/fonts/*.{ttf,woff,woff2}', {
  eager: true,
  as: 'url'
})
```

### التخزين المؤقت للبناء
```bash
# تفعيل التخزين المؤقت
export VITE_CACHE=true

# تنظيف ذاكرة التخزين المؤقت
rm -rf node_modules/.vite
rm -rf node_modules/.cache
```

## 🧪 اختبارات ما بعد البناء

### الاختبارات التلقائية
```bash
# اختبار الحزمة المبنية
npm run test:build

# اختبار التثبيت
npm run test:install

# اختبار التشغيل
npm run test:run
```

### الاختبارات اليدوية
1. **فحص الحزمة**: حجم، هيكل، صلاحيات
2. **اختبار التثبيت**: على أنظمة نظيفة
3. **اختبار التشغيل**: جميع الميزات الأساسية
4. **اختبار الأداء**: وقت البدء، استخدام الذاكرة
5. **اختبار التوافق**: إصدارات مختلفة من الأنظمة

## 📊 تحليل الحزمة

### تحليل حجم الحزمة
```bash
# تحليل مع Vite
npm run build -- --mode production --analyze

# تحليل مع webpack-bundle-analyzer
npm run analyze
```

### تقرير التحليل
```json
{
  "totalSize": "85 MB",
  "mainBundle": "15 MB",
  "vendorBundle": "40 MB",
  "assets": "30 MB",
  "compressionRatio": "65%",
  "loadTime": "2.3s",
  "memoryUsage": "150 MB"
}
```

## 🔐 التوقيع والتحقق

### توقيع التطبيق
```bash
# توقيع Windows
npm run electron:build -- --win --sign

# توقيع macOS
npm run electron:build -- --mac --sign

# توقيع Linux
npm run electron:build -- --linux --sign
```

### شهادات التوقيع
```yaml
# تكوين الشهادات
sign:
  - certificateFile: './certs/cert.pfx'
    certificatePassword: '${CERT_PASSWORD}'
  - certificateFile: './certs/cert.p12'
    certificatePassword: '${CERT_PASSWORD}'
```

## 🚀 النشر والتوزيع

### النشر التلقائي
```bash
# النشر ل GitHub Releases
npm run electron:build -- --publish always

# النشر لمزود محدد
npm run electron:build -- --publish onTagOrDraft
```

### قنوات التوزيع
1. **GitHub Releases**: للمطورين والمختبرين
2. **موقع الويب**: للتنزيل المباشر
3. **متاجر التطبيقات**: Microsoft Store، Mac App Store
4. **التوزيع الداخلي**: للفرق والمؤسسات

## 🛠️ استكشاف أخطاء البناء

### مشاكل شائعة
```bash
# خطأ في الذاكرة
export NODE_OPTIONS="--max-old-space-size=4096"

# خطأ في التبعيات
rm -rf node_modules package-lock.json
npm install

# خطأ في TypeScript
npm run type-check -- --noEmit

# خطأ في التوقيع
export CSC_LINK="file://certs/cert.p12"
export CSC_KEY_PASSWORD="password"
```

### سجلات البناء
```bash
# سجلات مفصلة
npm run electron:build -- --debug

# حفظ السجلات
npm run electron:build 2>&1 | tee build.log

# تحليل السجلات
grep -i "error\|warn\|fail" build.log
```

## ⚡ نصائح للبناء السريع

### البناء المتزايد
```bash
# بناء متزايد (للتطوير)
npm run build -- --watch

# بناء سريع (بدون تحسينات)
npm run build -- --mode development --minify false
```

### التخزين المؤقت
```bash
# تفعيل التخزين المؤقت الكامل
export VITE_CACHE=true
export NODE_OPTIONS="--max-old-space-size=4096"

# استخدام ذاكرة التخزين المؤقت المسبقة
npm run prebuild
```

### البناء الموازي
```bash
# بناء لأنظمة متعددة معاً
npm run build:all --parallel

# تقسيم المهام
npm run build:react & npm run build:electron
```

## 📈 مقاييس البناء

### مقاييس الأداء
```json
{
  "buildTime": "45s",
  "bundleSize": "85 MB",
  "compressedSize": "45 MB",
  "fileCount": 1250,
  "cacheHitRate": "85%"
}
```

### أهداف الجودة
- **وقت البناء**: < 60 ثانية
- **حجم الحزمة**: < 100 MB
- **معدل التخزين المؤقت**: > 80%
- **معدل النجاح**: 100%

## 🔄 التحديثات المستمرة

### البناء المستمر
```yaml
# تكوين GitHub Actions
name: Build
on: [push, pull_request]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run build
      - run: npm test
```

### إصدارات ليلية
```bash
# بناء إصدار ليلي
npm run build:nightly

# نشر إصدار بيتا
npm run publish:beta
```

## 📋 قائمة التحقق النهائية

### قبل البناء
- [ ] جميع الاختبارات تمر
- [ ] التحقق النوعي ناجح
- [ ] الفحص نظيف
- [ ] الإصدار محدث
- [ ] التبعيات محدثة

### أثناء البناء
- [ ] البناء بدون أخطاء
- [ ] الحجم ضمن الحدود
- [ ] التوقيع ناجح
- [ ] الضغط فعال

### بعد البناء
- [ ] اختبار التثبيت
- [ ] اختبار التشغيل
- [ ] التحقق من التوقيع
- [ ] تحديث الوثائق

## 🎯 أفضل الممارسات

### 1. إدارة الإصدارات
```bash
# زيادة الإصدار تلقائياً
npm version patch  # 1.0.0 → 1.0.1
npm version minor  # 1.0.1 → 1.1.0
npm version major  # 1.1.0 → 2.0.0
```

### 2. التحكم في الجودة
```bash
# سير عمل متكامل
npm run quality-check  # lint + type-check + test + build
```

### 3. الأمان
```bash
# فحص الثغرات
npm audit
npm audit fix

# فحص التبعيات
npx depcheck
```

### 4. التوثيق
```bash
# تحديث الوثائق
npm run docs

# تحديث شجرة المشروع
npm run tree
```

---

*دليل البناء - الإصدار 1.0*  
*آخر تحديث: $(Get-Date -Format "yyyy-MM-dd")*

[التنفيذ](../vite.config.ts) | [التكوين](../electron-builder.yml) | [الاختبارات](../app/tests/)
