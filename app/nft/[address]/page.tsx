'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { NFTContract, NFTMetadata, getContractData, getTokenURI, fetchTokenMetadata, checkWalletNFTs } from '@/lib/contractUtils'
import { verifyERC721 } from '@/lib/contractUtils'
import { calculateEarlyScore, EarlyScore } from '@/lib/scoreCalculator'
import ScoreBadge from '@/components/ScoreBadge'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useAccount } from 'wagmi'
import { Address } from 'viem'

export default function NFTDetailPage() {
  const params = useParams()
  const address = params.address as string
  const { address: connectedAddress } = useAccount()
  
  const [contract, setContract] = useState<NFTContract | null>(null)
  const [score, setScore] = useState<EarlyScore | null>(null)
  const [loading, setLoading] = useState(true)
  const [ownedCount, setOwnedCount] = useState<number>(0)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchContractDetails = async () => {
      try {
        setLoading(true)
        
        // Verify it's ERC721
        const isERC721 = await verifyERC721(address as Address)
        if (!isERC721) {
          setError('This address is not a valid ERC721 NFT contract')
          setLoading(false)
          return
        }

        // Get contract data
        const contractData = await getContractData(address as Address)
        
        // Get a sample token URI and metadata
        let metadata: NFTMetadata | undefined
        if (contractData.totalSupply && contractData.totalSupply > 0) {
          const tokenURI = await getTokenURI(address as Address, BigInt(1))
          if (tokenURI) {
            metadata = await fetchTokenMetadata(tokenURI) || undefined
          }
        }

        const nftContract: NFTContract = {
          address: address as Address,
          name: contractData.name || 'Unknown',
          symbol: contractData.symbol || '???',
          totalSupply: contractData.totalSupply || BigInt(0),
          lastMintedTokenId: BigInt(1),
          lastMinter: '0x0000000000000000000000000000000000000000' as Address,
          mintBlock: BigInt(0),
          metadata,
          isVerified: true,
        }

        setContract(nftContract)

        // Calculate score
        const calculatedScore = await calculateEarlyScore(nftContract)
        setScore(calculatedScore)

        // Check if connected wallet owns any
        if (connectedAddress) {
          const owned = await checkWalletNFTs(connectedAddress, [address as Address])
          if (owned.includes(address as Address)) {
            // Get balance
            const { publicClient, erc721Abi } = await import('@/lib/rpcClient')
            const balance = await publicClient.readContract({
              address: address as Address,
              abi: erc721Abi,
              functionName: 'balanceOf',
              args: [connectedAddress],
            })
            setOwnedCount(Number(balance))
          }
        }
      } catch (err) {
        console.error('Error fetching contract:', err)
        setError('Failed to load contract details')
      } finally {
        setLoading(false)
      }
    }

    if (address) {
      fetchContractDetails()
    }
  }, [address, connectedAddress])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
          <p className="mt-4 text-gray-400">Loading contract...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 text-xl">{error}</p>
          <a href="/" className="mt-4 text-purple-400 hover:text-purple-300">
            ← Back to home
          </a>
        </div>
      </div>
    )
  }

  if (!contract) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <p className="text-gray-400">Contract not found</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <a href="/" className="flex items-center gap-3">
              <span className="text-3xl">🎯</span>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                NFT Scout
              </h1>
            </a>
            <ConnectButton />
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <a href="/" className="text-gray-400 hover:text-white mb-8 inline-block">
          ← Back to discovery
        </a>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Image */}
          <div className="aspect-square bg-gray-800 rounded-2xl overflow-hidden">
            {contract.metadata?.image ? (
              <img
                src={contract.metadata.image}
                alt={contract.metadata.name || contract.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
                <span className="text-8xl">🎨</span>
              </div>
            )}
          </div>

          {/* Details */}
          <div>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">{contract.name}</h1>
                <p className="text-xl text-gray-400">{contract.symbol}</p>
              </div>
              {score && (
                <ScoreBadge score={score.score} size="lg" />
              )}
            </div>

            <a
              href={`https://basescan.org/address/${contract.address}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-400 hover:text-purple-300 font-mono text-sm block mb-6"
            >
              {contract.address}
            </a>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-gray-800 rounded-xl p-4">
                <p className="text-gray-500 text-sm">Total Supply</p>
                <p className="text-2xl font-bold text-white">{contract.totalSupply.toString()}</p>
              </div>
              <div className="bg-gray-800 rounded-xl p-4">
                <p className="text-gray-500 text-sm">Your Balance</p>
                <p className="text-2xl font-bold text-white">{ownedCount}</p>
              </div>
            </div>

            {/* Description */}
            {contract.metadata?.description && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-white mb-2">Description</h3>
                <p className="text-gray-400 leading-relaxed">
                  {contract.metadata.description}
                </p>
              </div>
            )}

            {/* Score Breakdown */}
            {score && (
              <div className="bg-gray-800 rounded-xl p-6 mb-8">
                <h3 className="text-lg font-semibold text-white mb-4">Early Score Breakdown</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Supply Score</span>
                    <span className="text-white font-medium">{score.breakdown.supplyScore}/20</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Recency Score</span>
                    <span className="text-white font-medium">{score.breakdown.recencyScore}/20</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Velocity Score</span>
                    <span className="text-white font-medium">{score.breakdown.velocityScore}/20</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Verification Score</span>
                    <span className="text-white font-medium">{score.breakdown.verificationScore}/20</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Metadata Score</span>
                    <span className="text-white font-medium">{score.breakdown.diversityScore}/20</span>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-700">
                  <div className="flex justify-between">
                    <span className="text-white font-semibold">Total Score</span>
                    <span className="text-purple-400 font-bold text-xl">{score.score}/100</span>
                  </div>
                </div>
              </div>
            )}

            {/* Attributes */}
            {contract.metadata?.attributes && contract.metadata.attributes.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Attributes</h3>
                <div className="grid grid-cols-2 gap-3">
                  {contract.metadata.attributes.map((attr: any, idx: number) => (
                    <div key={idx} className="bg-gray-800 rounded-lg p-3">
                      <p className="text-xs text-gray-500 uppercase">{attr.trait_type}</p>
                      <p className="text-white font-medium">{attr.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}