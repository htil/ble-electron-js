export const FeatureExtractor = class {
    constructor(sample_rate=256, lowFreq=7, highFreq=30, filterOrder=128) {
        this.bci = window.bci
        this.sampleRate = sample_rate;
        this.lowFreq = lowFreq;
        this.highFreq = highFreq;
        this.filterOrder = filterOrder;
        this.firCalculator = new Fili.FirCoeffs();
        this.coeffs = this.firCalculator.bandpass({
          order: this.filterOrder,
          Fs: this.sampleRate,
          F1: this.lowFreq,
          F2: this.highFreq,
        });
        this.filter = new Fili.FirFilter(this.coeffs);
        //console.log(this.bci)
        //console.log(this.filter)
    }

    getBandPower(channel, band)  {
        if (!channel) return 
        this.filter.simulate(channel);
        let psd = window.bci.signal.getPSD(this.sampleRate, channel);
        psd.shift();
        let bp = window.bci.signal.getBandPower(channel.length, psd, this.sampleRate, band);
        return {psd, bp};
    };

    getRelativeBandPower (channel, band){
        if(!channel) return
        var target = this.getBandPower(channel, band).bp;
        var delta = this.getBandPower(channel, "delta").bp;
        var theta = this.getBandPower(channel, "theta").bp;
        var alpha = this.getBandPower(channel, "alpha").bp;
        var beta = this.getBandPower(channel, "beta").bp;
        var gamma = this.getBandPower(channel, "beta").bp;
        //console.log({delta, theta, alpha, beta, gamma})
        return target / (delta + theta + alpha + beta + gamma);
      };
}