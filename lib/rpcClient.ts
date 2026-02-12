import { createPublicClient, http, parseAbi } from 'viem'
import { base } from 'viem/chains'

export const BASE_RPC = 'https://mainnet.base.org'

// Create client with optimized settings
export const publicClient = createPublicClient({
  chain: base,
  transport: http(BASE_RPC, {
    timeout: 15000, // Reduced from 30s to 15s
    retryCount: 2,
    retryDelay: 500,
  }),
  batch: {
    multicall: {
      wait: 100, // Batch calls within 100ms
      batchSize: 50, // Max 50 calls per batch
    },
  },
})

export const TRANSFER_EVENT_HASH = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef'
export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'
export const ERC721_INTERFACE_ID = '0x80ac58cd'

export const erc721Abi = parseAbi([
  'function supportsInterface(bytes4 interfaceId) view returns (bool)',
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function totalSupply() view returns (uint256)',
  'function tokenURI(uint256 tokenId) view returns (string)',
  'function balanceOf(address owner) view returns (uint256)',
  'function tokenOfOwnerByIndex(address owner, uint256 index) view returns (uint256)',
  'event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)',
])

// Cached block number to reduce RPC calls
let cachedBlockNumber: bigint | null = null
let lastBlockFetch = 0
const BLOCK_CACHE_MS = 5000 // Cache block number for 5 seconds

export async function fetchEthBlockNumber(): Promise<bigint> {
  const now = Date.now()
  if (cachedBlockNumber && now - lastBlockFetch < BLOCK_CACHE_MS) {
    return cachedBlockNumber
  }
  
  cachedBlockNumber = await publicClient.getBlockNumber()
  lastBlockFetch = now
  return cachedBlockNumber
}

// Optimized getLogs with smaller range for faster results
export async function getLogs(fromBlock: bigint, toBlock: bigint) {
  // Limit range to 30 blocks for faster scanning (reduced from 50)
  const maxRange = BigInt(30)
  if (toBlock - fromBlock > maxRange) {
    fromBlock = toBlock - maxRange
  }

  const logs = await publicClient.getLogs({
    event: {
      type: 'event',
      name: 'Transfer',
      inputs: [
        { type: 'address', name: 'from', indexed: true },
        { type: 'address', name: 'to', indexed: true },
        { type: 'uint256', name: 'tokenId', indexed: true },
      ],
    },
    args: {
      from: ZERO_ADDRESS,
    },
    fromBlock,
    toBlock,
  })
  
  return logs
}