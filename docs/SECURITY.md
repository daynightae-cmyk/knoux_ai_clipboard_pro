# Security Policy & Implementation

## 1. Data Encryption
We use a **Device-Bound Encryption Strategy**.
- **Algorithm:** AES-256-GCM.
- **Key Derivation:** The encryption key is derived at runtime from hardware signatures (Machine ID + OS Platform + Architecture).
- **Storage:** The key is NEVER stored on disk. It is generated in memory when the app starts.
- **Consequence:** Copying the `.sqlite` database to another computer renders it unreadable, as the key derivation will fail.

## 2. Sandbox Implementation
To prevent XSS (Cross-Site Scripting) and RCE (Remote Code Execution):
- **Renderer Isolation:** The React view has `nodeIntegration: false` and `contextIsolation: true`.
- **Preload Scripts:** Exposed APIs are limited strictly to defined functions in `app/shared/ipc-handlers.ts`.
- **HTML Sanitization:** Before rendering any copied HTML, it passes through `Sandbox.sanitizeHTML` (in `backend/security/sandbox.ts`) to strip `<script>`, `<iframe>`, and `on*` events.

## 3. Clipboard Privacy
Knoux respects privacy via the `PermissionGuard` module:
- **Blacklisting:** Automatically ignores content from known password managers (`keepass`, `1password`, `lastpass`).
- **Sensitive Detection:** Heuristic regex scanners identify Credit Cards, API Keys, and SSNs. These are flagged and masked visually in the UI until explicit user unlock.
- **Transient Mode:** Users can toggle "Incognito Mode" to stop recording entirely.

## 4. Updates
Updates are delivered via signed binaries verified against the publisher's certificate (if configured in `electron-builder.yml`).
