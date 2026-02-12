# Farcaster Frame Integration

This document explains the Farcaster Frame integration for NFT Scout.

## Overview

NFT Scout is now integrated with Farcaster Frames v2, allowing users to interact with the app directly from Farcaster casts.

## Features

- **Discover NFTs**: Browse the latest NFT mints on Base
- **Check Wallet**: Enter any wallet address to see NFT holdings
- **Open Full App**: Launch the complete web application
- **Dynamic Images**: Frame images update based on user actions

## Frame Configuration

### Manifest File
Located at: `.well-known/farcaster.json`

This file contains the frame metadata required by Farcaster:
- App name and description
- Icons and images
- Webhook URL for frame interactions
- Open Frames configuration

### Frame Actions

The frame supports three main actions:

1. **🔍 Discover NFTs** (`/api/frame`)
   - Shows featured NFTs
   - Provides navigation buttons

2. **👛 Check Wallet** (`/api/frame/wallet`)
   - Input field for wallet address
   - Validates and checks NFT holdings
   - Shows results

3. **🌐 Open App** (External Link)
   - Opens the full NFT Scout application
   - Maintains context (e.g., wallet address)

## API Endpoints

### `/api/frame` (POST)
Main frame endpoint for handling interactions.

### `/api/frame/image` (GET)
Dynamic image generation endpoint using Next.js ImageResponse.

**Query Parameters:**
- `type`: Image type (`default`, `wallet`, etc.)
- `count`: Number of NFTs found (for wallet view)
- `score`: Early Score value

### `/api/frame/wallet` (POST)
Wallet check endpoint with address validation.

## Testing the Frame

### Local Testing

1. Install the Farcaster Frame Debugger:
```bash
npm install -g @farcaster/frame-debugger
```

2. Run your app locally:
```bash
npm run dev
```

3. Test with the debugger:
```bash
frame-debugger http://localhost:3000
```

### Warpcast Testing

1. Deploy your app to production
2. Share the URL on Warpcast
3. The frame will automatically render

### Validation Checklist

- [ ] Frame loads correctly
- [ ] Buttons work as expected
- [ ] Input field accepts wallet addresses
- [ ] Images render properly (1.91:1 aspect ratio)
- [ ] Links open in browser
- [ ] Mobile responsive

## Frame Metadata

The frame metadata is embedded in the HTML `<head>` section via Next.js metadata API:

```html
<meta property="fc:frame" content="vNext" />
<meta property="fc:frame:image" content="https://base-phi-tan.vercel.app/api/frame/image" />
<meta property="fc:frame:button:1" content="🔍 Discover NFTs" />
<meta property="fc:frame:button:2" content="👛 Check Wallet" />
<meta property="fc:frame:button:3" content="🌐 Open App" />
<meta property="fc:frame:input:text" content="Enter wallet address (0x...)" />
```

## Customization

### Changing Buttons

Edit `app/layout.tsx` in the `metadata.other` section:

```typescript
'fc:frame:button:1': 'Your Button Text',
'fc:frame:button:1:action': 'post',
'fc:frame:button:1:target': 'https://your-url.com/api/frame',
```

### Changing Images

Update the image generation in `app/api/frame/image/route.tsx`:

```typescript
// Customize the visual appearance
<div style={{
  background: 'your-gradient',
  // ... other styles
}}>
```

### Adding New Actions

1. Create a new API route: `app/api/frame/[action]/route.ts`
2. Add the button metadata in `layout.tsx`
3. Handle the POST request

## Analytics

Frame interactions are logged to the console:

```javascript
{
  timestamp: "2024-...",
  action: 1,
  input: "0x...",
  fid: 12345
}
```

You can integrate with analytics services like:
- Google Analytics
- Mixpanel
- Segment
- Custom webhook

## Security Considerations

1. **Input Validation**: All wallet addresses are validated before processing
2. **HTTPS Only**: Frame requires HTTPS in production
3. **CORS Headers**: Configured for Farcaster compatibility
4. **Rate Limiting**: Consider adding rate limiting for frame endpoints

## Troubleshooting

### Frame Not Loading
- Check `.well-known/farcaster.json` is accessible
- Verify HTTPS is enabled
- Ensure proper CORS headers

### Images Not Rendering
- Check ImageResponse is working
- Verify image URL is accessible
- Confirm aspect ratio is 1.91:1

### Buttons Not Working
- Check POST endpoint returns proper HTML
- Verify button actions are correct
- Test with Frame Debugger

## Resources

- [Farcaster Frames Documentation](https://docs.farcaster.xyz/developers/frames/)
- [Frame Specification](https://docs.farcaster.xyz/reference/frames/spec)
- [Warpcast Frames](https://warpcast.com/~/developers/frames)

## Support

For issues or questions about the Farcaster integration:
- Check the [Farcaster Discord](https://discord.gg/farcaster)
- Review [Frame Examples](https://github.com/farcasterxyz/frames)
- Open an issue in this repository