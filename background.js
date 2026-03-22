const DELTA_WATER_ML_PER_BLOCK = 90;
const DELTA_ENERGY_WH_PER_BLOCK = 2.7;
const DEFAULT_WEEKLY_GOAL = 46;

const DEFAULT_LOCAL_STATE = {
  enabled: true,
  blockedQueryCount: 0,
  blockEventCount: 0,
  lastBlockedAt: 0,
  lastBlockedSource: "",
  weeklyBlockedCount: 0,
  weeklyGoal: DEFAULT_WEEKLY_GOAL,
  weeklyWindowStartMs: 0,
  waterSavedMl: 0,
  energySavedWh: 0,
  updatedAt: Date.now()
};

chrome.runtime.onInstalled.addListener(async () => {
  const current = await chrome.storage.local.get(Object.keys(DEFAULT_LOCAL_STATE));
  const weekStart = getWeekStartMs(Date.now());
  const nextState = {
    ...DEFAULT_LOCAL_STATE,
    ...current,
    weeklyWindowStartMs: current.weeklyWindowStartMs || weekStart
  };
  await chrome.storage.local.set(nextState);
  await updateBadge(nextState.weeklyBlockedCount, nextState.enabled);
});

chrome.runtime.onStartup.addListener(async () => {
  try {
    await ensureWeeklyWindow();
    const state = await chrome.storage.local.get(["weeklyBlockedCount", "enabled"]);
    await updateBadge(state.weeklyBlockedCount || 0, state.enabled !== false);
  } catch (_error) {
    // Fail silently.
  }
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (!message) {
    return;
  }

  // Handle AI_BLOCKED messages from content script
  if (message.type === "AI_BLOCKED") {
    const blockedCount = Number(message.count) || 0;
    const source = String(message.source || "overview");
    if (blockedCount <= 0) {
      sendResponse({ ok: true, skipped: true });
      return;
    }

    updateSavings(blockedCount, source)
      .then(() => sendResponse({ ok: true }))
      .catch(() => sendResponse({ ok: false }));

    return true;
  }

  // Handle verification requests from popup
  if (message.type === "VERIFY_STATUS") {
    chrome.storage.local.get(Object.keys(DEFAULT_LOCAL_STATE))
      .then((state) => {
        sendResponse({
          ok: true,
          enabled: state.enabled !== false,
          blockedCount: state.blockedQueryCount || 0,
          weeklyBlockedCount: state.weeklyBlockedCount || 0,
          weeklyGoal: state.weeklyGoal || DEFAULT_WEEKLY_GOAL,
          waterSavedMl: state.waterSavedMl || 0,
          energySavedWh: state.energySavedWh || 0,
          lastBlockedAt: state.lastBlockedAt || 0
        });
      })
      .catch(() => sendResponse({ ok: false }));

    return true;
  }
});

chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== "local") {
    return;
  }

  if (!changes.weeklyBlockedCount && !changes.enabled) {
    return;
  }

  chrome.storage.local
    .get(["weeklyBlockedCount", "enabled"])
    .then((state) => updateBadge(state.weeklyBlockedCount || 0, state.enabled !== false))
    .catch(() => {
      // Ignore badge update errors.
    });
});

async function updateSavings(incrementBy, source) {
  const nextWindow = await ensureWeeklyWindow();
  const state = await chrome.storage.local.get(Object.keys(DEFAULT_LOCAL_STATE));
  const blockedQueryCount = (state.blockedQueryCount || 0) + incrementBy;
  const blockEventCount = (state.blockEventCount || 0) + 1;
  const weeklyBlockedCount = (state.weeklyBlockedCount || 0) + incrementBy;
  const weeklyGoal = Number(state.weeklyGoal) || DEFAULT_WEEKLY_GOAL;

  const waterSavedMl = blockedQueryCount * DELTA_WATER_ML_PER_BLOCK;
  const energySavedWh = blockedQueryCount * DELTA_ENERGY_WH_PER_BLOCK;

  await chrome.storage.local.set({
    blockedQueryCount,
    blockEventCount,
    lastBlockedAt: Date.now(),
    lastBlockedSource: source,
    weeklyBlockedCount,
    weeklyGoal,
    weeklyWindowStartMs: nextWindow,
    waterSavedMl,
    energySavedWh,
    updatedAt: Date.now()
  });
}

async function ensureWeeklyWindow() {
  const now = Date.now();
  const expectedWeekStart = getWeekStartMs(now);
  const { weeklyWindowStartMs = 0 } = await chrome.storage.local.get("weeklyWindowStartMs");

  if (weeklyWindowStartMs === expectedWeekStart) {
    return expectedWeekStart;
  }

  await chrome.storage.local.set({
    weeklyBlockedCount: 0,
    weeklyWindowStartMs: expectedWeekStart
  });

  return expectedWeekStart;
}

function getWeekStartMs(timestamp) {
  const date = new Date(timestamp);
  const day = date.getDay();
  const diffToMonday = (day + 6) % 7;
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() - diffToMonday);
  return date.getTime();
}

async function updateBadge(weeklyBlockedCount, enabled) {
  if (!enabled) {
    await chrome.action.setBadgeText({ text: "OFF" });
    await chrome.action.setBadgeBackgroundColor({ color: "#6f6f6f" });
    return;
  }

  const safeCount = Number(weeklyBlockedCount) || 0;
  const text = safeCount <= 0 ? "" : safeCount > 99 ? "99+" : String(safeCount);

  await chrome.action.setBadgeText({ text });
  await chrome.action.setBadgeBackgroundColor({ color: "#5b8f56" });
}
