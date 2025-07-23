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
        if (tab.mutedInfo?.muted !== mute) {
            return chrome.tabs.update(tab.id, { muted: mute }).catch(() => {});
        }
    })
);

async function applyMutingRules(activeTabId = null) {
    const [settings, allTabs] = await Promise.all([
        getSettings(),
        chrome.tabs.query({})
    ]);

    const manageableTabs = allTabs.filter(tab => tab.id && !tab.url.startsWith('chrome://') && !tab.url.startsWith('chrome-extension://'));

    if (!settings.isExtensionEnabled) {
        return setMute(manageableTabs, false);
    }
    if (settings.isAllMuted) {
        return setMute(manageableTabs, true);
    }

    let tabToUnmuteId = null;
    const allTabsById = new Map(allTabs.map(tab => [tab.id, tab]));

    switch (settings.mode) {
        case 'active':
            if (activeTabId) {
                tabToUnmuteId = activeTabId;
            } else {
                const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
                if (activeTab) tabToUnmuteId = activeTab.id;
            }
            break;
        case 'first-sound':
            if (settings.firstAudibleTabId && allTabsById.has(settings.firstAudibleTabId)) {
                tabToUnmuteId = settings.firstAudibleTabId;
            }
            break;
        case 'whitelist':
            if (settings.whitelistedTabId && allTabsById.has(settings.whitelistedTabId)) {
                tabToUnmuteId = settings.whitelistedTabId;
            }
            break;
    }

    const tabsToMute = manageableTabs.filter(tab => tab.id !== tabToUnmuteId);
    const tabsToUnmute = manageableTabs.filter(tab => tab.id === tabToUnmuteId);

    await Promise.all([
        setMute(tabsToMute, true),
        setMute(tabsToUnmute, false),
    ]);
}

chrome.tabs.onActivated.addListener(async ({ tabId }) => {
    const settings = await getSettings();
    if (settings.isExtensionEnabled && settings.mode === 'first-sound' && !settings.firstAudibleTabId) {
        try {
            const activatedTab = await chrome.tabs.get(tabId);
            if (activatedTab?.audible) {
                await chrome.storage.session.set({ firstAudibleTabId: activatedTab.id });
                return;
            }
        } catch (e) {}
    }
    applyMutingRules(tabId);
});

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo) => {
    if (!('audible' in changeInfo)) return;

    if (changeInfo.audible === true) {
        const settings = await getSettings();
        if (settings.isExtensionEnabled && settings.mode === 'first-sound' && !settings.firstAudibleTabId) {
            const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
            if (activeTab?.id === tabId) {
                await chrome.storage.session.set({ firstAudibleTabId: tabId });
                return;
            }
        }
    }
    applyMutingRules();
});

chrome.tabs.onRemoved.addListener(async (tabId) => {
    const settings = await getSettings();
    if (!settings.isExtensionEnabled) return;

    if (settings.mode === 'first-sound' && tabId === settings.firstAudibleTabId) {
        const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (activeTab?.audible) {
            await chrome.storage.session.set({ firstAudibleTabId: activeTab.id });
        } else {
            await chrome.storage.session.remove('firstAudibleTabId');
        }
    } else if (settings.mode === 'whitelist' && tabId === settings.whitelistedTabId) {
        await chrome.storage.session.remove('whitelistedTabId');
    }
});

chrome.storage.onChanged.addListener(async (changes, area) => {
    if (area !== 'sync' && area !== 'session') return;

    if (changes.mode?.newValue === 'first-sound') {
        const { firstAudibleTabId } = await chrome.storage.session.get('firstAudibleTabId');
        if (!firstAudibleTabId) {
            const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
            if (activeTab?.audible) {
                await chrome.storage.session.set({ firstAudibleTabId: activeTab.id });
            }
        }
    }

    const needsRuleUpdate = ['mode', 'isExtensionEnabled', 'isAllMuted', 'firstAudibleTabId', 'whitelistedTabId'].some(key => key in changes);
    if (needsRuleUpdate) {
        applyMutingRules();
    }
    if ('isExtensionEnabled' in changes || 'isAllMuted' in changes) {
        updateExtensionIcon();
    }
});

async function updateExtensionIcon() {
    const { isExtensionEnabled, isAllMuted } = await getSettings();
    let iconSetKey = 'default';
    if (!isExtensionEnabled) {
        iconSetKey = 'off';
    } else if (isAllMuted) {
        iconSetKey = 'mute';
    }
    const paths = {
        'default': { 16: 'icons/icon16.png', 48: 'icons/icon48.png', 128: 'icons/icon128.png' },
        'off': { 16: 'icons/icon16_off.png', 48: 'icons/icon48_off.png', 128: 'icons/icon128_off.png' },
        'mute': { 16: 'icons/icon16_mute.png', 48: 'icons/icon48_mute.png', 128: 'icons/icon128_mute.png' },
    };
    chrome.action.setIcon({ path: paths[iconSetKey] });
}

chrome.commands.onCommand.addListener(async (command) => {
    const { isExtensionEnabled, isAllMuted, mode } = await getSettings();
    switch (command) {
        case 'toggle-extension':
            await chrome.storage.sync.set({ isExtensionEnabled: !isExtensionEnabled });
            break;
        case 'toggle-mute-all':
            await chrome.storage.sync.set({ isAllMuted: !isAllMuted });
            break;
        case 'set-current-tab-source':
            if (mode === 'first-sound') {
                const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
                if (activeTab) {
                    await chrome.storage.session.set({ firstAudibleTabId: activeTab.id });
                }
            }
            break;
    }
});

updateExtensionIcon();