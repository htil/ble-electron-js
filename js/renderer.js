import { MuseElectronClient } from "./muse-client.js"

let main =function(){
    let mc = new MuseElectronClient((res) => {
      console.log(res)
    })
}

main()

/*
async function testIt() {
  //alert("testing")

  const MUSE_SERVICE = 0xfe8d;

  const device = await navigator.bluetooth.requestDevice({
    filters: [
      {
        namePrefix: "Ganglion-",
      },
      {
        namePrefix: "Muse-",
      },
    ],
    filters: [{ services: [MUSE_SERVICE] }],
    //acceptAllDevices: true,
  });

  document.getElementById("device-name").innerHTML =
    device.name || `ID: ${device.id}`;


  console.log(device)
}

document.getElementById("clickme").addEventListener("click", testIt);

function cancelRequest() {
  window.electronAPI.cancelBluetoothRequest();
}

document.getElementById("cancel").addEventListener("click", cancelRequest);

*/

/*
  
  window.electronAPI.bluetoothPairingRequest((event, details) => {
    const response = {}
  
    switch (details.pairingKind) {
      case 'confirm': {
        response.confirmed = window.confirm(`Do you want to connect to device ${details.deviceId}?`)
        break
      }
      case 'confirmPin': {
        response.confirmed = window.confirm(`Does the pin ${details.pin} match the pin displayed on device ${details.deviceId}?`)
        break
      }
      case 'providePin': {
        const pin = window.prompt(`Please provide a pin for ${details.deviceId}.`)
        if (pin) {
          response.pin = pin
          response.confirmed = true
        } else {
          response.confirmed = false
        }
      }
    }
  
    window.electronAPI.bluetoothPairingResponse(response)
  })

  */
