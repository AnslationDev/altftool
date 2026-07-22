
import { COLORS, PIECES } from '../logic/Constants';

// Standard Staunton-style SVG paths
// Credit: Wikimedia Commons (Standard Chess Pieces)

export const Piece = ({ type, color }) => {
    if (!type) return null;

    const isWhite = color === COLORS.WHITE;
    const fill = isWhite ? "#ffffff" : "#1a1a1a";
    const stroke = isWhite ? "#1a1a1a" : "#ffffff";
    const dropShadow = "drop-shadow-[0_4px_3px_rgba(0,0,0,0.3)]";

    // Standard set of SVGs commonly used in web chess
    // I will render them explicitly here using paths.

    // King
    if (type === PIECES.KING) {
        return (
            <svg viewBox="0 0 45 45" className={`w-full h-full ${dropShadow} transition-transform hover:scale-105 duration-200`}>
                <g fill="none" fillRule="evenodd" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22.5 11.63V6M20 8h5" strokeLinejoin="miter" stroke={stroke} />
                    <path d="M22.5 25s4.5-7.5 3-10.5c0 0-1-2.5-3-2.5s-3 2.5-3 2.5c-1.5 3 3 10.5 3 10.5" fill={fill} stroke={stroke} />
                    <path d="M11.5 37c5.5 3.5 15.5 3.5 21 0v-7s9-4.5 6-10.5c-4-1-5 2-8 2s-4-1-9-1-5 2-8 2-4.5-5 2.5-12.5v12.5c0 3 0 7 3.5 14.5" fill={fill} stroke={stroke} />
                    <path d="M11.5 30c5.5-3 15.5-3 21 0M11.5 33.5c5.5-3 15.5-3 21 0M11.5 37c5.5-3 15.5-3 21 0" fill="none" stroke={stroke} />
                </g>
            </svg>
        );
    }

    // Queen
    if (type === PIECES.QUEEN) {
        return (
            <svg viewBox="0 0 45 45" className={`w-full h-full ${dropShadow} transition-transform hover:scale-105 duration-200`}>
                <g fillRule="evenodd" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <g fill={fill} stroke={stroke}>
                        <path d="M8 12a2 2 0 1 1-4 0a2 2 0 1 1 4 0M24.5 7.5a2 2 0 1 1-4 0a2 2 0 1 1 4 0M41 12a2 2 0 1 1-4 0a2 2 0 1 1 4 0M10.5 20.5a2 2 0 1 1-4 0a2 2 0 1 1 4 0M38.5 20.5a2 2 0 1 1-4 0a2 2 0 1 1 4 0" />
                        <path d="M9 26c8.5-1.5 21-1.5 27 0l2-12l-11 11l-5.5-13.5l-5.5 13.5l-11-11l2 12" />
                        <path d="M9 26c0 2 1.5 2 2.5 4l1 1c.5-1.5.5-3.5.5-6h-2c-.5 0-1.5.5-1.5 1" />
                        <path d="M36 26c0 2-1.5 2-2.5 4l-1 1c-.5-1.5-.5-3.5-.5-6h2c.5 0 1.5.5 1.5 1" />
                        <path d="M11.5 30c3.5-1 18.5-1 22 0M12 33.5c6-1 15-1 21 0" fill="none" />
                    </g>
                </g>
            </svg>
        );
    }

    // Rook
    if (type === PIECES.ROOK) {
        return (
            <svg viewBox="0 0 45 45" className={`w-full h-full ${dropShadow} transition-transform hover:scale-105 duration-200`}>
                <g fillRule="evenodd" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <g fill={fill} stroke={stroke}>
                        <path d="M9 39h27v-3H9v3zM12 36v-4h21v4H12zM11 14V9h4v2h5V9h5v2h5V9h4v5" strokeLinejoin="miter" />
                        <path d="M34 14l-3 3H14l-3-3" />
                        <path d="M31 17v12.5c0 1.5-1.5 3-4.5 3h-8c-3 0-4.5-1.5-4.5-3V17" />
                        <path d="M31 29.5l1.5 2.5h-20l1.5-2.5" />
                        <path d="M11 14h23" fill="none" strokeLinejoin="miter" stroke={stroke} />
                    </g>
                </g>
            </svg>
        );
    }

    // Bishop
    if (type === PIECES.BISHOP) {
        return (
            <svg viewBox="0 0 45 45" className={`w-full h-full ${dropShadow} transition-transform hover:scale-105 duration-200`}>
                <g fillRule="evenodd" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <g fill={fill} stroke={stroke}>
                        <path d="M9 36c3.39-.97 9.11-1.45 13.5-1.45 4.38 0 10.11.48 13.5 1.45V32H9v4z" />
                        <path d="M15 32c2.5 2.5 12.5 2.5 15 0 .5-1.5 0-2 0-2 0-2.5-2.5-4-2.5-4 5.5-1.5 6-11.5-5-15.5-11 4-10.5 14-5 15.5 0 0-2.5 1.5-2.5 4 0 0-.5.5 0 2z" />
                        <path d="M25 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 1 1 5 0z" />
                    </g>
                    <path d="M17.5 26h10M15 30h15M22.5 15.5v5M20 18h5" fill="none" stroke={stroke} strokeLinejoin="miter" />
                </g>
            </svg>
        );
    }

    // Knight
    if (type === PIECES.KNIGHT) {
        return (
            <svg viewBox="0 0 45 45" className={`w-full h-full ${dropShadow} transition-transform hover:scale-105 duration-200`}>
                <g fillRule="evenodd" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <g fill={fill} stroke={stroke}>
                        <path d="M 22,10 C 32.5,11 38.5,18 38,39 L 15,39 C 15,30 25,32.5 23,18" />
                        <path d="M 24,18 C 24.38,20.91 18.45,25.37 16,27 C 13,29 13.18,31.34 11,31 C 9.958,30.06 12.41,27.96 11,28 C 10,28 11.19,29.23 10,30 C 9,30 5.997,31 6,26 C 6,24 12,14 12,14 C 12,14 13.89,12.1 14,10.5 C 13.27,9.506 13.5,8.5 13.5,7.5 C 14.5,6.5 16.5,10 16.5,10 L 18.5,10 C 18.5,10 19.28,8.008 21,7 C 22,7 22,10 22,10" />
                    </g>
                    <path d="M 9.5 25.5 A 0.5 0.5 0 1 1 8.5,25.5 A 0.5 0.5 0 1 1 9.5 25.5 z" fill={stroke} stroke={stroke} />
                    <path d="M 15 15.5 A 0.5 1.5 0 1 1 14,15.5 A 0.5 1.5 0 1 1 15 15.5 z" transform="matrix(0.866,0.5,-0.5,0.866,9.693,-5.173)" fill={stroke} stroke={stroke} />
                </g>
            </svg>
        );
    }

    // Pawn
    if (type === PIECES.PAWN) {
        return (
            <svg viewBox="0 0 45 45" className={`w-full h-full ${dropShadow} transition-transform hover:scale-105 duration-200`}>
                <g fillRule="evenodd" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M 22,9 C 19.79,9 18,10.79 18,13 C 18,13.89 18.29,14.71 18.78,15.38 C 16.83,16.5 15.5,18.59 15.5,21 C 15.5,23.03 16.44,24.84 17.91,26.03 C 14.91,27.09 10.5,31.58 10.5,39.5 L 33.5,39.5 C 33.5,31.58 29.09,27.09 26.09,26.03 C 27.56,24.84 28.5,23.03 28.5,21 C 28.5,18.59 27.17,16.5 25.22,15.38 C 25.71,14.71 26,13.89 26,13 C 26,10.79 24.21,9 22,9 z " fill={fill} stroke={stroke} />
                </g>
            </svg>
        );
    }

    return null;
};
