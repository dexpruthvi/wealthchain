import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
    Rocket
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

const PowerSIP = () => {
    const [user, setUser] = useState<any>(null);
    const [currentLevel, setCurrentLevel] = useState(1);
    const [sipMonths, setSipMonths] = useState(0);
    const [xpPoints, setXpPoints] = useState(0);
    const [knowledgeTokens, setKnowledgeTokens] = useState(0);
    const [unlockedNFTs, setUnlockedNFTs] = useState<string[]>([]);
    const [performanceBoost, setPerformanceBoost] = useState(0);

    const sipLevels: SIPLevel[] = [
        {
            level: 1,
            title: "Rookie Investor",
            description: "Starting your investment journey",
            minMonths: 1,
            maxMonths: 3,
            icon: "🚀",
            color: "bg-green-500",
            benefits: ["Basic portfolio tracking", "Monthly SIP reports", "Community access"]
        },
        {
            level: 2,
            title: "Consistent Climber",
            description: "Building investing habits",
            minMonths: 4,
            maxMonths: 6,
            icon: "📈",
            color: "bg-blue-500",
            benefits: ["Advanced analytics", "Priority support", "5% fee discount"]
        },
        {
            level: 3,
            title: "Market Maverick",
            description: "Mastering market movements",
            minMonths: 7,
            maxMonths: 12,
            icon: "🎯",
            color: "bg-purple-500",
            benefits: ["AI insights", "Custom strategies", "10% fee discount", "NFT badges"]
        },
        {
            level: 4,
            title: "Wealth Wizard",
            description: "Financial freedom master",
            minMonths: 13,
            maxMonths: 999,
            icon: "🧙‍♂️",
            color: "bg-gold-500",
            benefits: ["Premium AI advisor", "VIP support", "15% fee discount", "Exclusive NFTs", "Early feature access"]
        }
    ];

    const milestones: Milestone[] = [
        {
            months: 3,
            title: "First Quarter Champion",
            reward: "Bronze Badge NFT",
            nft: "🥉",
            bonus: "₹100 bonus tokens",
            icon: "🎖️",
            color: "bg-amber-600"
        },
        {
            months: 6,
            title: "Half Year Hero",
            reward: "Silver Badge NFT",
            nft: "🥈",
            bonus: "Priority customer perks",
            icon: "🏆",
            color: "bg-gray-400"
        },
        {
            months: 12,
            title: "Annual Achiever",
            reward: "Gold Badge NFT",
            nft: "🥇",
            bonus: "Free AI investment report",
            icon: "👑",
            color: "bg-yellow-500"
        },
        {
            months: 24,
            title: "Diamond Dynasty",
            reward: "Diamond Investor NFT",
            nft: "💎",
            bonus: "Fee waivers + cashback",
            icon: "💍",
            color: "bg-cyan-400"
        }
    ];

    const learningQuizzes = [
        { id: 1, title: "What is CAGR?", reward: 10, completed: false },
        { id: 2, title: "How SIP works", reward: 15, completed: false },
        { id: 3, title: "Risk vs Return", reward: 20, completed: false },
        { id: 4, title: "Portfolio Diversification", reward: 25, completed: false },
        { id: 5, title: "Market Volatility", reward: 30, completed: false }
    ];

    useEffect(() => {
        const fetchUserData = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setUser(user);
                // Simulate user SIP data - in real app, fetch from database
                const mockSipMonths = Math.floor(Math.random() * 15) + 1;
                setSipMonths(mockSipMonths);
                setXpPoints(mockSipMonths * 100);
                setKnowledgeTokens(Math.floor(Math.random() * 200));
                setPerformanceBoost(Math.floor(Math.random() * 15));

                // Determine current level
                const level = sipLevels.find(l =>
                    mockSipMonths >= l.minMonths && mockSipMonths <= l.maxMonths
                ) || sipLevels[0];
                setCurrentLevel(level.level);

                // Set unlocked NFTs based on milestones
                const unlocked = milestones
                    .filter(m => mockSipMonths >= m.months)
                    .map(m => m.nft);
                setUnlockedNFTs(unlocked);
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
            <Card className="mb-8 border-2 border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="text-4xl">{currentLevelData.icon}</div>
                            <div>
                                <CardTitle className="text-2xl">{currentLevelData.title}</CardTitle>
                                <p className="text-muted-foreground">{currentLevelData.description}</p>
                            </div>
                        </div>
                        <Badge className={`${currentLevelData.color} text-white px-4 py-2 text-lg`}>
                            Level {currentLevel}
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
                        {currentLevelData.benefits.map((benefit, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                                {benefit}
                            </Badge>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <Tabs defaultValue="journey" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="journey">🚀 Journey</TabsTrigger>
                    <TabsTrigger value="milestones">🏆 Milestones</TabsTrigger>
                    <TabsTrigger value="nfts">💎 NFT Collection</TabsTrigger>
                    <TabsTrigger value="learning">🧠 Learn & Earn</TabsTrigger>
                </TabsList>

                {/* Journey Tab */}
                <TabsContent value="journey" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {sipLevels.map((level) => (
                            <Card key={level.level} className={`${level.level === currentLevel ? 'ring-2 ring-purple-500 bg-purple-50' :
                                    level.level < currentLevel ? 'bg-green-50' : 'bg-gray-50'
                                }`}>
                                <CardHeader className="text-center pb-2">
                                    <div className="text-3xl mb-2">{level.icon}</div>
                                    <CardTitle className="text-lg">{level.title}</CardTitle>
                                    <p className="text-sm text-muted-foreground">
                                        {level.minMonths}-{level.maxMonths === 999 ? '∞' : level.maxMonths} months
                                    </p>
                                </CardHeader>
                                <CardContent className="pt-0">
                                    <ul className="text-xs space-y-1">
                                        {level.benefits.map((benefit, idx) => (
                                            <li key={idx} className="flex items-center gap-1">
                                                <Star className="w-3 h-3 text-yellow-500" />
                                                {benefit}
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>
                            </Card>
                        ))}
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
                <TabsContent value="milestones" className="space-y-4">
                    {milestones.map((milestone) => {
                        const isUnlocked = sipMonths >= milestone.months;
                        return (
                            <Card key={milestone.months} className={`${isUnlocked ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200' : 'bg-gray-50'
                                }`}>
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-12 h-12 rounded-full ${milestone.color} flex items-center justify-center text-2xl`}>
                                                {milestone.icon}
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-semibold">{milestone.title}</h3>
                                                <p className="text-sm text-muted-foreground">{milestone.months} months milestone</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-2xl">{milestone.nft}</span>
                                                <span className="font-medium">{milestone.reward}</span>
                                            </div>
                                            <p className="text-sm text-muted-foreground">{milestone.bonus}</p>
                                            {isUnlocked ? (
                                                <Badge className="mt-2 bg-green-500">Unlocked!</Badge>
                                            ) : (
                                                <Badge variant="outline" className="mt-2">
                                                    {milestone.months - sipMonths} months to go
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
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
            {sipMonths === 0 && (
                <Card className="mt-8 border-2 border-purple-500 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                    <CardContent className="p-8 text-center">
                        <h3 className="text-2xl font-bold mb-4">Ready to Start Your PowerSIP Journey?</h3>
                        <p className="text-purple-100 mb-6">
                            Begin your gamified investing adventure and unlock rewards, NFTs, and exclusive perks!
                        </p>
                        <Button
                            size="lg"
                            className="bg-white text-purple-600 hover:bg-gray-100"
                            onClick={handleStartSIP}
                        >
                            <Zap className="w-5 h-5 mr-2" />
                            Start PowerSIP Now
                        </Button>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default PowerSIP;
