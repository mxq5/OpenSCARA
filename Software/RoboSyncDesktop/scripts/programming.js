/*
* Robo flow code interpreter - first version
*/
import RoboFlow from './RoboFlow.js';

const { ipcRenderer } = require('electron');

// Editor buttons
const btn_import = document.getElementById('btn_import');
const btn_save = document.getElementById('btn_save');
const btn_compile = document.getElementById('btn_compile');

const editor = document.getElementById('editor');

btn_import.addEventListener('click', () => {
  ipcRenderer.send('open-file-dialog');
  ipcRenderer.on('selected-file', (event, contents) => {
    editor.value = contents;
    localStorage.setItem('currentRoboSyncScript', contents);
    console.log(contents);
  });
});

btn_save.addEventListener('click', () => {
    // Using ipc save file dialog
    ipcRenderer.send('save-file-dialog', editor.value);
    ipcRenderer.on('selected-save-file', (event, contents) => {
        console.log('File saved');
    });
});

btn_compile.addEventListener('click', () => {
    const result = RoboFlow.parseScript(editor.value);
    if (!result) 
    {
        alert("Błąd kompilacji!");
        return;
    } else {
        alert("Kompilacja zakończona sukcesem!");
        localStorage.setItem('currentRoboSyncScript', editor.value);
    }
});