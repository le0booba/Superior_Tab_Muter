# Superior Tab Mute

> *Advanced Chrome Extension for Intelligent Audio Control*
> <br>
> Superior Tab Mute automatically manages which tabs can play audio, reducing distractions and improving focus.
<br>

![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-blue?logo=googlechrome)
<br>

### Use Cases
- Quick silence during calls or meetings
- Temporary quiet during focused work
- Override all other settings instantly

---

## 🌟 Key Features

### 🎯 **Smart Muting Modes**
- **Active Tab Mode**: Only your current tab plays audio - perfect for focused browsing
- **First Sound Mode**: The first tab that plays audio gets priority - ideal for music streaming
- **Whitelist Mode**: Manually select which tab should play audio - complete control
   
   - Use "Show all tabs" to select from any tab, not just audible ones

### ⚡ **Instant Controls**
- **Master Toggle**: Enable/disable the entire extension instantly
- **Global Mute**: Silence all tabs with one click or hotkey
- **Keyboard Shortcuts**: Control everything without touching your mouse
   - `Alt+Shift+S` - Toggle extension on/off
   - `Alt+Shift+M` - Mute/unmute all tabs

### 🎨 **Intelligent Interface**
- **Visual Status Indicators**: Extension icon shows current state at a glance
- **Real-time Tab Display**: See which tabs are playing audio
- **Bilingual Support**: English and Russian localization
   - Switch languages using the lang buttons in the popup 
- **Dark Theme**: Easy on the eyes during long browsing sessions

### 🔧 **Advanced Features**
- **Dynamic Sound Source**: Easily reassign which tab plays audio
- **Chrome Page Protection**: Safely handles system pages
- **Persistent Settings**: Your preferences sync across devices
- **Error Recovery**: Gracefully handles closed tabs and edge cases
- The current source is displayed with favicon and URL preview

---

## 🚀 Quick Start

### Installation
1. Download [LATEST RELEASE](https://github.com/le0booba/Superior_Tab_Mute/releases/latest) from GitHub.

2. **Load in Chrome**
   - Navigate to `chrome://extensions/`
   - Enable "Developer mode" (top right toggle)
   - Click "Load unpacked"
   - Select the extension folder

### First Use
1. **Choose Your Mode**: Click the extension icon and select your preferred muting strategy
2. **Test It**: Open multiple tabs with audio content
3. **Customize**: Set up keyboard shortcuts at `chrome://extensions/shortcuts`

---

## 📖 Detailed Usage Guide

### 🎵 Active Tab Mode
Perfect for focused work or browsing where you only want to hear the tab you're currently viewing.

**How it works:**
- Only the currently active tab can play audio
- Switching tabs automatically transfers audio permission
- Ideal for: Work, research, focused browsing

### 🎼 First Sound Mode  
Great for music streaming or when you want one consistent audio source.

**How it works:**
- The first tab that starts playing audio becomes the "source"
- All other tabs are muted automatically
- Use the "Refresh Source" button to reassign to the current tab
- Ideal for: Music streaming, podcasts, background audio

### 📋 Whitelist Mode
Maximum control for complex audio setups or specific workflows.

**How it works:**
- Manually select which single tab should play audio
- All other tabs remain muted until you change the selection
- Perfect granular control over your audio experience
- Ideal for: Multiple audio sources, complex workflows, presentations

### 🔇 Global Mute
Emergency silence for any situation.

---

<details>
<summary>⌨️ Keyboard Shortcuts</summary>

| Shortcut | Action | Customizable |
|----------|--------|--------------|
| `Alt+Shift+S` | Toggle extension on/off | ✅ |
| `Alt+Shift+M` | Mute/unmute all tabs | ✅ |

</details>

**Customize shortcuts:**
1. Go to `chrome://extensions/shortcuts`
2. Find "Superior Tab Mute"
3. Click the pencil icon to edit
4. Set your preferred key combinations

---

<details>
<summary>🎨 Visual Indicators</summary>

The extension icon changes to show the current state:

| Icon | Meaning |
|------|---------|
| 🎧 **Gray** | Extension active, normal operation |
| 🎧 **Gray with Red Cross** | All tabs muted |
| 🎧 **Red** | Extension disabled |

</details>

---

### File Structure
```
Superior_Tab_Mute/
├── 📑 manifest.json         # Extension configuration
├── 🔧 background.js         # Core muting logic & event handling
├── ⚙️ popup.html            # User interface structure
├── ⚙️ popup.js              # Interface logic & user interactions
├── 🎨 popup.css             # Modern dark theme styling
├── 🗁 icons/                # Status indicator icons
│   ├── 🖼️ icon16.png           # Normal state
│   ├── 🖼️ icon16_off.png       # Disabled state
│   └── 🖼️ icon16_mute.png      # All muted state
└── 🖺 README.md                # This documentation
```

---

## 🔒 Privacy & Security

### Data Collection: **NONE**
- ❌ No analytics or tracking
- ❌ No data sent to external servers  
- ❌ No personal information collected

### Permissions Used
- **`tabs`**: Required to mute/unmute tabs and detect audio
- **`storage`**: Saves your preferences locally

---

## 🐛 Troubleshooting

### Common Issues & Solutions

#### Extension Not Muting Tabs
- **Check**: Extension is enabled (icon should be colored, not gray)
- **Check**: Correct mode is selected in the popup
- **Note**: Chrome system pages (`chrome://`) cannot be muted due to browser restrictions

#### Keyboard Shortcuts Not Working  
- **Check**: No conflicting shortcuts at `chrome://extensions/shortcuts`
- **Try**: Different key combinations if current ones conflict with other software
- **Restart**: Chrome after changing shortcuts

#### Tabs Not Appearing in Lists
- **Enable**: "Show all tabs" option for full tab visibility
- **Refresh**: The popup to update the tab list
- **Check**: Tabs aren't Chrome system pages

#### Icon Not Updating
- **Reload**: Extension at `chrome://extensions/`
- **Restart**: Chrome browser
- **Check**: Extension has necessary permissions

---

<div align="center">
<sup>⭐ Enjoy the extension? Give it a star!</sup>

`© badrenton 2025`
</div>
