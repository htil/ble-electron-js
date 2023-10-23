import { BLE } from "./ble.js"
import { Signal } from "./signal.js"
import { MuseGraph } from "./muse-graph.js"
import { Events } from "./events.js"
import { FeatureExtractor } from "./feature-extractor.js"
import {BandPowerPlot} from "./band-power-plot.js"
import {BandPowerLineGraph} from "./bp-line-graph.js"

export const NeuroScope = class {
    constructor() {
        this.muse_visualizer = new MuseGraph("graph", window.innerWidth * 0.8, window.innerHeight * 0.5, 256 * 2, 1)
        this.graph_handlers = {"muse": this.muse_visualizer}
        this.signal_handler = new Signal(this.graph_handlers, 512)
        this.feature_extractor = new FeatureExtractor(512);
        this.ble = new BLE(this.signal_handler.add_data.bind(this.signal_handler))
        this.events = new Events(this.muse_visualizer, this.ble)
        //this.bp_plot = BandPowerPlot("bpGraph", "x_axis_bp", "y_axis_bp", window.innerWidth * 0.2, window.innerWidth * 0.05, 4)
        this.bp_line_plot = BandPowerLineGraph("bp-chart", "beta", 1000)

        /*
        setInterval(() => {
            //var tp9Data = [ { x: 0, y: 20 }, { x: 1, y: 10 }, { x: 2, y: 30 }, { x: 3, y: 10 }]
            //this.bp_plot.series[0].data = tp9Data
            //this.bp_plot.render()
            var data = { beta: Math.floor(Math.random() * 40) + 120 };
            this.bp_line_plot.series.addData(data);
            this.bp_line_plot.render()
            console.log("render")
        }, 1000)

        */

        setInterval(() => {
            let data = this.signal_handler.get_data()
            let beta = this.feature_extractor.getRelativeBandPower(data[0], "beta")
            this.bp_line_plot.series.addData({beta});
            this.bp_line_plot.render()
            //console.log(out)
        }, 500);
        
        
        
    }
}

let neuroScope = new NeuroScope()