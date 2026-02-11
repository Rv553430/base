import { publicClient, erc721Abi, ZERO_ADDRESS } from './rpcClient'
import { getContract, Address, formatUnits } from 'viem'

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
  attributes?: any[]
}

export async function verifyERC721(contractAddress: Address): Promise<boolean> {
  try {
    const result = await publicClient.readContract({
      address: contractAddress,
      abi: erc721Abi,
      functionName: 'supportsInterface',
      args: ['0x80ac58cd'],
    })
    return result
  } catch (error) {
    return false
  }
}

export async function getContractData(contractAddress: Address): Promise<Partial<NFTContract>> {
  try {
    const contract = getContract({
      address: contractAddress,
      abi: erc721Abi,
      client: publicClient,
    })

    const [name, symbol, totalSupply] = await Promise.all([
      contract.read.name().catch(() => 'Unknown'),
      contract.read.symbol().catch(() => '???'),
      contract.read.totalSupply().catch(() => BigInt(0)),
    ])

    return {
      name,
      symbol,
      totalSupply,
      isVerified: true,
    }
  } catch (error) {
    return {
      name: 'Unknown',
      symbol: '???',
      totalSupply: BigInt(0),
      isVerified: false,
    }
  }
}

export async function fetchTokenMetadata(tokenURI: string): Promise<NFTMetadata | null> {
  try {
    let url = tokenURI
    
    // Handle IPFS URLs
    if (url.startsWith('ipfs://')) {
      url = url.replace('ipfs://', 'https://ipfs.io/ipfs/')
    }

    const response = await fetch(url)
    const data = await response.json()
    
    // Handle IPFS image URLs
    let image = data.image || ''
    if (image.startsWith('ipfs://')) {
      image = image.replace('ipfs://', 'https://ipfs.io/ipfs/')
    }

    return {
      name: data.name || 'Unnamed NFT',
      description: data.description || '',
      image,
      attributes: data.attributes || [],
    }
  } catch (error) {
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
  } catch (error) {
    return null
  }
}

export async function checkWalletNFTs(walletAddress: Address, contractAddresses: Address[]): Promise<Address[]> {
  const ownedContracts: Address[] = []
  
  await Promise.all(
    contractAddresses.map(async (contractAddress) => {
      try {
        const balance = await publicClient.readContract({
          address: contractAddress,
          abi: erc721Abi,
          functionName: 'balanceOf',
          args: [walletAddress],
        })
        
        if (balance > 0) {
          ownedContracts.push(contractAddress)
        }
      } catch (error) {
        // Skip contracts that fail
      }
    })
  )
  
  return ownedContracts
}