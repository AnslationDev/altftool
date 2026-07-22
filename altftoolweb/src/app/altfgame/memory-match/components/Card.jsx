
const Card = ({ card, onClick, disabled }) => {
    return (
        <div
            className={`
                relative aspect-[3/4] cursor-pointer select-none
                transform transition-transform duration-200 active:scale-95
                ${disabled ? 'cursor-not-allowed' : 'hover:scale-105'}
            `}
            onClick={() => !disabled && onClick(card)}
        >
            <div
                className={`
                    w-full h-full transition-all duration-500
                    [transform-style:preserve-3d]
                    ${card.isFlipped || card.isMatched ? '[transform:rotateY(180deg)]' : ''}
                `}
            >
                {/* Card Back (Face Down) - The Pattern */}
                <div
                    className="
                        absolute inset-0 w-full h-full
                        bg-gradient-to-br from-indigo-600 to-purple-700
                        rounded-xl shadow-lg border-2 border-indigo-400/30
                        flex items-center justify-center
                        [backface-visibility:hidden]
                    "
                >
                    <span className="text-4xl opacity-20">?</span>
                </div>

                {/* Card Front (Face Up) - The Emoji */}
                <div
                    className={`
                        absolute inset-0 w-full h-full
                        bg-white dark:bg-gray-800
                        rounded-xl shadow-xl border-2
                        ${card.isMatched ? 'border-green-500 shadow-green-500/50' : 'border-white/50'}
                        flex items-center justify-center
                        [backface-visibility:hidden] [transform:rotateY(180deg)]
                    `}
                >
                    <span className="text-4xl sm:text-5xl lg:text-6xl drop-shadow-md filter">
                        {card.value}
                    </span>

                    {/* Matched Indicator */}
                    {card.isMatched && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="absolute inset-0 bg-green-500/20 animate-pulse rounded-xl"></div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Card;
