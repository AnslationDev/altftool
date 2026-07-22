export class InputManager {
    constructor() {
        this.keys = {
            left: false,
            right: false
        };
        this.touchStartX = null;
        this.callbacks = {
            onLeft: () => {},
            onRight: () => {}
        };

        this.init();
    }

    init() {
        // Keyboard
        window.addEventListener('keydown', this.handleKeyDown.bind(this));
        window.addEventListener('keyup', this.handleKeyUp.bind(this));
    }

    handleKeyDown(e) {
        if (e.repeat) return;

        if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
            this.keys.left = true;
            this.callbacks.onLeft();
        }
        if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
            this.keys.right = true;
            this.callbacks.onRight();
        }
    }

    handleKeyUp(e) {
        if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
            this.keys.left = false;
        }
        if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
            this.keys.right = false;
        }
    }

    // Touch logic (called from Game component to use React's event normalization if preferred,
    // or we can attach here. Let's provide a method to be called by Game.jsx's onTouchStart)
    handleTouch(clientX, screenWidth) {
        if (clientX < screenWidth / 2) {
            this.callbacks.onLeft();
        } else {
            this.callbacks.onRight();
        }
    }

    setCallbacks(onLeft, onRight) {
        this.callbacks.onLeft = onLeft;
        this.callbacks.onRight = onRight;
    }

    cleanup() {
        window.removeEventListener('keydown', this.handleKeyDown.bind(this));
        window.removeEventListener('keyup', this.handleKeyUp.bind(this));
    }
}
