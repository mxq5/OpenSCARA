import { app, BrowserWindow } from 'electron';

function createWindow() {
    // Create the browser window
    const win = new BrowserWindow({
        title: 'RoboSync Desktop',
        width: 1200,
        height: 720,
        icon: 'graphics/icon.ico',
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        }
    });

    // Load the index.html file
    win.loadFile('views/index.html');
    win.setMenu(null);

    // Open the DevTools
    win.webContents.openDevTools();
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