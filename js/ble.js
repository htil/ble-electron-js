import { MuseElectronClient } from "./muse-client.js";

export const BLE = class {
  constructor(callback, connect_button_id = "bluetooth") {
    this.device = new MuseElectronClient();
    this.callback = callback;

    // Connect Events
    document.getElementById(connect_button_id).onclick = function (e) {
      this.connect();
    }.bind(this);
  }

  async connect() {
    await this.device.connect();

    // EEG DATA
    this.device.eegReadings.subscribe(this.callback);
  }

  get_device() {
    return this.device;
  }
};
