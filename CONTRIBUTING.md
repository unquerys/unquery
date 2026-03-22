# Contributing to Unquery

Thanks for helping improve Unquery! We welcome contributions from the community.

## Getting Started

1. **Fork** the repository on GitHub
2. **Clone** your fork locally:
   ```bash
   git clone https://github.com/your-username/unquery.git
   cd unquery
   ```
3. **Install** test tools (optional):
   ```bash
   npm install  # if package.json exists
   ```

## Development Workflow

1. **Create a feature branch:**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes:**
   - Edit the relevant files
   - Test thoroughly on live search pages
   - Check browser console for errors

3. **Test your changes:**
   - Load the extension unpacked in `chrome://extensions`
   - Click reload to test your changes
   - Test on multiple search engines if applicable
   - Verify popup still loads and functions

4. **Commit with clear messages:**
   ```bash
   git commit -m "Brief description of your change"
   ```

5. **Push to your fork and open a PR**

## Contribution Types

### 🐛 Bug Fixes
- Include a clear description of the bug
- Provide steps to reproduce
- Link to any related issues

### 📍 Selector Updates
- Include the URL where you tested
- Provide a screenshot of the AI block
- Paste the relevant HTML snippet from DevTools
- Include browser version

### ✨ New Features
- Keep features minimal and on-theme (AI blocking focus)
- Ensure no external dependencies
- Test on all supported engines
- Update README if behavior changes

### 🌍 New Search Engine Support
1. Add to `ENGINES` object in content.js with appropriate selectors
2. Add to `host_permissions` in manifest.json
3. Update content script `matches` patterns in manifest.json
4. Test on live search results
5. Update README

## Code Style Guidelines

- **Error Handling:** Fail silently; never crash the extension
  ```javascript
  try {
    // operation
  } catch (e) {} // silent fail
  ```

- **Selectors:** Always wrap DOM queries in try/catch
  ```javascript
  try {
    document.querySelectorAll(selector).forEach(el => el.remove());
  } catch (e) {}
  ```

- **Comments:** Only explain non-obvious logic
  ```javascript
  // Remove AND hide (order matters for performance)
  el.style.display = 'none';
  el.remove();
  ```

- **Performance:** Avoid unnecessary DOM traversals
  ```javascript
  // Good: single query
  const items = document.querySelectorAll(selector);
  
  // Bad: multiple queries
  for (let i = 0; i < 10; i++) {
    document.querySelectorAll(selector).forEach(...);
  }
  ```

## Testing Checklist

Before submitting your PR:

- [ ] Changes work on live search pages
- [ ] No console errors introduced
- [ ] Popup loads and displays correctly
- [ ] Toggle on/off works as expected
- [ ] Stats update after blocking
- [ ] Tested on at least 2 search engines
- [ ] Code follows style guidelines
- [ ] README updated if needed

## Reporting Issues

### Selector Breakage
Please include:
- Direct link to the search page
- Screenshot showing the visible AI block
- HTML snippet of the container:
  ```html
  <div data-example="..." class="ai-block">
    <!-- HTML structure here -->
  </div>
  ```
- Browser version (Chrome, Edge, etc.)

### Performance Issues
- Describe the issue clearly
- Provide reproduction steps
- Include browser/OS info
- Share any console errors

## Pull Request Process

1. **Title:** Use a clear, descriptive title
2. **Description:** Explain what and why
3. **Testing:** Describe how you tested
4. **Checklist:** Mark completed items

Example PR description:
```
## Changes
- Updated Google selector for new AI Overview layout
- Added browser detection fallback

## Testing
- Tested on Google.com/search with 50+ queries
- Verified on Chrome 120 and Edge 120
- No console errors

## Related Issues
Fixes #42
```

## Code Review

All PRs go through review. Feedback might include:
- Selector efficiency questions
- Performance concerns
- Error handling improvements
- Documentation clarity

This is all constructive - question the code, not the person!

## Questions?

- **Issues:** [GitHub Issues](https://github.com/unquery/unquery/issues)
- **Discussions:** [GitHub Discussions](https://github.com/unquery/unquery/discussions)

---

**Thank you for contributing! Together we make the internet lighter. 🌱**

