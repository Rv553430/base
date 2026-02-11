# NFT Scout

A real-time NFT discovery platform for the Base blockchain. Track newly minted NFTs, calculate "Early Scores", and check wallet holdings - all directly from the blockchain with no storage or backend server.

## Features

### Core Functionality
- **Real-time NFT Detection**: Scans the last 50 blocks every 30 seconds for new NFT mints
- **Early Score System**: Algorithm that scores NFTs from 0-100 based on:
  - Supply (lower supply = higher score)
  - Recency (recent mints score higher)
  - Mint velocity (frequent mints = higher score)
  - Contract verification
  - Metadata availability
- **Wallet Checker**: Check any wallet address for NFT holdings from detected contracts
- **NFT Details Page**: View comprehensive information about each NFT contract

### Technical Highlights
- **No Backend**: Everything runs client-side
- **No Database**: Blockchain is your database
- **No Storage**: Data refreshes on every page load
- **Live from Chain**: Uses Base public RPC (https://mainnet.base.org)

## Tech Stack

- **Frontend**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **Blockchain**: viem (lightweight, modern alternative to ethers.js)
- **Wallet Connection**: wagmi + RainbowKit
- **State Management**: React hooks + Context
- **Query Management**: TanStack Query

## Architecture

```
User Browser
    ↓
Next.js Frontend
    ↓
Base Public RPC (mainnet.base.org)
    ↓
Basescan API (optional)
    ↓
CoinGecko API (optional for prices)
```

## How It Works

### NFT Detection Flow
1. Get latest block number via `eth_blockNumber`
2. Define scan range: latestBlock - 50 blocks
3. Call `eth_getLogs` with:
   - topic0 = Transfer event hash (0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef)
   - topic1 = zero address (0x0000...0000) - indicating mint
4. Extract contract addresses, minters, and token IDs from logs
5. Remove duplicate contracts
6. Verify ERC721 support via `supportsInterface(0x80ac58cd)`
7. Fetch contract data: name(), symbol(), totalSupply()
8. Fetch metadata via tokenURI() for sample tokens
9. Calculate Early Score
10. Render UI

### Early Score Algorithm
```
Supply Score (0-20):
- < 100 mints: +20
- < 500 mints: +15
- < 1000 mints: +10
- < 5000 mints: +5

Recency Score (0-20):
- < 50 blocks: +20
- < 100 blocks: +15
- < 200 blocks: +10
- < 500 blocks: +5

Velocity Score (0-20):
- 10+ mints in scan window: +20
- 5+ mints: +15
- 2+ mints: +10

Verification Score (0-20):
- ERC721 verified: +20

Metadata Score (0-20):
- Full metadata available: +20
- Partial metadata: +10
```

## Project Structure

```
nft-scout/
├── app/
│   ├── page.tsx              # Main discovery page
│   ├── layout.tsx            # Root layout with providers
│   ├── providers.tsx         # wagmi + RainbowKit setup
│   ├── globals.css           # Global styles
│   ├── nft/
│   │   └── [address]/
│   │       └── page.tsx      # NFT detail page
│   └── wallet/
│       ├── page.tsx          # Wallet checker page
│       └── client.tsx        # Client component
├── components/
│   ├── NFTCard.tsx           # NFT display card
│   ├── ScoreBadge.tsx        # Early score badge
│   ├── WalletInput.tsx       # Wallet address input
│   └── LoadingSkeleton.tsx   # Loading state UI
├── lib/
│   ├── rpcClient.ts          # viem client configuration
│   ├── contractUtils.ts      # Contract interaction utilities
│   ├── nftScanner.ts         # NFT scanning logic
│   └── scoreCalculator.ts    # Early score calculation
├── public/                   # Static assets
├── next.config.mjs          # Next.js configuration
├── package.json             # Dependencies
├── tsconfig.json            # TypeScript config
└── tailwind.config.ts       # Tailwind configuration
```

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

1. Clone or navigate to the project:
```bash
cd nft-scout
```

2. Install dependencies:
```bash
npm install --legacy-peer-deps
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Building for Production

```bash
npm run build
npm start
```

Note: If you encounter SWC binary issues on Windows, the project includes a `.babelrc` file as a fallback.

## Configuration

### WalletConnect Project ID
To enable wallet connections, you need a WalletConnect project ID:

1. Visit [WalletConnect Cloud](https://cloud.walletconnect.com)
2. Create a new project
3. Copy the Project ID
4. Update `app/providers.tsx`:
```typescript
const config = getDefaultConfig({
  appName: 'NFT Scout',
  projectId: 'YOUR_PROJECT_ID', // Replace this
  chains: [base],
  transports: {
    [base.id]: http('https://mainnet.base.org'),
  },
})
```

## Usage

### Discover New NFTs
1. Open the home page
2. The app automatically scans for new NFTs every 30 seconds
3. Browse the NFT cards with their Early Scores
4. Click "View Details" for more information

### Check Wallet Holdings
1. Enter any Base wallet address in the input field
2. Click "Check NFTs"
3. View all NFTs owned by that address from recently detected contracts

### Connect Your Wallet
1. Click the "Connect Wallet" button in the top right
2. Choose your wallet (MetaMask, Coinbase Wallet, etc.)
3. The app will automatically check your NFT holdings

## API Endpoints Used

### Base Public RPC
- **URL**: https://mainnet.base.org
- **Methods Used**:
  - `eth_blockNumber`: Get latest block
  - `eth_getLogs`: Query mint events
  - `eth_call`: Read contract data

### External APIs (Optional)
- **Basescan**: Contract verification info
- **CoinGecko**: ETH price data
- **IPFS**: NFT metadata (via ipfs.io gateway)

## Performance Considerations

- **Scan Range**: Limited to 50 blocks to respect RPC rate limits
- **Auto-refresh**: 30-second intervals
- **No Caching**: Data is fresh on every scan
- **IPFS Handling**: Automatic conversion from ipfs:// to https://ipfs.io/ipfs/

## Limitations

1. **History**: Cannot track full blockchain history (scan range limited)
2. **Holder Count**: Cannot calculate exact unique holder count easily
3. **Rate Limits**: Public RPC has rate limits (max 50 blocks scanned)
4. **Metadata**: Some NFTs may have IPFS metadata that's unavailable

## Future Enhancements

- [ ] Filter by score threshold
- [ ] Sort by different criteria
- [ ] Add to favorites (localStorage)
- [ ] Price tracking integration
- [ ] Collection verification badges
- [ ] Mobile app version
- [ ] Push notifications for high-score NFTs

## License

MIT License - feel free to use this project as a template for your own NFT discovery platforms.

## Credits

Built with ❤️ for the Base ecosystem using:
- [viem](https://viem.sh) - Modern blockchain interactions
- [wagmi](https://wagmi.sh) - React hooks for Ethereum
- [RainbowKit](https://rainbowkit.com) - Wallet connection UI
- [Tailwind CSS](https://tailwindcss.com) - Utility-first CSS
- [Next.js](https://nextjs.org) - React framework

## Support

For issues or questions:
- Check the project documentation
- Join the Base Discord community
- Follow updates on Twitter

---

**Note**: This is an MVP project designed to demonstrate the concept of real-time NFT discovery without a backend. For production use, consider adding error handling, rate limiting protection, and caching strategies.