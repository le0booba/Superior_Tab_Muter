# Superior Tab Mute

**Advanced Chrome Extension for Intelligent Audio Control**

<div align="center">
   <img src="https://raw.githubusercontent.com/le0booba/Superior_Tab_Mute/refs/heads/main/screen-1.png" alt="Area Links Screenshot 1" width="200"/>
</div>

Superior Tab Mute provides sophisticated audio management for Chrome tabs, automatically muting tabs based on user-defined rules to reduce distractions and enhance focus. With multiple muting modes, intuitive controls, and a sleek interface, it’s ideal for work, streaming, or complex browsing workflows.

<div align="center">

![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-blue?logo=googlechrome)
</div>

---

## 🚀 Installation

1. **Download the Extension**
   - Visit the [LATEST RELEASE](https://github.com/le0booba/Superior_Tab_Mute/releases/latest) on GitHub and download the extension folder.

2. **Load in Chrome**
   - Open Chrome and navigate to `chrome://extensions/`.
   - Enable **Developer mode** (top-right toggle).
   - Click **Load unpacked** and select the downloaded extension folder.

3. **Start Using**
   - Click the extension icon in Chrome’s toolbar to access the popup and configure settings.

---

## 🌟 Features

### 🎯 Smart Muting Modes
- **Active Tab Mode**: Only the currently active tab plays audio, perfect for focused browsing or work.
- **First Sound Mode**: Prioritizes the first tab that plays audio, ideal for music or podcasts.
- **Whitelist Mode**: Manually select a single tab to play audio, offering precise control for complex workflows.

### ⚡ Instant Controls
- **Master Toggle**: Enable or disable the extension with a single click or shortcut (`Alt+Shift+S`).
- **Global Mute**: Silence all tabs instantly (`Alt+Shift+M`).
- **Set Sound Source**: Designate the current tab as the audio source in First Sound Mode (`Alt+Shift+E`).
- **Show All Tabs**: View and select from all tabs, not just audible ones, in First Sound and Whitelist modes.

<details>
<summary>🔧 Customize Behavior</summary>

- Toggle the extension on/off or mute all tabs using the switches or shortcuts.
- In First Sound Mode, click “Refresh Source” to set the current tab as the audio source.
- Configure keyboard shortcuts at `chrome://extensions/shortcuts`:
  - `Alt+Shift+S`: Toggle extension on/off.
  - `Alt+Shift+M`: Mute/unmute all tabs.
  - `Alt+Shift+E`: Set current tab as sound source (First Sound Mode).

</details>

<details>
<summary>🎨 User-Friendly Interface</summary>

- **Dynamic Status Icons**: The extension icon reflects the current state (active, muted, or disabled).
- **Real-Time Tab List**: Displays tabs with audio or all tabs, with favicon and title previews.
- **Bilingual Support**: Switch between English and Russian via the popup’s language buttons.
- **Dark Theme**: A modern, eye-friendly design for prolonged use.

</details>

<details>
<summary>🔍 Advanced Functionality</summary>

- **Persistent Settings**: Preferences sync across devices using Chrome’s storage API.
- **Safe Handling**: Ignores Chrome system pages (`chrome://`) to prevent conflicts.
- **Error Recovery**: Automatically handles closed tabs and updates settings dynamically.

</details>

---

## 📖 Usage Guide

1. **Open the Popup**
   - Click the Superior Tab Mute icon in Chrome’s toolbar to access the control panel.

2. **Select a Mode**
   - Choose **Active Tab**, **First Sound**, or **Whitelist** mode via radio buttons.
   - For First Sound or Whitelist modes, use the tab list to select the audio source or enable “Show all tabs” for more options.

---

## 🔒 Permissions & Security

### Privacy Commitment

- **No Data Collection**: The extension does not collect, store, or transmit any personal data.
- **No Analytics**: No tracking or external server communication.
- **Local Operation**: All functionality runs locally within Chrome.

<details>
<summary>Permissions Used</summary>

- **tabs**: Required to detect and control tab audio and manage muting.
- **storage**: Saves user preferences locally for consistent behavior across sessions.

</details>

<details>
<summary>Synced Settings (chrome.storage.sync)</summary>

- Stored in your Google account and synchronized across devices when signed into Chrome.
- **isExtensionEnabled** (true/false): Controls whether the extension is active.
- **mode** ('active', 'first-sound', 'whitelist'): Defines the active muting mode.
- **isAllMuted** (true/false): Toggles global mute for all tabs.
- Ensures consistent core behavior across all your devices.

</details>

<details>
<summary>Session Storage (chrome.storage.session)</summary>

- Temporary settings cleared when Chrome closes.
- **firstAudibleTabId** (tab ID): Tracks the audio source tab in First Sound Mode.
- **whitelistedTabId** (tab ID): Tracks the selected tab in Whitelist Mode.
- Stored temporarily as tab IDs are unique to each browser session and invalid across devices or restarts.

</details>

<details>
<summary>Local Storage (localStorage)</summary>

- Persistent on the device, not synced.
- **stm_lang** ('en'/'ru'): Language preference for the interface.
- **showAllTabsFirstSound** (true/false): Toggles “Show all tabs” in First Sound Mode.
- **showAllTabsWhitelist** (true/false): Toggles “Show all tabs” in Whitelist Mode.
- Allows device-specific UI preferences, such as different settings for work and home computers.

</details>

---

## 📁 File Structure

```
Superior_Tab_Mute/
├── 📑 manifest.json         # Extension configuration
├── 🔧 background.js         # Core muting logic and event handling
├── ⚙️ popup.html            # User interface structure
├── ⚙️ popup.js              # Interface logic and user interactions
├── 🎨 popup.css             # Modern dark theme styling
├── 🗁 icons/                # Status indicator icons
│   ├── 🖼️ icon16.png           # Normal state
│   ├── 🖼️ icon16_off.png       # Disabled state
│   ├── 🖼️ icon16_mute.png      # All muted state
│   ├── 🖼️ icon48.png           # Normal state
│   ├── 🖼️ icon48_off.png       # Disabled state
│   ├── 🖼️ icon48_mute.png      # All muted state
│   ├── 🖼️ icon128.png          # Normal state
│   ├── 🖼️ icon128_off.png      # Disabled state
│   └── 🖼️ icon128_mute.png     # All muted state
└── 🖺 README.md             # This documentation
```

---

<div align="center">

⭐ Enjoying Superior Tab Mute? Star the repository on GitHub!

© badrenton 2025

</div>
