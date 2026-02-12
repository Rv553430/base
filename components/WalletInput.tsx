'use client'

import { useState } from 'react'

interface WalletInputProps {
  onSubmit: (address: string) => void
  isLoading?: boolean
}

export default function WalletInput({ onSubmit, isLoading = false }: WalletInputProps) {
  const [address, setAddress] = useState('')
  const [error, setError] = useState('')

  const validateAddress = (addr: string) => {
    return /^0x[a-fA-F0-9]{40}$/.test(addr)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!validateAddress(address)) {
      setError('Please enter a valid Ethereum address')
      return
    }

    onSubmit(address)
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto px-4 sm:px-0">
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-0 sm:relative">
        <input
          type="text"
          placeholder="Enter wallet address (0x...)"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 sm:px-6 py-3 sm:py-4 text-sm sm:text-base text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
        />
        <button
          type="submit"
          disabled={isLoading}
          className="w-full sm:w-auto sm:absolute sm:right-2 sm:top-2 sm:bottom-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold px-4 sm:px-6 py-3 sm:py-0 rounded-xl sm:rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Checking...
            </span>
          ) : (
            'Check NFTs'
          )}
        </button>
      </div>
      {error && (
        <p className="mt-2 text-red-400 text-sm px-4 sm:px-0">{error}</p>
      )}
    </form>
  )
}