# ⚡ QUICK START - Knoux Clipboard AI

## 🚀 Start Development (3 Commands)

```bash
# 1. Install dependencies
npm install

# 2. Start development server
npm run dev

# 3. Done! App opens automatically
```

---

## 📦 Build for Production

```bash
# Build everything
npm run build

# Create installer
npm run dist
```

---

## 🔍 What Happens When You Run `npm run dev`

1. ✅ Vite starts on `http://localhost:5173`
2. ✅ Electron waits for Vite to be ready
3. ✅ `main.js` loads and initializes IPC handlers
4. ✅ Electron window opens
5. ✅ React app loads and connects to IPC
6. ✅ Settings, language, and theme load
7. ✅ UI renders

---

## 🛠️ If Something Goes Wrong

### "Port 5173 already in use"
```bash
# Kill the process
lsof -ti:5173 | xargs kill -9
npm run dev
```

### "IPC not available"
```bash
# Check DevTools console (F12)
console.log(window.electron?.ipcRenderer);
# Should show an object with invoke, send, on methods
```

### "Settings not loading"
```bash
# Check main process console for:
# ✅ Enhanced IPC handlers initialized
# If not there, IPC handlers didn't load
```

### "TypeScript errors"
```bash
# Rebuild TypeScript
npm run build:main
npm run dev
```

---

## 📊 Project Structure (After Fix)

```
Knoux-Clipboard-AI/
├── main.js                          ← Electron entry point ✅
├── preload.js                       ← IPC bridge ✅
├── package.json                     ← Build scripts ✅
├── app/
│   ├── backend/
│   │   ├── init.ts                 ← Service initialization ✅
│   │   ├── ipc/
│   │   │   └── enhanced-handlers.ts ← IPC handlers ✅
│   │   ├── ai/                     ← AI services
│   │   ├── clipboard/              ← Clipboard services
│   │   ├── security/               ← Security services
│   │   └── services/               ← Business logic
│   ├── renderer/
│   │   ├── App.tsx                 ← Main React component ✅
│   │   ├── services/
│   │   │   └── initialization.ts   ← Renderer init ✅
│   │   ├── components/             ← UI components
│   │   ├── views/                  ← Page views
│   │   ├── contexts/               ← React contexts
│   │   └── hooks/                  ← Custom hooks
│   └── shared/
│       ├── logger.ts               ← Logging
│       ├── localized-logger.ts     ← Logger wrapper ✅
│       └── types.ts                ← TypeScript types
└── dist/                           ← Built app (after npm run build)
```

---

## 🎯 Development Workflow

### 1. Make Changes
Edit any file in `app/` directory

### 2. Changes Auto-Reload
- React components: Hot reload in browser
- Backend TypeScript: Recompile on save (ts-node)
- Electron main: Restart electron (manual restart needed)

### 3. Debug
- Open DevTools: `F12` or `Ctrl+Shift+I`
- Check Console for errors
- Check Network tab for IPC calls

### 4. Commit
```bash
git add .
git commit -m "feat: description of changes"
```

---

## 📋 Common Tasks

### Add New IPC Handler
1. Edit `app/backend/ipc/enhanced-handlers.ts`
2. Add new `ipcMain.handle()` call
3. Restart electron (or it auto-reloads)

### Add New React Component
1. Create file in `app/renderer/components/`
2. Import in `app/renderer/App.tsx`
3. Hot reload works automatically

### Add New Backend Service
1. Create file in `app/backend/services/`
2. Initialize in `app/backend/init.ts`
3. Expose via IPC handler

### Change Theme
1. Edit `app/renderer/contexts/ThemeContext.tsx`
2. Hot reload works automatically

---

## 🔐 Security Notes

- ✅ Context isolation enabled
- ✅ Node integration disabled
- ✅ Sandbox enabled
- ✅ IPC safely exposed via preload
- ✅ No direct access to Node APIs from renderer

---

## 📞 Support

If you encounter issues:

1. Check `SETUP-FIXED.md` for detailed troubleshooting
2. Check `FIX-SUMMARY.md` for what was changed
3. Check console logs (both main and renderer)
4. Check DevTools Network tab for IPC calls

---

## ✅ Verification

After running `npm run dev`, you should see:

**Main Process Console:**
```
✅ IPC handlers initialized (dev mode)
```

**Renderer Console:**
```
🚀 Initializing renderer app...
✅ Settings loaded
✅ Language loaded
✅ Theme loaded
✅ Renderer initialization complete
```

**Window:**
- Knoux Clipboard AI window opens
- No white screen
- UI is responsive

---

**Ready to go! Run `npm run dev` now! 🚀**
