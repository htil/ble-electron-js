import { MuseDataCapture } from "./muse-data-capture.js"

/*
let handle_eeg_data = (sample) => {
    console.log(sample)
}
*/
let main = () => {
    let dc = new MuseDataCapture("bluetooth", (sample) => console.log(sample))
}

main()