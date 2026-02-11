import { NFTContract } from './contractUtils'
import { publicClient } from './rpcClient'

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

export async function calculateEarlyScore(contract: NFTContract, recentMintCount: number = 1): Promise<EarlyScore> {
  const breakdown = {
    supplyScore: 0,
    recencyScore: 0,
    velocityScore: 0,
    verificationScore: 0,
    diversityScore: 0,
  }
  const reasons: string[] = []

  // 1. Supply Score (0-20 points)
  const supply = Number(contract.totalSupply)
  if (supply < 100) {
    breakdown.supplyScore = 20
    reasons.push('Ultra early: Less than 100 mints')
  } else if (supply < 500) {
    breakdown.supplyScore = 15
    reasons.push('Very early: Less than 500 mints')
  } else if (supply < 1000) {
    breakdown.supplyScore = 10
    reasons.push('Early: Less than 1,000 mints')
  } else if (supply < 5000) {
    breakdown.supplyScore = 5
    reasons.push('Growing: Less than 5,000 mints')
  }

  // 2. Recency Score (0-20 points)
  try {
    const currentBlock = await publicClient.getBlockNumber()
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
  } catch (e) {
    // Skip recency check if it fails
  }

  // 3. Velocity Score (0-20 points) - based on mints in scan window
  if (recentMintCount >= 10) {
    breakdown.velocityScore = 20
    reasons.push('High velocity: 10+ recent mints')
  } else if (recentMintCount >= 5) {
    breakdown.velocityScore = 15
    reasons.push('Good velocity: 5+ recent mints')
  } else if (recentMintCount >= 2) {
    breakdown.velocityScore = 10
    reasons.push('Steady velocity: 2+ recent mints')
  }

  // 4. Verification Score (0-20 points)
  if (contract.isVerified) {
    breakdown.verificationScore = 20
    reasons.push('Contract verified as ERC721')
  }

  // 5. Metadata Score (0-20 points)
  if (contract.metadata?.image) {
    breakdown.diversityScore = 20
    reasons.push('Metadata accessible')
  } else if (contract.metadata) {
    breakdown.diversityScore = 10
    reasons.push('Partial metadata available')
  }

  const totalScore = Object.values(breakdown).reduce((a, b) => a + b, 0)

  return {
    score: totalScore,
    breakdown,
    reasons,
  }
}