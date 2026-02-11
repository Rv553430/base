import { Metadata } from 'next'
import WalletChecker from './client'

export const metadata: Metadata = {
  title: 'My NFTs | NFT Scout',
  description: 'Check your NFT holdings on Base blockchain',
}

export default function WalletPage() {
  return <WalletChecker />
}