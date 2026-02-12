import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const inputText = body.untrustedData?.inputText || ''
    
    // Validate wallet address
    const isValidAddress = /^0x[a-fA-F0-9]{40}$/.test(inputText)
    
    if (!isValidAddress && inputText) {
      return new NextResponse(
        getFrameHtml({
          image: 'https://base-phi-tan.vercel.app/api/frame/image',
          buttons: [
            {
              label: 'Try Again',
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
            text: 'Enter valid wallet address (0x...)',
          },
          message: '❌ Invalid wallet address',
        }),
        {
          headers: { 'Content-Type': 'text/html' },
        }
      )
    }
    
    // If no input, show input field
    if (!inputText) {
      return new NextResponse(
        getFrameHtml({
          image: 'https://base-phi-tan.vercel.app/api/frame/image?type=wallet',
          buttons: [
            {
              label: 'Check Wallet',
              action: 'post',
              target: 'https://base-phi-tan.vercel.app/api/frame/wallet',
            },
            {
              label: '🔍 Discover',
              action: 'post',
              target: 'https://base-phi-tan.vercel.app/api/frame',
            },
          ],
          input: {
            text: 'Enter wallet address (0x...)',
          },
        }),
        {
          headers: { 'Content-Type': 'text/html' },
        }
      )
    }
    
    // Wallet check would go here - for now show success message
    return new NextResponse(
      getFrameHtml({
        image: `https://base-phi-tan.vercel.app/api/frame/image?type=wallet&count=3`,
        buttons: [
          {
            label: '🔄 Check Another',
            action: 'post',
            target: 'https://base-phi-tan.vercel.app/api/frame/wallet',
          },
          {
            label: '🔍 Discover',
            action: 'post',
            target: 'https://base-phi-tan.vercel.app/api/frame',
          },
          {
            label: '🌐 View in App',
            action: 'link',
            target: `https://base-phi-tan.vercel.app/wallet`,
          },
        ],
        message: `✅ Checked: ${inputText.slice(0, 6)}...${inputText.slice(-4)}`,
      }),
      {
        headers: { 'Content-Type': 'text/html' },
      }
    )
  } catch (error) {
    console.error('Wallet frame error:', error)
    return new NextResponse('Error processing wallet check', { status: 500 })
  }
}

export async function GET() {
  return new NextResponse(
    getFrameHtml({
      image: 'https://base-phi-tan.vercel.app/api/frame/image?type=wallet',
      buttons: [
        {
          label: 'Check Wallet',
          action: 'post',
          target: 'https://base-phi-tan.vercel.app/api/frame/wallet',
        },
        {
          label: '🔍 Discover',
          action: 'post',
          target: 'https://base-phi-tan.vercel.app/api/frame',
        },
      ],
      input: {
        text: 'Enter wallet address (0x...)',
      },
    }),
    {
      headers: { 'Content-Type': 'text/html' },
    }
  )
}

function getFrameHtml({
  image,
  buttons,
  input,
  message,
}: {
  image: string
  buttons: Array<{
    label: string
    action: string
    target?: string
  }>
  input?: { text: string }
  message?: string
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
  <meta property="fc:frame:post_url" content="https://base-phi-tan.vercel.app/api/frame/wallet" />
  ${buttonHtml}
  ${inputHtml}
  <meta property="og:title" content="NFT Scout - Wallet Check" />
  <meta property="og:description" content="Check NFT holdings on Base" />
  <meta property="og:image" content="${image}" />
  <title>NFT Scout - Wallet Check</title>
  ${message ? `<style>body::before{content:"${message}";display:block;text-align:center;padding:20px;color:#a855f7;font-weight:bold;}</style>` : ''}
</head>
<body>
  <h1>NFT Scout</h1>
  <p>Check your NFT holdings on Base</p>
</body>
</html>`
}