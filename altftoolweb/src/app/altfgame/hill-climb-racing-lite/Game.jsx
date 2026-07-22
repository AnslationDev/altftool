export default function Game() {
    return (
        <div style={{ width: '100%', height: '100%', minHeight: '600px', position: 'relative' }}>
            <iframe
                src="https://html5.gamedistribution.com/ddcba9beafaf409ab581385023761cde/"
                width="100%"
                height="100%"
                style={{ border: 'none', borderRadius: '12px', minHeight: '600px', display: 'block' }}
                allowFullScreen
                title="Hill Climb Racing Lite"
                allow="autoplay; fullscreen"
            ></iframe>
        </div>
    );
}
