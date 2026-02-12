'use client'

import { NFTContract } from '@/lib/contractUtils'
import { EarlyScore } from '@/lib/scoreCalculator'
import ScoreBadge from './ScoreBadge'
import { useState, memo } from 'react'

interface NFTCardProps {
  contract: NFTContract
  score: EarlyScore | null
}

// Memoized formatter functions (defined outside component)
const formatAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`
const formatSupply = (supply: bigint) => supply.toString()

// Optimized Image Component with lazy loading
const LazyImage = memo(function LazyImage({ 
  src, 
  alt, 
  onError 
}: { 
  src: string
  alt: string
  onError: () => void 
}) {
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      className="w-full h-full object-cover"
      onError={onError}
    />
  )
})

// Main NFT Card Component (memoized)
const NFTCard = memo(function NFTCard({ contract, score }: NFTCardProps) {
  const [imageError, setImageError] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden hover:border-gray-700 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/10 will-change-transform">
      {/* Image Container */}
      <div className="relative aspect-square bg-gray-800">
        {/* Placeholder while loading */}
        {!imageLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900 animate-pulse">
            <span className="text-4xl opacity-50">🎨</span>
          </div>
        )}
        
        {contract.metadata?.image && !imageError ? (
          <LazyImage
            src={contract.metadata.image}
            alt={contract.metadata.name || contract.name}
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
            <span className="text-6xl">🎨</span>
          </div>
        )}
        
        {/* Score Badge */}
        {score && (
          <div className="absolute top-3 right-3 z-10">
            <ScoreBadge score={score.score} />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="min-w-0 flex-1">
            <h3 className="font-bold text-lg text-white truncate">
              {contract.name}
            </h3>
            <p className="text-gray-400 text-sm">{contract.symbol}</p>
          </div>
        </div>

        {/* Contract Address */}
        <a
          href={`https://basescan.org/address/${contract.address}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-blue-400 hover:text-blue-300 font-mono block mb-3 truncate"
        >
          {formatAddress(contract.address)}
        </a>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className="bg-gray-800 rounded-lg p-2">
            <p className="text-xs text-gray-500">Total Supply</p>
            <p className="font-semibold text-white">{formatSupply(contract.totalSupply)}</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-2">
            <p className="text-xs text-gray-500">Last Minter</p>
            <p className="font-semibold text-white text-xs truncate">
              {formatAddress(contract.lastMinter)}
            </p>
          </div>
        </div>

        {/* Description - only show if short */}
        {contract.metadata?.description && contract.metadata.description.length < 100 && (
          <p className="text-sm text-gray-400 line-clamp-2 mb-3">
            {contract.metadata.description}
          </p>
        )}

        {/* Score Reasons - limit to 2 for performance */}
        {score && score.reasons.length > 0 && (
          <div className="space-y-1">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Score Factors
            </p>
            <div className="flex flex-wrap gap-1">
              {score.reasons.slice(0, 2).map((reason, idx) => (
                <span
                  key={idx}
                  className="text-xs bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full"
                >
                  {reason}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* View Button */}
        <a
          href={`/nft/${contract.address}`}
          className="mt-4 block w-full text-center bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold py-2 rounded-lg transition-all active:scale-95"
        >
          View Details
        </a>
      </div>
    </div>
  )
})

export default NFTCard