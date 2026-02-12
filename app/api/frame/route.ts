import { NextRequest, NextResponse } from 'next/server'

// Farcaster Frame API Route
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    
    // Log frame interaction for analytics
    console.log('Frame interaction:', {
      timestamp: new Date().toISOString(),
      action: body.untrustedData?.buttonIndex,
      input: body.untrustedData?.inputText,
      fid: body.untrustedData?.fid,
    })

    // Return frame HTML
    return new NextResponse(
      getFrameHtml({
        image: 'https://base-phi-tan.vercel.app/api/frame/image',
        buttons: [
          {
            label: '🔍 Discover NFTs',
            action: 'post',
            target: 'https://base-phi-tan.vercel.app/api/frame',
          },
          {
            label: '👛 Check Wallet',
            action: 'post',
            target: 'https://base-phi-tan.vercel.app/api/frame/wallet',
          },
          {
            label: '🌐 Open App',
            action: 'link',
            target: 'https://base-phi-tan.vercel.app',
          },
        ],
        input: {
          text: 'Enter wallet address (0x...)',
        },
      }),
      {
        headers: {
          'Content-Type': 'text/html',
        },
      }
    )
  } catch (error) {
    console.error('Frame error:', error)
    return new NextResponse('Error processing frame', { status: 500 })
  }
}

// Handle GET requests for frame metadata
export async function GET() {
  return NextResponse.json({
    name: 'NFT Scout',
    description: 'Discover early NFTs on Base blockchain',
    image: 'https://base-phi-tan.vercel.app/api/frame/image',
    external_link: 'https://base-phi-tan.vercel.app',
  })
}

// Helper function to generate frame HTML
function getFrameHtml({
  image,
  buttons,
  input,
  postUrl,
}: {
  image: string
  buttons: Array<{
    label: string
    action: string
    target?: string
  }>
  input?: { text: string }
  postUrl?: string
}) {
  const buttonHtml = buttons
    .map(
      (btn, i) =>
        `<meta property="fc:frame:button:${i + 1}" content="${btn.label}" />\n` +
        `<meta property="fc:frame:button:${i + 1}:action" content="${btn.action}" />` +
        (btn.target
          ? `\n<meta property="fc:frame:button:${i + 1}:target" content="${btn.target}" />`
          : '')
    )
    .join('\n')

  const inputHtml = input
    ? `<meta property="fc:frame:input:text" content="${input.text}" />`
    : ''

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta property="fc:frame" content="vNext" />
  <meta property="fc:frame:image" content="${image}" />
  <meta property="fc:frame:image:aspect_ratio" content="1.91:1" />
  <meta property="fc:frame:post_url" content="${postUrl || 'https://base-phi-tan.vercel.app/api/frame'}" />
  ${buttonHtml}
  ${inputHtml}
  <meta property="og:title" content="NFT Scout" />
  <meta property="og:description" content="Discover early NFTs on Base blockchain" />
  <meta property="og:image" content="${image}" />
  <title>NFT Scout - Farcaster Frame</title>
</head>
<body>
  <h1>NFT Scout</h1>
  <p>Discover early NFTs on Base blockchain</p>
</body>
</html>`
}