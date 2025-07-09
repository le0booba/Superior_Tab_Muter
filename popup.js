document.addEventListener('DOMContentLoaded', () => {
    const locales = {
        en: {
            masterToggle: '❌ / ✔️',
            muteAll: '🔇 ⦗ 🗗 ⦘',
            modeActive: 'Mute all except active tab',
            modeFirstSound: 'Mute all except first tab with sound',
            modeWhitelist: 'Mute all except a specific tab',
            selectTabToUnmute: 'Select a Tab to Unmute:',
            showAllTabs: 'Show all tabs',
            refreshSource: '⦗ 🗖 ⦘ 🡪 SOURCE',
            noTabs: 'No tabs found.',
            noSoundSource: 'No sound source designated.',
            sourceClosed: 'Source tab has been closed.',
            language: 'Language:',
            english: 'English',
            russian: 'Русский',
            by: 'by',
            github: 'Page on GitHub'
        },
        ru: {
            masterToggle: '❌ / ✔️',
            muteAll: '🔇 ⦗ 🗗 ⦘',
            modeActive: 'Заглушить все, кроме активной',
            modeFirstSound: 'Заглушить все, кроме 1ой со звуком',
            modeWhitelist: 'Заглушить все, кроме выбранной',
            selectTabToUnmute: 'Выберите вкладку для звука:',
            showAllTabs: 'Показать все вкладки',
            refreshSource: '⦗ 🗖 ⦘ 🡪 SOURCE',
            noTabs: 'Вкладки не найдены.',
            noSoundSource: 'Источник звука не назначен.',
            sourceClosed: 'Вкладка-источник закрыта.',
            language: 'Язык:',
            english: 'English',
            russian: 'Русский',
            by: 'by',
            github: 'Страница на GitHub'
        }
    };

    let lang = localStorage.getItem('stm_lang') || 'en';
    const t = key => locales[lang][key] || locales['en'][key] || key;

    const qs = sel => document.querySelector(sel);
    const modeForm = qs('#mode-form');
    const firstSoundControls = qs('#first-sound-controls');
    const refreshBtn = qs('#refresh-first-sound-btn');
    const versionInfo = qs('#version-info');
    const masterToggle = qs('#master-toggle-switch');
    const controlsWrapper = qs('#controls-wrapper');
    const currentSoundSourceDisplay = qs('#current-sound-source-display');
    const muteAllToggle = qs('#mute-all-toggle-switch');
    const showAllTabsFirstSound = document.getElementById('show-all-tabs-first-sound');
    let whitelistSection = null,
        audibleTabsList = null,
        whitelistShowAllCheckbox = null;

    function setupLangSwitcher() {
        const langEnBtn = document.getElementById('lang-en');
        const langRuBtn = document.getElementById('lang-ru');
        if (lang === 'en') {
            langEnBtn.classList.add('active');
            langRuBtn.classList.remove('active');
        } else {
            langRuBtn.classList.add('active');
            langEnBtn.classList.remove('active');
        }
        langEnBtn.onclick = () => {
            lang = 'en';
            localStorage.setItem('stm_lang', lang);
            localizeStatic();
            updateUIVisibility(qs('input[name="mode"]:checked').value);
            setupLangSwitcher();
        };
        langRuBtn.onclick = () => {
            lang = 'ru';
            localStorage.setItem('stm_lang', lang);
            localizeStatic();
            updateUIVisibility(qs('input[name="mode"]:checked').value);
            setupLangSwitcher();
        };
    }

    function localizeStatic() {
        document.querySelector('.master-toggle-container .toggle-label').textContent = t('masterToggle');
        document.querySelectorAll('.toggle-label')[1].textContent = t('muteAll');
        const modeLabels = modeForm.querySelectorAll('label');
        modeLabels[0].lastChild.textContent = t('modeActive');
        modeLabels[1].lastChild.textContent = t('modeFirstSound');
        modeLabels[2].lastChild.textContent = t('modeWhitelist');
        if (refreshBtn) {
            refreshBtn.textContent = t('refreshSource');
        }
        document.getElementById('github-link').textContent = t('github');
        document.getElementById('author-info').textContent = `${t('by')} badrenton`;
        const muteAllLabel = document.getElementById('mute-all-toggle-switch')?.closest('label.toggle-switch');
        if (muteAllLabel) muteAllLabel.style.marginTop = '2px';
    }

    versionInfo.textContent = `${chrome.runtime.getManifest().name} v${chrome.runtime.getManifest().version}`;
    localizeStatic();
    setupLangSwitcher();

    const getStorage = keys => new Promise(r => chrome.storage.sync.get(keys, r));
    const setStorage = obj => new Promise(r => chrome.storage.sync.set(obj, r));

    async function updateFirstSoundDisplay() {
        const { firstAudibleTabId } = await getStorage('firstAudibleTabId');
        currentSoundSourceDisplay.className = '';
        if (firstAudibleTabId) {
            try {
                const tab = await chrome.tabs.get(firstAudibleTabId);
                currentSoundSourceDisplay.innerHTML = `<img src="${tab.favIconUrl || ''}" style="width:16px;height:16px;vertical-align:middle;margin-right:4px;">` +
                    `SOURCE: ${tab.title} <span style='color:#95a5a6;font-size:11px;'>&nbsp;${tab.url ? tab.url.replace(/^https?:\/\//,'').slice(0,40) : ''}</span`;
                currentSoundSourceDisplay.classList.add('active');
            } catch {
                currentSoundSourceDisplay.textContent = t('sourceClosed');
                currentSoundSourceDisplay.classList.add('error');
            }
        } else {
            currentSoundSourceDisplay.textContent = t('noSoundSource');
        }
    }

    async function renderTabsList({ container, selectedId, showAll, onSelect }) {
        let tabs = showAll
            ? await chrome.tabs.query({})
            : await chrome.tabs.query({ audible: true });
        tabs = tabs.filter(tab => !(tab.url && tab.url.startsWith('chrome://')));
        container.innerHTML = tabs.length
            ? ''
            : `<li class="no-sound">${t('noTabs')}</li>`;
        tabs.forEach(tab => {
            const li = document.createElement('li');
            li.innerHTML = `<img src="${tab.favIconUrl || ''}" style="width:16px;height:16px;vertical-align:middle;margin-right:4px;">` +
                `<span>${tab.title}</span> <span style='color:#95a5a6;font-size:11px;'>&nbsp;${tab.url ? tab.url.replace(/^https?:\/\//,'').slice(0,40) : ''}</span>`;
            li.dataset.tabId = tab.id;
            if (tab.id === selectedId) li.classList.add('selected');
            li.onclick = async () => {
                try {
                    await onSelect(tab.id, li, container);
                } catch {
                    showError(t('errorMute'));
                }
            };
            container.appendChild(li);
        });
    }

    async function showWhitelistUI() {
        whitelistSection = document.createElement('div');
        whitelistSection.id = 'whitelist-section';
        const h4 = document.createElement('h4');
        h4.textContent = t('selectTabToUnmute');
        audibleTabsList = document.createElement('ul');
        audibleTabsList.id = 'audible-tabs-list';
        whitelistShowAllCheckbox = document.createElement('label');
        whitelistShowAllCheckbox.className = 'show-all-tabs-label';
        whitelistShowAllCheckbox.style.marginTop = '12px';
        whitelistShowAllCheckbox.innerHTML = `<input type="checkbox" id="show-all-tabs-whitelist">${t('showAllTabs')}`;
        whitelistSection.append(h4, audibleTabsList, whitelistShowAllCheckbox);
        controlsWrapper.appendChild(whitelistSection);
        const { whitelistedTabId } = await getStorage('whitelistedTabId');
        const showAll = localStorage.getItem('showAllTabsWhitelist') === 'true';
        whitelistShowAllCheckbox.querySelector('input').checked = showAll;
        const onSelect = async (tabId, li, container) => {
            await setStorage({ whitelistedTabId: tabId });
            container.querySelectorAll('li').forEach(li2 => li2.classList.remove('selected'));
            li.classList.add('selected');
        };
        renderTabsList({
            container: audibleTabsList,
            selectedId: whitelistedTabId,
            showAll,
            onSelect
        });
        whitelistShowAllCheckbox.querySelector('input').onchange = e => {
            localStorage.setItem('showAllTabsWhitelist', e.target.checked);
            renderTabsList({
                container: audibleTabsList,
                selectedId: whitelistedTabId,
                showAll: e.target.checked,
                onSelect
            });
        };
    }

    async function showFirstSoundUI() {
        const showAll = localStorage.getItem('showAllTabsFirstSound') === 'true';
        showAllTabsFirstSound.checked = showAll;
        const showAllLabel = showAllTabsFirstSound.closest('label');
        if (showAllLabel) showAllLabel.lastChild.textContent = t('showAllTabs');
        await updateFirstSoundDisplay();
        let list = document.getElementById('first-sound-tabs-list');
        if (!list) {
            list = document.createElement('ul');
            list.id = 'first-sound-tabs-list';
            currentSoundSourceDisplay.parentNode.insertBefore(list, currentSoundSourceDisplay.nextSibling);
        }
        const { firstAudibleTabId } = await getStorage('firstAudibleTabId');
        const onSelect = async (tabId) => {
            await setStorage({ firstAudibleTabId: tabId });
            showFirstSoundUI();
        };
        renderTabsList({
            container: list,
            selectedId: firstAudibleTabId,
            showAll,
            onSelect
        });
        showAllTabsFirstSound.onchange = e => {
            localStorage.setItem('showAllTabsFirstSound', e.target.checked);
            showFirstSoundUI();
        };
    }

    async function updateUIVisibility(mode) {
        if (whitelistSection && whitelistSection.parentNode) whitelistSection.remove();
        whitelistSection = audibleTabsList = null;
        firstSoundControls.classList.toggle('hidden', mode !== 'first-sound');
        if (mode === 'whitelist') {
            showWhitelistUI();
        } else if (mode === 'first-sound') {
            showFirstSoundUI();
        }
    }

    getStorage(['mode', 'whitelistedTabId', 'isExtensionEnabled', 'isAllMuted']).then(data => {
        const isEnabled = data.isExtensionEnabled !== false;
        let mode = data.mode || 'active';
        if (mode === 'blacklist') mode = 'active';
        masterToggle.checked = isEnabled;
        muteAllToggle.checked = data.isAllMuted || false;
        controlsWrapper.classList.toggle('disabled', !isEnabled);
        qs(`input[name="mode"][value="${mode}"]`).checked = true;
        updateUIVisibility(mode);
    });

    masterToggle.onchange = async e => {
        const newState = e.target.checked;
        await setStorage({ isExtensionEnabled: newState });
        controlsWrapper.classList.toggle('disabled', !newState);
    };

    modeForm.onchange = e => {
        setStorage({ mode: e.target.value });
        updateUIVisibility(e.target.value);
    };

    refreshBtn.onclick = async () => {
        const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (activeTab) {
            await setStorage({ firstAudibleTabId: activeTab.id });
            await updateFirstSoundDisplay();
            if (showAllTabsFirstSound.checked) showFirstSoundUI();
        }
    };

    muteAllToggle.onchange = e => setStorage({ isAllMuted: e.target.checked });
});