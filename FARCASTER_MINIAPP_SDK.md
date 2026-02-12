# Farcaster Miniapp SDK Integration

This document explains the Farcaster Miniapp SDK integration for NFT Scout.

## Overview

NFT Scout now includes the official `@farcaster/miniapp-sdk` package for enhanced Farcaster integration and native app-like experiences within the Farcaster ecosystem.

## SDK Features

### 1. **Context Detection**
Automatically detects when running inside a Farcaster frame and initializes the SDK.

### 2. **Share to Farcaster**
Users can share NFT discoveries directly to Farcaster with the `ShareToFarcasterButton` component.

### 3. **Add Frame**
Users can add NFT Scout as a persistent frame in their Farcaster client with the `AddFrameButton`.

### 4. **User Context**
Access user information (when permission is granted) for personalized experiences.

## Files Added

### `app/miniapp-provider.tsx`
React context provider that initializes the Miniapp SDK and provides:
- `sdk`: MiniAppSDK instance
- `isReady`: Boolean indicating SDK initialization status
- `context`: Frame context information
- `user`: User information (if available)

### `components/FarcasterActions.tsx`
React components for Farcaster interactions:
- `ShareToFarcasterButton`: Share content to Farcaster
- `AddFrameButton`: Add frame to Farcaster client

### Updated Files
- `app/providers.tsx`: Added MiniappProvider wrapper
- `app/page.tsx`: Added Farcaster action buttons to header

## Usage

### Using the Hook

```tsx
import { useMiniapp } from '@/app/miniapp-provider'

function MyComponent() {
  const { sdk, isReady, context, user } = useMiniapp()
  
  if (isReady) {
    console.log('Running in Farcaster frame')
    console.log('User:', user)
    console.log('Context:', context)
  }
  
  return <div>...</div>
}
```

### Share Button

```tsx
import { ShareToFarcasterButton } from '@/components/FarcasterActions'

function NFTCard({ nft }) {
  return (
    <div>
      <h3>{nft.name}</h3>
      <ShareToFarcasterButton 
        title={`Check out ${nft.name}!`}
        text="Found this early NFT on Base"
        embeds={[`https://base-phi-tan.vercel.app/nft/${nft.address}`]}
      />
    </div>
  )
}
```

### Add Frame Button

```tsx
import { AddFrameButton } from '@/components/FarcasterActions'

function Header() {
  return (
    <header>
      <h1>NFT Scout</h1>
      <AddFrameButton />
    </header>
  )
}
```

## SDK Methods Available

When running inside a Farcaster frame, the SDK provides these actions:

### `sdk.actions.share(options)`
Share content to Farcaster.
```typescript
await sdk.actions.share({
  title: 'My NFT Discovery',
  text: 'Check out this NFT!',
  embeds: ['https://example.com/nft/123'],
})
```

### `sdk.actions.addFrame()`
Add the current app as a frame.
```typescript
await sdk.actions.addFrame()
```

### `sdk.actions.getFrameStatus()`
Check if the frame is already added.
```typescript
const status = await sdk.actions.getFrameStatus()
console.log(status.added) // true/false
```

### `sdk.getContext()`
Get frame context information.
```typescript
const context = await sdk.getContext()
```

### `sdk.getUser()`
Get user information (requires user permission).
```typescript
const user = await sdk.getUser()
```

## Configuration

The SDK is automatically configured. No additional setup is required beyond the installation:

```bash
npm install @farcaster/miniapp-sdk
```

## Testing

### Local Testing
1. Run the app locally: `npm run dev`
2. Use the [Farcaster Frame Debugger](https://warpcast.com/~/developers/frames)
3. Enter your local URL: `http://localhost:3000`

### Warpcast Testing
1. Deploy to production: `vercel --prod`
2. Share the URL on Warpcast
3. Interact with the frame buttons

## Fallback Behavior

The components are designed to work both inside and outside Farcaster:

- **Inside Farcaster**: Uses native SDK actions
- **Outside Farcaster**: Falls back to standard web share or opens Warpcast compose URL

This ensures the app works perfectly as a standalone web app and as a Farcaster frame.

## Events and Analytics

The SDK automatically logs:
- Frame initialization
- User actions (share, add frame)
- Context information

You can extend this by adding your own analytics:

```typescript
import { useMiniapp } from '@/app/miniapp-provider'

function useAnalytics() {
  const { isReady, context } = useMiniapp()
  
  useEffect(() => {
    if (isReady) {
      // Log to your analytics service
      analytics.track('Frame Loaded', {
        fid: context?.user?.fid,
        client: context?.client,
      })
    }
  }, [isReady, context])
}
```

## Security Considerations

1. **Untrusted Data**: Always validate data from `untrustedData` in frame POST requests
2. **Permissions**: User data requires explicit permission - handle gracefully when denied
3. **HTTPS**: Frame SDK only works over HTTPS in production
4. **Origin Validation**: Verify the frame is being called from authorized origins

## Troubleshooting

### SDK Not Initializing
- Check browser console for errors
- Verify app is running in an iframe (Farcaster frame)
- Ensure HTTPS is enabled

### Share Not Working
- Check if running inside Farcaster context
- Fallback will open Warpcast compose URL
- Verify embed URLs are valid and accessible

### Frame Actions Not Responding
- Check if user has granted permissions
- Handle promise rejections gracefully
- Provide fallback UI for unsupported actions

## Resources

- [Farcaster Miniapp SDK Documentation](https://docs.farcaster.xyz/)
- [Frame Specification](https://docs.farcaster.xyz/reference/frames/spec)
- [SDK GitHub Repository](https://github.com/farcasterxyz/miniapp-sdk)

## Support

For SDK-specific issues:
- [Farcaster Discord](https://discord.gg/farcaster)
- [GitHub Issues](https://github.com/farcasterxyz/miniapp-sdk/issues)

For NFT Scout integration questions:
- Check `FARCASTER_FRAME.md` for frame-specific documentation
- Open an issue in this repository