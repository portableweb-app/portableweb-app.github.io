# @portableweb/web

Node.js server powering **portableweb.org** — homepage at `/` and browser-based PWA viewer at `/app/`.

## What's inside

```
public/
  index.html        # portableweb.org marketing homepage
  icons/icon.svg    # brand icon (used by both pages and the PWA manifest)
  app/
    index.html      # PWA app shell (dashboard + viewer, all JS/CSS inline)
    manifest.json   # Web App Manifest — file_handlers for .pweb, offline icons
    sw.js           # Service Worker — pre-caches app shell for offline use
server.js           # Express — static files + JSZip route + SPA fallback
```

## Getting started

```bash
npm install
npm start          # → http://localhost:3000
```

Set `PORT` env var to change the port.

## Routes

| Path | What it serves |
|---|---|
| `/` | Marketing homepage |
| `/app/` | PWA viewer app |
| `/app/jszip.min.js` | JSZip 3.x (served from node_modules, cached by SW) |
| `/icons/icon.svg` | Brand icon |

Any `/app/*` path not matched by a static file falls back to the app shell (SPA routing).

## PWA features

**File Handling API** — when the PWA is installed in Chrome or Edge on desktop, opening a `.pweb` file from the OS launches the app directly. The app receives the file via `window.launchQueue` and renders it immediately.

**Drag-and-drop** — drop a `.pweb` file anywhere on the window to open it.

**File picker** — the "Choose .pweb file" button opens a native file picker. On mobile, this opens the system file browser.

**Offline** — the service worker pre-caches the app shell (HTML, manifest, SW, JSZip, icon) on install. The viewer works fully offline once cached.

**Share Target** — the manifest declares a share target so `.pweb` files can be shared to the app from the OS share sheet (Android / desktop).

## Developer tools (dashboard)

| Tool | What it does |
|---|---|
| **Open** | Pick and render a `.pweb` bundle in the viewer |
| **Unpack** | Rename `.pweb` → `.zip` and download for inspection/editing |
| **Pack** | Select a folder → build a spec-compliant `.pweb` (mimetype first, STORE compression) |
| **Validate** | Run 12 spec checks against a `.pweb` and show a pass/fail report |
| **New Project** | Fill a short form → download a ready-to-edit starter `.pweb` |

## Bundle rendering (v0.1 notes)

Bundles are opened client-side with JSZip. Each file is converted to a Blob URL and the entry HTML has its `src`/`href`/`url()` attributes rewritten before loading into a sandboxed `<iframe>`.

The iframe runs with `sandbox="allow-scripts allow-forms allow-pointer-lock allow-popups allow-modals allow-downloads"` — JavaScript works, but the bundle cannot access the parent page's origin or storage. Bundle-level `localStorage`/`IndexedDB` is not available in this viewer tier; that requires the native Tauri viewer (`portableweb/viewer`) or a future Service Worker–based origin-isolation approach.

## Related packages

| Repo | Purpose |
|---|---|
| [`portableweb/spec`](https://github.com/portableweb/spec) | v0.1 spec, `hello.pweb` example, container and manifest docs |
| [`portableweb/cli`](https://github.com/portableweb/cli) | `pweb` CLI — `pack`, `validate`, `init` |
| [`portableweb/viewer`](https://github.com/portableweb/viewer) | Native desktop viewer (Tauri) with full sandbox and `pweb://` protocol |

## Known issues / TODOs

### Recent files re-open (not yet implemented)

The "Recent" section in the dashboard stores filenames and titles in `localStorage`
but cannot re-open files — the browser has no persistent access to the original file
path after the session ends.

**Fix:** Use the [File System Access API](https://developer.chrome.com/docs/capabilities/web-apis/file-system-access)
to store a `FileSystemFileHandle` per recent entry in IndexedDB.
On click, call `handle.requestPermission({ mode: 'read' })` to re-acquire access,
then `handle.getFile()` → `openBundle(file)`.

Caveats:
- Chrome/Edge desktop only (no Firefox, no mobile Safari)
- Requires a user permission re-prompt each browser session
- Handle goes stale if the file is moved or deleted

### Domain categorisation — submit to enterprise web filters

New domains default to "Uncategorized" in enterprise web filters, which most
corporate firewalls block. Submit portableweb.org to each vendor's portal and
request the category **Technology / Information Technology / Open Source Software**.

| Vendor | Submission URL |
|---|---|
| Cisco Umbrella / Talos | https://investigate.umbrella.com |
| Palo Alto Networks | https://urlfiltering.paloaltonetworks.com |
| Zscaler | https://zscaler.com/tools/url-categorization |
| Fortinet FortiGuard | https://fortiguard.com/webfilter |
| Symantec / Broadcom | https://sitereview.symantec.com |
| Barracuda | https://barracudacentral.org/lookups |
| McAfee / Trellix | https://trustedsource.org |
| Webroot BrightCloud | https://brightcloud.com/tools/url-ip-lookup |
| IBM X-Force | https://exchange.xforce.ibmcloud.com |
| Trend Micro | https://sitesafety.trendmicro.com |
| Google Safe Browsing | https://transparencyreport.google.com/safe-browsing/search |

Priority: **Cisco and Palo Alto** are the most common in enterprise environments.
Most vendors review within 24–72 hours.

## Community

This project is open for community contribution. All materials are contributed under the Creative Commons Attribution 4.0 license (CC-BY-4.0). This work is being submitted as input to the W3C Portable Web Content Format (PortableWeb) Community Group.

## License

MIT — see [portableweb/spec](https://github.com/portableweb/spec) for the CC-BY 4.0 spec license.
