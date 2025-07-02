chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.sync.set({
        mode: 'active',
        isExtensionEnabled: true,
        isAllMuted: false,
        isBlacklistMode: false
    });
});

const getSettings = () => chrome.storage.sync.get({
    mode: 'active',
    firstAudibleTabId: null,
    whitelistedTabId: null,
    blacklistedTabId: null,
    isExtensionEnabled: true,
    isAllMuted: false,
    isBlacklistMode: false
});

const setMute = (tabs, mute) => Promise.all(
    tabs.map(tab =>
        tab.mutedInfo && tab.mutedInfo.muted !== mute
            ? chrome.tabs.update(tab.id, { muted: mute }).catch(() => {})
            : null
    )
);

const getTabs = q => chrome.tabs.query(q);

async function unmuteAllTabs() { 
    await setMute(await getTabs({}), false); 
}

async function muteAllTabs() { 
    await setMute(await getTabs({}), true); 
}

async function applyMutingRules() {
    const s = await getSettings();
    
    if (!s.isExtensionEnabled) return unmuteAllTabs();
    if (s.isAllMuted) return muteAllTabs();

    const allTabs = await getTabs({});
    const [activeTab] = await getTabs({ active: true, currentWindow: true });
    let tabToUnmuteId = null, tabToMuteId = null;

    switch (s.mode) {
        case 'active':
            tabToUnmuteId = activeTab && activeTab.id;
            break;
            
        case 'first-sound':
            if (s.firstAudibleTabId && allTabs.some(t => t.id === s.firstAudibleTabId)) {
                tabToUnmuteId = s.firstAudibleTabId;
            } else if (activeTab && activeTab.audible) {
                await chrome.storage.sync.set({ firstAudibleTabId: activeTab.id });
                tabToUnmuteId = activeTab.id;
            }
            break;
            
        case 'whitelist':
            tabToUnmuteId = s.whitelistedTabId;
            break;
            
        case 'blacklist':
            tabToMuteId = s.blacklistedTabId;
            break;
    }

    for (const tab of allTabs) {
        if (!tab.id || tab.url.startsWith('chrome://')) continue;
        
        let shouldMute = s.mode === 'blacklist'
            ? (tab.id === tabToMuteId)
            : (tab.id !== tabToUnmuteId);
            
        if (tab.mutedInfo && tab.mutedInfo.muted !== shouldMute) {
            try { 
                await chrome.tabs.update(tab.id, { muted: shouldMute }); 
            } catch {}
        }
    }
}

chrome.tabs.onActivated.addListener(applyMutingRules);

chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
    if ('audible' in changeInfo || 'active' in changeInfo) {
        applyMutingRules();
    }
});

chrome.tabs.onRemoved.addListener(async (tabId) => {
    const s = await chrome.storage.sync.get([
        'mode', 
        'firstAudibleTabId', 
        'whitelistedTabId', 
        'blacklistedTabId', 
        'isExtensionEnabled'
    ]);
    
    if (!s.isExtensionEnabled) return;
    
    if (s.mode === 'first-sound' && tabId === s.firstAudibleTabId) {
        await chrome.storage.sync.remove('firstAudibleTabId');
    } else if (s.mode === 'whitelist' && tabId === s.whitelistedTabId) {
        await chrome.storage.sync.remove('whitelistedTabId');
    } else if (s.mode === 'blacklist' && tabId === s.blacklistedTabId) {
        await chrome.storage.sync.remove('blacklistedTabId');
    }
    
    applyMutingRules();
});

chrome.storage.onChanged.addListener(applyMutingRules);

function updateExtensionIcon(isEnabled, isAllMuted) {
    let path;
    
    if (!isEnabled) {
        path = {
            16: 'icons/icon16_off.png',
            48: 'icons/icon48_off.png',
            128: 'icons/icon128_off.png'
        };
    } else if (isAllMuted) {
        path = {
            16: 'icons/icon16_mute.png',
            48: 'icons/icon48_mute.png',
            128: 'icons/icon128_mute.png'
        };
    } else {
        path = {
            16: 'icons/icon16.png',
            48: 'icons/icon48.png',
            128: 'icons/icon128.png'
        };
    }
    
    chrome.action.setIcon({ path });
}

chrome.storage.sync.get(['isExtensionEnabled', 'isAllMuted'], ({ isExtensionEnabled, isAllMuted }) => {
    updateExtensionIcon(isExtensionEnabled !== false, isAllMuted === true);
});

chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'sync' && (changes.isExtensionEnabled || changes.isAllMuted)) {
        chrome.storage.sync.get(['isExtensionEnabled', 'isAllMuted'], ({ isExtensionEnabled, isAllMuted }) => {
            updateExtensionIcon(isExtensionEnabled !== false, isAllMuted === true);
        });
    }
});

chrome.commands && chrome.commands.onCommand.addListener(async (command) => {
    if (command === 'toggle-extension') {
        const { isExtensionEnabled } = await chrome.storage.sync.get('isExtensionEnabled');
        await chrome.storage.sync.set({ isExtensionEnabled: !isExtensionEnabled });
    } else if (command === 'toggle-mute-all') {
        const { isAllMuted } = await chrome.storage.sync.get('isAllMuted');
        await chrome.storage.sync.set({ isAllMuted: !isAllMuted });
    }
});