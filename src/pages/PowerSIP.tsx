// PowerSIP - Force Vercel Deployment
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navbar from "@/components/Navbar";
import { toast } from "sonner";
import {
    Zap,
    Trophy,
    Target,
    TrendingUp,
    Award,
    Star,
    Gift,
    Brain,
    Calendar,
    Coins,
    Crown,
    Gem,
    Shield,
    Rocket,
    Calculator,
    ArrowRight,
    IndianRupee,
    Clock,
    BarChart3,
    Medal,
    CheckCircle,
    Lock
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface SIPLevel {
    level: number;
    title: string;
    description: string;
    minMonths: number;
    maxMonths: number;
    icon: string;
    color: string;
    benefits: string[];
}

interface Milestone {
    months: number;
    title: string;
    reward: string;
    nft: string;
    bonus: string;
    icon: string;
    color: string;
}

interface SIPFund {
    id: string;
    name: string;
    category: string;
    nav: number;
    rating: string;
    fundSize: string;
    minSip: number;
    returns: {
        oneYear: number;
        threeYear: number;
        fiveYear: number;
    };
    riskLevel: 'Low' | 'Moderate' | 'High';
    manager: string;
    description: string;
}

const PowerSIP = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState<any>(null);
    const [currentLevel, setCurrentLevel] = useState(1);
    const [sipMonths, setSipMonths] = useState(0);
    const [xpPoints, setXpPoints] = useState(0);
    const [knowledgeTokens, setKnowledgeTokens] = useState(0);
    const [unlockedNFTs, setUnlockedNFTs] = useState<string[]>([]);
    const [performanceBoost, setPerformanceBoost] = useState(0);
    const [selectedSip, setSelectedSip] = useState<SIPFund | null>(null);
    const [sipAmount, setSipAmount] = useState(5000);
    const [sipDuration, setSipDuration] = useState(12);
    const [calculatorResults, setCalculatorResults] = useState({
        totalInvestment: 0,
        expectedReturns: 0,
        maturityAmount: 0
    });
    const [userInvestments, setUserInvestments] = useState<any[]>([]);
    const [totalInvestedAmount, setTotalInvestedAmount] = useState(0);
    const [activeSIPs, setActiveSIPs] = useState<string[]>([]);

    const sipLevels: SIPLevel[] = [
        {
            level: 1,
            title: "Rookie Investor",
            description: "Complete 3 months of consistent SIP investing",
            minMonths: 1,
            maxMonths: 3,
            icon: "🚀",
            color: "bg-green-500",
            benefits: [
                "🏅 Bronze Investor Medal",
                "📊 Basic portfolio tracking",
                "📄 Monthly SIP reports",
                "👥 Community access",
                "🎁 Welcome bonus of 100 tokens"
            ]
        },
        {
            level: 2,
            title: "Consistent Climber",
            description: "Achieve 6 months of disciplined SIP journey",
            minMonths: 4,
            maxMonths: 6,
            icon: "📈",
            color: "bg-blue-500",
            benefits: [
                "🥈 Silver Achievement Badge",
                "📈 Advanced analytics dashboard",
                "🎧 Priority customer support",
                "💰 5% transaction fee discount",
                "🎯 Custom investment alerts",
                "🏆 Consistency Streak Reward"
            ]
        },
        {
            level: 3,
            title: "Market Maverick",
            description: "Master 12 months of strategic SIP investing",
            minMonths: 7,
            maxMonths: 12,
            icon: "🎯",
            color: "bg-purple-500",
            benefits: [
                "🥇 Gold Master Medal",
                "🤖 AI-powered investment insights",
                "⚡ Custom portfolio strategies",
                "💸 10% transaction fee discount",
                "🎨 Exclusive NFT badge collection",
                "🔔 Market movement predictions",
                "💎 VIP community access"
            ]
        },
        {
            level: 4,
            title: "Wealth Wizard",
            description: "Elite status after 13+ months of wealth building",
            minMonths: 13,
            maxMonths: 999,
            icon: "🧙‍♂️",
            color: "bg-gradient-to-r from-yellow-400 to-orange-500",
            benefits: [
                "💎 Diamond Elite Crown",
                "🧠 Premium AI investment advisor",
                "👑 VIP concierge support",
                "🎉 15% transaction fee discount",
                "🌟 Exclusive ultra-rare NFTs",
                "🚀 Early access to new features",
                "💰 Quarterly bonus rewards",
                "🏛️ Elite investor club membership"
            ]
        }
    ];

    const milestones: Milestone[] = [
        {
            months: 3,
            title: "First Quarter Champion",
            reward: "Bronze Investment Medal + NFT",
            nft: "🥉",
            bonus: "₹500 cashback + 100 bonus tokens",
            icon: "🎖️",
            color: "bg-amber-600"
        },
        {
            months: 6,
            title: "Half Year Hero",
            reward: "Silver Achievement Badge + NFT",
            nft: "🥈",
            bonus: "Priority support + 5% fee waiver for 3 months",
            icon: "🏆",
            color: "bg-gray-400"
        },
        {
            months: 9,
            title: "Persistent Pro",
            reward: "Platinum Consistency Medal",
            nft: "⭐",
            bonus: "₹1,000 investment bonus + AI insights unlock",
            icon: "🌟",
            color: "bg-purple-500"
        },
        {
            months: 12,
            title: "Annual Achiever",
            reward: "Gold Master Badge + Rare NFT",
            nft: "🥇",
            bonus: "Free portfolio review + 10% fee discount",
            icon: "👑",
            color: "bg-yellow-500"
        },
        {
            months: 18,
            title: "Investment Sage",
            reward: "Emerald Wisdom Medal",
            nft: "💚",
            bonus: "₹2,000 bonus + Custom strategy session",
            icon: "�",
            color: "bg-emerald-500"
        },
        {
            months: 24,
            title: "Diamond Dynasty",
            reward: "Diamond Elite Crown + Ultra Rare NFT",
            nft: "💎",
            bonus: "₹5,000 cashback + VIP status + Fee waivers",
            icon: "💍",
            color: "bg-cyan-400"
        },
        {
            months: 36,
            title: "Wealth Legend",
            reward: "Legendary Status + Mythical NFT",
            nft: "🏛️",
            bonus: "₹10,000 bonus + Lifetime benefits",
            icon: "⚡",
            color: "bg-gradient-to-r from-purple-500 to-pink-500"
        }
    ];

    const learningQuizzes = [
        { id: 1, title: "What is CAGR?", reward: 10, completed: false },
        { id: 2, title: "How SIP works", reward: 15, completed: false },
        { id: 3, title: "Risk vs Return", reward: 20, completed: false },
        { id: 4, title: "Portfolio Diversification", reward: 25, completed: false },
        { id: 5, title: "Market Volatility", reward: 30, completed: false }
    ];

    const availableSIPs: SIPFund[] = [
        {
            id: "sip1",
            name: "HDFC Top 100 Fund",
            category: "Large Cap",
            nav: 855.34,
            rating: "4⭐",
            fundSize: "₹34,521.37 Cr",
            minSip: 500,
            returns: { oneYear: 15.67, threeYear: 12.45, fiveYear: 14.23 },
            riskLevel: "Moderate",
            manager: "Chirag Setalvad",
            description: "Invests primarily in large-cap stocks with proven track record"
        },
        {
            id: "sip2",
            name: "SBI Small Cap Fund",
            category: "Small Cap",
            nav: 145.67,
            rating: "5⭐",
            fundSize: "₹12,847.23 Cr",
            minSip: 500,
            returns: { oneYear: 28.45, threeYear: 18.67, fiveYear: 16.89 },
            riskLevel: "High",
            manager: "R. Srinivasan",
            description: "High growth potential through small cap equity investments"
        },
        {
            id: "sip3",
            name: "ICICI Prudential Bluechip Fund",
            category: "Large Cap",
            nav: 67.89,
            rating: "4⭐",
            fundSize: "₹28,956.12 Cr",
            minSip: 1000,
            returns: { oneYear: 13.45, threeYear: 11.23, fiveYear: 13.67 },
            riskLevel: "Moderate",
            manager: "Anish Tawakley",
            description: "Diversified large cap fund for steady wealth creation"
        },
        {
            id: "sip4",
            name: "Axis Midcap Fund",
            category: "Mid Cap",
            nav: 89.23,
            rating: "5⭐",
            fundSize: "₹8,734.56 Cr",
            minSip: 500,
            returns: { oneYear: 22.34, threeYear: 16.78, fiveYear: 15.45 },
            riskLevel: "High",
            manager: "Shreyash Devalkar",
            description: "Focuses on mid-cap companies with high growth potential"
        },
        {
            id: "sip5",
            name: "Mirae Asset Large Cap Fund",
            category: "Large Cap",
            nav: 123.45,
            rating: "4⭐",
            fundSize: "₹19,234.67 Cr",
            minSip: 500,
            returns: { oneYear: 14.56, threeYear: 12.89, fiveYear: 13.92 },
            riskLevel: "Moderate",
            manager: "Neelesh Surana",
            description: "Well-diversified large cap portfolio for consistent returns"
        },
        {
            id: "sip6",
            name: "Parag Parikh Flexi Cap Fund",
            category: "Flexi Cap",
            nav: 67.23,
            rating: "5⭐",
            fundSize: "₹45,678.34 Cr",
            minSip: 1000,
            returns: { oneYear: 19.23, threeYear: 15.67, fiveYear: 17.45 },
            riskLevel: "Moderate",
            manager: "Rajeev Thakkar",
            description: "Flexible investment across market caps and geographies"
        },
        {
            id: "sip7",
            name: "Kotak Emerging Equity Fund",
            category: "Multi Cap",
            nav: 234.56,
            rating: "4⭐",
            fundSize: "₹12,456.78 Cr",
            minSip: 500,
            returns: { oneYear: 17.89, threeYear: 14.23, fiveYear: 15.67 },
            riskLevel: "High",
            manager: "Pankaj Tibrewal",
            description: "Invests in emerging companies across market segments"
        },
        {
            id: "sip8",
            name: "DSP Tax Saver Fund",
            category: "ELSS",
            nav: 89.67,
            rating: "4⭐",
            fundSize: "₹7,892.34 Cr",
            minSip: 500,
            returns: { oneYear: 16.34, threeYear: 13.45, fiveYear: 14.78 },
            riskLevel: "Moderate",
            manager: "Vinit Sambre",
            description: "Tax saving fund with 3-year lock-in period"
        }
    ];

    useEffect(() => {
        const fetchUserData = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setUser(user);

                // Fetch user's actual investment data from database
                // For now, check localStorage for demo purposes
                const storedInvestments = localStorage.getItem(`powerSIP_investments_${user.id}`);
                const storedSIPs = localStorage.getItem(`active_sips_${user.id}`);

                if (storedInvestments) {
                    const investments = JSON.parse(storedInvestments);
                    setUserInvestments(investments);

                    // Calculate total invested amount
                    const totalAmount = investments.reduce((sum: number, inv: any) => sum + inv.amount, 0);
                    setTotalInvestedAmount(totalAmount);

                    // Calculate active SIP months based on actual investments
                    const firstInvestmentDate = investments.length > 0 ? new Date(investments[0].date) : new Date();
                    const monthsActive = Math.floor((Date.now() - firstInvestmentDate.getTime()) / (1000 * 60 * 60 * 24 * 30));
                    setSipMonths(Math.max(0, monthsActive));

                    // Calculate XP based on investment activity
                    setXpPoints(investments.length * 50 + totalAmount * 0.01);

                    // Calculate knowledge tokens based on investment experience
                    setKnowledgeTokens(Math.floor(totalAmount * 0.001) + investments.length * 10);

                    // Performance boost based on consistent investing
                    const consistentMonths = investments.length;
                    setPerformanceBoost(Math.min(15, consistentMonths * 2));

                    // Determine current level based on actual investment activity
                    let currentLvl = 1;
                    if (totalAmount >= 50000 && monthsActive >= 13) currentLvl = 4;
                    else if (totalAmount >= 25000 && monthsActive >= 7) currentLvl = 3;
                    else if (totalAmount >= 10000 && monthsActive >= 4) currentLvl = 2;
                    else if (totalAmount >= 1000 && monthsActive >= 1) currentLvl = 1;
                    else currentLvl = 0; // No level if no investments

                    setCurrentLevel(currentLvl);

                    // Set unlocked NFTs based on actual milestones achieved
                    const unlocked = milestones
                        .filter(m => monthsActive >= m.months && totalAmount >= m.months * 500)
                        .map(m => m.nft);
                    setUnlockedNFTs(unlocked);
                } else {
                    // No investments yet - set everything to 0/locked
                    setSipMonths(0);
                    setXpPoints(0);
                    setKnowledgeTokens(0);
                    setPerformanceBoost(0);
                    setCurrentLevel(0); // No level until first investment
                    setUnlockedNFTs([]);
                }

                if (storedSIPs) {
                    setActiveSIPs(JSON.parse(storedSIPs));
                }
            }
        };

        fetchUserData();
    }, []);

    const currentLevelData = sipLevels.find(l => l.level === currentLevel) || sipLevels[0];
    const nextLevel = sipLevels.find(l => l.level === currentLevel + 1);
    const progressToNextLevel = nextLevel ?
        ((sipMonths - currentLevelData.minMonths) / (nextLevel.minMonths - currentLevelData.minMonths)) * 100 : 100;

    const handleStartSIP = () => {
        // Navigate to SIP setup - implement based on your flow
        console.log("Starting PowerSIP Journey...");
    };

    const handleTakeQuiz = (quizId: number) => {
        // Implement quiz logic
        console.log(`Taking quiz ${quizId}`);
    };

    const calculateSIP = (amount: number, duration: number, expectedReturn: number = 12) => {
        const monthlyRate = expectedReturn / 100 / 12;
        const totalInvestment = amount * duration;
        const maturityAmount = amount * (((Math.pow(1 + monthlyRate, duration) - 1) / monthlyRate) * (1 + monthlyRate));
        const expectedReturns = maturityAmount - totalInvestment;

        setCalculatorResults({
            totalInvestment,
            expectedReturns,
            maturityAmount
        });
    };

    const handleSipSelect = (sip: SIPFund) => {
        setSelectedSip(sip);
        calculateSIP(sipAmount, sipDuration, sip.returns.fiveYear);
    };

    const handleAmountChange = (amount: number) => {
        setSipAmount(amount);
        if (selectedSip) {
            calculateSIP(amount, sipDuration, selectedSip.returns.fiveYear);
        }
    };

    const handleDurationChange = (duration: number) => {
        setSipDuration(duration);
        if (selectedSip) {
            calculateSIP(sipAmount, duration, selectedSip.returns.fiveYear);
        }
    };

    const handleStartSIPInvestment = async () => {
        if (!selectedSip) {
            toast.error('Please select a SIP plan first');
            return;
        }

        if (!user) {
            toast.error('Please log in to start SIP investment');
            return;
        }

        console.log('Starting SIP investment:', {
            selectedSip: selectedSip.name,
            amount: sipAmount,
            duration: sipDuration,
            user: user.id
        });

        try {
            // Create new investment record for PowerSIP tracking
            const newInvestment = {
                id: Date.now().toString(),
                sipId: selectedSip.id,
                sipName: selectedSip.name,
                amount: sipAmount,
                duration: sipDuration,
                date: new Date().toISOString(),
                expectedReturns: calculatorResults.expectedReturns,
                maturityAmount: calculatorResults.maturityAmount,
                status: 'active'
            };

            // Update PowerSIP investments in localStorage
            const existingInvestments = localStorage.getItem(`powerSIP_investments_${user.id}`);
            const investments = existingInvestments ? JSON.parse(existingInvestments) : [];
            investments.push(newInvestment);
            localStorage.setItem(`powerSIP_investments_${user.id}`, JSON.stringify(investments));

            // Update active SIPs
            const existingSIPs = localStorage.getItem(`active_sips_${user.id}`);
            const sips = existingSIPs ? JSON.parse(existingSIPs) : [];
            if (!sips.includes(selectedSip.id)) {
                sips.push(selectedSip.id);
                localStorage.setItem(`active_sips_${user.id}`, JSON.stringify(sips));
            }

            // Add SIP to portfolio table in Supabase
            const { data: stockData, error: stockError } = await supabase
                .from('stocks')
                .select('id')
                .eq('symbol', selectedSip.id)
                .single();

            let stockId;
            if (stockError || !stockData) {
                // Create new stock entry for SIP fund
                const { data: newStock, error: createError } = await supabase
                    .from('stocks')
                    .insert({
                        symbol: selectedSip.id,
                        name: selectedSip.name,
                        current_price: selectedSip.nav,
                        change_percent: 0,
                        sector: selectedSip.category
                    })
                    .select()
                    .single();

                if (createError) {
                    console.error('Error creating stock:', createError);
                    throw createError;
                }
                stockId = newStock.id;
            } else {
                stockId = stockData.id;
            }

            // Calculate units based on monthly SIP amount and NAV
            const unitsPerMonth = sipAmount / selectedSip.nav;
            const totalUnits = unitsPerMonth * sipDuration;

            // Check if user already has this SIP in portfolio
            const { data: existingPortfolio, error: portfolioError } = await supabase
                .from('user_portfolios')
                .select('*')
                .eq('user_id', user.id)
                .eq('stock_id', stockId)
                .single();

            if (portfolioError && portfolioError.code !== 'PGRST116') {
                console.error('Error checking portfolio:', portfolioError);
                throw portfolioError;
            }

            if (existingPortfolio) {
                // Update existing portfolio entry
                const newQuantity = existingPortfolio.quantity + totalUnits;
                const newTotalInvested = existingPortfolio.total_invested + (sipAmount * sipDuration);
                const newAveragePrice = newTotalInvested / newQuantity;

                const { error: updateError } = await supabase
                    .from('user_portfolios')
                    .update({
                        quantity: newQuantity,
                        average_price: newAveragePrice,
                        total_invested: newTotalInvested,
                        current_value: newQuantity * selectedSip.nav
                    })
                    .eq('id', existingPortfolio.id);

                if (updateError) {
                    console.error('Error updating portfolio:', updateError);
                    throw updateError;
                }
            } else {
                // Create new portfolio entry
                const { error: insertError } = await supabase
                    .from('user_portfolios')
                    .insert({
                        user_id: user.id,
                        stock_id: stockId,
                        quantity: totalUnits,
                        average_price: selectedSip.nav,
                        total_invested: sipAmount * sipDuration,
                        current_value: totalUnits * selectedSip.nav
                    });

                if (insertError) {
                    console.error('Error adding to portfolio:', insertError);
                    throw insertError;
                }
            }

            // Show success message
            toast.success(`🎉 SIP Investment Started!`, {
                description: `₹${sipAmount.toLocaleString()} monthly SIP in ${selectedSip.name} has been added to your portfolio!`
            });

            // Refresh user data to update levels and stats
            setTimeout(() => {
                window.location.reload();
            }, 2000);

        } catch (error) {
            console.error('Error starting SIP investment:', error);
            toast.error('Failed to start SIP investment', {
                description: 'Please try again or contact support if the problem persists.'
            });
        }
    };

    if (!user) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-center">
                    <h1 className="text-3xl font-bold mb-4">Please log in to access PowerSIP Journey</h1>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="flex items-center justify-center gap-2 mb-4">
                        <Zap className="w-8 h-8 text-purple-600" />
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                            PowerSIP Journey
                        </h1>
                        <Zap className="w-8 h-8 text-purple-600" />
                    </div>
                    <p className="text-lg text-muted-foreground">
                        Level up your investing game with gamified SIPs, NFT rewards, and real perks!
                    </p>
                </div>

                {/* Current Level Card */}
                <Card className={`mb-8 border-2 ${currentLevel === 0 ? 'border-gray-300 bg-gradient-to-r from-gray-50 to-gray-100' : 'border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50'}`}>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="text-4xl">{currentLevel === 0 ? '🔒' : currentLevelData.icon}</div>
                                <div>
                                    <CardTitle className="text-2xl">
                                        {currentLevel === 0 ? 'Start Your Journey' : currentLevelData.title}
                                    </CardTitle>
                                    <p className="text-muted-foreground">
                                        {currentLevel === 0 ?
                                            'Make your first SIP investment to unlock Level 1!' :
                                            currentLevelData.description
                                        }
                                    </p>
                                </div>
                            </div>
                            <Badge className={`${currentLevel === 0 ? 'bg-gray-500' : currentLevelData.color} text-white px-4 py-2 text-lg`}>
                                {currentLevel === 0 ? 'Not Started' : `Level ${currentLevel}`}
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                            <div className="text-center">
                                <div className="text-3xl font-bold text-purple-600">{sipMonths}</div>
                                <div className="text-sm text-muted-foreground">Months Active</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-blue-600">{xpPoints}</div>
                                <div className="text-sm text-muted-foreground">Investor XP</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-green-600">{knowledgeTokens}</div>
                                <div className="text-sm text-muted-foreground">Knowledge Tokens</div>
                            </div>
                        </div>

                        {nextLevel && (
                            <div className="mb-4">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm text-muted-foreground">Progress to {nextLevel.title}</span>
                                    <span className="text-sm font-medium">{Math.round(progressToNextLevel)}%</span>
                                </div>
                                <Progress value={progressToNextLevel} className="h-3" />
                            </div>
                        )}

                        <div className="flex flex-wrap gap-2">
                            {currentLevel === 0 ? (
                                <Badge variant="outline" className="text-xs">
                                    🚀 Start investing to unlock rewards!
                                </Badge>
                            ) : (
                                currentLevelData.benefits.map((benefit, index) => (
                                    <Badge key={index} variant="secondary" className="text-xs">
                                        {benefit}
                                    </Badge>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Tabs defaultValue="sips" className="w-full">
                    <TabsList className="grid w-full grid-cols-5">
                        <TabsTrigger value="sips">💰 SIP Marketplace</TabsTrigger>
                        <TabsTrigger value="journey">🚀 Journey</TabsTrigger>
                        <TabsTrigger value="milestones">🏆 Milestones</TabsTrigger>
                        <TabsTrigger value="nfts">💎 NFT Collection</TabsTrigger>
                        <TabsTrigger value="learning">🧠 Learn & Earn</TabsTrigger>
                    </TabsList>

                    {/* SIP Marketplace Tab */}
                    <TabsContent value="sips" className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* SIP List */}
                            <div className="lg:col-span-2 space-y-4">
                                <h3 className="text-xl font-semibold mb-4">Available SIP Plans</h3>
                                {availableSIPs.map((sip) => (
                                    <Card
                                        key={sip.id}
                                        className={`cursor-pointer transition-all hover:shadow-lg ${selectedSip?.id === sip.id ? 'ring-2 ring-purple-500 bg-purple-50' : ''
                                            }`}
                                        onClick={() => handleSipSelect(sip)}
                                    >
                                        <CardContent className="p-4">
                                            <div className="flex justify-between items-start mb-3">
                                                <div>
                                                    <h4 className="font-semibold text-lg">{sip.name}</h4>
                                                    <p className="text-sm text-muted-foreground">{sip.category}</p>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-lg font-bold">₹{sip.nav}</div>
                                                    <div className="text-sm text-muted-foreground">NAV</div>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-3 gap-4 mb-3">
                                                <div>
                                                    <div className="text-sm text-muted-foreground">Rating</div>
                                                    <div className="font-medium">{sip.rating}</div>
                                                </div>
                                                <div>
                                                    <div className="text-sm text-muted-foreground">Min. SIP</div>
                                                    <div className="font-medium">₹{sip.minSip}</div>
                                                </div>
                                                <div>
                                                    <div className="text-sm text-muted-foreground">5Y Return</div>
                                                    <div className="font-medium text-green-600">{sip.returns.fiveYear}%</div>
                                                </div>
                                            </div>

                                            <div className="flex justify-between items-center">
                                                <Badge
                                                    className={`${sip.riskLevel === 'Low' ? 'bg-green-100 text-green-800' :
                                                        sip.riskLevel === 'Moderate' ? 'bg-yellow-100 text-yellow-800' :
                                                            'bg-red-100 text-red-800'
                                                        }`}
                                                >
                                                    {sip.riskLevel} Risk
                                                </Badge>
                                                <Button size="sm" variant="outline">
                                                    View Details <ArrowRight className="w-4 h-4 ml-1" />
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>

                            {/* SIP Details & Calculator */}
                            <div className="space-y-4">
                                {selectedSip ? (
                                    <>
                                        {/* Selected SIP Details */}
                                        <Card className="border-purple-200">
                                            <CardHeader>
                                                <CardTitle className="text-lg">{selectedSip.name}</CardTitle>
                                                <p className="text-sm text-muted-foreground">{selectedSip.description}</p>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="space-y-3">
                                                    <div className="flex justify-between">
                                                        <span className="text-sm text-muted-foreground">Fund Manager</span>
                                                        <span className="text-sm font-medium">{selectedSip.manager}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-sm text-muted-foreground">Fund Size</span>
                                                        <span className="text-sm font-medium">{selectedSip.fundSize}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-sm text-muted-foreground">1Y Return</span>
                                                        <span className="text-sm font-medium text-green-600">{selectedSip.returns.oneYear}%</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-sm text-muted-foreground">3Y Return</span>
                                                        <span className="text-sm font-medium text-green-600">{selectedSip.returns.threeYear}%</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-sm text-muted-foreground">5Y Return</span>
                                                        <span className="text-sm font-medium text-green-600">{selectedSip.returns.fiveYear}%</span>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>

                                        {/* SIP Calculator */}
                                        <Card className="border-green-200">
                                            <CardHeader>
                                                <CardTitle className="flex items-center gap-2">
                                                    <Calculator className="w-5 h-5" />
                                                    SIP Calculator
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="space-y-4">
                                                <div>
                                                    <label className="text-sm font-medium">Monthly Investment</label>
                                                    <div className="flex items-center mt-1">
                                                        <IndianRupee className="w-4 h-4 text-muted-foreground mr-1" />
                                                        <input
                                                            type="range"
                                                            min="500"
                                                            max="50000"
                                                            value={sipAmount}
                                                            onChange={(e) => handleAmountChange(Number(e.target.value))}
                                                            className="flex-1 mr-3"
                                                        />
                                                        <span className="font-medium">₹{sipAmount.toLocaleString()}</span>
                                                    </div>
                                                </div>

                                                <div>
                                                    <label className="text-sm font-medium">Investment Period</label>
                                                    <div className="flex items-center mt-1">
                                                        <Clock className="w-4 h-4 text-muted-foreground mr-1" />
                                                        <input
                                                            type="range"
                                                            min="6"
                                                            max="240"
                                                            value={sipDuration}
                                                            onChange={(e) => handleDurationChange(Number(e.target.value))}
                                                            className="flex-1 mr-3"
                                                        />
                                                        <span className="font-medium">{Math.floor(sipDuration / 12)}Y {sipDuration % 12}M</span>
                                                    </div>
                                                </div>

                                                <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg">
                                                    <div className="space-y-2">
                                                        <div className="flex justify-between">
                                                            <span className="text-sm text-muted-foreground">Total Investment</span>
                                                            <span className="font-medium">₹{calculatorResults.totalInvestment.toLocaleString()}</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="text-sm text-muted-foreground">Expected Returns</span>
                                                            <span className="font-medium text-green-600">₹{calculatorResults.expectedReturns.toLocaleString()}</span>
                                                        </div>
                                                        <div className="flex justify-between border-t pt-2">
                                                            <span className="font-medium">Maturity Amount</span>
                                                            <span className="font-bold text-lg text-green-600">₹{calculatorResults.maturityAmount.toLocaleString()}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <Button
                                                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600"
                                                    onClick={handleStartSIPInvestment}
                                                >
                                                    <Zap className="w-4 h-4 mr-2" />
                                                    Start This SIP Journey
                                                </Button>
                                            </CardContent>
                                        </Card>
                                    </>
                                ) : (
                                    <Card className="border-dashed border-2 border-gray-300">
                                        <CardContent className="p-8 text-center">
                                            <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                                            <h3 className="font-medium mb-2">Select a SIP Plan</h3>
                                            <p className="text-sm text-muted-foreground">
                                                Choose from our curated list of SIP plans to see detailed information and calculate returns
                                            </p>
                                        </CardContent>
                                    </Card>
                                )}
                            </div>
                        </div>
                    </TabsContent>

                    {/* Journey Tab */}
                    <TabsContent value="journey" className="space-y-6">
                        <div className="text-center mb-6">
                            <h3 className="text-2xl font-bold mb-2">🎯 Your Investment Journey Levels</h3>
                            <p className="text-muted-foreground">Complete SIP investments to unlock exclusive rewards, medals, and benefits!</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {sipLevels.map((level) => {
                                const isCompleted = level.level < currentLevel;
                                const isCurrent = level.level === currentLevel;
                                const isLocked = level.level > currentLevel || (level.level > 0 && currentLevel === 0);

                                return (
                                    <Card key={level.level} className={`relative transition-all duration-300 ${isCurrent ? 'ring-2 ring-purple-500 bg-gradient-to-br from-purple-50 to-pink-50 shadow-lg' :
                                        isCompleted ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200' :
                                            'bg-gray-50 opacity-75'
                                        }`}>
                                        {/* Status Badge */}
                                        <div className="absolute -top-3 -right-3">
                                            {isCompleted ? (
                                                <div className="bg-green-500 text-white rounded-full p-2">
                                                    <CheckCircle className="w-4 h-4" />
                                                </div>
                                            ) : isCurrent ? (
                                                <div className="bg-purple-500 text-white rounded-full p-2">
                                                    <Target className="w-4 h-4" />
                                                </div>
                                            ) : (
                                                <div className="bg-gray-400 text-white rounded-full p-2">
                                                    <Lock className="w-4 h-4" />
                                                </div>
                                            )}
                                        </div>

                                        <CardHeader className="text-center pb-3">
                                            <div className="text-4xl mb-2">{level.icon}</div>
                                            <CardTitle className={`text-xl ${isCurrent ? 'text-purple-700' : isCompleted ? 'text-green-700' : 'text-gray-600'}`}>
                                                {level.title}
                                            </CardTitle>
                                            <Badge className={`${level.color} text-white px-3 py-1 text-sm`}>
                                                Level {level.level}
                                            </Badge>
                                            <p className="text-sm text-muted-foreground mt-2">
                                                {level.description}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                Duration: {level.minMonths}-{level.maxMonths === 999 ? '∞' : level.maxMonths} months
                                            </p>
                                        </CardHeader>

                                        <CardContent className="pt-0">
                                            <div className="space-y-2">
                                                <h4 className="font-semibold text-sm flex items-center gap-1">
                                                    <Gift className="w-4 h-4" />
                                                    Rewards & Benefits:
                                                </h4>
                                                <ul className="text-xs space-y-1.5">
                                                    {level.benefits.map((benefit, idx) => (
                                                        <li key={idx} className="flex items-start gap-2">
                                                            <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${isCompleted ? 'bg-green-500' :
                                                                isCurrent ? 'bg-purple-500' : 'bg-gray-400'
                                                                }`} />
                                                            <span className={isLocked ? 'text-gray-500' : ''}>{benefit}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>

                                            {currentLevel === 0 && level.level === 1 && (
                                                <div className="mt-4 p-3 bg-blue-100 rounded-lg">
                                                    <p className="text-xs text-blue-700 font-medium">
                                                        🚀 Start your first SIP investment to unlock this level!
                                                    </p>
                                                </div>
                                            )}

                                            {isCurrent && currentLevel > 0 && (
                                                <div className="mt-4 p-3 bg-purple-100 rounded-lg">
                                                    <p className="text-xs text-purple-700 font-medium">
                                                        🎯 You're currently at this level! Keep investing to unlock the next tier.
                                                    </p>
                                                </div>
                                            )}

                                            {isLocked && currentLevel === 0 && level.level > 1 && (
                                                <div className="mt-4 p-3 bg-gray-100 rounded-lg">
                                                    <p className="text-xs text-gray-600 font-medium">
                                                        🔒 Complete previous levels by investing in SIPs to unlock this tier.
                                                    </p>
                                                </div>
                                            )}

                                            {isCompleted && (
                                                <div className="mt-4 p-3 bg-green-100 rounded-lg">
                                                    <p className="text-xs text-green-700 font-medium flex items-center gap-1">
                                                        <Medal className="w-3 h-3" />
                                                        Congratulations! Level completed and rewards unlocked.
                                                    </p>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>

                        {performanceBoost > 0 && (
                            <Card className="border-green-200 bg-green-50">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-green-700">
                                        <Rocket className="w-5 h-5" />
                                        Performance Boost Active!
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-green-600">
                                        Your SIP is outperforming the market by {performanceBoost}%!
                                        You've earned bonus token credits and a "Power Boost" badge.
                                    </p>
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>

                    {/* Milestones Tab */}
                    <TabsContent value="milestones" className="space-y-6">
                        <div className="text-center mb-6">
                            <h3 className="text-2xl font-bold mb-2">🏆 Investment Milestones & Rewards</h3>
                            <p className="text-muted-foreground">Achieve these milestones through consistent SIP investing to earn exclusive medals, NFTs, and bonus rewards!</p>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            {milestones.map((milestone, index) => {
                                const isUnlocked = sipMonths >= milestone.months;
                                const isNext = !isUnlocked && (index === 0 || sipMonths >= milestones[index - 1].months);
                                const monthsRemaining = milestone.months - sipMonths;

                                return (
                                    <Card key={milestone.months} className={`relative transition-all duration-300 ${isUnlocked ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200 shadow-md' :
                                        isNext ? 'bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200' :
                                            'bg-gray-50 border-gray-200'
                                        }`}>
                                        {/* Progress Indicator */}
                                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-500 to-pink-500 rounded-l-lg"
                                            style={{
                                                opacity: isUnlocked ? 1 : isNext ? 0.7 : 0.3
                                            }} />

                                        <CardContent className="p-6">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className={`relative w-16 h-16 rounded-full ${milestone.color} flex items-center justify-center text-3xl shadow-lg`}>
                                                        {milestone.icon}
                                                        {isUnlocked && (
                                                            <div className="absolute -top-1 -right-1 bg-green-500 rounded-full p-1">
                                                                <CheckCircle className="w-3 h-3 text-white" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <h3 className={`text-xl font-bold ${isUnlocked ? 'text-yellow-700' : isNext ? 'text-blue-700' : 'text-gray-600'}`}>
                                                            {milestone.title}
                                                        </h3>
                                                        <p className="text-sm text-muted-foreground mb-1">
                                                            🎯 Achieve {milestone.months} months of consistent SIP investing
                                                        </p>
                                                        <div className="flex items-center gap-2">
                                                            <Medal className="w-4 h-4 text-amber-500" />
                                                            <span className="text-sm font-medium">{milestone.reward}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="text-right">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <span className="text-3xl">{milestone.nft}</span>
                                                        <div>
                                                            <div className="text-sm text-muted-foreground">NFT Reward</div>
                                                            <div className="text-xs text-muted-foreground">Collectible Badge</div>
                                                        </div>
                                                    </div>

                                                    <div className="bg-white/50 rounded-lg p-3 mb-3">
                                                        <div className="text-sm font-medium text-green-600 mb-1">💰 Cash Rewards:</div>
                                                        <div className="text-sm text-muted-foreground">{milestone.bonus}</div>
                                                    </div>

                                                    {isUnlocked ? (
                                                        <Badge className="bg-green-500 text-white px-3 py-1">
                                                            <CheckCircle className="w-3 h-3 mr-1" />
                                                            Achieved!
                                                        </Badge>
                                                    ) : isNext ? (
                                                        <div className="space-y-2">
                                                            <Badge className="bg-blue-500 text-white px-3 py-1">
                                                                <Target className="w-3 h-3 mr-1" />
                                                                Next Milestone
                                                            </Badge>
                                                            <div className="text-xs text-blue-600 font-medium">
                                                                {monthsRemaining} months to go
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="space-y-2">
                                                            <Badge variant="outline" className="px-3 py-1">
                                                                <Lock className="w-3 h-3 mr-1" />
                                                                Locked
                                                            </Badge>
                                                            <div className="text-xs text-gray-500">
                                                                {monthsRemaining} months remaining
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {isNext && (
                                                <div className="mt-4 p-3 bg-blue-100 rounded-lg">
                                                    <p className="text-sm text-blue-700 font-medium">
                                                        🎯 This is your next milestone! Continue your SIP journey to unlock amazing rewards.
                                                    </p>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>

                        {/* Progress Summary */}
                        <Card className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                            <CardContent className="p-6 text-center">
                                <h3 className="text-xl font-bold mb-2">🚀 Your Milestone Progress</h3>
                                <div className="grid grid-cols-3 gap-4 mb-4">
                                    <div>
                                        <div className="text-2xl font-bold">{milestones.filter(m => sipMonths >= m.months).length}</div>
                                        <div className="text-sm opacity-80">Achieved</div>
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold">{sipMonths}</div>
                                        <div className="text-sm opacity-80">Months Active</div>
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold">{milestones.length}</div>
                                        <div className="text-sm opacity-80">Total Milestones</div>
                                    </div>
                                </div>
                                <p className="text-purple-100">
                                    Keep investing consistently to unlock more exclusive rewards and reach legendary status! 🏆
                                </p>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* NFT Collection Tab */}
                    <TabsContent value="nfts" className="space-y-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                            {milestones.map((milestone) => {
                                const isUnlocked = unlockedNFTs.includes(milestone.nft);
                                return (
                                    <Card key={milestone.months} className={`text-center ${isUnlocked ? 'bg-gradient-to-b from-yellow-50 to-orange-50' : 'bg-gray-50 opacity-50'
                                        }`}>
                                        <CardContent className="p-4">
                                            <div className="text-4xl mb-2">{isUnlocked ? milestone.nft : '🔒'}</div>
                                            <h4 className="font-medium text-sm">{milestone.reward}</h4>
                                            {isUnlocked && (
                                                <Badge className="mt-2 text-xs bg-green-500">Owned</Badge>
                                            )}
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>

                        {unlockedNFTs.length > 0 && (
                            <Card className="border-purple-200 bg-purple-50">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Gem className="w-5 h-5 text-purple-600" />
                                        NFT Collection Value
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-purple-700">
                                        You own {unlockedNFTs.length} exclusive NFT{unlockedNFTs.length > 1 ? 's' : ''}!
                                        These have collectible value within the WealthChain ecosystem.
                                    </p>
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>

                    {/* Learning Tab */}
                    <TabsContent value="learning" className="space-y-4">
                        <Card className="border-blue-200 bg-blue-50">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Brain className="w-5 h-5 text-blue-600" />
                                    Learn & Earn Program
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-blue-700 mb-4">
                                    Complete financial education quizzes to earn Knowledge Tokens.
                                    Use tokens for SIP cashback or fee discounts!
                                </p>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-blue-600">{knowledgeTokens}</div>
                                    <div className="text-sm text-muted-foreground">Knowledge Tokens Balance</div>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {learningQuizzes.map((quiz) => (
                                <Card key={quiz.id} className="hover:shadow-md transition-shadow">
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h4 className="font-medium">{quiz.title}</h4>
                                                <p className="text-sm text-muted-foreground">
                                                    Reward: {quiz.reward} Knowledge Tokens
                                                </p>
                                            </div>
                                            <Button
                                                size="sm"
                                                onClick={() => handleTakeQuiz(quiz.id)}
                                                disabled={quiz.completed}
                                            >
                                                {quiz.completed ? 'Completed' : 'Take Quiz'}
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </TabsContent>
                </Tabs>

                {/* Start SIP CTA */}
                {currentLevel === 0 && (
                    <Card className="mt-8 border-2 border-purple-500 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                        <CardContent className="p-8 text-center">
                            <h3 className="text-2xl font-bold mb-4">Ready to Start Your PowerSIP Journey?</h3>
                            <p className="text-purple-100 mb-6">
                                Begin your gamified investing adventure and unlock rewards, NFTs, and exclusive perks!
                            </p>
                            <p className="text-purple-200 text-sm mb-4">
                                💡 Choose a SIP from the marketplace above and start investing to unlock Level 1!
                            </p>
                            <Button
                                size="lg"
                                className="bg-white text-purple-600 hover:bg-gray-100"
                                onClick={() => {
                                    const sipTab = document.querySelector('[value="sips"]') as HTMLElement;
                                    if (sipTab) sipTab.click();
                                }}
                            >
                                <Zap className="w-5 h-5 mr-2" />
                                Explore SIP Marketplace
                            </Button>
                        </CardContent>
                    </Card>
                )}

                {currentLevel > 0 && userInvestments.length > 0 && (
                    <Card className="mt-8 border-2 border-green-500 bg-gradient-to-r from-green-600 to-emerald-600 text-white">
                        <CardContent className="p-6 text-center">
                            <h3 className="text-xl font-bold mb-2">🎉 Great Progress!</h3>
                            <div className="grid grid-cols-3 gap-4 mb-4">
                                <div>
                                    <div className="text-2xl font-bold">{userInvestments.length}</div>
                                    <div className="text-sm opacity-80">Active SIPs</div>
                                </div>
                                <div>
                                    <div className="text-2xl font-bold">₹{totalInvestedAmount.toLocaleString()}</div>
                                    <div className="text-sm opacity-80">Total Invested</div>
                                </div>
                                <div>
                                    <div className="text-2xl font-bold">Level {currentLevel}</div>
                                    <div className="text-sm opacity-80">Current Status</div>
                                </div>
                            </div>
                            <p className="text-green-100 text-sm">
                                Keep investing consistently to unlock higher levels and earn more rewards! 🚀
                            </p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
};

export default PowerSIP;
