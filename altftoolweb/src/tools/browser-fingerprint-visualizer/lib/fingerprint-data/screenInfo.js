

export function getScreenInfo() {

  const screenWidth = screen.width || 0;
  const screenHeight = screen.height || 0;

 
  const availWidth = screen.availWidth || 0;
  const availHeight = screen.availHeight || 0;


  const viewportWidth = window.innerWidth || 0;
  const viewportHeight = window.innerHeight || 0;

 
  const outerWidth = window.outerWidth || 0;
  const outerHeight = window.outerHeight || 0;

  // --- Color Depth ---

  const colorDepth = screen.colorDepth || 0;
  const pixelDepth = screen.pixelDepth || 0;

  // --- Device Pixel Ratio ---

  const devicePixelRatio = window.devicePixelRatio || 1;

  // --- Screen Orientation ---
 
  const orientation = screen.orientation
    ? {
        type: screen.orientation.type,
        angle: screen.orientation.angle,
      }
    : { type: "Unknown", angle: 0 };

  // --- Window Position on Screen ---

  const windowX = window.screenX || window.screenLeft || 0;
  const windowY = window.screenY || window.screenTop || 0;

  // Calculated fields
  const taskbarHeight = screenHeight - availHeight;
  const isRetina = devicePixelRatio >= 2;

  const rawValue = [
    screenWidth,
    screenHeight,
    colorDepth,
    devicePixelRatio,
    orientation.type,
  ].join("|");

  return {
    // Screen
    screenWidth,
    screenHeight,
    availWidth,
    availHeight,
    // Viewport
    viewportWidth,
    viewportHeight,
    outerWidth,
    outerHeight,
    // Display
    colorDepth,
    pixelDepth,
    devicePixelRatio,
    isRetina,
    // Orientation
    orientation,
    // Position
    windowX,
    windowY,
    // Calculated
    taskbarHeight,
    rawValue,
  };
}