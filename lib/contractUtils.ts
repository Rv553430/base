import { publicClient, erc721Abi } from './rpcClient'
import { getContract, Address } from 'viem'
import { nftCache } from './cache'

export interface NFTContract {
  address: Address
  name: string
  symbol: string
  totalSupply: bigint
  lastMintedTokenId: bigint
  lastMinter: Address
  mintBlock: bigint
  metadata?: NFTMetadata
  isVerified: boolean
}

export interface NFTMetadata {
  name: string
  description: string
  image: string
  attributes?: { trait_type: string; value: string | number }[]
}

// Cache key generator
const getContractCacheKey = (address: Address) => `contract:${address.toLowerCase()}`
const getMetadataCacheKey = (tokenURI: string) => `metadata:${tokenURI}`

export async function verifyERC721(contractAddress: Address): Promise<boolean> {
  const cacheKey = `erc721:${contractAddress.toLowerCase()}`
  const cached = nftCache.get<boolean>(cacheKey)
  if (cached !== null) return cached

  try {
    const result = await publicClient.readContract({
      address: contractAddress,
      abi: erc721Abi,
      functionName: 'supportsInterface',
      args: ['0x80ac58cd'],
    })
    nftCache.set(cacheKey, result)
    return result
  } catch {
    return false
  }
}

export async function getContractData(contractAddress: Address): Promise<Partial<NFTContract>> {
  const cacheKey = getContractCacheKey(contractAddress)
  const cached = nftCache.get<Partial<NFTContract>>(cacheKey)
  if (cached) return cached

  try {
    const contract = getContract({
      address: contractAddress,
      abi: erc721Abi,
      client: publicClient,
    })

    // Parallel execution for faster results
    const [name, symbol, totalSupply] = await Promise.all([
      contract.read.name().catch(() => 'Unknown'),
      contract.read.symbol().catch(() => '???'),
      contract.read.totalSupply().catch(() => BigInt(0)),
    ])

    const data = {
      name,
      symbol,
      totalSupply,
      isVerified: true,
    }

    nftCache.set(cacheKey, data)
    return data
  } catch {
    return {
      name: 'Unknown',
      symbol: '???',
      totalSupply: BigInt(0),
      isVerified: false,
    }
  }
}

// Preload metadata with timeout
const METADATA_TIMEOUT = 3000 // 3 seconds max

export async function fetchTokenMetadata(tokenURI: string): Promise<NFTMetadata | null> {
  const cacheKey = getMetadataCacheKey(tokenURI)
  const cached = nftCache.get<NFTMetadata>(cacheKey)
  if (cached) return cached

  try {
    let url = tokenURI
    
    // Handle IPFS URLs
    if (url.startsWith('ipfs://')) {
      url = url.replace('ipfs://', 'https://ipfs.io/ipfs/')
    }

    // Add timeout to fetch
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), METADATA_TIMEOUT)

    try {
      const response = await fetch(url, { signal: controller.signal })
      clearTimeout(timeoutId)
      
      if (!response.ok) return null
      
      const data = await response.json()
      
      // Handle IPFS image URLs
      let image = data.image || ''
      if (image.startsWith('ipfs://')) {
        image = image.replace('ipfs://', 'https://ipfs.io/ipfs/')
      }

      const metadata: NFTMetadata = {
        name: data.name || 'Unnamed NFT',
        description: data.description || '',
        image,
        attributes: data.attributes || [],
      }

      nftCache.set(cacheKey, metadata)
      return metadata
    } catch {
      clearTimeout(timeoutId)
      return null
    }
  } catch {
    return null
  }
}

export async function getTokenURI(contractAddress: Address, tokenId: bigint): Promise<string | null> {
  try {
    const uri = await publicClient.readContract({
      address: contractAddress,
      abi: erc721Abi,
      functionName: 'tokenURI',
      args: [tokenId],
    })
    return uri
  } catch {
    return null
  }
}

// Optimized batch wallet check with concurrency limit
export async function checkWalletNFTs(
  walletAddress: Address, 
  contractAddresses: Address[],
  concurrencyLimit: number = 5
): Promise<Address[]> {
  const ownedContracts: Address[] = []
  
  // Process in batches to avoid overwhelming the RPC
  for (let i = 0; i < contractAddresses.length; i += concurrencyLimit) {
    const batch = contractAddresses.slice(i, i + concurrencyLimit)
    
    const results = await Promise.all(
      batch.map(async (contractAddress) => {
        try {
          const balance = await publicClient.readContract({
            address: contractAddress,
            abi: erc721Abi,
            functionName: 'balanceOf',
            args: [walletAddress],
          })
          
          return balance > 0 ? contractAddress : null
        } catch {
          return null
        }
      })
    )
    
    ownedContracts.push(...results.filter((addr): addr is Address => addr !== null))
  }
  
  return ownedContracts
}