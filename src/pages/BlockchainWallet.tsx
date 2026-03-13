import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  Wallet,
  Link as LinkIcon,
  Shield,
  Coins,
  TrendingUp,
  ArrowUpRight,
  ArrowDownLeft,
  Copy,
  ExternalLink,
  Gem,
  Zap,
  Award,
  BarChart3,
  RefreshCw,
  CheckCircle,
  Clock,
  Lock,
  Layers,
} from "lucide-react";

interface NFTBadge {
  id: string;
  name: string;
  description: string;
  emoji: string;
  rarity: "Common" | "Rare" | "Epic" | "Legendary";
  earned: boolean;
  earnedDate?: string;
  contractAddress: string;
  tokenId: number;
}

interface OnChainTx {
  hash: string;
  type: "Stake" | "Unstake" | "Claim" | "Purchase" | "Reward";
  amount: string;
  token: string;
  status: "Confirmed" | "Pending";
  timestamp: string;
  blockNumber: number;
}

interface DeFiPool {
  id: string;
  name: string;
  protocol: string;
  apy: number;
  tvl: string;
  userStake: number;
  pendingRewards: number;
  token: string;
  riskLevel: "Low" | "Medium" | "High";
}

const MOCK_WALLET = "0x742d35Cc6634C0532925a3b8D4C9bF7E8dA3f20";
const CHAIN_NAME = "Polygon Mumbai (Testnet)";

const nftBadges: NFTBadge[] = [
  {
    id: "nft-1",
    name: "Rookie Investor",
    description: "Completed first month of SIP investment",
    emoji: "🚀",
    rarity: "Common",
    earned: true,
    earnedDate: "2024-01-15",
    contractAddress: "0xABcD...1234",
    tokenId: 1001,
  },
  {
    id: "nft-2",
    name: "Consistent Saver",
    description: "Maintained SIP for 3 consecutive months",
    emoji: "💎",
    rarity: "Rare",
    earned: true,
    earnedDate: "2024-03-15",
    contractAddress: "0xABcD...1234",
    tokenId: 1002,
  },
  {
    id: "nft-3",
    name: "Market Veteran",
    description: "Maintained SIP for 6 consecutive months",
    emoji: "🏆",
    rarity: "Epic",
    earned: false,
    contractAddress: "0xABcD...1234",
    tokenId: 1003,
  },
  {
    id: "nft-4",
    name: "WealthChain Legend",
    description: "1 year of unbroken SIP + ₹1L+ invested",
    emoji: "👑",
    rarity: "Legendary",
    earned: false,
    contractAddress: "0xABcD...1234",
    tokenId: 1004,
  },
  {
    id: "nft-5",
    name: "DeFi Pioneer",
    description: "First yield-farming deposit on WealthChain",
    emoji: "⚡",
    rarity: "Rare",
    earned: true,
    earnedDate: "2024-02-10",
    contractAddress: "0xDEF0...5678",
    tokenId: 2001,
  },
  {
    id: "nft-6",
    name: "Group Leader",
    description: "Created and led an investment group",
    emoji: "🌟",
    rarity: "Epic",
    earned: false,
    contractAddress: "0xDEF0...5678",
    tokenId: 2002,
  },
];

const defiPools: DeFiPool[] = [
  {
    id: "pool-1",
    name: "WCH-USDC LP",
    protocol: "WealthSwap",
    apy: 24.5,
    tvl: "₹48.2 Cr",
    userStake: 5000,
    pendingRewards: 12.3,
    token: "WCH",
    riskLevel: "Medium",
  },
  {
    id: "pool-2",
    name: "Stable Yield Vault",
    protocol: "SafeVault",
    apy: 9.8,
    tvl: "₹120.5 Cr",
    userStake: 10000,
    pendingRewards: 27.1,
    token: "USDC",
    riskLevel: "Low",
  },
  {
    id: "pool-3",
    name: "Index Token Farm",
    protocol: "WealthFarm",
    apy: 38.2,
    tvl: "₹22.8 Cr",
    userStake: 0,
    pendingRewards: 0,
    token: "IDX",
    riskLevel: "High",
  },
];

const recentTransactions: OnChainTx[] = [
  {
    hash: "0x4f2a...8c3d",
    type: "Stake",
    amount: "10,000",
    token: "WCH",
    status: "Confirmed",
    timestamp: "2 mins ago",
    blockNumber: 45823901,
  },
  {
    hash: "0x91bc...2e7f",
    type: "Reward",
    amount: "27.1",
    token: "USDC",
    status: "Confirmed",
    timestamp: "1 hour ago",
    blockNumber: 45823456,
  },
  {
    hash: "0xd3e8...aa01",
    type: "Purchase",
    amount: "5,000",
    token: "WCH",
    status: "Confirmed",
    timestamp: "3 hours ago",
    blockNumber: 45820123,
  },
  {
    hash: "0x17fc...bb44",
    type: "Claim",
    amount: "12.3",
    token: "WCH",
    status: "Pending",
    timestamp: "Just now",
    blockNumber: 45823910,
  },
];

const rarityColors: Record<NFTBadge["rarity"], string> = {
  Common: "text-gray-400 border-gray-300 bg-gray-50",
  Rare: "text-blue-600 border-blue-300 bg-blue-50",
  Epic: "text-purple-600 border-purple-300 bg-purple-50",
  Legendary: "text-yellow-600 border-yellow-300 bg-yellow-50",
};

const txTypeColors: Record<OnChainTx["type"], string> = {
  Stake: "text-blue-600 bg-blue-50",
  Unstake: "text-orange-600 bg-orange-50",
  Claim: "text-green-600 bg-green-50",
  Purchase: "text-purple-600 bg-purple-50",
  Reward: "text-yellow-600 bg-yellow-50",
};

const BlockchainWallet = () => {
  const navigate = useNavigate();
  const [walletConnected, setWalletConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [wchBalance, setWchBalance] = useState(15420.5);
  const [stakedBalance, setStakedBalance] = useState(15000);
  const [totalRewards, setTotalRewards] = useState(39.4);
  const [claimingRewards, setClaimingRewards] = useState(false);
  const [stakingPool, setStakingPool] = useState<string | null>(null);
  const [stakeAmounts, setStakeAmounts] = useState<Record<string, number>>({});

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) navigate("/auth");
    });
  }, [navigate]);

  const handleConnectWallet = async () => {
    setConnecting(true);
    // Simulated wallet connection delay
    await new Promise((r) => setTimeout(r, 1800));
    setWalletConnected(true);
    setConnecting(false);
    toast.success("Wallet connected successfully!", {
      description: `${MOCK_WALLET.slice(0, 10)}...${MOCK_WALLET.slice(-6)} on ${CHAIN_NAME}`,
    });
  };

  const copyAddress = () => {
    navigator.clipboard.writeText(MOCK_WALLET);
    toast.success("Address copied to clipboard");
  };

  const handleClaimRewards = async () => {
    setClaimingRewards(true);
    await new Promise((r) => setTimeout(r, 2000));
    setWchBalance((prev) => prev + totalRewards);
    setTotalRewards(0);
    setClaimingRewards(false);
    toast.success(`Claimed ${totalRewards.toFixed(2)} WCH rewards!`, {
      description: "Tokens added to your wallet",
    });
  };

  const handleStake = async (poolId: string, poolName: string) => {
    const amount = stakeAmounts[poolId];
    if (!amount || amount <= 0) {
      toast.error("Please enter a valid stake amount");
      return;
    }
    setStakingPool(poolId);
    await new Promise((r) => setTimeout(r, 1500));
    setWchBalance((prev) => prev - amount);
    setStakedBalance((prev) => prev + amount);
    setStakingPool(null);
    toast.success(`Staked ₹${amount.toLocaleString()} in ${poolName}`, {
      description: "Transaction confirmed on-chain",
    });
  };

  const earnedNFTs = nftBadges.filter((n) => n.earned);
  const lockedNFTs = nftBadges.filter((n) => !n.earned);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 p-8 rounded-2xl bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-blue-500/10 border border-indigo-500/20">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Wallet className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">Blockchain Wallet</h1>
            <Badge className="bg-indigo-100 text-indigo-700 border-indigo-300">Web3</Badge>
          </div>
          <p className="text-muted-foreground">
            Your on-chain portfolio, DeFi yields, and NFT achievements — all in one place.
          </p>
        </div>

        {/* Wallet Connection Banner */}
        {!walletConnected ? (
          <Card className="mb-8 border-indigo-200 bg-gradient-to-r from-indigo-50 to-purple-50">
            <CardContent className="p-8 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center">
                  <Wallet className="w-9 h-9 text-indigo-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-indigo-800 mb-1">Connect Your Web3 Wallet</h2>
                  <p className="text-indigo-600 text-sm max-w-md">
                    Link MetaMask or WalletConnect to access your on-chain portfolio,
                    stake WCH tokens, and claim NFT rewards.
                  </p>
                </div>
              </div>
              <Button
                size="lg"
                className="bg-indigo-600 hover:bg-indigo-700 text-white min-w-[180px]"
                onClick={handleConnectWallet}
                disabled={connecting}
              >
                {connecting ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Connecting…
                  </>
                ) : (
                  <>
                    <Wallet className="w-4 h-4 mr-2" />
                    Connect Wallet
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        ) : (
          /* Connected wallet header */
          <Card className="mb-8 border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
            <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-6 h-6 text-green-600" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-green-800">Connected</span>
                    <Badge className="bg-green-100 text-green-700 border-green-300 text-xs">
                      {CHAIN_NAME}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <code className="text-sm text-green-700 bg-green-100 px-2 py-0.5 rounded">
                      {MOCK_WALLET.slice(0, 12)}...{MOCK_WALLET.slice(-8)}
                    </code>
                    <button onClick={copyAddress} className="text-green-600 hover:text-green-800">
                      <Copy className="w-4 h-4" />
                    </button>
                    <a
                      href={`https://mumbai.polygonscan.com/address/${MOCK_WALLET}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-600 hover:text-green-800"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>
              <div className="flex gap-6 text-center">
                <div>
                  <div className="text-2xl font-bold text-green-800">{wchBalance.toLocaleString()}</div>
                  <div className="text-xs text-green-600">WCH Balance</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-indigo-800">{stakedBalance.toLocaleString()}</div>
                  <div className="text-xs text-indigo-600">Staked</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-yellow-700">{totalRewards.toFixed(2)}</div>
                  <div className="text-xs text-yellow-600">Pending Rewards</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className={!walletConnected ? "opacity-50 pointer-events-none" : ""}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">WCH Tokens</CardTitle>
              <Coins className="h-4 w-4 text-indigo-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{wchBalance.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">≈ ₹{(wchBalance * 0.85).toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
            </CardContent>
          </Card>

          <Card className={!walletConnected ? "opacity-50 pointer-events-none" : ""}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Staked Value</CardTitle>
              <Lock className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{stakedBalance.toLocaleString()}</div>
              <p className="text-xs text-green-600">Earning yield</p>
            </CardContent>
          </Card>

          <Card className={!walletConnected ? "opacity-50 pointer-events-none" : ""}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">NFTs Earned</CardTitle>
              <Gem className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{earnedNFTs.length}</div>
              <p className="text-xs text-muted-foreground">of {nftBadges.length} total</p>
            </CardContent>
          </Card>

          <Card className={!walletConnected ? "opacity-50 pointer-events-none" : ""}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending Rewards</CardTitle>
              <Zap className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{totalRewards.toFixed(2)}</div>
              <Button
                size="sm"
                variant="outline"
                className="mt-2 h-7 text-xs w-full"
                disabled={totalRewards === 0 || claimingRewards || !walletConnected}
                onClick={handleClaimRewards}
              >
                {claimingRewards ? (
                  <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                ) : (
                  <Zap className="w-3 h-3 mr-1" />
                )}
                {claimingRewards ? "Claiming…" : "Claim All"}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="defi" className={!walletConnected ? "opacity-50 pointer-events-none" : ""}>
          <TabsList className="mb-6">
            <TabsTrigger value="defi">
              <BarChart3 className="w-4 h-4 mr-2" />
              DeFi Pools
            </TabsTrigger>
            <TabsTrigger value="nfts">
              <Gem className="w-4 h-4 mr-2" />
              NFT Gallery
            </TabsTrigger>
            <TabsTrigger value="transactions">
              <Layers className="w-4 h-4 mr-2" />
              On-Chain Txns
            </TabsTrigger>
          </TabsList>

          {/* DeFi Pools */}
          <TabsContent value="defi">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {defiPools.map((pool) => (
                <Card key={pool.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-base">{pool.name}</CardTitle>
                        <p className="text-xs text-muted-foreground mt-0.5">{pool.protocol}</p>
                      </div>
                      <Badge
                        className={
                          pool.riskLevel === "Low"
                            ? "bg-green-100 text-green-700 border-green-300"
                            : pool.riskLevel === "Medium"
                            ? "bg-yellow-100 text-yellow-700 border-yellow-300"
                            : "bg-red-100 text-red-700 border-red-300"
                        }
                      >
                        {pool.riskLevel} Risk
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="bg-green-50 p-3 rounded-lg text-center">
                        <div className="text-xl font-bold text-green-700">{pool.apy}%</div>
                        <div className="text-xs text-green-600">APY</div>
                      </div>
                      <div className="bg-blue-50 p-3 rounded-lg text-center">
                        <div className="text-base font-bold text-blue-700">{pool.tvl}</div>
                        <div className="text-xs text-blue-600">TVL</div>
                      </div>
                    </div>

                    {pool.userStake > 0 && (
                      <div className="mb-4 p-3 bg-indigo-50 rounded-lg">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-indigo-600">Your Stake</span>
                          <span className="font-semibold text-indigo-800">₹{pool.userStake.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-indigo-600">Pending</span>
                          <span className="font-semibold text-yellow-700">{pool.pendingRewards} {pool.token}</span>
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <input
                        type="number"
                        placeholder="Amount (₹)"
                        className="flex-1 px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                        value={stakeAmounts[pool.id] || ""}
                        onChange={(e) =>
                          setStakeAmounts((prev) => ({ ...prev, [pool.id]: Number(e.target.value) }))
                        }
                      />
                      <Button
                        size="sm"
                        className="bg-indigo-600 hover:bg-indigo-700"
                        disabled={stakingPool === pool.id}
                        onClick={() => handleStake(pool.id, pool.name)}
                      >
                        {stakingPool === pool.id ? (
                          <RefreshCw className="w-3 h-3 animate-spin" />
                        ) : (
                          "Stake"
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* DeFi Summary */}
            <Card className="mt-6 border-indigo-100 bg-indigo-50/50">
              <CardContent className="p-6">
                <h3 className="font-semibold text-indigo-800 mb-3 flex items-center gap-2">
                  <Shield className="w-4 h-4" /> Smart Contract Security
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center gap-2 text-indigo-700">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    Audited by CertiK
                  </div>
                  <div className="flex items-center gap-2 text-indigo-700">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    Non-custodial smart contracts
                  </div>
                  <div className="flex items-center gap-2 text-indigo-700">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    Real-time on-chain verification
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* NFT Gallery */}
          <TabsContent value="nfts">
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-1">Earned NFTs ({earnedNFTs.length})</h3>
              <p className="text-sm text-muted-foreground mb-4">
                On-chain achievement badges minted to your wallet from PowerSIP milestones and platform activities.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {earnedNFTs.map((nft) => (
                  <Card
                    key={nft.id}
                    className={`border-2 ${rarityColors[nft.rarity]} hover:shadow-md transition-shadow`}
                  >
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <span className="text-4xl">{nft.emoji}</span>
                        <Badge className={rarityColors[nft.rarity]}>{nft.rarity}</Badge>
                      </div>
                      <h4 className="font-bold text-base mb-1">{nft.name}</h4>
                      <p className="text-xs text-muted-foreground mb-3">{nft.description}</p>
                      <div className="text-xs space-y-1 text-muted-foreground">
                        <div className="flex justify-between">
                          <span>Contract</span>
                          <code className="font-mono">{nft.contractAddress}</code>
                        </div>
                        <div className="flex justify-between">
                          <span>Token ID</span>
                          <code className="font-mono">#{nft.tokenId}</code>
                        </div>
                        <div className="flex justify-between">
                          <span>Earned</span>
                          <span>{nft.earnedDate}</span>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="mt-3 w-full text-xs h-7"
                        onClick={() =>
                          window.open(
                            `https://opensea.io/assets/matic/${nft.contractAddress}/${nft.tokenId}`,
                            "_blank"
                          )
                        }
                      >
                        <ExternalLink className="w-3 h-3 mr-1" />
                        View on OpenSea
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {lockedNFTs.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-1 text-muted-foreground flex items-center gap-2">
                  <Lock className="w-4 h-4" /> Locked NFTs ({lockedNFTs.length})
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Complete PowerSIP milestones to unlock these exclusive NFTs.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {lockedNFTs.map((nft) => (
                    <Card key={nft.id} className="border-2 border-gray-200 bg-gray-50 opacity-70">
                      <CardContent className="p-5">
                        <div className="flex items-start justify-between mb-3">
                          <span className="text-4xl grayscale">{nft.emoji}</span>
                          <Badge className="bg-gray-100 text-gray-500 border-gray-300">{nft.rarity}</Badge>
                        </div>
                        <h4 className="font-bold text-base mb-1 text-gray-500">{nft.name}</h4>
                        <p className="text-xs text-gray-400 mb-3">{nft.description}</p>
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                          <Lock className="w-3 h-3" />
                          <span>Complete milestone to unlock</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          {/* On-Chain Transactions */}
          <TabsContent value="transactions">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Layers className="w-5 h-5 text-indigo-600" />
                  On-Chain Transaction History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentTransactions.map((tx, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-full flex items-center justify-center ${txTypeColors[tx.type]}`}
                        >
                          {tx.type === "Stake" || tx.type === "Purchase" ? (
                            <ArrowDownLeft className="w-4 h-4" />
                          ) : (
                            <ArrowUpRight className="w-4 h-4" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm">{tx.type}</span>
                            <Badge
                              className={
                                tx.status === "Confirmed"
                                  ? "bg-green-100 text-green-700 border-green-300 text-xs"
                                  : "bg-yellow-100 text-yellow-700 border-yellow-300 text-xs"
                              }
                            >
                              {tx.status === "Confirmed" ? (
                                <CheckCircle className="w-3 h-3 mr-1" />
                              ) : (
                                <Clock className="w-3 h-3 mr-1" />
                              )}
                              {tx.status}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <code className="text-xs text-muted-foreground">{tx.hash}</code>
                            <a
                              href={`https://mumbai.polygonscan.com/tx/${tx.hash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-indigo-500 hover:text-indigo-700"
                            >
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-sm">
                          {tx.amount} {tx.token}
                        </div>
                        <div className="text-xs text-muted-foreground">{tx.timestamp}</div>
                        <div className="text-xs text-muted-foreground">Block #{tx.blockNumber}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 p-4 bg-indigo-50 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-indigo-700">
                    <LinkIcon className="w-4 h-4" />
                    All transactions are publicly verifiable on Polygon Mumbai
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-indigo-600 border-indigo-300"
                    onClick={() =>
                      window.open(
                        `https://mumbai.polygonscan.com/address/${MOCK_WALLET}`,
                        "_blank"
                      )
                    }
                  >
                    View on Explorer
                    <ExternalLink className="w-3 h-3 ml-1" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default BlockchainWallet;
