'use client'

import { useState } from 'react'
import { useAccount } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import NFTCard from '@/components/NFTCard'
import LoadingSkeleton from '@/components/LoadingSkeleton'
import { scanRecentMints, processNFTContracts } from '@/lib/nftScanner'
import { checkWalletNFTs, NFTContract } from '@/lib/contractUtils'
import { calculateEarlyScore, EarlyScore } from '@/lib/scoreCalculator'
import { Address } from 'viem'

export default function WalletChecker() {
  const { address: connectedAddress } = useAccount()
  const [walletAddress, setWalletAddress] = useState('')
  const [ownedNfts, setOwnedNfts] = useState<NFTContract[]>([])
  const [scores, setScores] = useState<Map<string, EarlyScore>>(new Map())
  const [loading, setLoading] = useState(false)
  const [checked, setChecked] = useState(false)

  const handleCheckWallet = async (address: string) => {
    try {
      setLoading(true)
      setChecked(false)
      setWalletAddress(address)

      // First get recent contracts
      const mintEvents = await scanRecentMints(100)
      const contracts = await processNFTContracts(mintEvents)

      // Check which ones the wallet owns
      const contractAddresses = contracts.map(c => c.address)
      const ownedAddresses = await checkWalletNFTs(address as Address, contractAddresses)
      
      const owned = contracts.filter(c => 
        ownedAddresses.some(oa => oa.toLowerCase() === c.address.toLowerCase())
      )

      // Calculate scores
      const scoreMap = new Map<string, EarlyScore>()
      await Promise.all(
        owned.map(async (contract) => {
          const score = await calculateEarlyScore(contract)
          scoreMap.set(contract.address.toLowerCase(), score)
        })
      )

      setOwnedNfts(owned)
      setScores(scoreMap)
      setChecked(true)
    } catch (error) {
      console.error('Error checking wallet:', error)
    } finally {
      setLoading(false)
    }
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Check Your NFTs
            </span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Connect your wallet or enter an address to check NFT holdings from recently minted contracts.
          </p>
        </div>

        {/* Wallet Input */}
        <div className="max-w-xl mx-auto mb-12">
          {connectedAddress ? (
            <div className="bg-gray-800 rounded-xl p-6 text-center">
              <p className="text-gray-400 mb-4">Connected Wallet</p>
              <p className="text-white font-mono text-lg mb-4">{connectedAddress}</p>
              <button
                onClick={() => handleCheckWallet(connectedAddress)}
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold py-3 rounded-lg transition-all disabled:opacity-50"
              >
                {loading ? 'Checking...' : 'Check My NFTs'}
              </button>
            </div>
          ) : (
            <div className="bg-gray-800 rounded-xl p-6 text-center">
              <p className="text-gray-400 mb-4">Connect your wallet to check</p>
              <ConnectButton />
            </div>
          )}
        </div>

        {/* Manual Input */}
        <div className="max-w-xl mx-auto mb-12">
          <p className="text-center text-gray-500 mb-4">or enter any address</p>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              const form = e.target as HTMLFormElement
              const input = form.elements.namedItem('address') as HTMLInputElement
              if (input.value) handleCheckWallet(input.value)
            }}
            className="flex gap-2"
          >
            <input
              name="address"
              type="text"
              placeholder="0x..."
              className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold px-6 py-3 rounded-lg transition-all disabled:opacity-50"
            >
              Check
            </button>
          </form>
        </div>

        {/* Results */}
        {loading ? (
          <LoadingSkeleton />
        ) : checked ? (
          ownedNfts.length > 0 ? (
            <div>
              <h3 className="text-2xl font-bold text-white mb-6">
                Found {ownedNfts.length} NFT{ownedNfts.length !== 1 ? 's' : ''}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {ownedNfts.map((nft) => (
                  <NFTCard
                    key={nft.address}
                    contract={nft}
                    score={scores.get(nft.address.toLowerCase()) || null}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-gray-400 text-xl">No NFTs found</p>
              <p className="text-gray-600 mt-2">
                This wallet doesn&apos;t own any NFTs from recently minted contracts
              </p>
            </div>
          )
        ) : null}
      </main>
    </div>
  )
}