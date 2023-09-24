//import {fromEvent} from "https://unpkg.com/rxjs@^7/dist/bundles/rxjs.umd.min.js"
const { fromEvent } = rxjs;
const { first } = rxjs.operators;

export const MuseElectronClient = class {
  constructor(callback, connect_button_id = "bluetooth") {
    // Connect Events
    document.getElementById(connect_button_id).onclick = function (e) {
      this.connect();
    }.bind(this);

    this.MUSE_SERVICE = 0xfe8d;
    this.device = null;
    this.deviceName = null;
  }

  async connect() {
    this.device = await navigator.bluetooth.requestDevice({
      filters: [
        {
          namePrefix: "Ganglion-",
        },
        {
          namePrefix: "Muse-",
        },
      ],
      filters: [{ services: [this.MUSE_SERVICE] }],
      //acceptAllDevices: true,
    });

    if (this.device.gatt) {
      this.gatt = await this.device.gatt.connect();
      this.deviceName = this.gatt.device.name || null;

      document.getElementById("device-name").innerHTML = this.deviceName;

      const service = await this.gatt.getPrimaryService(this.MUSE_SERVICE);
      console.log(service)

      fromEvent(this.gatt.device, "gattserverdisconnected")
        .pipe(first())
        .subscribe(() => {
          console.log("gattserverdisconnected")
          this.gatt = null;
          //this.connectionStatus.next(false);
        });

    } else {
      console.log("error with gatt object.");
    }
  }

  get_device() {
    return this.device;
  }
};
