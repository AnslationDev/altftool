# 🎮 Game Image Sizing Guide

To ensure your game cover images look perfect in the Bento Grid (Home/Games Page), follow these dimension and aspect ratio guidelines.

---

## 📏 Recommended Dimensions

The grid adapts to different screen sizes, so we use `object-cover`. This means images might be cropped to fill the space. Use these sizes for the best results:

### 1. Large Cards (2x2)
> Best for: Blockbuster games, complex artwork.
- **Recommended Size:** `1024 x 1024 px` (1:1 Aspect Ratio)
- **Why?** On desktop it's a large square (~1.3:1), but on mobile it's a tall rectangle (~1:2). A high-res square image ensures the main content stays visible in both.
- **Safe Zone:** Keep characters and text in the center 60%.

### 2. Medium Cards (2x1)
> Best for: Landscape-oriented scenes, racing games.
- **Recommended Size:** `1280 x 640 px` (2:1 Aspect Ratio)
- **Why?** On desktop, these cards are very wide. On mobile, they become standard units (~1:1). 
- **Safe Zone:** Keep all important elements (Title/Hero) in the center-middle.

### 3. Small Cards (1x1)
> Best for: Simple icons, minimalist patterns.
- **Recommended Size:** `600 x 600 px` (1:1 Aspect Ratio)
- **Why?** These cards are roughly square-ish on all devices. High-res icons look crisp.

---

## 💡 Pro Tips for "Proper Fix"

1. **The "Safe Zone" Rule**: 
   Since `object-cover` crops the edges, **never** put important text or icons near the absolute corners. Keep them in the center.

2. **Contrast & Readability**:
   The grid adds a dark gradient overlay at the bottom for the title. Ensure your image has enough contrast or clear space at the bottom so the game name is readable.

3. **File Format**:
   - Use **.webp** (best for performance) or high-quality **.png**.
   - If you can, use **.svg** for simple logos (like `aim-trainer-pro`).

4. **Consistency**:
   Try to use a consistent art style across your images to make the dashboard look premium.

---

## 🛠 How to Test
After adding an image to `/public/games/`, update `src/platform/registry/gameMap.js` with the correct path, then check both **Desktop** and **Mobile** views in your browser.
