# Image Assets Setup

## Created SVG Files

I've created 3 SVG files with the correct dimensions:

1. **icon.svg** (300×300px) - App icon
2. **splash.svg** (200×200px) - Splash screen
3. **screenshot.svg** (1284×2778px) - App screenshot

## Convert to PNG (Required)

Farcaster requires PNG format. Convert the SVG files using one of these methods:

### Option 1: Online Converter (Easiest)
1. Go to https://cloudconvert.com/svg-to-png
2. Upload each SVG file
3. Set dimensions:
   - icon.svg → 300×300px
   - splash.svg → 200×200px
   - screenshot.svg → 1284×2778px
4. Download PNG files
5. Rename to: `icon.png`, `splash.png`, `screenshot.png`
6. Place in `/public/` folder

### Option 2: Using Node.js
```bash
npm install -g svgexport

# Convert icon
svgexport public/icon.svg public/icon.png 300:300

# Convert splash
svgexport public/splash.svg public/splash.png 200:200

# Convert screenshot
svgexport public/screenshot.svg public/screenshot.png 1284:2778
```

### Option 3: Using Figma/Sketch
1. Import the SVG file
2. Export as PNG at specified dimensions
3. Save to `/public/` folder

### Option 4: Using ImageMagick
```bash
# Install ImageMagick first

# Convert all
convert public/icon.svg -resize 300x300 public/icon.png
convert public/splash.svg -resize 200x200 public/splash.png
convert public/screenshot.svg -resize 1284x2778 public/screenshot.png
```

## File Structure After Conversion

```
public/
├── icon.svg (300×300px) - Keep as backup
├── icon.png (300×300px) - Use this ✅
├── splash.svg (200×200px) - Keep as backup
├── splash.png (200×200px) - Use this ✅
├── screenshot.svg (1284×2778px) - Keep as backup
├── screenshot.png (1284×2778px) - Use this ✅
└── .well-known/
    └── farcaster.json
```

## Update References

After converting to PNG, update `farcaster.json`:

```json
{
  "frame": {
    "iconUrl": "https://base-phi-tan.vercel.app/icon.png",
    "splashImageUrl": "https://base-phi-tan.vercel.app/splash.png"
  },
  "screenshotUrls": [
    "https://base-phi-tan.vercel.app/screenshot.png"
  ],
  "heroImageUrl": "https://base-phi-tan.vercel.app/screenshot.png"
}
```

## Design Specifications

### Icon (300×300px)
- Hexagon shape with gradient (cyan → purple → pink)
- "NFT" text in center
- Rounded corners (60px radius)

### Splash (200×200px)
- Dark background (#0a0a0a)
- Centered icon (150×150px)
- Same gradient design

### Screenshot (1284×2778px)
- Mobile app mockup (iPhone size)
- Shows:
  - Header with logo
  - Main icon
  - Feature cards (Track Mints, Early Score, Check Wallet)
  - CTA button
  - Footer with URL

## Gradient Colors
- Start: `#06b6d4` (Cyan)
- Middle: `#8b5cf6` (Purple)
- End: `#ec4899` (Pink)

## Next Steps

1. Convert SVG → PNG using one of the methods above
2. Upload PNG files to `/public/` folder
3. Update `farcaster.json` to use `.png` extension
4. Deploy to Vercel
5. Test on Farcaster