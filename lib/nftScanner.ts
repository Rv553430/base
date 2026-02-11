import { publicClient, getLogs } from './rpcClient'
import { verifyERC721, getContractData, getTokenURI, fetchTokenMetadata, NFTContract } from './contractUtils'
import { Address, Log } from 'viem'

export interface MintEvent {
  contractAddress: Address
  minter: Address
  tokenId: bigint
  blockNumber: bigint
  transactionHash: string
}

export async function scanRecentMints(blockRange: number = 50): Promise<MintEvent[]> {
  const latestBlock = await publicClient.getBlockNumber()
  const fromBlock = latestBlock - BigInt(blockRange)

  const logs = await getLogs(fromBlock, latestBlock)
  
  const mintEvents: MintEvent[] = logs.map((log: any) => ({
    contractAddress: log.address,
    minter: log.args?.to as Address,
    tokenId: log.args?.tokenId as bigint,
    blockNumber: log.blockNumber,
    transactionHash: log.transactionHash,
  }))

  return mintEvents
}

export async function getUniqueContracts(mintEvents: MintEvent[]): Promise<Address[]> {
  const uniqueAddresses = new Set<Address>()
  mintEvents.forEach(event => uniqueAddresses.add(event.contractAddress))
  return Array.from(uniqueAddresses)
}

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
  
  await Promise.all(
    Array.from(contractMap.entries()).map(async ([address, events]) => {
      try {
        // Verify it's ERC721
        const isERC721 = await verifyERC721(address)
        if (!isERC721) return

        // Get contract data
        const contractData = await getContractData(address)
        
        // Get the most recent mint event
        const latestEvent = events[events.length - 1]
        
        // Try to fetch metadata for the latest token
        let metadata = undefined
        try {
          const tokenURI = await getTokenURI(address, latestEvent.tokenId)
          if (tokenURI) {
            metadata = await fetchTokenMetadata(tokenURI) || undefined
          }
        } catch (e) {
          // Metadata fetch failed, continue without it
        }

        nftContracts.push({
          address,
          name: contractData.name || 'Unknown',
          symbol: contractData.symbol || '???',
          totalSupply: contractData.totalSupply || BigInt(0),
          lastMintedTokenId: latestEvent.tokenId,
          lastMinter: latestEvent.minter,
          mintBlock: latestEvent.blockNumber,
          metadata,
          isVerified: true,
        })
      } catch (error) {
        console.error(`Error processing contract ${address}:`, error)
      }
    })
  )

  return nftContracts
}