export default function Game() {
    return (
        <div style={{ width: '100%', height: '100%', minHeight: '600px', position: 'relative' }}>
            <iframe
                src="https://games.crazygames.com/en_US/dog-simulator-3d/index.html?v=1.351"
                width="100%"
                height="100%"
                style={{ border: 'none', borderRadius: '12px', minHeight: '600px', display: 'block' }}
                allowFullScreen
                title="Dog Simulator 3D"
                allow="autoplay; fullscreen"
            ></iframe>
        </div>
    );
}
