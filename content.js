// ============================================================================
// UNQUERY - Simple AI Blocker with remote selector updates
// ============================================================================

let extensionEnabled = true;
let activeObserver = null;
let readyCheckTimer = null;
let fallbackScanTimer = null;

// Core removal function - tracks what we remove
function removeAI(selectors, engine) {
  if (!extensionEnabled) return 0;
  if (!selectors || !Array.isArray(selectors)) return 0;
  
  let blockedCount = 0;
  selectors.forEach(sel => {
    try {
      document.querySelectorAll(sel).forEach(el => {
        el.style.display = 'none';  // hide first (instant)
        el.remove();                // then remove from DOM
        blockedCount++;
      });
    } catch(e) {} // bad selector won't crash the script
  });
  
  // Report blocks to background script
  if (blockedCount > 0) {
    try {
      chrome.runtime.sendMessage({
        type: 'AI_BLOCKED',
        count: blockedCount,
        engine: engine,
        timestamp: Date.now()
      }, () => {
        if (chrome.runtime.lastError) {
          // Silent fail - messaging not ready
        }
      });
    } catch (e) {
      // Silent fail
    }
  }
  
  return blockedCount;
}

function shouldAcceptRemoteSelector(selector) {
  if (typeof selector !== "string") return false;
  const trimmed = selector.trim();
  if (!trimmed || trimmed.length > 120) return false;

  // Reject broad/destructive selectors.
  if (/^(\*|html|body|:root)$/i.test(trimmed)) return false;
  if (/^(#search|#rso|#rcnt|#b_results|#links|#results)$/i.test(trimmed)) return false;

  // Accept reasonably constrained selector syntax.
  return /^[a-z0-9_\-\.\[\]="':\s>#*]+$/i.test(trimmed);
}

function sanitizeRemoteSelectors(selectors) {
  if (!Array.isArray(selectors)) return [];
  return selectors.filter(shouldAcceptRemoteSelector).slice(0, 50);
}

// Fetch remote selectors from GitHub (for Google only - most frequently updated)
// To use remote selectors, configure the URL below or leave as null for hardcoded selectors only
async function fetchRemoteSelectors(engine) {
  if (engine !== 'google.com') return null;

  // Configure your remote selector URL here
  const urls = [
    // Example: 'https://raw.githubusercontent.com/your-org/unquery/main/selectors.json'
  ];

  if (urls.length === 0) return null;

  for (const url of urls) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    try {
      const response = await fetch(url, { cache: 'no-cache', signal: controller.signal });
      if (response.ok) {
        const data = await response.json();
        return sanitizeRemoteSelectors(data.google || []);
      }
    } catch (e) {
      // Silently fail - try next URL.
    } finally {
      clearTimeout(timeoutId);
    }
  }

  return null;
}

// Per-engine selector configs (hardcoded defaults)
const ENGINES = {
  'google.com': {
    observe: '#rcnt',
    selectors: [
      'div[data-initq]',
      'div[jsname="yEVEwb"]',
      'div.M8OgIe',
      'div[jscontroller="MF0kdc"]',
      '[data-attrid="wa:/description"]',
      'div[data-async-type="liveresults"]',
      'div.YVIcad',
      'div[data-sokoban-container]'
    ]
  },
  'bing.com': {
    observe: '#b_results',
    selectors: [
      '#b_sydConvCont',
      'div.b_ans.b_top[data-tag="Conversational"]',
      '#coreui_answers_conversational_answer',
      '.crs_cont[data-bap]'
    ]
  },
  'duckduckgo.com': {
    observe: null,
    selectors: [
      '[data-area="answer"]',
      'div.js-assist-container',
      '.assist-answer',
      '#duckbar_static .assist--answer'
    ]
  },
  'search.brave.com': {
    observe: null,
    selectors: [
      '#summarizer',
      'div[data-type="summarizer"]',
      '.snippet[data-pos="0"].summarizer'
    ]
  },
  'ecosia.org': {
    observe: '.mainline-results',
    selectors: [
      'div[class*="answer-module"]',
      '[data-result-type="answer"]',
      '.mainline-results__item--answer'
    ]
  },
  'startpage.com': {
    observe: '#results',
    selectors: [
      '[class*="ai-answer"]',
      '[class*="ai-response"]',
      '.result--ai'
    ]
  },
  'yahoo.com': {
    observe: '#web',
    selectors: [
      '[class*="ai"]',
      '[class*="answer"]',
      '[aria-label*="AI"]'
    ]
  }
};

// Main script
async function initializeBlocker() {
  if (!extensionEnabled) return;

  // Detect which engine we're on
  const host = location.hostname.replace('www.', '');
  const engine = Object.keys(ENGINES).find(k => host.includes(k));
  
  if (!engine) return; // Not a supported engine
  
  let config = ENGINES[engine];
  let selectors = [...config.selectors]; // Copy hardcoded selectors
  
  // Try to fetch remote selectors for Google
  if (engine === 'google.com') {
    const remoteSelectors = await fetchRemoteSelectors(engine);
    if (remoteSelectors && Array.isArray(remoteSelectors)) {
      selectors = [...new Set([...selectors, ...remoteSelectors])]; // Merge, dedupe
    }
  }
  
  // Run immediately on page load
  removeAI(selectors, engine);
  
  // Watch for dynamically injected elements
  if (config.observe) {
    // Try to find the observer target
    let target = document.querySelector(config.observe);

    // If target doesn't exist yet, wait for it
    if (!target) {
      readyCheckTimer = setInterval(() => {
        if (!extensionEnabled) {
          clearInterval(readyCheckTimer);
          readyCheckTimer = null;
          return;
        }

        target = document.querySelector(config.observe);
        if (target) {
          clearInterval(readyCheckTimer);
          readyCheckTimer = null;
          activeObserver = new MutationObserver(() => removeAI(selectors, engine));
          activeObserver.observe(target, { childList: true, subtree: true });
        }
      }, 500);
    } else {
      // Target exists, attach observer
      activeObserver = new MutationObserver(() => removeAI(selectors, engine));
      activeObserver.observe(target, { childList: true, subtree: true });
    }
  } else {
    // For engines without a stable observer anchor (DDG, Brave), watch body direct children only
    activeObserver = new MutationObserver(() => removeAI(selectors, engine));
    activeObserver.observe(document.body, { childList: true, subtree: false });
  }

  // Also run periodic scans as fallback (every 1 second for 10 seconds)
  let scanCount = 0;
  fallbackScanTimer = setInterval(() => {
    if (!extensionEnabled) {
      clearInterval(fallbackScanTimer);
      fallbackScanTimer = null;
      return;
    }

    removeAI(selectors, engine);
    scanCount++;
    if (scanCount >= 10) {
      clearInterval(fallbackScanTimer);
      fallbackScanTimer = null;
    }
  }, 1000);
}

function stopBlocker() {
  if (activeObserver) {
    activeObserver.disconnect();
    activeObserver = null;
  }

  if (readyCheckTimer) {
    clearInterval(readyCheckTimer);
    readyCheckTimer = null;
  }

  if (fallbackScanTimer) {
    clearInterval(fallbackScanTimer);
    fallbackScanTimer = null;
  }
}

// Message listener for verification and control
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (!message) return;

  if (message.type === 'SET_ENABLED') {
    extensionEnabled = Boolean(message.enabled);
    if (extensionEnabled) {
      initializeBlocker();
    } else {
      stopBlocker();
    }
    sendResponse({ ok: true });
    return;
  }
  
  if (message.type === 'VERIFY_PAGE_STATUS') {
    // Check page status for popup verification
    const host = location.hostname.replace('www.', '');
    const engine = Object.keys(ENGINES).find(k => host.includes(k));
    
    if (!engine) {
      sendResponse({ ok: false });
      return;
    }
    
    const config = ENGINES[engine];
    const selectorHits = config.selectors.reduce((sum, selector) => {
      try {
        return sum + document.querySelectorAll(selector).length;
      } catch (e) {
        return sum;
      }
    }, 0);
    
    sendResponse({
      ok: true,
      extensionEnabled,
      searchEngine: engine,
      selectorHits: selectorHits
    });
    return;
  }
});

chrome.storage.local.get({ enabled: true }, (state) => {
  extensionEnabled = Boolean(state.enabled);

  if (!extensionEnabled) {
    stopBlocker();
    return;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeBlocker, { once: true });
  } else {
    initializeBlocker();
  }
});

chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== 'local' || !changes.enabled) return;
  extensionEnabled = Boolean(changes.enabled.newValue);
  if (extensionEnabled) {
    initializeBlocker();
  } else {
    stopBlocker();
  }
});
