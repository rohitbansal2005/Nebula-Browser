const { ipcRenderer } = require('electron');

// DOM elements
const addressBar = document.getElementById('addressBar');
const goBtn = document.getElementById('goBtn');
const backBtn = document.getElementById('backBtn');
const forwardBtn = document.getElementById('forwardBtn');
const refreshBtn = document.getElementById('refreshBtn');
const homeBtn = document.getElementById('homeBtn');
const bookmarkBtn = document.getElementById('bookmarkBtn');
const settingsBtn = document.getElementById('settingsBtn');
const historyBtn = document.getElementById('historyBtn');
const newTabBtn = document.getElementById('newTabBtn');
const webview = document.getElementById('webview');
const tabsContainer = document.getElementById('tabsContainer');

// Modal elements
const settingsModal = document.getElementById('settingsModal');
const bookmarksModal = document.getElementById('bookmarksModal');
const historyModal = document.getElementById('historyModal');
const closeSettings = document.getElementById('closeSettings');
const closeBookmarks = document.getElementById('closeBookmarks');
const closeHistory = document.getElementById('closeHistory');

// Settings elements
const homepageInput = document.getElementById('homepageInput');
const searchEngineInput = document.getElementById('searchEngineInput');
const saveSettings = document.getElementById('saveSettings');

// Lists
const bookmarksList = document.getElementById('bookmarksList');
const historyList = document.getElementById('historyList');

// Global variables
let currentTabId = 'tab1';
let tabCounter = 1;
let settings = {};
const nebulaHomepage = `file://${__dirname}/welcome.html`;
let tabs = new Map(); // Store tab data: {id, title, url, webview}
let webviews = new Map(); // Store webview elements

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    setupEventListeners();
    await loadSettings();
    
    // Initialize first tab
    createInitialTab();
});

// Create initial tab
function createInitialTab() {
    const tabId = 'tab1';
    const webview = document.getElementById('webview');
    
    console.log('Creating initial tab:', tabId);
    
    // Store tab data
    tabs.set(tabId, {
        id: tabId,
        title: 'New Tab',
        url: nebulaHomepage,
        webview: webview
    });
    
    webviews.set(tabId, webview);
    currentTabId = tabId;
    
    // Setup webview events for first tab
    setupWebviewEventsForTab(webview, tabId);
    
    // Add click event to initial tab
    const initialTab = document.querySelector(`[data-tab-id="${tabId}"]`);
    if (initialTab) {
        initialTab.addEventListener('click', (e) => {
            console.log('Initial tab clicked:', tabId);
            e.preventDefault();
            e.stopPropagation();
            switchToTab(tabId);
        });
        
        // Add close button event to initial tab
        const closeBtn = initialTab.querySelector('.tab-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                console.log('Closing initial tab:', tabId);
                closeTab(tabId);
            });
        }
    }
    
    // Load homepage
    webview.loadURL(nebulaHomepage);
}

// Tab management
function createNewTab() {
    tabCounter++;
    const tabId = `tab${tabCounter}`;
    
    console.log('Creating new tab:', tabId);
    
    // Create tab element
    const tab = document.createElement('div');
    tab.className = 'tab';
    tab.setAttribute('data-tab-id', tabId);
    tab.innerHTML = `
        <span class="tab-title">New Tab</span>
        <button class="tab-close" data-tab-id="${tabId}">×</button>
    `;

    // Add close button event
    tab.querySelector('.tab-close').addEventListener('click', (e) => {
        e.stopPropagation();
        console.log('Closing tab:', tabId);
        closeTab(tabId);
    });

    // Add tab click event with better handling
    tab.addEventListener('click', (e) => {
        console.log('Tab clicked:', tabId);
        e.preventDefault();
        e.stopPropagation();
        switchToTab(tabId);
    });

    tabsContainer.appendChild(tab);
    
    // Create new webview for this tab
    const webview = document.createElement('webview');
    webview.className = 'webview';
    webview.style.display = 'none';
    webview.src = nebulaHomepage;
    
    // Store webview
    webviews.set(tabId, webview);
    
    // Add to container
    document.querySelector('.webview-container').appendChild(webview);
    
    // Store tab data
    tabs.set(tabId, {
        id: tabId,
        title: 'New Tab',
        url: nebulaHomepage,
        webview: webview
    });
    
    // Switch to new tab
    switchToTab(tabId);
    
    // Setup webview events for new webview
    setupWebviewEventsForTab(webview, tabId);
}

function switchToTab(tabId) {
    console.log('Switching to tab:', tabId);
    console.log('Available tabs:', Array.from(tabs.keys()));
    console.log('Available webviews:', Array.from(webviews.keys()));
    
    // Hide all webviews
    webviews.forEach((webview) => {
        webview.style.display = 'none';
    });
    
    // Show current tab's webview
    const currentWebview = webviews.get(tabId);
    if (currentWebview) {
        currentWebview.style.display = 'block';
        console.log('Showing webview for tab:', tabId);
    } else {
        console.error('Webview not found for tab:', tabId);
    }
    
    // Update active tab
    document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
    const activeTab = document.querySelector(`[data-tab-id="${tabId}"]`);
    if (activeTab) {
        activeTab.classList.add('active');
        console.log('Activated tab:', tabId);
    } else {
        console.error('Tab element not found:', tabId);
    }
    
    currentTabId = tabId;
    
    // Update address bar and navigation buttons
    const tabData = tabs.get(tabId);
    if (tabData && tabData.webview) {
        updateAddressBar(tabData.webview.getURL());
        updateNavigationButtons();
        console.log('Updated UI for tab:', tabId);
    }
}

function closeTab(tabId) {
    const tab = document.querySelector(`[data-tab-id="${tabId}"]`);
    const webview = webviews.get(tabId);
    
    if (tab && webview) {
        // Remove tab element
        tab.remove();
        
        // Remove webview
        webview.remove();
        
        // Clean up data
        tabs.delete(tabId);
        webviews.delete(tabId);
        
        // If this was the active tab, switch to another
        const remainingTabs = document.querySelectorAll('.tab');
        if (tabId === currentTabId) {
            if (remainingTabs.length > 0) {
                const firstTab = remainingTabs[0];
                const firstTabId = firstTab.getAttribute('data-tab-id');
                switchToTab(firstTabId);
            } else {
                // No tabs left, quit the app
                ipcRenderer.send('quit-app');
            }
        }
    }
}

// Setup webview events for specific tab
function setupWebviewEventsForTab(webview, tabId) {
    webview.addEventListener('did-start-loading', () => {
        updateTabTitle('Loading...', tabId);
        // Only update navigation buttons if this is the current tab
        if (tabId === currentTabId) {
            updateNavigationButtons();
        }
    });

    webview.addEventListener('did-stop-loading', () => {
        const title = webview.getTitle();
        updateTabTitle(title, tabId);
        
        // Only update address bar and navigation if this is the current tab
        if (tabId === currentTabId) {
            updateAddressBar(webview.getURL());
            updateNavigationButtons();
        }
        
        addToHistory(webview.getURL());
        
        // Update tab data
        const tabData = tabs.get(tabId);
        if (tabData) {
            tabData.title = title;
            tabData.url = webview.getURL();
        }
    });

    webview.addEventListener('did-navigate', (e) => {
        // Only update address bar if this is the current tab
        if (tabId === currentTabId) {
            updateAddressBar(e.url);
        }
        
        addToHistory(e.url);
        
        // Update tab data
        const tabData = tabs.get(tabId);
        if (tabData) {
            tabData.url = e.url;
        }
        
        // If navigated to homepage, clear address bar
        if (e.url && e.url.includes('welcome.html') && tabId === currentTabId) {
            addressBar.value = '';
        }
    });

    webview.addEventListener('page-title-updated', (e) => {
        updateTabTitle(e.title, tabId);
    });
}

// Load settings
async function loadSettings() {
    settings = await ipcRenderer.invoke('get-settings');
    homepageInput.value = settings.homepage;
    searchEngineInput.value = settings.searchEngine;
}

// Get current webview
function getCurrentWebview() {
    const tabData = tabs.get(currentTabId);
    return tabData ? tabData.webview : null;
}

// Setup event listeners
function setupEventListeners() {
    // Navigation
    goBtn.addEventListener('click', navigateToUrl);
    addressBar.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') navigateToUrl();
    });

    // Enhanced navigation with visual feedback
    backBtn.addEventListener('click', () => {
        const webview = getCurrentWebview();
        if (webview && webview.canGoBack()) {
            webview.goBack();
            showButtonFeedback(backBtn, '←');
        }
    });
    
    forwardBtn.addEventListener('click', () => {
        const webview = getCurrentWebview();
        if (webview && webview.canGoForward()) {
            webview.goForward();
            showButtonFeedback(forwardBtn, '→');
        }
    });
    
    refreshBtn.addEventListener('click', () => {
        const webview = getCurrentWebview();
        if (webview) {
            webview.reload();
            showButtonFeedback(refreshBtn, '↻');
        }
    });
    
    homeBtn.addEventListener('click', () => {
        const webview = getCurrentWebview();
        if (webview) {
            webview.loadURL(nebulaHomepage);
            showButtonFeedback(homeBtn, '🏠');
        }
    });

    // Enhanced toolbar actions with better feedback
    bookmarkBtn.addEventListener('click', async () => {
        await addBookmark();
        showButtonFeedback(bookmarkBtn, '⭐');
    });
    
    settingsBtn.addEventListener('click', () => {
        settingsModal.style.display = 'block';
        showButtonFeedback(settingsBtn, '⚙️');
    });
    
    historyBtn.addEventListener('click', async () => {
        await showHistory();
        showButtonFeedback(historyBtn, '📚');
    });

    // Tab management
    newTabBtn.addEventListener('click', () => {
        createNewTab();
        showButtonFeedback(newTabBtn, '+');
    });

    // Modal close buttons
    closeSettings.addEventListener('click', () => settingsModal.style.display = 'none');
    closeBookmarks.addEventListener('click', () => bookmarksModal.style.display = 'none');
    closeHistory.addEventListener('click', () => historyModal.style.display = 'none');

    // Settings
    saveSettings.addEventListener('click', saveSettingsData);

    // Close modals when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === settingsModal) settingsModal.style.display = 'none';
        if (e.target === bookmarksModal) bookmarksModal.style.display = 'none';
        if (e.target === historyModal) historyModal.style.display = 'none';
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Ctrl/Cmd + L: Focus address bar
        if ((e.ctrlKey || e.metaKey) && e.key === 'l') {
            e.preventDefault();
            addressBar.focus();
            addressBar.select();
        }
        
        // Ctrl/Cmd + T: New tab
        if ((e.ctrlKey || e.metaKey) && e.key === 't') {
            e.preventDefault();
            createNewTab();
        }
        
        // Ctrl/Cmd + W: Close current tab
        if ((e.ctrlKey || e.metaKey) && e.key === 'w') {
            e.preventDefault();
            closeTab(currentTabId);
        }
        
        // F5: Refresh
        if (e.key === 'F5') {
            e.preventDefault();
            const webview = getCurrentWebview();
            if (webview) {
                webview.reload();
                showButtonFeedback(refreshBtn, '↻');
            }
        }
        
        // Ctrl/Cmd + R: Refresh
        if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
            e.preventDefault();
            const webview = getCurrentWebview();
            if (webview) {
                webview.reload();
                showButtonFeedback(refreshBtn, '↻');
            }
        }
        
        // Alt + Left: Go back
        if (e.altKey && e.key === 'ArrowLeft') {
            e.preventDefault();
            const webview = getCurrentWebview();
            if (webview && webview.canGoBack()) {
                webview.goBack();
                showButtonFeedback(backBtn, '←');
            }
        }
        
        // Alt + Right: Go forward
        if (e.altKey && e.key === 'ArrowRight') {
            e.preventDefault();
            const webview = getCurrentWebview();
            if (webview && webview.canGoForward()) {
                webview.goForward();
                showButtonFeedback(forwardBtn, '→');
            }
        }
        
        // Ctrl/Cmd + D: Add bookmark
        if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
            e.preventDefault();
            addBookmark();
            showButtonFeedback(bookmarkBtn, '⭐');
        }
        
        // Ctrl/Cmd + H: Show history
        if ((e.ctrlKey || e.metaKey) && e.key === 'h') {
            e.preventDefault();
            showHistory();
            showButtonFeedback(historyBtn, '📚');
        }
        
        // Ctrl/Cmd + ,: Open settings
        if ((e.ctrlKey || e.metaKey) && e.key === ',') {
            e.preventDefault();
            settingsModal.style.display = 'block';
            showButtonFeedback(settingsBtn, '⚙️');
        }
    });
}

// Navigation functions
function navigateToUrl() {
    const webview = getCurrentWebview();
    if (!webview) return;
    
    let url = addressBar.value.trim();
    if (!url) {
        // If address bar is blank, always load homepage
        webview.loadURL(nebulaHomepage);
        return;
    }

    // Add protocol if missing
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        // If it looks like a URL (has a dot, no spaces), treat as URL
        if (url.includes('.') && !url.includes(' ')) {
            url = 'https://' + url;
        } else {
            // Direct Google search for queries
            url = `https://www.google.com/search?q=${encodeURIComponent(addressBar.value.trim())}`;
        }
    }

    console.log('Loading URL in tab', currentTabId, ':', url);
    webview.loadURL(url);
}

function updateAddressBar(url) {
    // Only update if this is the current tab
    if (currentTabId) {
        // If on homepage, show blank or custom text
        if (url && url.includes('welcome.html')) {
            addressBar.value = '';
        } else {
            addressBar.value = url;
        }
    }
}

function updateTabTitle(title, tabId = currentTabId) {
    const tab = document.querySelector(`[data-tab-id="${tabId}"] .tab-title`);
    if (tab) {
        tab.textContent = title || 'New Tab';
    }
    
    // Update tab data
    const tabData = tabs.get(tabId);
    if (tabData) {
        tabData.title = title || 'New Tab';
    }
}

function updateNavigationButtons() {
    const webview = getCurrentWebview();
    if (webview) {
        backBtn.disabled = !webview.canGoBack();
        forwardBtn.disabled = !webview.canGoForward();
    }
}

// Bookmarks
async function addBookmark() {
    const webview = getCurrentWebview();
    if (!webview) return;
    
    const url = webview.getURL();
    const title = webview.getTitle();
    
    if (url && url !== 'about:blank' && !url.includes('welcome.html')) {
        try {
            // Check if bookmark already exists
            const existingBookmarks = await ipcRenderer.invoke('get-bookmarks');
            const isDuplicate = existingBookmarks.some(bookmark => bookmark.url === url);
            
            if (isDuplicate) {
                showNotification('Bookmark already exists!', 'warning');
                return;
            }
            
            await ipcRenderer.invoke('save-bookmark', { url, title });
            showNotification('Bookmark added successfully!', 'success');
        } catch (error) {
            showNotification('Failed to add bookmark!', 'error');
        }
    } else {
        showNotification('Cannot bookmark this page!', 'warning');
    }
}

async function showBookmarks() {
    try {
        const bookmarks = await ipcRenderer.invoke('get-bookmarks');
        bookmarksList.innerHTML = '';
        
        if (bookmarks.length === 0) {
            bookmarksList.innerHTML = '<div class="empty-state">No bookmarks yet. Start browsing and add some!</div>';
        } else {
            bookmarks.forEach((bookmark, index) => {
                const item = document.createElement('div');
                item.className = 'bookmark-item';
                item.innerHTML = `
                    <div class="bookmark-content">
                        <div class="bookmark-title">${bookmark.title || 'Untitled'}</div>
                        <div class="bookmark-url">${bookmark.url}</div>
                    </div>
                    <div class="bookmark-actions">
                        <button class="visit-btn" title="Visit">🌐</button>
                        <button class="remove-btn" title="Remove">🗑️</button>
                    </div>
                `;
                
                // Visit bookmark
                item.querySelector('.visit-btn').addEventListener('click', (e) => {
                    e.stopPropagation();
                    webview.loadURL(bookmark.url);
                    bookmarksModal.style.display = 'none';
                    showNotification('Opening bookmark...', 'info');
                });
                
                // Remove bookmark
                item.querySelector('.remove-btn').addEventListener('click', (e) => {
                    e.stopPropagation();
                    removeBookmark(index);
                });
                
                // Click to visit
                item.addEventListener('click', () => {
                    webview.loadURL(bookmark.url);
                    bookmarksModal.style.display = 'none';
                    showNotification('Opening bookmark...', 'info');
                });
                
                bookmarksList.appendChild(item);
            });
        }
        
        bookmarksModal.style.display = 'block';
    } catch (error) {
        showNotification('Failed to load bookmarks!', 'error');
    }
}

async function removeBookmark(index) {
    await ipcRenderer.invoke('remove-bookmark', index);
    showBookmarks(); // Refresh the list
}

// History
async function showHistory() {
    const history = await ipcRenderer.invoke('get-history');
    historyList.innerHTML = '';
    
    history.forEach((item) => {
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        historyItem.innerHTML = `
            <div>
                <div class="history-title">${item.url}</div>
                <div class="history-url">${new Date(item.timestamp).toLocaleString()}</div>
            </div>
        `;
        
        historyItem.addEventListener('click', () => {
            webview.loadURL(item.url);
            historyModal.style.display = 'none';
        });
        
        historyList.appendChild(historyItem);
    });
    
    historyModal.style.display = 'block';
}

async function removeHistory(index) {
    await ipcRenderer.invoke('remove-history', index);
    showHistory(); // Refresh the list
}

// Settings
async function saveSettingsData() {
    const homepage = homepageInput.value;
    const searchEngine = searchEngineInput.value;
    await ipcRenderer.invoke('save-settings', { homepage, searchEngine });
    showNotification('Settings saved!');
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-icon">${getNotificationIcon(type)}</span>
            <span class="notification-text">${message}</span>
        </div>
    `;
    
    // Add to body
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => notification.classList.add('show'), 10);
    
    // Remove after delay
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

function getNotificationIcon(type) {
    switch (type) {
        case 'success': return '✅';
        case 'error': return '❌';
        case 'warning': return '⚠️';
        case 'info': return 'ℹ️';
        default: return 'ℹ️';
    }
}

// Add to history
function addToHistory(url) {
    ipcRenderer.invoke('add-to-history', url);
}

// Helper function to switch to a tab by its ID
function switchToTab(tabId) {
    document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
    document.querySelector(`[data-tab-id="${tabId}"]`).classList.add('active');
    currentTabId = tabId;
}

// Visual feedback for button clicks
function showButtonFeedback(button, originalText) {
    const originalBackground = button.style.background;
    const originalTransform = button.style.transform;
    
    // Add visual feedback
    button.style.background = 'linear-gradient(135deg, #27ae60 0%, #2ecc71 100%)';
    button.style.transform = 'scale(0.95)';
    
    // Reset after animation
    setTimeout(() => {
        button.style.background = originalBackground;
        button.style.transform = originalTransform;
    }, 150);
}