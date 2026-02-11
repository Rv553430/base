'use client'

import { NFTContract } from '@/lib/contractUtils'
import { EarlyScore } from '@/lib/scoreCalculator'
import ScoreBadge from './ScoreBadge'
import { useState, useEffect } from 'react'

interface NFTCardProps {
  contract: NFTContract
  score: EarlyScore | null
}

export default function NFTCard({ contract, score }: NFTCardProps) {
  const [imageError, setImageError] = useState(false)

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  const formatSupply = (supply: bigint) => {
    return supply.toString()
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden hover:border-gray-700 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/10">
      {/* Image Container */}
      <div className="relative aspect-square bg-gray-800">
        {contract.metadata?.image && !imageError ? (
          <img
            src={contract.metadata.image}
            alt={contract.metadata.name || contract.name}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
            <span className="text-6xl">🎨</span>
          </div>
        )}
        
        {/* Score Badge */}
        {score && (
          <div className="absolute top-3 right-3">
            <ScoreBadge score={score.score} />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div>
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
          className="text-xs text-blue-400 hover:text-blue-300 font-mono block mb-3"
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
            <p className="font-semibold text-white text-xs">
              {formatAddress(contract.lastMinter)}
            </p>
          </div>
        </div>

        {/* Description */}
        {contract.metadata?.description && (
          <p className="text-sm text-gray-400 line-clamp-2 mb-3">
            {contract.metadata.description}
          </p>
        )}

        {/* Score Reasons */}
        {score && score.reasons.length > 0 && (
          <div className="space-y-1">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Score Factors
            </p>
            <div className="flex flex-wrap gap-1">
              {score.reasons.slice(0, 3).map((reason, idx) => (
                <span
                  key={idx}
                  className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded-full"
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
          className="mt-4 block w-full text-center bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold py-2 rounded-lg transition-all"
        >
          View Details
        </a>
      </div>
    </div>
  )
}