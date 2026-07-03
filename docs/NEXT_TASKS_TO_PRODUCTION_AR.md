# مهام تحويل Knoux AI Clipboard Pro إلى تطبيق إنتاجي

## المرحلة 1 — تشغيل محلي نظيف

- [ ] فتح المشروع في VS Code.
- [ ] تشغيل أمر تثبيت الحزم المناسب: `npm install` أو `pnpm install` أو حسب التقنية.
- [ ] تشغيل التطبيق محليًا: `npm run dev` أو الأمر المتاح في `package.json`.
- [ ] إصلاح أخطاء TypeScript/ESLint/Imports.
- [ ] التأكد من عدم وجود أسرار داخل Git.

## المرحلة 2 — تثبيت هوية KNOUX

- [ ] إضافة شعار KNOUX في splash/about/header حيث يناسب.
- [ ] استخدام البنفسجي الرسمي `#8A2BE2` ودرجاته.
- [ ] إضافة عبارة `A Knoux Product` في شاشة About أو Footer.
- [ ] إضافة بيانات المطور الرسمية في صفحة About فقط، وليس في كل شاشة.

## المرحلة 3 — تحويله لمنتج فعلي

- [ ] إزالة البيانات الوهمية غير الضرورية أو فصلها في demo mode.
- [ ] بناء إعدادات إنتاج `.env.example`.
- [ ] إضافة معالجة أخطاء حقيقية وempty states.
- [ ] تحسين responsive UI وdark/light mode.
- [ ] إضافة logging آمن بدون أسرار.

## المرحلة 4 — التغليف EXE

- [ ] تثبيت Electron Builder وإخراج Windows NSIS/portable EXE.
- [ ] إضافة اسم المنتج، الأيقونة، الناشر، الإصدار، وبيانات KNOUX داخل manifest.
- [ ] تشغيل build production.
- [ ] اختبار EXE على Windows نظيف.

## المرحلة 5 — GitHub

- [ ] إنشاء branch باسم `rescue/production-readiness`.
- [ ] رفع النسخة المنظمة بدون node_modules أو ملفات البيئة.
- [ ] إضافة GitHub Actions للفحص والبناء.
- [ ] فتح Issues للمهام المتبقية.
