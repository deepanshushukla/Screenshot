
// Modules to control application life and create native browser window
const {app,ipcMain, BrowserWindow,Menu,systemPreferences} = require('electron');
const {createAuthWindow} = require('./autho/auth-process');
const oauthConfig = require('./config').oauth;
console.log('isDev-----',process.env.ELECTRON_ENV);
const windowParams = {
    alwaysOnTop: true,
    autoHideMenuBar: false,
    webPreferences: {
        nodeIntegration: false
    }
};
const path = require('path');
// const genesysOAuth = electronOauth2(oauthConfig, windowParams);
// require('electron-reload')(__dirname, {
//     // Note that the path to electron may vary according to the main file
//     electron: require(`${__dirname}/node_modules/.bin/electron`),
//     ignored: /videos|node_modules|[\/\\]\./,
//     argv: []
// });
os.platform() ===
systemPreferences.askForMediaAccess('camera').then((status)=>{
    console.log('status', status)
    const permission = systemPreferences.getMediaAccessStatus("screen");
    console.log('permission', permission)
})
function createMainWindow () {
    // Create the browser window.
    const mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js').toLowerCase(),
            nodeIntegration: true
        }
    })

    // and load the index.html of the app.
    mainWindow.loadFile(path.join(__dirname,'index.html'));

    // Open the DevTools.
     mainWindow.webContents.openDevTools()
    ipcMain.on('genesys-oauth', (event, arg) => {
        createAuthWindow((urlObj)=>{
            event.sender.send('genesys-oauth-reply', urlObj);
        });
    });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
    createMainWindow();

    app.on('activate', function () {
        // On macOS it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (BrowserWindow.getAllWindows().length === 0) createMainWindow()
    })

})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit()
})

