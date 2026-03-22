const WEEKLY_GOAL = 46;

const toggle = document.getElementById("enabled-toggle");
const toggleLabel = document.getElementById("toggle-label");
const waterSaved = document.getElementById("water-saved");
const energySaved = document.getElementById("energy-saved");
const blockedCount = document.getElementById("blocked-count");
const weeklyGoal = document.getElementById("weekly-goal");
const goalProgress = document.getElementById("goal-progress");
const verifyStatus = document.getElementById("verify-status");
const verifyNow = document.getElementById("verify-now");
const verifyLastEvent = document.getElementById("verify-last-event");
const verifyLastSource = document.getElementById("verify-last-source");

const previous = {
  weeklyBlockedCount: 0,
  waterSavedMl: 0,
  energySavedWh: 0
};

init();

function init() {
  weeklyGoal.textContent = String(WEEKLY_GOAL);

  chrome.storage.local.get(
    {
      enabled: true,
      blockedQueryCount: 0,
      blockEventCount: 0,
      lastBlockedAt: 0,
      lastBlockedSource: "",
      weeklyBlockedCount: 0,
      weeklyGoal: WEEKLY_GOAL,
      waterSavedMl: 0,
      energySavedWh: 0
    },
    (state) => {
      toggle.checked = Boolean(state.enabled);
      updateToggleLabel(Boolean(state.enabled));
      renderStats(state);
      renderVerification(state);
      verifyCurrentTab();
    }
  );

  toggle.addEventListener("change", () => {
    const enabled = toggle.checked;
    updateToggleLabel(enabled);
    chrome.storage.local.set({ enabled });
  });

  verifyNow.addEventListener("click", () => {
    verifyCurrentTab(true);
  });

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== "local") {
      return;
    }

    if (changes.enabled) {
      const enabled = Boolean(changes.enabled.newValue);
      toggle.checked = enabled;
      updateToggleLabel(enabled);
    }

    const statsChanged =
      Boolean(changes.blockedQueryCount) ||
      Boolean(changes.weeklyBlockedCount) ||
      Boolean(changes.weeklyGoal) ||
      Boolean(changes.waterSavedMl) ||
      Boolean(changes.energySavedWh) ||
      Boolean(changes.lastBlockedAt) ||
      Boolean(changes.lastBlockedSource) ||
      Boolean(changes.blockEventCount);

    if (statsChanged) {
      chrome.storage.local.get(
        {
          blockedQueryCount: 0,
          blockEventCount: 0,
          lastBlockedAt: 0,
          lastBlockedSource: "",
          weeklyBlockedCount: 0,
          weeklyGoal: WEEKLY_GOAL,
          waterSavedMl: 0,
          energySavedWh: 0
        },
        (state) => {
          renderStats(state);
          renderVerification(state);
          verifyCurrentTab();
        }
      );
    }
  });
}

function updateToggleLabel(enabled) {
  toggleLabel.textContent = enabled ? "on" : "off";
}

function renderStats(state) {
  const blocked = Number(state.weeklyBlockedCount) || 0;
  const goal = Number(state.weeklyGoal) || WEEKLY_GOAL;
  const water = Math.round(Number(state.waterSavedMl) || 0);
  const energy = Number(state.energySavedWh) || 0;

  animateNumber(blockedCount, previous.weeklyBlockedCount, blocked, (value) => String(Math.round(value)), 450);
  animateNumber(waterSaved, previous.waterSavedMl, water, (value) => Math.round(value).toLocaleString(), 700);
  animateNumber(energySaved, previous.energySavedWh, energy, (value) => value.toFixed(1), 700);

  weeklyGoal.textContent = String(goal);

  const progress = Math.min((blocked / goal) * 100, 100);
  goalProgress.style.width = `${progress}%`;

  bumpIfChanged(waterSaved, previous.waterSavedMl, water);
  bumpIfChanged(energySaved, previous.energySavedWh, energy);

  previous.weeklyBlockedCount = blocked;
  previous.waterSavedMl = water;
  previous.energySavedWh = energy;
}

function animateNumber(element, from, to, formatter, duration) {
  const start = performance.now();
  const change = to - from;

  if (change === 0) {
    element.textContent = formatter(to);
    return;
  }

  function tick(now) {
    const elapsed = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - elapsed, 3);
    const value = from + change * eased;
    element.textContent = formatter(value);

    if (elapsed < 1) {
      requestAnimationFrame(tick);
    }
  }

  requestAnimationFrame(tick);
}

function bumpIfChanged(element, oldValue, newValue) {
  if (oldValue === newValue) {
    return;
  }

  element.classList.remove("bump");
  // Trigger reflow so repeating updates can retrigger the animation class.
  void element.offsetWidth;
  element.classList.add("bump");
  setTimeout(() => {
    element.classList.remove("bump");
  }, 260);
}

function renderVerification(state) {
  const blockEvents = Number(state.blockEventCount) || 0;
  const source = String(state.lastBlockedSource || "");
  const blockedAt = Number(state.lastBlockedAt) || 0;

  verifyLastEvent.textContent =
    blockEvents <= 0 || blockedAt <= 0
      ? "Last blocked: never"
      : "Last blocked: " + formatRelativeTime(blockedAt) + " (" + new Date(blockedAt).toLocaleTimeString() + ")";

  verifyLastSource.textContent =
    blockEvents <= 0
      ? "Type: n/a"
      : "Type: " + (source === "suggestion" ? "AI suggestion filtered" : "AI overview removed");
}

function verifyCurrentTab(manual) {
  verifyStatus.classList.remove("ok", "warn");
  verifyStatus.textContent = manual ? "Checking current page..." : "Checking active tab...";

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs && tabs[0];
    if (!tab || !tab.id || !tab.url) {
      verifyStatus.classList.add("warn");
      verifyStatus.textContent = "Unable to inspect this tab";
      return;
    }

    const isSupportedSearch = /https?:\/\/([^/]*\.)?(google\.[^/]+\/search|bing\.com\/search|duckduckgo\.com\/?\?|ecosia\.org\/search|search\.brave\.com\/search|startpage\.com\/cgi-bin\/aspsearch|yahoo\.com\/search|yandex\.com\/search)/i.test(tab.url);
    if (!isSupportedSearch) {
      verifyStatus.classList.add("warn");
      verifyStatus.textContent = "Open a supported search tab to verify";
      return;
    }

    chrome.tabs.sendMessage(tab.id, { type: "VERIFY_PAGE_STATUS" }, (response) => {
      if (chrome.runtime.lastError || !response || !response.ok) {
        verifyStatus.classList.add("warn");
        verifyStatus.textContent = "Protection probe unavailable (reload tab)";
        return;
      }

      if (!response.extensionEnabled) {
        verifyStatus.classList.add("warn");
        verifyStatus.textContent = "Extension is currently disabled";
        return;
      }

      if (Number(response.selectorHits) === 0) {
        verifyStatus.classList.add("ok");
        verifyStatus.textContent = "Protection active on this page";
        return;
      }

      verifyStatus.classList.add("warn");
      verifyStatus.textContent = "Potential AI block detected - monitoring";
    });
  });
}

function formatRelativeTime(timestamp) {
  const diffMs = Math.max(0, Date.now() - timestamp);
  const seconds = Math.floor(diffMs / 1000);
  if (seconds < 60) {
    return seconds + "s ago";
  }

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return minutes + "m ago";
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return hours + "h ago";
  }

  const days = Math.floor(hours / 24);
  return days + "d ago";
}
