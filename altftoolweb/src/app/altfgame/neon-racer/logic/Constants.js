export const CONSTANTS = {
    // Game Settings
    GAME_SPEED_MIN: 600,
    GAME_SPEED_MAX: 1800,
    LANE_COUNT: 4,

    // Dimensions (Relative)
    PLAYER_WIDTH_RATIO: 0.15, // % of lane width
    PLAYER_LENGTH_RATIO: 0.25, // % of lane width (makes it rectangular)

    // Colors (Neon Palette)
    COLORS: {
        ROAD_BG: '#0b0b15',
        LANE_LINE: 'rgba(255, 255, 255, 0.1)',
        LANE_ACTIVE: 'rgba(0, 243, 255, 0.2)',

        PLAYER_BODY: '#00f3ff', // Cyan
        PLAYER_GLOW: '#00f3ff',

        ENEMY_SLOW: '#ff0055', // Red
        ENEMY_FAST: '#cc00ff', // Purple
        ENEMY_CRAZY: '#00ff99', // Green

        TEXT_PRIMARY: '#ffffff',
        TEXT_ACCENT: '#00f3ff'
    },

    // Physics
    LANE_SWITCH_SPEED: 15,
    COLLISION_BOX_SCALE: 0.8, // Hitbox slightly smaller than sprite

    // Spawning
    SPAWN_INITIAL_DELAY: 1000,
    SPAWN_MIN_INTERVAL: 400
};
