class AudioManager {
    constructor() {
        this.ctx = null;
        this.enabled = true;
    }

    init() {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        }
    }

    playTone(freq, type, duration, volume = 0.1) {
        if (!this.enabled || !this.ctx) return;

        // Resume context if suspended (browser autoplay policy)
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

        gain.gain.setValueAtTime(volume, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + duration);
    }

    playFlip() {
        // High pitched short blip
        this.playTone(600, 'sine', 0.1, 0.05);
    }

    playMatch() {
        // Happy ascending arpeggio
        if (!this.enabled || !this.ctx) return;
        this.playTone(400, 'sine', 0.1, 0.1);
        setTimeout(() => this.playTone(600, 'sine', 0.1, 0.1), 100);
        setTimeout(() => this.playTone(800, 'sine', 0.2, 0.1), 200);
    }

    playMismatch() {
        // Low dissonance
        if (!this.enabled || !this.ctx) return;
        this.playTone(300, 'triangle', 0.2, 0.1);
        setTimeout(() => this.playTone(250, 'triangle', 0.2, 0.1), 100);
    }

    playWin() {
        // Victory fanfare
        if (!this.enabled || !this.ctx) return;
        const now = this.ctx.currentTime;
        [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
            setTimeout(() => this.playTone(freq, 'square', 0.2, 0.05), i * 150);
        });
    }
}

export default new AudioManager();
