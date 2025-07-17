// background.js

// --- Initial Setup ---
chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.sync.set({
        mode: 'active',
        isExtensionEnabled: true,
        isAllMuted: false,
    });
});

// --- Core Muting Logic ---

/**
 * Retrieves settings from storage with default values.
 */
const getSettings = () => chrome.storage.sync.get({
    mode: 'active',
    firstAudibleTabId: null,
    whitelistedTabId: null,
    isExtensionEnabled: true,
    isAllMuted: false,
});

/**
 * Mutes or unmutes an array of tabs.
 * @param {chrome.tabs.Tab[]} tabs - The tabs to update.
 * @param {boolean} mute - True to mute, false to unmute.
 */
const setMute = (tabs, mute) => Promise.all(
    tabs.map(tab => {
        // Only update if the mute state is different
        if (tab.mutedInfo && tab.mutedInfo.muted !== mute) {
            return chrome.tabs.update(tab.id, { muted: mute }).catch(() => { /* Ignore errors for closed tabs */ });
        }
        return null;
    })
);

/**
 * Applies the current muting rules across all tabs based on user settings.
 */
async function applyMutingRules() {
    const s = await getSettings();
    const allTabs = await chrome.tabs.query({});
    
    // Filter out special tabs that cannot be muted
    const manageableTabs = allTabs.filter(tab => tab.id && !tab.url.startsWith('chrome://'));

    // Handle global overrides first
    if (!s.isExtensionEnabled) {
        return setMute(manageableTabs, false); // Unmute all
    }
    if (s.isAllMuted) {
        return setMute(manageableTabs, true); // Mute all
    }

    let tabToUnmuteId = null;

    switch (s.mode) {
        case 'active':
            const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
            if (activeTab) {
                tabToUnmuteId = activeTab.id;
            }
            break;
        case 'first-sound':
            const firstAudibleTabExists = s.firstAudibleTabId && allTabs.some(t => t.id === s.firstAudibleTabId);
            if (firstAudibleTabExists) {
                tabToUnmuteId = s.firstAudibleTabId;
            } else {
                // If the stored tab is gone, find the first audible tab and designate it as the new source.
                const firstAudible = await chrome.tabs.query({ audible: true });
                if (firstAudible.length > 0) {
                    tabToUnmuteId = firstAudible[0].id;
                    await chrome.storage.sync.set({ firstAudibleTabId: tabToUnmuteId });
                }
            }
            break;
        case 'whitelist':
            // Only unmute if the whitelisted tab actually exists.
            if (s.whitelistedTabId && allTabs.some(t => t.id === s.whitelistedTabId)) {
                tabToUnmuteId = s.whitelistedTabId;
            }
            break;
    }

    const tabsToMute = manageableTabs.filter(t => t.id !== tabToUnmuteId);
    const tabsToUnmute = manageableTabs.filter(t => t.id === tabToUnmuteId);

    await Promise.all([
        setMute(tabsToMute, true),
        setMute(tabsToUnmute, false),
    ]);
}

// --- Event Listeners ---

chrome.tabs.onActivated.addListener(applyMutingRules);
chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
    // Re-evaluate rules if a tab starts or stops playing audio.
    if ('audible' in changeInfo) {
        applyMutingRules();
    }
});

chrome.tabs.onRemoved.addListener(async (tabId) => {
    const s = await getSettings();
    if (!s.isExtensionEnabled) return;

    // Clear stored tab IDs if they are closed.
    if ((s.mode === 'first-sound' && tabId === s.firstAudibleTabId) ||
        (s.mode === 'whitelist' && tabId === s.whitelistedTabId)) {
        await chrome.storage.sync.remove(s.mode === 'first-sound' ? 'firstAudibleTabId' : 'whitelistedTabId');
    }
    // No need to call applyMutingRules here, as other listeners will handle the state change.
});

// Consolidated listener for storage changes.
chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== 'sync') return;

    // Apply muting rules if any relevant setting has changed.
    const ruleTriggers = ['mode', 'isExtensionEnabled', 'isAllMuted', 'firstAudibleTabId', 'whitelistedTabId'];
    if (ruleTriggers.some(key => key in changes)) {
        applyMutingRules();
    }

    // Update the extension icon if its state changes.
    if ('isExtensionEnabled' in changes || 'isAllMuted' in changes) {
        updateExtensionIcon();
    }
});

// --- Icon and Command Handling ---

async function updateExtensionIcon() {
    const { isExtensionEnabled, isAllMuted } = await getSettings();
    let iconSet = 'default'; // 'default', 'off', 'mute'
    if (!isExtensionEnabled) {
        iconSet = 'off';
    } else if (isAllMuted) {
        iconSet = 'mute';
    }
    
    const paths = {
        'default': { 16: 'icons/icon16.png', 48: 'icons/icon48.png', 128: 'icons/icon128.png' },
        'off': { 16: 'icons/icon16_off.png', 48: 'icons/icon48_off.png', 128: 'icons/icon128_off.png' },
        'mute': { 16: 'icons/icon16_mute.png', 48: 'icons/icon48_mute.png', 128: 'icons/icon128_mute.png' },
    };
    chrome.action.setIcon({ path: paths[iconSet] });
}

// Set initial icon on startup
updateExtensionIcon();

// Listener for keyboard shortcuts.
chrome.commands?.onCommand.addListener(async (command) => {
    const { isExtensionEnabled, isAllMuted } = await getSettings();
    if (command === 'toggle-extension') {
        await chrome.storage.sync.set({ isExtensionEnabled: !isExtensionEnabled });
    } else if (command === 'toggle-mute-all') {
        await chrome.storage.sync.set({ isAllMuted: !isAllMuted });
    }
});