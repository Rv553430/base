'use client'

import { useEffect, useState, useCallback, useMemo, memo } from 'react'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import NFTCard from '@/components/NFTCard'
import LoadingSkeleton from '@/components/LoadingSkeleton'
import WalletInput from '@/components/WalletInput'
import { scanRecentMints, processNFTContracts } from '@/lib/nftScanner'
import { NFTContract } from '@/lib/contractUtils'
import { calculateEarlyScore, EarlyScore } from '@/lib/scoreCalculator'
import { checkWalletNFTs } from '@/lib/contractUtils'
import { Address } from 'viem'
import { debounce } from '@/lib/cache'
import { ShareToFarcasterButton, AddFrameButton } from '@/components/FarcasterActions'

// Items per page for pagination
const ITEMS_PER_PAGE = 12

// Memoized NFT Grid to prevent re-renders
const NFTGrid = memo(function NFTGrid({ 
  nfts, 
  scores 
}: { 
  nfts: NFTContract[]
  scores: Map<string, EarlyScore>
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {nfts.map((nft) => (
        <NFTCard
          key={nft.address}
          contract={nft}
          score={scores.get(nft.address.toLowerCase()) || null}
        />
      ))}
    </div>
  )
})

export default function Home() {
  const [nfts, setNfts] = useState<NFTContract[]>([])
  const [scores, setScores] = useState<Map<string, EarlyScore>>(new Map())
  const [loading, setLoading] = useState(true)
  const [initialLoading, setInitialLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [walletNfts, setWalletNfts] = useState<NFTContract[]>([])
  const [checkingWallet, setCheckingWallet] = useState(false)
  const [activeTab, setActiveTab] = useState<'discover' | 'wallet'>('discover')
  const [currentPage, setCurrentPage] = useState(1)
  const [autoRefresh, setAutoRefresh] = useState(true)

  // Progressive loading - fetch scores after displaying contracts
  const fetchScoresProgressive = useCallback(async (
    contracts: NFTContract[], 
    mintEvents: any[]
  ) => {
    const scoreMap = new Map<string, EarlyScore>()
    
    // Process scores in small batches to not block UI
    const batchSize = 2
    for (let i = 0; i < contracts.length; i += batchSize) {
      const batch = contracts.slice(i, i + batchSize)
      
      await Promise.all(
        batch.map(async (contract) => {
          const mintCount = mintEvents.filter(
            e => e.contractAddress.toLowerCase() === contract.address.toLowerCase()
          ).length
          const score = await calculateEarlyScore(contract, mintCount)
          scoreMap.set(contract.address.toLowerCase(), score)
        })
      )
      
      // Update scores progressively
      setScores(new Map(scoreMap))
      
      // Small delay between batches for UI responsiveness
      if (i + batchSize < contracts.length) {
        await new Promise(resolve => setTimeout(resolve, 50))
      }
    }
  }, [])

  const fetchNFTs = useCallback(async (isInitial = false) => {
    try {
      if (isInitial) {
        setInitialLoading(true)
      }
      setLoading(true)
      setError(null)

      // Scan recent mints with caching
      const mintEvents = await scanRecentMints(30) // Reduced from 50
      
      if (mintEvents.length === 0) {
        setNfts([])
        setLoading(false)
        setInitialLoading(false)
        return
      }

      // Process contracts
      const contracts = await processNFTContracts(mintEvents)
      
      // Set contracts immediately so UI shows something
      setNfts(contracts)
      setLastUpdated(new Date())
      setLoading(false)
      setInitialLoading(false)
      
      // Calculate scores in background
      fetchScoresProgressive(contracts, mintEvents)
      
    } catch (err) {
      console.error('Error fetching NFTs:', err)
      setError('Failed to fetch NFTs. Please try again.')
      setLoading(false)
      setInitialLoading(false)
    }
  }, [fetchScoresProgressive])

  // Debounced wallet check
  const debouncedWalletCheck = useMemo(
    () => debounce(async (address: string) => {
      try {
        setCheckingWallet(true)
        const addresses = nfts.map(n => n.address)
        const ownedAddresses = await checkWalletNFTs(address as Address, addresses, 3) // Reduced concurrency
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
    }, 500),
    [nfts]
  )

  const handleWalletCheck = useCallback((address: string) => {
    debouncedWalletCheck(address)
  }, [debouncedWalletCheck])

  // Pagination
  const paginatedNfts = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    return nfts.slice(start, start + ITEMS_PER_PAGE)
  }, [nfts, currentPage])

  const totalPages = useMemo(() => Math.ceil(nfts.length / ITEMS_PER_PAGE), [nfts.length])

  // Initial load
  useEffect(() => {
    fetchNFTs(true)
  }, [fetchNFTs])

  // Auto-refresh with user control
  useEffect(() => {
    if (!autoRefresh) return
    
    const interval = setInterval(() => {
      fetchNFTs(false)
    }, 60000) // Increased to 60 seconds

    return () => clearInterval(interval)
  }, [autoRefresh, fetchNFTs])

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
            <div className="flex items-center gap-3">
              <AddFrameButton />
              <ShareToFarcasterButton 
                title="Discover early NFTs with NFT Scout! 🎯"
                text="Track fresh NFT mints on Base blockchain in real-time. Check it out:"
                embeds={['https://base-phi-tan.vercel.app']}
              />
              <ConnectButton />
            </div>
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

        {/* Performance Controls */}
        <div className="flex justify-center gap-4 mb-6">
          <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded border-gray-700 bg-gray-800 text-purple-600"
            />
            Auto-refresh (60s)
          </label>
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
              onClick={() => fetchNFTs(false)}
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
        {initialLoading ? (
          <LoadingSkeleton />
        ) : activeTab === 'discover' ? (
          nfts.length > 0 ? (
            <>
              <NFTGrid nfts={paginatedNfts} scores={scores} />
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-8">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 bg-gray-800 rounded-lg text-white disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <span className="px-4 py-2 text-gray-400">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 bg-gray-800 rounded-lg text-white disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
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
            <NFTGrid nfts={walletNfts} scores={scores} />
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