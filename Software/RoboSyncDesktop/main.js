const electron = require('electron');
const { dialog, ipcMain } = require('electron');
const fs = require('fs');

const path = require('path');

const BrowserWindow = electron.BrowserWindow;
const app = electron.app;

// decide whether to open DevTools from command line
const args = process.argv.slice(1);
const devtools = args.some(val => val === '--devtools');

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

// Create write file function that is async
async function writeFile(path, data) {
    try {
        await fs.promises.writeFile(path, data);
        console.log('File written successfully');
    }
    catch (error) {
        console.error('Error writing file', error);
    }
}

// Create open file function that will return String
async function openFile(path) {
    try {
        const data = await fs
            .promises
            .readFile(path, 'utf8');
        console.log('File read successfully');
        return data;
    }
    catch (error) {
        console.error('Error reading file', error);
    }
}

// IPC
ipcMain.on('open-file-dialog', (event) => {
    dialog.showOpenDialog({
        properties: ['openFile'],
        filters: [
            { name: 'Text Files', extensions: ['txt', 'rbflw'] }
        ]
    }).then(result => {
        if (!result.canceled) {
            openFile(result.filePaths[0]).then(data => {
                event.sender.send('selected-file', data); 
            });
        }
    });
});

// Using ipc let renderer save file dialog
ipcMain.on('save-file-dialog', (event, contents) => {
    dialog.showSaveDialog({
        defaultPath: 'myFile.rbflw',
        filters: [
            { name: 'RoboFlow files', extensions: ['rbflw'] }
        ]
    }).then(result => {
        if (!result.canceled) {
            event.sender.send('selected-save-file', result.filePath);
            console.log(event);
            writeFile(result.filePath, contents);
        }
    });
});