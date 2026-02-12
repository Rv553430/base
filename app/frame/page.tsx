import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'NFT Scout Frame',
  description: 'NFT Scout Farcaster Frame',
  other: {
    'fc:frame': 'vNext',
    'fc:frame:image': 'https://base-phi-tan.vercel.app/api/frame/image',
    'fc:frame:image:aspect_ratio': '1.91:1',
    'fc:frame:post_url': 'https://base-phi-tan.vercel.app/api/frame',
    'fc:frame:button:1': '🔍 Discover NFTs',
    'fc:frame:button:1:action': 'post',
    'fc:frame:button:1:target': 'https://base-phi-tan.vercel.app/api/frame',
    'fc:frame:button:2': '👛 Check Wallet',
    'fc:frame:button:2:action': 'post',
    'fc:frame:button:2:target': 'https://base-phi-tan.vercel.app/api/frame/wallet',
    'fc:frame:button:3': '🌐 Open App',
    'fc:frame:button:3:action': 'link',
    'fc:frame:button:3:target': 'https://base-phi-tan.vercel.app',
    'fc:frame:input:text': 'Enter wallet address (0x...)',
  },
}

export default function FramePage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center p-8">
      <div className="text-6xl mb-6">🎯</div>
      <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
        NFT Scout
      </h1>
      <p className="text-gray-400 text-lg mb-8 text-center max-w-md">
        This page is configured as a Farcaster Frame.
      </p>
      
      <div className="bg-gray-900 rounded-xl p-8 max-w-lg w-full">
        <h2 className="text-xl font-semibold mb-4">Frame Actions</h2>
        <ul className="space-y-3 text-gray-300">
          <li className="flex items-center gap-2">
            <span>🔍</span>
            <span>Discover NFTs - Browse latest mints</span>
          </li>
          <li className="flex items-center gap-2">
            <span>👛</span>
            <span>Check Wallet - Enter any address</span>
          </li>
          <li className="flex items-center gap-2">
            <span>🌐</span>
            <span>Open App - Launch full application</span>
          </li>
        </ul>
        
        <div className="mt-8 p-4 bg-gray-800 rounded-lg">
          <p className="text-sm text-gray-400 mb-2">Share this URL on Warpcast:</p>
          <code className="text-purple-400 break-all">
            https://base-phi-tan.vercel.app/frame
          </code>
        </div>
      </div>
      
      <a 
        href="/" 
        className="mt-8 text-purple-400 hover:text-purple-300 transition-colors"
      >
        ← Back to App
      </a>
    </div>
  )
}