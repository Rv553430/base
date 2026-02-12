import { NFTContract } from './contractUtils'
import { fetchEthBlockNumber } from './rpcClient'
import { nftCache } from './cache'

export interface EarlyScore {
  score: number
  breakdown: {
    supplyScore: number
    recencyScore: number
    velocityScore: number
    verificationScore: number
    diversityScore: number
  }
  reasons: string[]
}

// Generate cache key for score
const getScoreCacheKey = (contractAddress: string, mintCount: number) => 
  `score:${contractAddress.toLowerCase()}:${mintCount}`

export async function calculateEarlyScore(
  contract: NFTContract, 
  recentMintCount: number = 1
): Promise<EarlyScore> {
  // Check cache first
  const cacheKey = getScoreCacheKey(contract.address, recentMintCount)
  const cached = nftCache.get<EarlyScore>(cacheKey)
  if (cached) return cached

  const breakdown = {
    supplyScore: 0,
    recencyScore: 0,
    velocityScore: 0,
    verificationScore: 0,
    diversityScore: 0,
  }
  const reasons: string[] = []

  // 1. Supply Score (0-20 points) - synchronous, no RPC needed
  const supply = Number(contract.totalSupply)
  if (supply < 100) {
    breakdown.supplyScore = 20
    reasons.push('Ultra early: < 100 mints')
  } else if (supply < 500) {
    breakdown.supplyScore = 15
    reasons.push('Very early: < 500 mints')
  } else if (supply < 1000) {
    breakdown.supplyScore = 10
    reasons.push('Early: < 1,000 mints')
  } else if (supply < 5000) {
    breakdown.supplyScore = 5
    reasons.push('Growing: < 5,000 mints')
  }

  // 2. Recency Score (0-20 points) - uses cached block number
  try {
    const currentBlock = await fetchEthBlockNumber()
    const blocksSinceMint = Number(currentBlock - contract.mintBlock)
    
    if (blocksSinceMint < 50) {
      breakdown.recencyScore = 20
      reasons.push('Minted in last 50 blocks')
    } else if (blocksSinceMint < 100) {
      breakdown.recencyScore = 15
      reasons.push('Minted in last 100 blocks')
    } else if (blocksSinceMint < 200) {
      breakdown.recencyScore = 10
      reasons.push('Minted in last 200 blocks')
    } else if (blocksSinceMint < 500) {
      breakdown.recencyScore = 5
      reasons.push('Minted in last 500 blocks')
    }
  } catch {
    // Skip recency check if it fails
  }

  // 3. Velocity Score (0-20 points) - synchronous
  if (recentMintCount >= 10) {
    breakdown.velocityScore = 20
    reasons.push('High velocity: 10+ mints')
  } else if (recentMintCount >= 5) {
    breakdown.velocityScore = 15
    reasons.push('Good velocity: 5+ mints')
  } else if (recentMintCount >= 2) {
    breakdown.velocityScore = 10
    reasons.push('Steady velocity: 2+ mints')
  }

  // 4. Verification Score (0-20 points) - synchronous
  if (contract.isVerified) {
    breakdown.verificationScore = 20
    reasons.push('ERC721 verified')
  }

  // 5. Metadata Score (0-20 points) - synchronous
  if (contract.metadata?.image) {
    breakdown.diversityScore = 20
    reasons.push('Metadata ready')
  } else if (contract.metadata) {
    breakdown.diversityScore = 10
    reasons.push('Partial metadata')
  }

  const totalScore = Object.values(breakdown).reduce((a, b) => a + b, 0)

  const result: EarlyScore = {
    score: totalScore,
    breakdown,
    reasons,
  }

  // Cache the result
  nftCache.set(cacheKey, result)
  
  return result
}