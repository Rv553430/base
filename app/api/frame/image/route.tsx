import { NextRequest, NextResponse } from 'next/server'
import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const type = searchParams.get('type') || 'default'
    const count = searchParams.get('count') || '0'
    const score = searchParams.get('score') || ''

    return new ImageResponse(
      (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #0f0f1e 100%)',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            padding: '40px',
          }}
        >
          {/* Logo */}
          <div style={{ fontSize: 80, marginBottom: 20 }}>🎯</div>
          
          {/* Title */}
          <div
            style={{
              fontSize: 60,
              fontWeight: 'bold',
              background: 'linear-gradient(90deg, #a855f7, #ec4899)',
              backgroundClip: 'text',
              color: 'transparent',
              marginBottom: 20,
            }}
          >
            NFT Scout
          </div>
          
          {/* Description */}
          <div
            style={{
              fontSize: 32,
              color: '#9ca3af',
              textAlign: 'center',
              marginBottom: 30,
              maxWidth: '80%',
            }}
          >
            Discover Early NFTs on Base Blockchain
          </div>
          
          {/* Stats or Info */}
          {type === 'default' && (
            <div
              style={{
                display: 'flex',
                gap: '40px',
                marginTop: 20,
              }}
            >
              <div
                style={{
                  background: 'rgba(168, 85, 247, 0.2)',
                  padding: '20px 40px',
                  borderRadius: '16px',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: 48, fontWeight: 'bold', color: '#a855f7' }}>
                  🔍
                </div>
                <div style={{ fontSize: 24, color: '#fff', marginTop: 10 }}>
                  Track Mints
                </div>
              </div>
              <div
                style={{
                  background: 'rgba(236, 72, 153, 0.2)',
                  padding: '20px 40px',
                  borderRadius: '16px',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: 48, fontWeight: 'bold', color: '#ec4899' }}>
                  📊
                </div>
                <div style={{ fontSize: 24, color: '#fff', marginTop: 10 }}>
                  Early Score
                </div>
              </div>
              <div
                style={{
                  background: 'rgba(59, 130, 246, 0.2)',
                  padding: '20px 40px',
                  borderRadius: '16px',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: 48, fontWeight: 'bold', color: '#3b82f6' }}>
                  👛
                </div>
                <div style={{ fontSize: 24, color: '#fff', marginTop: 10 }}>
                  Check Wallet
                </div>
              </div>
            </div>
          )}
          
          {type === 'wallet' && count !== '0' && (
            <div
              style={{
                background: 'rgba(168, 85, 247, 0.2)',
                padding: '30px 60px',
                borderRadius: '20px',
                marginTop: 20,
              }}
            >
              <div style={{ fontSize: 36, color: '#fff' }}>
                Found <span style={{ color: '#a855f7', fontWeight: 'bold' }}>{count}</span> NFTs
              </div>
            </div>
          )}
          
          {score && (
            <div
              style={{
                background: 'linear-gradient(90deg, #a855f7, #ec4899)',
                padding: '20px 50px',
                borderRadius: '50px',
                marginTop: 30,
              }}
            >
              <div style={{ fontSize: 48, fontWeight: 'bold', color: '#fff' }}>
                Early Score: {score}/100
              </div>
            </div>
          )}
          
          {/* Footer */}
          <div
            style={{
              position: 'absolute',
              bottom: 30,
              fontSize: 20,
              color: '#6b7280',
            }}
          >
            base-phi-tan.vercel.app
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 628,
      }
    )
  } catch (error) {
    console.error('Error generating frame image:', error)
    return new NextResponse('Error generating image', { status: 500 })
  }
}