// main/auth-process.js

const {BrowserWindow} = require('electron');
const authService = require('../auth/auth-service');
const createAppWindow = require('../main/app-process');

let win = null;

function createAuthWindow(callBack) {
    let urlObj ;
    destroyAuthWin();

    win = new BrowserWindow({
        width: 1000,
        height: 600,
        webPreferences: {
            nodeIntegration: false,
            enableRemoteModule: false
        }
    });

    win.loadURL(authService.getAuthenticationURL());

    const {session: {webRequest}} = win.webContents;

    const filter = {
        urls: [
            'http://localhost/callback*'
        ]
    };

    webRequest.onBeforeRequest(filter,  ({url}) => {
        urlObj = authService.getTokenFromUrl(url);
        // createAppWindow();
            callBack(urlObj)
         return destroyAuthWin();
    });

    win.on('authenticated', () => {
        destroyAuthWin();
    });

    win.on('closed', () => {
        win = null;
    });
}

function destroyAuthWin() {
    if (!win) return;
    win.close();
    win = null;
}


module.exports = {
    createAuthWindow,
};