import { MuseElectronClient } from "./muse-client.js";

export const MuseDataCapture = class {
  constructor(connect_button_id, eeg_handler) {
    this.device = new MuseElectronClient();
    this.connect_button_id = connect_button_id;
    this.eeg_handler = eeg_handler

    // Set up UI
    this.init_ui()
  }

  init_ui() {
    document.getElementById(this.connect_button_id).onclick = () =>
      this.on_connect(this.device);
  }

  async on_connect() {
    await this.device.connect()

    // EEG DATA
    this.device.eegReadings.subscribe(sample => {
      this.eeg_handler(sample)
    })
  }
};



//let dc = new DataCapture()