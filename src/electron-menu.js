const electron = require('electron');
const Menu = electron.Menu;
const app = electron.app;
// const openAboutWindow = require('electron-about-window');

module.exports = {
  setMenu: (mainWindow) => {
    const name = app.getName();

    let template = [
      {
        label: 'Edit',
        submenu: [
          {role: 'undo'},
          {role: 'redo'},
          {type: 'separator'},
          {role: 'cut'},
          {role: 'copy'},
          {role: 'paste'},
          {role: 'selectall'}
        ]
      },
      {
        label: 'Library',
        submenu: [
          {
            label: 'Add Module',
            accelerator: 'CmdOrCtrl+M',
            click: (item, focusedWindow) => {
              if (focusedWindow != null) mainWindow.webContents.send('read-module');
            }
          },
          {
            label: 'Scan Dirertory',
            accelerator: 'CmdOrCtrl+D',
            click: (item, focusedWindow) => {
              if (focusedWindow != null) mainWindow.webContents.send('scan-directory');
            }
          },
        ],
      },
      {
        label: 'View',
        submenu: [
          {
            label: 'Toggle ModuleList',
            // accelerator: 'CmdOrCtrl+M',
            click: (item, focusedWindow) => {
              if (focusedWindow != null) mainWindow.webContents.send('toggle-module-list');
            }
          },
          {
            label: 'Toggle Search',
            // accelerator: 'CmdOrCtrl+D',
            click: (item, focusedWindow) => {
              if (focusedWindow != null) mainWindow.webContents.send('toggle-search');
            }
          },
        ],
      },
    ];
    console.log('process.platform:', process.platform)

    if (process.platform === 'darwin') {
      template.unshift({
        label: name,
        submenu: [
          // {
          //   label: 'About ' + name,
          //   click: () => openAboutWindow({
          //     icon_path: '../public/favicon.svg',
          //   })
          // },
          // {
          //   type: 'separator'
          // },
          {
            label: 'Hide ' + name,
            accelerator: 'Command+H',
            role: 'hide'
          },
          {
            label: 'Hide Others',
            accelerator: 'Command+Shift+H',
            role: 'hideothers'
          },
          {
            label: 'Show All',
            role: 'unhide'
          },
          {
            type: 'separator'
          },
          {
            label: 'Quit',
            accelerator: 'Command+Q',
            click: ()=> {
              app.quit()
            }
          }
        ]
      });

      // (windowsMenu.submenu).push(
      //   {
      //     type: 'separator'
      //   },
      //   {
      //     label: 'Bring All to Front',
      //     role: 'front'
      //   })
    }

    const appMenu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(appMenu);
  }
}