# Unquery

Protect your search experience by blocking AI overviews and AI summary modules across major search engines.

![MIT License](https://img.shields.io/badge/License-MIT-2f5d3a)
![Manifest V3](https://img.shields.io/badge/Chrome-Manifest%20V3-3f7a56)
![Zero Dependencies](https://img.shields.io/badge/Dependencies-0-4d8f66)

## Why Unquery
- 🚫 Removes AI summary blocks from supported engines.
- 🔒 Runs locally with no analytics, no tracking, and no account required.
- 💧 Shows estimated water impact saved.
- ⚡ Shows estimated energy impact saved.
- 🎯 Includes weekly progress tracking in the popup.

## Preview

### Popup Snippet
![Unquery popup preview](<img width="351" height="576" alt="image" src="https://github.com/user-attachments/assets/f70958cf-3171-4963-8fd6-9e7d98e9271a" />
)

If the image does not render yet, add your screenshot at `docs/popup-preview.png` in this repository and it will appear automatically on GitHub.

## Supported Search Engines
- Google
- Bing
- DuckDuckGo
- Brave
- Ecosia
- Startpage
- Yahoo
- Yandex

## Impact Model
Per blocked AI summary event:
- 💧 Water saved: 90 ml
- ⚡ Energy saved: 2.7 Wh

These are estimated values shown in the popup dashboard.

## Installation

### Manual Install
1. Clone the repository:

```bash
git clone https://github.com/unquerys/unquery.git
cd unquery
```

2. Open `chrome://extensions`
3. Turn on `Developer mode`
4. Click `Load unpacked`
5. Select this project folder

## Quick Usage
1. Open any supported search engine results page.
2. Click the Unquery extension icon.
3. Keep protection enabled to auto-block AI summary modules.
4. Review your weekly impact in the popup.

## Project Structure
- `manifest.json` - Extension manifest and permissions
- `content.js` - AI block detection and removal logic
- `background.js` - Weekly counters and impact totals
- `popup.html` - Popup UI layout
- `popup.js` - Popup interactions and metrics rendering
- `icons/` - Extension icon set

## Privacy
- ✅ No cloud sync
- ✅ No telemetry
- ✅ No personal data collection

## Contributing
See `CONTRIBUTING.md` for setup and contribution flow.

## Support
☕ Buy Me a Coffee: https://www.buymeacoffee.com/rybrtle

## Repository
https://github.com/unquerys/unquery

## License
MIT. See `LICENSE`.
