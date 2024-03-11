const electron = require('electron');
const path = require('path');

const BrowserWindow = electron.BrowserWindow;
const app = electron.app;

const devtools = false;

function createWindow() {
    // Create the browser window
    const win = new BrowserWindow({
        title: 'RoboSync Desktop',
        minWidth: 1356,
        minHeight: 860,
        center: true,
        icon: path.join(__dirname, 'graphics/icon.ico'),
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        }
    });

    // Load the index.html file
    win.loadFile('views/index.html');
    win.setMenu(null);

    // Open the DevTools
    if(devtools) win.webContents.openDevTools();
}

// When the app is ready, create the window
app.whenReady().then(createWindow);

// Quit when all windows are closed
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});