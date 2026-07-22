
// Sound Manager using a Singleton AudioContext pattern
class SoundManager {
    constructor() {
        this.ctx = null;
    }

    init() {
        if (!this.ctx && typeof window !== 'undefined') {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) {
                this.ctx = new AudioContext();
            }
        }
    }

    play(type) {
        if (!this.ctx) this.init();
        if (!this.ctx) return;

        // Browser policy: resume context if suspended (requires user interaction first)
        if (this.ctx.state === 'suspended') {
            this.ctx.resume().catch(() => {});
        }

        try {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const now = this.ctx.currentTime;

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            switch (type) {
                case 'paddle':
                    // Ping sound
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(400, now);
                    osc.frequency.exponentialRampToValueAtTime(600, now + 0.1);
                    gain.gain.setValueAtTime(0.3, now);
                    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
                    osc.start(now);
                    osc.stop(now + 0.1);
                    break;

                case 'wall':
                    // Thud sound
                    osc.type = 'triangle';
                    osc.frequency.setValueAtTime(200, now);
                    gain.gain.setValueAtTime(0.2, now);
                    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
                    osc.start(now);
                    osc.stop(now + 0.1);
                    break;

                case 'brick':
                    // High pitch ping
                    osc.type = 'square';
                    osc.frequency.setValueAtTime(600, now);
                    osc.frequency.exponentialRampToValueAtTime(800, now + 0.1);
                    gain.gain.setValueAtTime(0.1, now);
                    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
                    osc.start(now);
                    osc.stop(now + 0.1);
                    break;

                case 'lose':
                    // Descending tone
                    osc.type = 'sawtooth';
                    osc.frequency.setValueAtTime(300, now);
                    osc.frequency.linearRampToValueAtTime(100, now + 0.5);
                    gain.gain.setValueAtTime(0.3, now);
                    gain.gain.linearRampToValueAtTime(0.01, now + 0.5);
                    osc.start(now);
                    osc.stop(now + 0.5);
                    break;

                case 'win':
                    // Ascending fanfare-ish
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(400, now);
                    osc.frequency.setValueAtTime(600, now + 0.1);
                    osc.frequency.setValueAtTime(1000, now + 0.2);
                    gain.gain.setValueAtTime(0.2, now);
                    gain.gain.linearRampToValueAtTime(0.01, now + 0.6);
                    osc.start(now);
                    osc.stop(now + 0.6);
                    break;

                default:
                    break;
            }
        } catch (e) {
            console.error("Audio playback failed", e);
        }
    }
}

const soundManager = new SoundManager();

export const playSound = (type) => {
    soundManager.play(type);
};
