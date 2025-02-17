const { app, BrowserWindow, ipcMain } = require("electron");
const tello = require("./tello.js");

const path = require("path");
//const BCIDevice = require("./bcidevice.js")

// Temp hard coded device name
//const MUSE_DEVICE_NAME = "Muse-9BC0"
const MUSE_DEVICE_NAME = "Muse-05F3";
//const MUSE_DEVICE_NAME = "Muse-9BC1"
//const MUSE_DEVICE_NAME = "Muse-05F3"

//let bluetoothPinCallback
let selectBluetoothCallback;

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  mainWindow.webContents.on(
    "select-bluetooth-device",
    (event, deviceList, callback) => {
      event.preventDefault();
      console.log(deviceList);
      deviceList.map((x) => {
        console.log(x.deviceName);
      });
      //selectBluetoothCallback = callback

      const result = deviceList.find((device) => {
        return device.deviceName === MUSE_DEVICE_NAME;
      });

      //console.log(MuseClient)

      if (result) {
        callback(result.deviceId);

        // Do we listen to characteristics here?
        // Find examples of subscribing to characteristics in electron.js
      } else {
        // The device wasn't found so we need to either wait longer (eg until the
        // device is turned on) or until the user cancels the request
      }
    }
  );

  let isUp = false

  ipcMain.on("manual-control", (event, response) => {
    //console.log("index", response);
    switch (response) {
      case "takeoff":
        isUp = true
        tello.takeoff();
        break;
      case "land":
        isUp = true
        tello.land();
        break;
      case "up":
        tello.up(20);
        break;
      case "down":
        tello.down(20);
        break;
      default:
        break;
    }
  });

  ipcMain.on("control-signal", (event, response) => {

    if (!isUp) return 0

    let { feature, threshold } = response;

    if (feature > threshold) {
      //tello.takeoff();
      console.log("Go Up");
      tello.up(20);
    } else {
      tello.down(20);
      console.log("Go Down");
    }

  });

  /*
  ipcMain.on('cancel-bluetooth-request', (event) => {
    //selectBluetoothCallback('')
  })
  */

  // Listen for a message from the renderer to get the response for the Bluetooth pairing.

  /*
  ipcMain.on('bluetooth-pairing-response', (event, response) => {
    bluetoothPinCallback(response)
  })
  */

  /*
  mainWindow.webContents.session.setBluetoothPairingHandler((details, callback) => {
    bluetoothPinCallback = callback
    // Send a message to the renderer to prompt the user to confirm the pairing.
    mainWindow.webContents.send('bluetooth-pairing-request', details)
  }) 
  */

  mainWindow.loadFile("index.html");
}

app.whenReady().then(() => {
  createWindow();

  app.on("activate", function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", function () {
  if (process.platform !== "darwin") app.quit();
});
