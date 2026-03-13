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
  Vote,
  Users,
  TrendingUp,
  Shield,
  Coins,
  CheckCircle,
  XCircle,
  Clock,
  ExternalLink,
  RefreshCw,
  PlusCircle,
  BarChart3,
  Lock,
  Unlock,
  ArrowRight,
  Zap,
  Star,
  Award,
  Globe,
} from "lucide-react";

interface DAOProposal {
  id: string;
  title: string;
  description: string;
  proposer: string;
  daoName: string;
  type: "Buy" | "Sell" | "Rebalance" | "AddMember" | "FeeChange";
  status: "Active" | "Passed" | "Rejected" | "Executed";
  forVotes: number;
  againstVotes: number;
  abstainVotes: number;
  quorum: number;
  deadline: string;
  createdAt: string;
  txHash?: string;
  amount?: string;
  userVote?: "for" | "against" | "abstain" | null;
}

interface InvestmentDAO {
  id: string;
  name: string;
  description: string;
  totalFunds: number;
  memberCount: number;
  yourTokens: number;
  totalTokens: number;
  apy: number;
  proposals: number;
  activeProposals: number;
  contractAddress: string;
  createdAt: string;
  yourRole: "Admin" | "Member" | "Observer";
  category: string;
}

const mockDAOs: InvestmentDAO[] = [
  {
    id: "dao-1",
    name: "BlueChip Collective",
    description: "Community-governed fund focusing on large-cap Indian equities and Nifty 50 constituents.",
    totalFunds: 2500000,
    memberCount: 42,
    yourTokens: 1200,
    totalTokens: 10000,
    apy: 18.4,
    proposals: 15,
    activeProposals: 2,
    contractAddress: "0xF3a2...d891",
    createdAt: "2024-01-10",
    yourRole: "Admin",
    category: "Large Cap",
  },
  {
    id: "dao-2",
    name: "Tech Innovators DAO",
    description: "Decentralized fund targeting high-growth technology and IT sector stocks.",
    totalFunds: 980000,
    memberCount: 18,
    yourTokens: 500,
    totalTokens: 5000,
    apy: 31.2,
    proposals: 8,
    activeProposals: 1,
    contractAddress: "0xB7c9...a203",
    createdAt: "2024-02-20",
    yourRole: "Member",
    category: "Technology",
  },
  {
    id: "dao-3",
    name: "Green Energy Fund",
    description: "ESG-focused DAO investing in renewable energy and sustainability-driven companies.",
    totalFunds: 450000,
    memberCount: 29,
    yourTokens: 0,
    totalTokens: 8000,
    apy: 14.6,
    proposals: 5,
    activeProposals: 0,
    contractAddress: "0xC4e1...f567",
    createdAt: "2024-03-05",
    yourRole: "Observer",
    category: "ESG",
  },
];

const mockProposals: DAOProposal[] = [
  {
    id: "prop-1",
    title: "Buy ₹2L of RELIANCE shares",
    description:
      "Reliance Industries reported strong Q3 results with 18% YoY revenue growth. This proposal allocates ₹2,00,000 from the treasury to purchase RELIANCE at current market price.",
    proposer: "0x9Fd2...3A1c",
    daoName: "BlueChip Collective",
    type: "Buy",
    status: "Active",
    forVotes: 6800,
    againstVotes: 1200,
    abstainVotes: 400,
    quorum: 5000,
    deadline: "2026-03-15",
    createdAt: "2026-03-10",
    amount: "₹2,00,000",
    userVote: null,
  },
  {
    id: "prop-2",
    title: "Rebalance: Reduce IT exposure by 5%",
    description:
      "Following the recent IT sector correction, this proposal reduces our IT allocation from 40% to 35% and moves funds to FMCG for defensive positioning.",
    proposer: "0x3Ab8...7E2f",
    daoName: "BlueChip Collective",
    type: "Rebalance",
    status: "Active",
    forVotes: 3200,
    againstVotes: 3900,
    abstainVotes: 200,
    quorum: 5000,
    deadline: "2026-03-14",
    createdAt: "2026-03-09",
    userVote: "for",
  },
  {
    id: "prop-3",
    title: "Buy ₹5L of INFY at dip",
    description:
      "Infosys hit 52-week support. Proposal to accumulate ₹5,00,000 worth of INFY shares over 5 trading days using TWAP strategy.",
    proposer: "0x7De4...1B9a",
    daoName: "Tech Innovators DAO",
    type: "Buy",
    status: "Passed",
    forVotes: 4200,
    againstVotes: 500,
    abstainVotes: 100,
    quorum: 3000,
    deadline: "2026-03-08",
    createdAt: "2026-03-03",
    amount: "₹5,00,000",
    txHash: "0xabc1...def2",
    userVote: "for",
  },
  {
    id: "prop-4",
    title: "Add new member: @cryptosage",
    description:
      "Community vote to onboard @cryptosage as a full member with 250 governance tokens. Applicant has 3+ years DeFi experience.",
    proposer: "0x1Cf3...8D5b",
    daoName: "BlueChip Collective",
    type: "AddMember",
    status: "Rejected",
    forVotes: 1800,
    againstVotes: 5200,
    abstainVotes: 300,
    quorum: 5000,
    deadline: "2026-03-05",
    createdAt: "2026-02-28",
    userVote: "against",
  },
];

const typeColors: Record<DAOProposal["type"], string> = {
  Buy: "bg-green-100 text-green-700 border-green-300",
  Sell: "bg-red-100 text-red-700 border-red-300",
  Rebalance: "bg-blue-100 text-blue-700 border-blue-300",
  AddMember: "bg-purple-100 text-purple-700 border-purple-300",
  FeeChange: "bg-orange-100 text-orange-700 border-orange-300",
};

const statusColors: Record<DAOProposal["status"], string> = {
  Active: "bg-yellow-100 text-yellow-700 border-yellow-300",
  Passed: "bg-green-100 text-green-700 border-green-300",
  Rejected: "bg-red-100 text-red-700 border-red-300",
  Executed: "bg-indigo-100 text-indigo-700 border-indigo-300",
};

const DAOGovernance = () => {
  const navigate = useNavigate();
  const [proposals, setProposals] = useState<DAOProposal[]>(mockProposals);
  const [votingId, setVotingId] = useState<string | null>(null);
  const [joiningId, setJoiningId] = useState<string | null>(null);
  const [selectedDAO, setSelectedDAO] = useState<InvestmentDAO | null>(mockDAOs[0]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newProposal, setNewProposal] = useState({ title: "", description: "", type: "Buy" as DAOProposal["type"] });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) navigate("/auth");
    });
  }, [navigate]);

  const handleVote = async (proposalId: string, vote: "for" | "against" | "abstain") => {
    const proposal = proposals.find((p) => p.id === proposalId);
    if (!proposal) return;
    if (proposal.userVote) {
      toast.error("You have already voted on this proposal");
      return;
    }
    if (proposal.status !== "Active") {
      toast.error("This proposal is no longer active");
      return;
    }

    setVotingId(proposalId);
    await new Promise((r) => setTimeout(r, 1500));

    setProposals((prev) =>
      prev.map((p) => {
        if (p.id !== proposalId) return p;
        const dao = mockDAOs.find((d) => d.name === p.daoName);
        const weight = dao?.yourTokens ?? 100;
        return {
          ...p,
          userVote: vote,
          forVotes: vote === "for" ? p.forVotes + weight : p.forVotes,
          againstVotes: vote === "against" ? p.againstVotes + weight : p.againstVotes,
          abstainVotes: vote === "abstain" ? p.abstainVotes + weight : p.abstainVotes,
        };
      })
    );

    setVotingId(null);
    toast.success(`Vote cast: ${vote.toUpperCase()}`, {
      description: "Your on-chain vote has been recorded.",
    });
  };

  const handleJoinDAO = async (daoId: string, daoName: string) => {
    setJoiningId(daoId);
    await new Promise((r) => setTimeout(r, 1800));
    setJoiningId(null);
    toast.success(`Joined ${daoName}!`, {
      description: "250 governance tokens allocated to your wallet.",
    });
  };

  const handleCreateProposal = async () => {
    if (!newProposal.title.trim() || !newProposal.description.trim()) {
      toast.error("Please fill in all fields");
      return;
    }
    const created: DAOProposal = {
      id: `prop-${Date.now()}`,
      title: newProposal.title,
      description: newProposal.description,
      proposer: "0x742d...8dA3",
      daoName: selectedDAO?.name ?? "BlueChip Collective",
      type: newProposal.type,
      status: "Active",
      forVotes: 0,
      againstVotes: 0,
      abstainVotes: 0,
      quorum: 5000,
      deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      createdAt: new Date().toISOString().split("T")[0],
      userVote: null,
    };
    setProposals((prev) => [created, ...prev]);
    setNewProposal({ title: "", description: "", type: "Buy" });
    setShowCreateForm(false);
    toast.success("Proposal submitted on-chain!", {
      description: "Voting opens immediately for DAO members.",
    });
  };

  const getVotePercent = (p: DAOProposal) => {
    const total = p.forVotes + p.againstVotes + p.abstainVotes;
    if (total === 0) return { for: 0, against: 0, abstain: 0 };
    return {
      for: Math.round((p.forVotes / total) * 100),
      against: Math.round((p.againstVotes / total) * 100),
      abstain: Math.round((p.abstainVotes / total) * 100),
    };
  };

  const activeProposals = proposals.filter((p) => p.status === "Active");
  const pastProposals = proposals.filter((p) => p.status !== "Active");

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">

        {/* Header */}
        <div className="mb-8 p-8 rounded-2xl bg-gradient-to-br from-violet-500/10 via-purple-500/5 to-indigo-500/10 border border-violet-500/20">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center">
              <Vote className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">DAO Governance</h1>
            <Badge className="bg-violet-100 text-violet-700 border-violet-300">Web3</Badge>
          </div>
          <p className="text-muted-foreground max-w-2xl">
            Investment groups powered by smart contracts. Hold governance tokens, vote on fund decisions,
            and earn yield — all on-chain with full transparency.
          </p>
        </div>

        {/* DAO Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Your DAOs</CardTitle>
              <Users className="h-4 w-4 text-violet-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {mockDAOs.filter((d) => d.yourRole !== "Observer").length}
              </div>
              <p className="text-xs text-muted-foreground">Active memberships</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Gov Tokens</CardTitle>
              <Coins className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {mockDAOs.reduce((s, d) => s + d.yourTokens, 0).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">Voting power</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Votes</CardTitle>
              <Vote className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{activeProposals.length}</div>
              <p className="text-xs text-muted-foreground">Require your vote</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total AUM</CardTitle>
              <TrendingUp className="h-4 w-4 text-indigo-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ₹{(mockDAOs.reduce((s, d) => s + (d.yourRole !== "Observer" ? d.totalFunds : 0), 0) / 100000).toFixed(1)}L
              </div>
              <p className="text-xs text-muted-foreground">Under governance</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="myDAOs">
          <TabsList className="mb-6">
            <TabsTrigger value="myDAOs">
              <Users className="w-4 h-4 mr-2" />
              My DAOs
            </TabsTrigger>
            <TabsTrigger value="proposals">
              <Vote className="w-4 h-4 mr-2" />
              Proposals
              {activeProposals.length > 0 && (
                <Badge className="ml-2 bg-yellow-100 text-yellow-700 border-yellow-300 text-xs px-1.5">
                  {activeProposals.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="explore">
              <Globe className="w-4 h-4 mr-2" />
              Explore DAOs
            </TabsTrigger>
          </TabsList>

          {/* My DAOs Tab */}
          <TabsContent value="myDAOs">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {mockDAOs.map((dao) => (
                <Card
                  key={dao.id}
                  className={`hover:shadow-md transition-shadow cursor-pointer ${
                    selectedDAO?.id === dao.id ? "ring-2 ring-violet-500" : ""
                  }`}
                  onClick={() => setSelectedDAO(dao)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-base">{dao.name}</CardTitle>
                        <p className="text-xs text-muted-foreground mt-0.5">{dao.category}</p>
                      </div>
                      <Badge
                        className={
                          dao.yourRole === "Admin"
                            ? "bg-violet-100 text-violet-700 border-violet-300"
                            : dao.yourRole === "Member"
                            ? "bg-blue-100 text-blue-700 border-blue-300"
                            : "bg-gray-100 text-gray-500 border-gray-300"
                        }
                      >
                        {dao.yourRole}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-muted-foreground mb-4 line-clamp-2">{dao.description}</p>

                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="bg-violet-50 p-2.5 rounded-lg text-center">
                        <div className="text-base font-bold text-violet-700">
                          ₹{(dao.totalFunds / 100000).toFixed(1)}L
                        </div>
                        <div className="text-xs text-violet-600">Total Funds</div>
                      </div>
                      <div className="bg-green-50 p-2.5 rounded-lg text-center">
                        <div className="text-base font-bold text-green-700">{dao.apy}%</div>
                        <div className="text-xs text-green-600">Avg APY</div>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm mb-4">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Members</span>
                        <span className="font-medium">{dao.memberCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Your Tokens</span>
                        <span className="font-semibold text-violet-700">{dao.yourTokens.toLocaleString()} WCH</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Voting Power</span>
                        <span className="font-medium">
                          {dao.totalTokens > 0
                            ? ((dao.yourTokens / dao.totalTokens) * 100).toFixed(1)
                            : "0"}%
                        </span>
                      </div>
                    </div>

                    {dao.yourTokens > 0 && (
                      <div className="mb-3">
                        <div className="flex justify-between text-xs text-muted-foreground mb-1">
                          <span>Your share</span>
                          <span>{((dao.yourTokens / dao.totalTokens) * 100).toFixed(1)}%</span>
                        </div>
                        <Progress
                          value={(dao.yourTokens / dao.totalTokens) * 100}
                          className="h-1.5"
                        />
                      </div>
                    )}

                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <code className="bg-gray-100 px-1.5 py-0.5 rounded">{dao.contractAddress}</code>
                      <a
                        href={`https://mumbai.polygonscan.com/address/${dao.contractAddress}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-500 hover:text-indigo-700"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Smart Contract Info */}
            <Card className="mt-6 border-violet-100 bg-violet-50/40">
              <CardContent className="p-6">
                <h3 className="font-semibold text-violet-800 mb-3 flex items-center gap-2">
                  <Shield className="w-4 h-4" /> How DAO Governance Works
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {[
                    { icon: Coins, title: "Hold Tokens", desc: "Get WCH governance tokens by investing in the group pool" },
                    { icon: Vote, title: "Vote on-chain", desc: "Each token = 1 vote. Propose and vote on fund decisions" },
                    { icon: CheckCircle, title: "Auto-Execute", desc: "Smart contracts execute passed proposals automatically" },
                    { icon: TrendingUp, title: "Earn Yield", desc: "Profits distributed proportionally to token holders" },
                  ].map(({ icon: Icon, title, desc }) => (
                    <div key={title} className="flex gap-3">
                      <div className="w-8 h-8 bg-violet-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Icon className="w-4 h-4 text-violet-600" />
                      </div>
                      <div>
                        <div className="font-semibold text-sm text-violet-800">{title}</div>
                        <div className="text-xs text-violet-600 mt-0.5">{desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Proposals Tab */}
          <TabsContent value="proposals">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold">Governance Proposals</h2>
                <p className="text-sm text-muted-foreground">Vote with your WCH tokens to shape investment decisions</p>
              </div>
              <Button
                className="bg-violet-600 hover:bg-violet-700"
                onClick={() => setShowCreateForm((v) => !v)}
              >
                <PlusCircle className="w-4 h-4 mr-2" />
                New Proposal
              </Button>
            </div>

            {/* Create Proposal Form */}
            {showCreateForm && (
              <Card className="mb-6 border-violet-200 bg-violet-50/40">
                <CardHeader>
                  <CardTitle className="text-base text-violet-800">Submit New Proposal</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground mb-1 block">Title</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-violet-300"
                        placeholder="e.g. Buy ₹1L of TCS shares"
                        value={newProposal.title}
                        onChange={(e) => setNewProposal((p) => ({ ...p, title: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground mb-1 block">Type</label>
                      <select
                        className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-violet-300 bg-white"
                        value={newProposal.type}
                        onChange={(e) =>
                          setNewProposal((p) => ({ ...p, type: e.target.value as DAOProposal["type"] }))
                        }
                      >
                        <option value="Buy">Buy</option>
                        <option value="Sell">Sell</option>
                        <option value="Rebalance">Rebalance</option>
                        <option value="AddMember">Add Member</option>
                        <option value="FeeChange">Fee Change</option>
                      </select>
                    </div>
                  </div>
                  <div className="mb-4">
                    <label className="text-sm font-medium text-muted-foreground mb-1 block">Description</label>
                    <textarea
                      className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-violet-300 resize-none"
                      rows={3}
                      placeholder="Explain your proposal with rationale and expected impact..."
                      value={newProposal.description}
                      onChange={(e) => setNewProposal((p) => ({ ...p, description: e.target.value }))}
                    />
                  </div>
                  <div className="flex gap-3">
                    <Button
                      className="bg-violet-600 hover:bg-violet-700"
                      onClick={handleCreateProposal}
                    >
                      <Zap className="w-4 h-4 mr-2" />
                      Submit On-Chain
                    </Button>
                    <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Active Proposals */}
            {activeProposals.length > 0 && (
              <div className="mb-8">
                <h3 className="text-base font-semibold text-yellow-700 flex items-center gap-2 mb-3">
                  <Clock className="w-4 h-4" /> Active — Voting Open
                </h3>
                <div className="space-y-4">
                  {activeProposals.map((proposal) => {
                    const pct = getVotePercent(proposal);
                    const total = proposal.forVotes + proposal.againstVotes + proposal.abstainVotes;
                    const quorumReached = total >= proposal.quorum;
                    return (
                      <Card key={proposal.id} className="border-yellow-200 bg-yellow-50/30">
                        <CardContent className="p-6">
                          <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                            <div>
                              <div className="flex items-center gap-2 flex-wrap mb-1">
                                <h4 className="font-bold text-base">{proposal.title}</h4>
                                <Badge className={typeColors[proposal.type]}>{proposal.type}</Badge>
                                <Badge className={statusColors[proposal.status]}>{proposal.status}</Badge>
                              </div>
                              <p className="text-xs text-muted-foreground">{proposal.daoName} · by {proposal.proposer}</p>
                            </div>
                            {proposal.amount && (
                              <div className="bg-green-50 px-3 py-1.5 rounded-lg">
                                <div className="text-sm font-bold text-green-700">{proposal.amount}</div>
                                <div className="text-xs text-green-600">Amount</div>
                              </div>
                            )}
                          </div>

                          <p className="text-sm text-muted-foreground mb-4">{proposal.description}</p>

                          {/* Vote bars */}
                          <div className="space-y-2 mb-4">
                            <div>
                              <div className="flex justify-between text-xs mb-1">
                                <span className="text-green-600 font-medium">For</span>
                                <span className="text-green-600">{pct.for}% ({proposal.forVotes.toLocaleString()} WCH)</span>
                              </div>
                              <Progress value={pct.for} className="h-2 [&>div]:bg-green-500" />
                            </div>
                            <div>
                              <div className="flex justify-between text-xs mb-1">
                                <span className="text-red-600 font-medium">Against</span>
                                <span className="text-red-600">{pct.against}% ({proposal.againstVotes.toLocaleString()} WCH)</span>
                              </div>
                              <Progress value={pct.against} className="h-2 [&>div]:bg-red-500" />
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                              <span className={quorumReached ? "text-green-600 font-medium" : "text-orange-600"}>
                                {quorumReached ? "✓ Quorum reached" : `Quorum: ${total.toLocaleString()}/${proposal.quorum.toLocaleString()}`}
                              </span>
                              <span>Deadline: {proposal.deadline}</span>
                            </div>

                            {proposal.userVote ? (
                              <Badge className="bg-indigo-100 text-indigo-700 border-indigo-300">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Voted: {proposal.userVote.toUpperCase()}
                              </Badge>
                            ) : (
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  className="bg-green-600 hover:bg-green-700 h-8"
                                  disabled={votingId === proposal.id}
                                  onClick={() => handleVote(proposal.id, "for")}
                                >
                                  {votingId === proposal.id ? (
                                    <RefreshCw className="w-3 h-3 animate-spin" />
                                  ) : (
                                    <CheckCircle className="w-3 h-3 mr-1" />
                                  )}
                                  For
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-red-600 border-red-300 hover:bg-red-50 h-8"
                                  disabled={votingId === proposal.id}
                                  onClick={() => handleVote(proposal.id, "against")}
                                >
                                  <XCircle className="w-3 h-3 mr-1" />
                                  Against
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-8 text-muted-foreground"
                                  disabled={votingId === proposal.id}
                                  onClick={() => handleVote(proposal.id, "abstain")}
                                >
                                  Abstain
                                </Button>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Past Proposals */}
            {pastProposals.length > 0 && (
              <div>
                <h3 className="text-base font-semibold text-muted-foreground flex items-center gap-2 mb-3">
                  <BarChart3 className="w-4 h-4" /> Past Proposals
                </h3>
                <div className="space-y-3">
                  {pastProposals.map((proposal) => {
                    const pct = getVotePercent(proposal);
                    return (
                      <Card key={proposal.id} className="opacity-80">
                        <CardContent className="p-5">
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                              <div className="flex items-center gap-2 flex-wrap mb-1">
                                <h4 className="font-semibold text-sm">{proposal.title}</h4>
                                <Badge className={typeColors[proposal.type]}>{proposal.type}</Badge>
                                <Badge className={statusColors[proposal.status]}>{proposal.status}</Badge>
                              </div>
                              <p className="text-xs text-muted-foreground">{proposal.daoName} · {proposal.createdAt}</p>
                            </div>
                            <div className="flex items-center gap-3 text-xs">
                              <span className="text-green-600">{pct.for}% For</span>
                              <span className="text-red-600">{pct.against}% Against</span>
                              {proposal.txHash && (
                                <a
                                  href={`https://mumbai.polygonscan.com/tx/${proposal.txHash}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-indigo-500 hover:text-indigo-700 flex items-center gap-1"
                                >
                                  <code>{proposal.txHash}</code>
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}
          </TabsContent>

          {/* Explore DAOs */}
          <TabsContent value="explore">
            <div className="mb-6">
              <h2 className="text-xl font-bold mb-1">Discover Investment DAOs</h2>
              <p className="text-sm text-muted-foreground">Join on-chain investment communities and earn governance tokens</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {mockDAOs.map((dao) => (
                <Card key={dao.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-base">{dao.name}</CardTitle>
                      <Badge className="bg-gray-100 text-gray-600 border-gray-300">{dao.category}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">{dao.description}</p>
                    <div className="grid grid-cols-3 gap-2 mb-4 text-center">
                      <div className="bg-violet-50 p-2 rounded-lg">
                        <div className="text-sm font-bold text-violet-700">{dao.memberCount}</div>
                        <div className="text-xs text-violet-600">Members</div>
                      </div>
                      <div className="bg-green-50 p-2 rounded-lg">
                        <div className="text-sm font-bold text-green-700">{dao.apy}%</div>
                        <div className="text-xs text-green-600">APY</div>
                      </div>
                      <div className="bg-blue-50 p-2 rounded-lg">
                        <div className="text-sm font-bold text-blue-700">
                          ₹{(dao.totalFunds / 100000).toFixed(1)}L
                        </div>
                        <div className="text-xs text-blue-600">AUM</div>
                      </div>
                    </div>
                    {dao.yourRole !== "Observer" ? (
                      <Button variant="outline" className="w-full" disabled>
                        <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                        Already a Member
                      </Button>
                    ) : (
                      <Button
                        className="w-full bg-violet-600 hover:bg-violet-700"
                        disabled={joiningId === dao.id}
                        onClick={() => handleJoinDAO(dao.id, dao.name)}
                      >
                        {joiningId === dao.id ? (
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <ArrowRight className="w-4 h-4 mr-2" />
                        )}
                        {joiningId === dao.id ? "Joining…" : "Join DAO"}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default DAOGovernance;
