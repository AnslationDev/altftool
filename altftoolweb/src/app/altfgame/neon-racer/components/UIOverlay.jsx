import { CONSTANTS } from '../logic/Constants';

export const UIOverlay = ({ gameState, score, isGameOver, onStart, onRestart }) => {
    return (
        <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-6 select-none font-mono">
            {/* Top HUD */}
            <div className="flex justify-between items-start text-white/90 drop-shadow-[0_0_10px_rgba(0,243,255,0.8)]">
                <div className="flex flex-col gap-1">
                    <div className="text-sm uppercase text-white/50 tracking-widest">Speed</div>
                    <div className="text-4xl font-bold font-mono tracking-tighter">
                        {Math.floor(score.speed)} <span className="text-sm text-white/50 ml-1">KPH</span>
                    </div>
                    {/* Speed Bar */}
                    <div className="w-32 h-1 bg-white/10 mt-1 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-cyan-400 transition-all duration-100 ease-out"
                            style={{ width: `${Math.min(100, (score.speed / CONSTANTS.GAME_SPEED_MAX) * 100)}%` }}
                        />
                    </div>
                </div>

                <div className="flex flex-col gap-1 text-right">
                    <div className="text-sm uppercase text-white/50 tracking-widest">Distance</div>
                    <div className="text-4xl font-bold font-mono tracking-tighter">
                        {(score.distance).toFixed(1)} <span className="text-sm text-white/50 ml-1">KM</span>
                    </div>
                    <div className="mt-2 text-xl text-yellow-400">
                        {Math.floor(score.score)} <span className="text-xs text-white/50">PTS</span>
                    </div>
                </div>
            </div>

            {/* Start Screen */}
            {gameState === 'START' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm pointer-events-auto">
                    <h2 className="text-6xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 drop-shadow-[0_0_20px_rgba(0,243,255,0.5)] mb-8">
                        NEON RACER
                    </h2>
                    <button
                        onClick={onStart}
                        className="px-8 py-4 bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xl rounded-none skew-x-[-10deg] transition-all hover:scale-110 active:scale-95 shadow-[0_0_20px_rgba(0,243,255,0.6)]"
                    >
                        START ENGINE
                    </button>
                    <p className="mt-6 text-white/50 text-sm">
                        ARROWS / WASD to Steer • TAP sides on Mobile
                    </p>
                </div>
            )}

            {/* Game Over Screen */}
            {isGameOver && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-md pointer-events-auto">
                    <h2 className="text-5xl font-bold text-red-500 mb-2 drop-shadow-[0_0_15px_rgba(255,0,0,0.8)]">CRASHED</h2>

                    <div className="flex flex-col gap-2 text-center mb-8">
                        <div className="text-2xl text-white">
                            SCORE: <span className="text-yellow-400 font-bold">{Math.floor(score.score)}</span>
                        </div>
                        <div className="text-sm text-white/50">
                            DISTANCE: {(score.distance).toFixed(1)} KM
                        </div>
                    </div>

                    <button
                        onClick={onRestart}
                        className="px-8 py-4 bg-white text-black font-bold text-xl hover:bg-gray-200 transition-all shadow-[0_0_20px_rgba(255,255,255,0.4)]"
                    >
                        RETRY
                    </button>
                </div>
            )}

            {/* Mobile Controls Hint (Bottom) */}
            {gameState === 'PLAYING' && (
                <div className="absolute bottom-10 left-0 right-0 flex justify-between px-8 opacity-20 pointer-events-none md:hidden">
                    <div className="w-16 h-16 border-2 border-white rounded-full flex items-center justify-center">
                        <span className="text-3xl">←</span>
                    </div>
                    <div className="w-16 h-16 border-2 border-white rounded-full flex items-center justify-center">
                        <span className="text-3xl">→</span>
                    </div>
                </div>
            )}
        </div>
    );
};
