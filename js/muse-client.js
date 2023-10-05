//import {fromEvent} from "https://unpkg.com/rxjs@^7/dist/bundles/rxjs.umd.min.js"
const { fromEvent } = rxjs;
const { first, map, takeUntil, scan, concatMap, filter, share } =
  rxjs.operators;

const TELEMETRY_CHARACTERISTIC = "273e000b-4c4d-454d-96be-f03bac821358";

export const MuseElectronClient = class {
  constructor(callback, connect_button_id = "bluetooth") {
    // Connect Events
    document.getElementById(connect_button_id).onclick = function (e) {
      this.connect();
    }.bind(this);

    //console.log(MuseClient)

    /*
    document.getElementById("battery_level").onclick = function (e) {
      console.log(e)
      console.log(this.telemetryData)
      this.telemetryData.subscribe((telemetry) => {
        console.log(telemetry);
      });
    }.bind(this);

    */

    this.MUSE_SERVICE = 0xfe8d;
    this.device = null;
    this.deviceName = null;
    this.telemetryData = null;
  }

  parseTelemetry(data) {
    return {
      sequenceId: data.getUint16(0),
      batteryLevel: data.getUint16(2) / 512,
      fuelGaugeVoltage: data.getUint16(4) * 2.2,
      // Next 2 bytes are probably ADC millivolt level, not sure
      temperature: data.getUint16(8),
    };
  }

  parseControl(controlData) {
    return controlData.pipe(
      concatMap((data) => data.split("")),
      scan((acc, value) => {
        if (acc.indexOf("}") >= 0) {
          return value;
        } else {
          return acc + value;
        }
      }, ""),
      filter((value) => value.indexOf("}") >= 0),
      map((value) => JSON.parse(value))
    );
  }

  decodeResponse(bytes) {
    return new TextDecoder().decode(bytes.subarray(1, 1 + bytes[0]));
  }

  async observableCharacteristic(characteristic) {
    await characteristic.startNotifications();
    if (characteristic.service) {
      const disconnected = fromEvent(
        characteristic.service.device,
        "gattserverdisconnected"
      );
      return fromEvent(characteristic, "characteristicvaluechanged").pipe(
        takeUntil(disconnected),
        map((event) => event.target.value)
      );
    } else {
      return null;
    }
  }

  async sendCommand(cmd) {
    await this.controlChar.writeValue(this.encodeCommand(cmd));
  }

  async pause() {
    await this.sendCommand("h");
  }

  async resume() {
    await this.sendCommand("d");
  }

  async start() {
    await this.pause();
    let preset = "p21";
    await this.controlChar.writeValue(this.encodeCommand(preset));
    await this.controlChar.writeValue(this.encodeCommand("s"));
    await this.resume();
  }

  encodeCommand(cmd) {
    const encoded = new TextEncoder().encode(`X${cmd}\n`);
    encoded[0] = encoded.length - 1;
    return encoded;
  }

  parseGyroscope(data) {
    return this.parseImuReading(data, 0.0074768);
  }

  parseImuReading(data, scale) {
    function sample(startIndex) {
      return {
        x: scale * data.getInt16(startIndex),
        y: scale * data.getInt16(startIndex + 2),
        z: scale * data.getInt16(startIndex + 4),
      };
    }
    return {
      sequenceId: data.getUint16(0),
      samples: [sample(2), sample(8), sample(14)],
    };
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

      fromEvent(this.gatt.device, "gattserverdisconnected")
        .pipe(first())
        .subscribe(() => {
          console.log("gattserverdisconnected");
          this.gatt = null;
          //this.connectionStatus.next(false);
        });

      // Battery

      const service = await this.gatt.getPrimaryService(this.MUSE_SERVICE);
      console.log("service", service);

      
      const telemetryCharacteristic = await service.getCharacteristic(
        TELEMETRY_CHARACTERISTIC
      );
      console.log(telemetryCharacteristic);

      this.telemetryData = (
        await this.observableCharacteristic(telemetryCharacteristic)
      ).pipe(
        map(this.parseTelemetry)
      );
      

      // Telemetry info

      
      this.telemetryData.subscribe((status) => {
        console.log(status);
      });
      

      // Gyroscope

      const GYROSCOPE_CHARACTERISTIC = "273e0009-4c4d-454d-96be-f03bac821358";

      const gyroscopeCharacteristic = await service.getCharacteristic(
        GYROSCOPE_CHARACTERISTIC
      );

      this.gyroscopeData = (
        await this.observableCharacteristic(gyroscopeCharacteristic)
      ).pipe(map(this.parseGyroscope.bind(this)));

      
      this.gyroscopeData.subscribe((status) => {
        //console.log(status.samples[0]);
      });

      const CONTROL_CHARACTERISTIC = "273e0001-4c4d-454d-96be-f03bac821358";
      this.controlChar = await service.getCharacteristic(
        CONTROL_CHARACTERISTIC
      );

      this.rawControlData = (
        await this.observableCharacteristic(this.controlChar)
      ).pipe(
        map((data) => this.decodeResponse(new Uint8Array(data.buffer))),
        share()
      );

      this.controlResponses = this.parseControl(this.rawControlData);
      this.start();

      //console.log(this.telemetryData)

      /*      


      this.telemetryData.subscribe((telemetry) => {
        console.log(telemetry);
      });
      
      */
    } else {
      console.log("error with gatt object.");
    }
  }

  get_device() {
    return this.device;
  }
};
