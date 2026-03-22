# 🚫 Unquery

> **Block AI Overviews, Copilot responses, and AI summaries** across all major search engines—and track the environmental impact.

![MIT License](https://img.shields.io/badge/licence-MIT-blue.svg)
![Chrome Extension](https://img.shields.io/badge/Chrome%20Extension-Available-brightgreen)
![Manifest V3](https://img.shields.io/badge/Manifest-v3-informational)
![JavaScript](https://img.shields.io/badge/Lang-JavaScript-yellow)
![Zero Dependencies](https://img.shields.io/badge/Dependencies-0-success)

Unquery is a lightweight, privacy-first Chrome extension that removes AI-generated search summaries before they load. It also calculates and displays the water and energy saved by blocking these computationally expensive queries.

---

## ✨ Features

### 🎯 **Remove AI Overviews**
- Blocks Google AI Overview blocks on search result pages
- Removes Copilot responses, Bing AI summaries, and similar AI content
- Supports 8 major search engines out of the box

### ⚡ **Ultra-Lightweight**
- Minimal memory footprint (~500KB unpacked)
- **Zero external dependencies**
- Efficient MutationObserver patterns for DOM monitoring
- Smart selector validation to prevent broad DOM sweeps

### 📊 **Track Environmental Impact**
- Real-time water savings calculation (ml)
- Energy consumption reduction tracking (Wh)
- Weekly progress goals and achievements
- No tracking, no analytics, no data collection

### 🔍 **Smart Selector Management**
- Hardcoded default selectors for all supported engines
- Optional remote selector updates (configurable)
- Defensive error handling for selector breakage
- Automatic fallback mechanisms

### 🔒 **Privacy-First**
- ✅ Zero data collection
- ✅ Runs entirely locally in your browser
- ✅ No external network requests (except optional remote selectors)
- ✅ Open source—audit the code yourself

---

## 🌐 Supported Search Engines

| Engine | Status | Support Level |
|--------|--------|---|
| 🔍 Google Search | ✅ Supported | Full |
| 🔵 Bing | ✅ Supported | Full |
| 🦆 DuckDuckGo | ✅ Supported | Full |
| 🦁 Brave Search | ✅ Supported | Full |
| 🌱 Ecosia | ✅ Supported | Full |
| 🔎 Startpage | ✅ Supported | Full |
| 📔 Yahoo Search | ✅ Supported | Full |
| 🔮 Yandex | ✅ Supported | Full |

---

## 📥 Installation

### 🎁 From Chrome Web Store
[🔗 Visit the Chrome Web Store](https://chromewebstore.google.com) and search for "Unquery" to install the latest published version.

### 🧑‍💻 Manual Installation (Development)

1. **Clone this repository:**
   ```bash
   git clone https://github.com/unquery/unquery.git
   cd unquery
   ```

2. **Open `chrome://extensions`** in your browser

3. **Enable Developer Mode** (toggle in top right)

4. **Click Load unpacked**

5. **Select the cloned repository folder**

6. **Confirm** the extension loads and appears in your toolbar

---

## 🔧 How It Works

### 📡 **Core Architecture**

**Content Script** (`content.js`):
- Executes on supported search engine domains
- Removes AI overview elements on page load using CSS selectors
- Observes DOM mutations to catch dynamically injected AI content
- Uses multiple detection strategies for reliability

**Service Worker** (`background.js`):
- Tracks blocked-query events
- Maintains cumulative statistics (water 💧, energy ⚡)
- Manages weekly progress windows (reset Mondays at 00:00)
- Updates extension badge with weekly block count

**User Interface** (`popup.html` + `popup.js`):
- Toggle extension on/off per session
- Display real-time savings metrics
- Weekly progress bar toward configurable goals
- Last-blocked event verification

### 🌍 **Environmental Impact Calculation**

The extension's impact is based on published research into data center resource consumption:

| Metric | Standard Query | AI Query | **Savings per Block** |
|--------|---|---|---|
| **Water** 💧 | 10 ml | 100 ml | **90 ml** |
| **Energy** ⚡ | 0.3 Wh | 3.0 Wh | **2.7 Wh** |

**Monthly Impact Example:**
- Blocking 100 AI queries per month
- **Water:** 9,000 ml (9 liters) saved
- **Energy:** 270 Wh saved
- That's equivalent to **~1 full bottle of water** per query blocked!

---

## ⚙️ Configuration

### 🔄 **Remote Selector Updates**

To enable automatic selector updates from a remote source:

1. Edit `content.js` and update the `urls` array in `fetchRemoteSelectors()`:

```javascript
const urls = [
  'https://your-domain.com/selectors.json'
];
```

2. Host a `selectors.json` file with this structure:

```json
{
  "google": [
    "div.ai-overview-container",
    "div[data-ai-block]"
  ],
  "bing": [
    "#copilot-response"
  ]
}
```

3. Reload the extension in `chrome://extensions`

### 🎯 **Customize Weekly Goals**

Goals are stored in `chrome.storage.local.weeklyGoal`. Modify in the popup or via DevTools:

```javascript
chrome.storage.local.set({ weeklyGoal: 50 });
```

---

## 🆘 Troubleshooting

### ❌ AI Overviews Still Appearing?

1. **Verify the extension is enabled:**
   - Click the extension icon in your toolbar
   - Confirm the toggle is in the **ON** position

2. **Check selector support:**
   - Open your browser's DevTools (`F12`)
   - Console should show no errors
   - Google frequently updates selectors; this is expected

3. **Update selectors:**
   - Open an issue on GitHub with:
     - 🔗 The search URL you were on
     - 📸 Screenshot of the visible AI block
     - 📋 HTML snippet from DevTools showing the container

4. **Force reload:**
   - Go to `chrome://extensions`
   - Click the **reload** icon on Unquery

### 📊 Stats Not Updating?

1. Clear storage: `chrome.storage.local.clear()` in DevTools console
2. Reload the extension
3. Search again and wait a few seconds for stats to sync

### ⏸️ Extension Disabled Automatically?

Chrome disables extensions on startup in certain scenarios. Re-enable at `chrome://extensions`.

---

## 👨‍💻 Development

### 📁 **Project Structure**

```
unquery/
├── manifest.json          ⚙️  Manifest V3 config, permissions
├── content.js             🔧  Content script: DOM removal, selectors
├── background.js          💾  Service worker: stats tracking, storage
├── popup.html             🎨  UI template with animations
├── popup.js               📊  UI logic, storage bindings
├── icons/                 🎭  Extension icons (16, 24, 32, 48, 128px)
├── LICENSE                📜  MIT License
├── README.md              📖  This file
└── CONTRIBUTING.md        🤝  Contribution guidelines
```

### 🔄 **Local Development Workflow**

1. Make edits to `.js` or `.html` files
2. Go to `chrome://extensions`
3. Click the **reload** icon on Unquery
4. Test on a search results page
5. Check DevTools console for errors

### 🌍 **Adding Support for a New Search Engine**

1. Add a new entry to the `ENGINES` object in `content.js`:

```javascript
'newsearch.com': {
  observe: '#results',          // Parent element to watch
  selectors: [
    'div.ai-response',
    '[data-ai]'
  ]
}
```

2. Add to `host_permissions` in `manifest.json`:

```json
"*://*.newsearch.com/*"
```

3. Update content script `matches` in `manifest.json`

4. Test thoroughly on live search results

### 💎 **Code Quality Standards**

- **Error Handling:** Fail silently; never crash
  ```javascript
  try { /* operation */ } catch (e) {}
  ```
- **Selectors:** Always wrap in try/catch
- **Comments:** Only explain non-obvious logic
- **Performance:** No unnecessary DOM traversals

---

## 🤝 Contributing

We welcome contributions! Here's how:

1. **Fork** this repository
2. **Create** a feature branch (`git checkout -b feature/your-feature`)
3. **Make** your changes
4. **Test** on live search pages
5. **Commit** with clear messages
6. **Push** to your fork
7. **Open** a pull request with description

### 📋 **Contribution Types**

- 🐛 **Bug Fixes** - Include reproduction steps, please!
- 📍 **Selector Updates** - Broken selector? We need: URL, screenshot, HTML snippet
- ✨ **New Features** - Keep them minimal and on-theme
- 🌍 **New Search Engines** - Full selector coverage required

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.

---

## 💝 Support & Donations

If Unquery saves you time and helps the environment, consider supporting the project:

| Option | Link |
|--------|------|
| ☕ **Buy Me a Coffee** | [![BMAC](https://img.shields.io/badge/Buy%20Me%20a%20Coffee-FFDD00?logo=buymeacoffee&logoColor=black)](https://www.buymeacoffee.com/rybrtle) |
| 🎁 **GitHub Sponsors** | [![GH Sponsors](https://img.shields.io/badge/GitHub%20Sponsors-white?logo=github&logoColor=black)](https://github.com/sponsors) |
| 💗 **Ko-fi** | [![Ko-fi](https://img.shields.io/badge/Ko--fi-FF5E8A?logo=ko-fi&logoColor=white)](https://ko-fi.com/) |

Your support helps sustain development, selector updates, and testing across multiple search engines. **Every donation is appreciated!** 🙏

---

## 📜 License

This project is licensed under the **MIT License**—see [LICENSE](LICENSE) for details.

```
MIT License - Free to use, modify, and distribute
Copyright (c) 2024-2026 Unquery Contributors
```

---

## ⚖️ Disclaimer

- 🔗 Unquery is **not affiliated** with Google, Microsoft, DuckDuckGo, Brave, Ecosia, Startpage, Yahoo, or Yandex
- 💡 It operates on the principle that users have the right to modify their own browsing experience
- ✅ Always respect the terms of service of any website you visit

---

## 📰 Changelog

### v1.0.0 (Production Release) 🚀
- ✅ Multi-engine support (8 search engines)
- ✅ Environmental impact tracking
- ✅ Weekly progress goals
- ✅ Remote selector updates (optional)
- ✅ Improved error handling
- ✅ Production-ready codebase

### v0.2.0
- Multi-engine expansion
- Stats tracking improvements

### v0.1.0
- Initial release (Google-only)

---

## 🗺️ Roadmap

- [ ] 🦊 Firefox support
- [ ] 🐢 Safari support  
- [ ] 🔌 API for custom selector sets
- [ ] 📈 Historical stats export
- [ ] 📅 Calendar integration for weekly trends
- [ ] 🌙 Dark mode UI

---

## ❓ Questions or Issues?

- 📝 **Report a bug:** [GitHub Issues](https://github.com/unquery/unquery/issues)
- 💬 **Ask a question:** [GitHub Discussions](https://github.com/unquery/unquery/discussions)
- 🌟 **Like it?** Star the repository!

---

<div align="center">
  
**Made with ❤️ for a cleaner, lighter internet**

🌍 *Blocking AI = Saving Water + Energy = Protecting Our Planet* 🌍

</div>

---

## How It Works

### Core Mechanism

**Content Script (`content.js`):**
- Executes on supported search engine domains
- Removes AI overview elements on page load using CSS selectors
- Observes DOM mutations to catch dynamically injected AI content
- Uses multiple detection strategies (element removal, style-based hiding, network interception)

**Background Service Worker (`background.js`):**
- Tracks blocked-query events
- Maintains cumulative statistics (water, energy)
- Manages weekly progress windows (reset Mondays at 00:00 local time)
- Updates extension badge with weekly block count

**UI (`popup.html` + `popup.js`):**
- Toggle extension on/off per session
- Display real-time savings metrics
- Weekly progress bar toward configurable goals
- Last-blocked event verification

### Environmental Impact Calculation

The extension uses these baseline assumptions:

| Metric | Standard Query | AI Query | Delta |
|--------|---|---|---|
| **Water** | 10 ml | 100 ml | 90 ml |
| **Energy** | 0.3 Wh | 3.0 Wh | 2.7 Wh |

**Formulas:**
```
Water Saved (ml) = Blocked Queries × 90
Energy Saved (Wh) = Blocked Queries × 2.7
```

These numbers are based on published research into data center resource consumption and AI model inference costs.

---

## Configuration

### Remote Selector Updates

To enable automatic selector updates from a remote source:

1. Edit `content.js` and update the `urls` array in `fetchRemoteSelectors()`:

```javascript
const urls = [
  'https://your-domain.com/selectors.json'
];
```

2. Host a `selectors.json` file with this structure:

```json
{
  "google": [
    "div.ai-overview-container",
    "div[data-ai-block]"
  ],
  "bing": [
    "#copilot-response"
  ]
}
```

3. Reload the extension in `chrome://extensions`

### Customize Weekly Goals

Goals are stored in `chrome.storage.local.weeklyGoal`. Modify in the popup or directly via DevTools:

```javascript
chrome.storage.local.set({ weeklyGoal: 50 });
```

---

## Troubleshooting

### AI Overviews Still Appearing?

1. **Verify the extension is enabled:**
   - Click the extension icon in your toolbar
   - Confirm "on/off" toggle is in the **on** position

2. **Check selector support:**
   - Open your browser's DevTools (F12)
   - Console should show no errors
   - Google frequently changes selectors; this is expected

3. **Update selectors:**
   - Open an issue on GitHub with:
     - The search URL you were on
     - Screenshot of the visible AI block
     - HTML snippet from DevTools showing the container

4. **Force reload:**
   - Go to `chrome://extensions`
   - Click the reload icon on the Unquery extension

### Stats Not Updating?

1. Clear storage: `chrome.storage.local.clear()` in DevTools console
2. Reload the extension
3. Search again and await a few seconds for stats to sync

### Extension Disabled Automatically?

Chrome disables extensions on startup in certain scenarios. Re-enable at `chrome://extensions`.

---

## Development

### Project Structure

```
unquery/
├── manifest.json          # Manifest V3 config, permissions
├── content.js             # Content script: DOM removal, selectors, monitoring
├── background.js          # Service worker: stats tracking, storage
├── popup.html             # UI template with animations
├── popup.js               # UI logic, storage bindings
├── icons/                 # Extension icons (16, 24, 32, 48, 128 px)
├── LICENSE                # MIT License
└── README.md              # This file
```

### Local Development Workflow

1. Make edits to `.js` or `.html` files
2. Go to `chrome://extensions`
3. Click the reload icon on Unquery
4. Test on a search results page
5. Check DevTools console for errors

### Adding Support for a New Search Engine

1. Add a new entry to the `ENGINES` object in `content.js`:

```javascript
'newsearch.com': {
  observe: '#results',          // Parent element to watch
  selectors: [
    'div.ai-response',
    '[data-ai]'
  ]
}
```

2. Add to `host_permissions` in `manifest.json`:

```json
"*://*.newsearch.com/*"
```

3. Update content script matches in `manifest.json`

4. Test thoroughly on live search results

### Code Style

- **Minimal comments:** Only explain non-obvious logic
- **Error handling:** Fail silently; never crash the extension
- **Selectors:** Always wrap in try/catch
- **Performance:** Use efficient DOM queries; avoid large loops

---

## Contributing

We welcome contributions! Here's how:

1. **Fork** this repository
2. **Create** a feature branch (`git checkout -b feature/your-feature`)
3. **Make** your changes, following the code style above
4. **Test** on live search pages
5. **Commit** with clear messages
6. **Push** to your fork
7. **Open** a pull request with a description

### Contribution Guidelines

- **Selector breakage:** Include a reproducible search URL and HTML snippet
- **New features:** Keep them minimal and on-theme (AI blocking only)
- **Bug fixes:** Clearly explain the issue and your fix
- **Testing:** Verify on multiple search engines before submitting

---

## Support & Donations

If Unquery is useful to you, consider supporting the project:

- **Buy Me a Coffee:** [![Buy Me a Coffee](https://img.shields.io/badge/Buy%20Me%20a%20Coffee-FFDD00?logo=buymeacoffee&logoColor=black)](https://www.buymeacoffee.com/)
- **GitHub Sponsors:** [![GitHub Sponsors](https://img.shields.io/badge/GitHub%20Sponsors-white?logo=github&logoColor=black)](https://github.com/sponsors)
- **Ko-Fi:** [![Ko-fi](https://img.shields.io/badge/Ko--fi-FF5E8A?logo=ko-fi&logoColor=white)](https://ko-fi.com/)

Even small donations help sustain development, selector updates, and testing across multiple search engines.

---

## Disclaimer

- Unquery is **not affiliated** with Google, Microsoft, DuckDuckGo, Brave, Ecosia, Startpage, Yahoo, or Yandex
- It operates on the principle that users have the right to modify their own browsing experience
- Always respect the terms of service of any website you visit

---

## License

This project is licensed under the **MIT License**—see [LICENSE](LICENSE) for details.

---

## Changelog

### v0.2.0
- Multi-engine support (8 search engines)
- Environmental impact tracking
- Weekly progress goals
- Remote selector updates (optional)
- Improved error handling

### v0.1.0
- Initial release (Google-only)

---

## Questions?

- **Issues:** [GitHub Issues](https://github.com/unquery/unquery/issues)
- **Discussions:** [GitHub Discussions](https://github.com/unquery/unquery/discussions)

---

**Made with ❤️ for a cleaner, lighter internet.**
