# Unquery

Block AI Overviews and AI summaries across major search engines, while tracking estimated water and energy impact.

## Highlights
- Blocks AI summaries on Google, Bing, DuckDuckGo, Brave, Ecosia, Startpage, Yahoo, and Yandex.
- Runs locally in the browser with no analytics and no external dependencies.
- Shows weekly block count and estimated impact in the popup.

## Impact Model
Per blocked AI summary event, Unquery estimates:
- Water saved: 90 ml
- Energy saved: 2.7 Wh

## Install (Manual)
1. Clone the repository:

```bash
git clone https://github.com/unquerys/unquery.git
cd unquery
```

2. Open `chrome://extensions`
3. Turn on `Developer mode`
4. Click `Load unpacked`
5. Select this project folder

## Usage
1. Open a supported search engine result page.
2. Click the extension icon to verify status.
3. Use the popup toggle to enable or disable protection.

## Project Files
- `manifest.json` - Extension manifest and permissions
- `content.js` - AI block detection and removal
- `background.js` - Counters, weekly window, and badge updates
- `popup.html` + `popup.js` - Popup UI and interactions

## Support
Buy Me a Coffee: https://www.buymeacoffee.com/rybrtle

## Repository
https://github.com/unquerys/unquery

## License
MIT - see `LICENSE`
