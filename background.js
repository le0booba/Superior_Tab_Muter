chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.sync.set({
        mode: 'active',
        isExtensionEnabled: true,
        isAllMuted: false,
    });
    chrome.storage.session.set({
        firstAudibleTabId: null,
        whitelistedTabId: null,
    });
});

const getSettings = async () => {
    const [syncSettings, sessionSettings] = await Promise.all([
        chrome.storage.sync.get(['mode', 'isExtensionEnabled', 'isAllMuted']),
        chrome.storage.session.get(['firstAudibleTabId', 'whitelistedTabId'])
    ]);
    return { ...syncSettings, ...sessionSettings };
};

const setMute = (tabs, mute) => Promise.all(
    tabs.map(tab => {
        if (tab.mutedInfo && tab.mutedInfo.muted !== mute) {
            return chrome.tabs.update(tab.id, { muted: mute }).catch(() => {});
        }
        return null;
    })
);

async function applyMutingRules() {
    const s = await getSettings();
    const allTabs = await chrome.tabs.query({});
    
    const manageableTabs = allTabs.filter(tab => tab.id && !tab.url.startsWith('chrome://') && !tab.url.startsWith('chrome-extension://'));

    if (!s.isExtensionEnabled) {
        return setMute(manageableTabs, false);
    }
    if (s.isAllMuted) {
        return setMute(manageableTabs, true);
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
                const [firstAudible] = await chrome.tabs.query({ audible: true });
                if (firstAudible) {
                    tabToUnmuteId = firstAudible.id;
                    await chrome.storage.session.set({ firstAudibleTabId: tabToUnmuteId });
                }
            }
            break;
        case 'whitelist':
            if (s.whitelistedTabId && allTabs.some(t => t.id === s.whitelistedTabId)) {
                tabToUnmuteId = s.whitelistedTabId;
            }
            break;
    }

    await Promise.all([
        setMute(manageableTabs.filter(t => t.id !== tabToUnmuteId), true),
        setMute(manageableTabs.filter(t => t.id === tabToUnmuteId), false),
    ]);
}

chrome.tabs.onActivated.addListener(applyMutingRules);

chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
    if ('audible' in changeInfo) {
        applyMutingRules();
    }
});

chrome.tabs.onRemoved.addListener(async (tabId) => {
    const s = await getSettings();
    if (!s.isExtensionEnabled) return;

    if (s.mode === 'first-sound' && tabId === s.firstAudibleTabId) {
        await chrome.storage.session.remove('firstAudibleTabId');
    } else if (s.mode === 'whitelist' && tabId === s.whitelistedTabId) {
        await chrome.storage.session.remove('whitelistedTabId');
    }
});

chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== 'sync' && area !== 'session') return;

    const ruleTriggers = ['mode', 'isExtensionEnabled', 'isAllMuted', 'firstAudibleTabId', 'whitelistedTabId'];
    if (ruleTriggers.some(key => key in changes)) {
        applyMutingRules();
    }

    if ('isExtensionEnabled' in changes || 'isAllMuted' in changes) {
        updateExtensionIcon();
    }
});

async function updateExtensionIcon() {
    const { isExtensionEnabled, isAllMuted } = await getSettings();
    let iconSet = 'default';
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

chrome.commands?.onCommand.addListener(async (command) => {
    const { isExtensionEnabled, isAllMuted, mode } = await getSettings();
    if (command === 'toggle-extension') {
        await chrome.storage.sync.set({ isExtensionEnabled: !isExtensionEnabled });
    } else if (command === 'toggle-mute-all') {
        await chrome.storage.sync.set({ isAllMuted: !isAllMuted });
    } else if (command === 'set-current-tab-source') {
        if (mode === 'first-sound') {
            const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
            if (activeTab) {
                await chrome.storage.session.set({ firstAudibleTabId: activeTab.id });
            }
        }
    }
});

updateExtensionIcon();