const electron = require('electron');
const url = require('url');
const path = require('path');
const { Menu } = require('electron');

const { app, BrowserWindow, ipcMain } = electron;

process.env.NODE_ENV = 'production';

let mainWindow;
let addWindow;

app.on('ready', function() {
    // Create new main window
    mainWindow = new BrowserWindow({
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        }
    }
    );
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, "mainWindow.html"),
        protocol: 'file:',
        slashes: true,
    }));

    mainWindow.on('closed', function() {
        app.quit();
    });

    const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);

    Menu.setApplicationMenu(mainMenu);
})

function createAddWindow(){
    addWindow = new BrowserWindow({
        width: 300,
        height: 200,
        title: 'Add Shopping List Item',
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        }
        
    });


    addWindow.loadURL(url.format({
        pathname: path.join(__dirname, "addWindow.html"),
        protocol: 'file:',
        slashes: true
    }));

    addWindow.on('close', function() {
        addWindow = null;
    });
}

// catch item add and send it to the mainwindow
ipcMain.on('item:add', function(e, item) {
    mainWindow.webContents.send('item:add', item);
    addWindow.close();
})

const mainMenuTemplate = [
    {
        label: 'file',
        submenu: [
            {
                label: "Add Item",
                click() {
                    createAddWindow()
                }
            },
            {
                label: "Clear Items",
                click() {
                    mainWindow.webContents.send('item:clear')
                }
            },
            {
                label: "Quit",
                accelerator: process.platform == 'darwin' ? 'Command+Q' : 'Ctrl+Q',
                click() {
                    app.quit();
                }
            }
        ]
    }
];

// if mac, add empty object to menu
if (process.platform == 'darwin') {
    mainMenuTemplate.unshift({})
}

// Add developer tools item not in prod
if (process.env.NODE_ENV !== 'production') {
    mainMenuTemplate.push({
        label: 'Developer Tools',
        submenu: [
            {
                label: 'Toggle DevTools',
                accelerator: process.platform == 'darwin' ? 'Command+I' : 'Ctrl+I',
                click(item, focusedWindow) {
                    focusedWindow.toggleDevTools();
                }
            },
            {
                role: 'reload'
            }
        ]
    })
}