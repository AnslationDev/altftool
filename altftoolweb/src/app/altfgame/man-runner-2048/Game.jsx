
'use client';

export default function Game() {
    return (
        <div style={{
            width: '100%',
            height: '100%',
            background: 'black',
            overflow: 'hidden'
        }}>
            <iframe
                src="https://www.miniplay.com/embed/man-runner-2048"
                style={{
                    width: '100%',
                    height: '100%',
                    border: 'none'
                }}
                allow="autoplay; payment; fullscreen; microphone; gamepad; clipboard-read; clipboard-write; accelerometer; gyroscope;"
                allowFullScreen
                sandbox="allow-forms allow-modals allow-orientation-lock allow-pointer-lock allow-presentation allow-scripts allow-same-origin allow-downloads allow-popups allow-popups-to-escape-sandbox"
                title="Man Runner 2048"
                loading="lazy"
            />
        </div>
    );
}
