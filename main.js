const { app, BrowserWindow, Menu, ipcMain, shell } = require('electron');
const path = require('path');
const Store = require('electron-store');

const store = new Store();

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    title: 'Nebula Browser',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false,
      allowRunningInsecureContent: true,
      webviewTag: true
    },
    icon: path.join(__dirname, 'logo.png'),
    titleBarStyle: 'default',
    show: false
  });

  // Load the main browser interface with navbar
  mainWindow.loadFile('index.html');

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Handle external links
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC handlers for communication with renderer
ipcMain.handle('get-settings', () => {
  return {
    homepage: `file://${__dirname}/welcome.html`,
    searchEngine: store.get('searchEngine', 'https://www.google.com/search?q=')
  };
});

ipcMain.handle('save-settings', (event, settings) => {
  // Ignore homepage changes, always use welcome.html
  store.set('searchEngine', settings.searchEngine);
  return true;
});

ipcMain.handle('get-bookmarks', () => {
  return store.get('bookmarks', []);
});

ipcMain.handle('save-bookmark', (event, bookmark) => {
  const bookmarks = store.get('bookmarks', []);
  bookmarks.push(bookmark);
  store.set('bookmarks', bookmarks);
  return true;
});

ipcMain.handle('remove-bookmark', (event, index) => {
  const bookmarks = store.get('bookmarks', []);
  bookmarks.splice(index, 1);
  store.set('bookmarks', bookmarks);
  return true;
});

ipcMain.handle('get-history', () => {
  return store.get('history', []);
});

ipcMain.handle('add-history', (event, url) => {
  const history = store.get('history', []);
  const timestamp = new Date().toISOString();
  history.unshift({ url, timestamp });
  
  // Keep only last 100 entries
  if (history.length > 100) {
    history.splice(100);
  }
  
  store.set('history', history);
  return true;
}); 

ipcMain.handle('add-to-history', (event, url) => {
  const history = store.get('history', []);
  const timestamp = new Date().toISOString();
  history.unshift({ url, timestamp });
  // Keep only last 100 entries
  if (history.length > 100) {
    history.splice(100);
  }
  store.set('history', history);
  return true;
});

ipcMain.on('quit-app', () => {
  app.quit();
}); 