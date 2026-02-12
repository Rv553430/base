import { publicClient, getLogs, fetchEthBlockNumber } from './rpcClient'
import { verifyERC721, getContractData, getTokenURI, fetchTokenMetadata, NFTContract } from './contractUtils'
import { Address } from 'viem'
import { nftCache } from './cache'

interface LogEvent {
  address: Address
  args?: {
    to?: Address
    tokenId?: bigint
  }
  blockNumber: bigint
  transactionHash: string
}

export interface MintEvent {
  contractAddress: Address
  minter: Address
  tokenId: bigint
  blockNumber: bigint
  transactionHash: string
}

// Cache scan results briefly
const SCAN_CACHE_KEY = 'recent_mints'
const SCAN_CACHE_TTL = 10000 // 10 seconds

export async function scanRecentMints(blockRange: number = 30): Promise<MintEvent[]> {
  // Check cache first
  const cached = nftCache.get<MintEvent[]>(SCAN_CACHE_KEY)
  if (cached) {
    console.log('Using cached mint events')
    return cached
  }

  const latestBlock = await fetchEthBlockNumber()
  const fromBlock = latestBlock - BigInt(blockRange)

  const logs = await getLogs(fromBlock, latestBlock)
  
  const mintEvents: MintEvent[] = logs.map((log: LogEvent) => ({
    contractAddress: log.address,
    minter: log.args?.to as Address,
    tokenId: log.args?.tokenId as bigint,
    blockNumber: log.blockNumber,
    transactionHash: log.transactionHash,
  }))

  // Cache the results
  nftCache.set(SCAN_CACHE_KEY, mintEvents)
  
  return mintEvents
}

export async function getUniqueContracts(mintEvents: MintEvent[]): Promise<Address[]> {
  const uniqueAddresses = new Set<Address>()
  mintEvents.forEach(event => uniqueAddresses.add(event.contractAddress))
  return Array.from(uniqueAddresses)
}

// Process contracts in batches for better performance
const CONCURRENCY_LIMIT = 3

export async function processNFTContracts(mintEvents: MintEvent[]): Promise<NFTContract[]> {
  const contractMap = new Map<Address, MintEvent[]>()
  
  // Group events by contract
  mintEvents.forEach(event => {
    if (!contractMap.has(event.contractAddress)) {
      contractMap.set(event.contractAddress, [])
    }
    contractMap.get(event.contractAddress)!.push(event)
  })

  const nftContracts: NFTContract[] = []
  const contractEntries = Array.from(contractMap.entries())
  
  // Process in batches to avoid overwhelming the RPC
  for (let i = 0; i < contractEntries.length; i += CONCURRENCY_LIMIT) {
    const batch = contractEntries.slice(i, i + CONCURRENCY_LIMIT)
    
    const batchResults = await Promise.all(
      batch.map(async ([address, events]) => {
        try {
          // Verify it's ERC721 first (fast check)
          const isERC721 = await verifyERC721(address)
          if (!isERC721) return null

          // Get contract data in parallel with tokenURI
          const latestEvent = events[events.length - 1]
          
          const [contractData, tokenURI] = await Promise.all([
            getContractData(address),
            getTokenURI(address, latestEvent.tokenId),
          ])
          
          // Fetch metadata if tokenURI exists
          let metadata = undefined
          if (tokenURI) {
            metadata = await fetchTokenMetadata(tokenURI) || undefined
          }

          return {
            address,
            name: contractData.name || 'Unknown',
            symbol: contractData.symbol || '???',
            totalSupply: contractData.totalSupply || BigInt(0),
            lastMintedTokenId: latestEvent.tokenId,
            lastMinter: latestEvent.minter,
            mintBlock: latestEvent.blockNumber,
            metadata,
            isVerified: true,
          }
        } catch (error) {
          console.error(`Error processing contract ${address}:`, error)
          return null
        }
      })
    )
    
    // Filter out nulls and add to results
    nftContracts.push(...batchResults.filter((nft): nft is NFTContract => nft !== null))
  }

  return nftContracts
}