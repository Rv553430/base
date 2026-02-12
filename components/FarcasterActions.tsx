'use client'

import { useMiniapp } from '@/app/miniapp-provider'
import { useEffect, useState } from 'react'

interface ShareButtonProps {
  title?: string
  text?: string
  embeds?: string[]
}

export function ShareToFarcasterButton({ 
  title = 'Check out this NFT on NFT Scout!',
  text,
  embeds 
}: ShareButtonProps) {
  const { sdk, isReady } = useMiniapp()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleShare = async () => {
    if (!sdk) return

    try {
      await sdk.actions.share({
        title,
        text: text || 'Discover early NFTs on Base with NFT Scout 🎯',
        embeds: embeds || ['https://base-phi-tan.vercel.app'],
      })
    } catch (error) {
      console.error('Error sharing to Farcaster:', error)
      // Fallback to regular share
      window.open(
        `https://warpcast.com/~/compose?text=${encodeURIComponent(text || title)}&embeds[]=${encodeURIComponent(embeds?.[0] || 'https://base-phi-tan.vercel.app')}`,
        '_blank'
      )
    }
  }

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg opacity-50">
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"/>
        </svg>
        Share
      </button>
    )
  }

  if (!isReady || !sdk) {
    return (
      <button
        onClick={() => {
          window.open(
            `https://warpcast.com/~/compose?text=${encodeURIComponent(title)}&embeds[]=${encodeURIComponent(embeds?.[0] || 'https://base-phi-tan.vercel.app')}`,
            '_blank'
          )
        }}
        className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition-colors"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"/>
        </svg>
        Share
      </button>
    )
  }

  return (
    <button
      onClick={handleShare}
      className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition-colors"
    >
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"/>
      </svg>
      Share to Farcaster
    </button>
  )
}

interface AddFrameButtonProps {
  className?: string
}

export function AddFrameButton({ className = '' }: AddFrameButtonProps) {
  const { sdk, isReady } = useMiniapp()
  const [mounted, setMounted] = useState(false)
  const [isAdded, setIsAdded] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted || !sdk) return
    
    const checkFrameStatus = async () => {
      try {
        // Check if frame is already added
        const status = await sdk.actions.getFrameStatus()
        setIsAdded(status?.added || false)
      } catch (error) {
        console.log('Could not get frame status:', error)
      }
    }
    
    checkFrameStatus()
  }, [sdk, mounted])

  const handleAddFrame = async () => {
    if (!sdk) return

    try {
      await sdk.actions.addFrame()
      setIsAdded(true)
      console.log('Frame added successfully')
    } catch (error) {
      console.error('Error adding frame:', error)
    }
  }

  // Prevent hydration mismatch
  if (!mounted) {
    return null
  }

  if (!isReady || !sdk || isAdded) return null

  return (
    <button
      onClick={handleAddFrame}
      className={`px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-lg transition-all ${className}`}
    >
      ➕ Add to Farcaster
    </button>
  )
}