'use client'

import { useEffect, useState, useCallback } from 'react'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import NFTCard from '@/components/NFTCard'
import LoadingSkeleton from '@/components/LoadingSkeleton'
import WalletInput from '@/components/WalletInput'
import { scanRecentMints, processNFTContracts, MintEvent } from '@/lib/nftScanner'
import { NFTContract } from '@/lib/contractUtils'
import { calculateEarlyScore, EarlyScore } from '@/lib/scoreCalculator'
import { checkWalletNFTs } from '@/lib/contractUtils'
import { Address } from 'viem'

export default function Home() {
  const [nfts, setNfts] = useState<NFTContract[]>([])
  const [scores, setScores] = useState<Map<string, EarlyScore>>(new Map())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [walletNfts, setWalletNfts] = useState<NFTContract[]>([])
  const [checkingWallet, setCheckingWallet] = useState(false)
  const [activeTab, setActiveTab] = useState<'discover' | 'wallet'>('discover')

  const fetchNFTs = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Scan recent mints
      const mintEvents = await scanRecentMints(50)
      
      if (mintEvents.length === 0) {
        setNfts([])
        setLoading(false)
        return
      }

      // Process contracts
      const contracts = await processNFTContracts(mintEvents)
      
      // Calculate scores
      const scoreMap = new Map<string, EarlyScore>()
      
      await Promise.all(
        contracts.map(async (contract) => {
          const mintCount = mintEvents.filter(
            e => e.contractAddress.toLowerCase() === contract.address.toLowerCase()
          ).length
          const score = await calculateEarlyScore(contract, mintCount)
          scoreMap.set(contract.address.toLowerCase(), score)
        })
      )

      setNfts(contracts)
      setScores(scoreMap)
      setLastUpdated(new Date())
    } catch (err) {
      console.error('Error fetching NFTs:', err)
      setError('Failed to fetch NFTs. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [])

  const handleWalletCheck = async (address: string) => {
    try {
      setCheckingWallet(true)
      const addresses = nfts.map(n => n.address)
      const ownedAddresses = await checkWalletNFTs(address as Address, addresses)
      const owned = nfts.filter(n => 
        ownedAddresses.some(oa => oa.toLowerCase() === n.address.toLowerCase())
      )
      setWalletNfts(owned)
      setActiveTab('wallet')
    } catch (err) {
      console.error('Error checking wallet:', err)
      setError('Failed to check wallet NFTs')
    } finally {
      setCheckingWallet(false)
    }
  }

  useEffect(() => {
    fetchNFTs()

    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchNFTs, 30000)

    return () => clearInterval(interval)
  }, [fetchNFTs])

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🎯</span>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  NFT Scout
                </h1>
                <p className="text-xs text-gray-500">Discover early NFTs on Base</p>
              </div>
            </div>
            <ConnectButton />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero */}
        <div className="text-center mb-12">
          <h2 className="text-4xl sm:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
              Track Fresh NFT Mints
            </span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Real-time NFT discovery on Base blockchain. No storage, no backend. 
            Pure blockchain data.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-8">
          <div className="bg-gray-800 p-1 rounded-xl inline-flex">
            <button
              onClick={() => setActiveTab('discover')}
              className={`px-6 py-2 rounded-lg font-medium transition-all ${
                activeTab === 'discover'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              🔍 Discover
            </button>
            <button
              onClick={() => setActiveTab('wallet')}
              className={`px-6 py-2 rounded-lg font-medium transition-all ${
                activeTab === 'wallet'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              👛 My NFTs
            </button>
          </div>
        </div>

        {/* Wallet Input */}
        <div className="mb-8">
          <WalletInput onSubmit={handleWalletCheck} isLoading={checkingWallet} />
        </div>

        {/* Stats */}
        {activeTab === 'discover' && (
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <span className="text-gray-400">
                {nfts.length} NFT contracts found
              </span>
              {lastUpdated && (
                <span className="text-xs text-gray-500">
                  Last updated: {lastUpdated.toLocaleTimeString()}
                </span>
              )}
            </div>
            <button
              onClick={fetchNFTs}
              disabled={loading}
              className="text-sm text-purple-400 hover:text-purple-300 disabled:opacity-50"
            >
              {loading ? 'Scanning...' : '↻ Refresh'}
            </button>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 rounded-xl p-4 mb-6 text-center">
            {error}
          </div>
        )}

        {/* Content */}
        {loading && nfts.length === 0 ? (
          <LoadingSkeleton />
        ) : activeTab === 'discover' ? (
          nfts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {nfts.map((nft) => (
                <NFTCard
                  key={nft.address}
                  contract={nft}
                  score={scores.get(nft.address.toLowerCase()) || null}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-gray-500 text-lg">No new NFTs found in recent blocks</p>
              <p className="text-gray-600 text-sm mt-2">
                New mints will appear here automatically
              </p>
            </div>
          )
        ) : (
          walletNfts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {walletNfts.map((nft) => (
                <NFTCard
                  key={nft.address}
                  contract={nft}
                  score={scores.get(nft.address.toLowerCase()) || null}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-gray-500 text-lg">No NFTs found in wallet</p>
              <p className="text-gray-600 text-sm mt-2">
                Enter a wallet address to check for NFTs
              </p>
            </div>
          )
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 mt-20 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-gray-500 text-sm">
            Built with 🖤 on Base | Data from blockchain only | No storage
          </p>
        </div>
      </footer>
    </div>
  )
}