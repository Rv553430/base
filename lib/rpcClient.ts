import { createPublicClient, http, parseAbi } from 'viem'
import { base } from 'viem/chains'

export const BASE_RPC = 'https://mainnet.base.org'

export const publicClient = createPublicClient({
  chain: base,
  transport: http(BASE_RPC, {
    timeout: 30000, // 30 second timeout
  }),
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

export async function fetchEthBlockNumber(): Promise<bigint> {
  return await publicClient.getBlockNumber()
}

export async function getLogs(fromBlock: bigint, toBlock: bigint) {
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