import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import RewardsTokenSystem from "@/components/RewardsTokenSystem";
import DailyBonusSystem from "@/components/DailyBonusSystem";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Trophy,
    Star,
    Target,
    Zap,
    Crown,
    Medal,
    Gift,
    Calendar,
    TrendingUp
} from "lucide-react";

interface Achievement {
    id: string;
    title: string;
    description: string;
    icon: string;
    reward: number;
    unlocked: boolean;
    progress: number;
    maxProgress: number;
    category: 'investment' | 'trading' | 'social' | 'milestone';
}

const Rewards = () => {
    const navigate = useNavigate();
    const [achievements, setAchievements] = useState<Achievement[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkAuth();
        loadAchievements();
    }, []);

    const checkAuth = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            navigate("/auth");
        }
    };

    const loadAchievements = () => {
        const availableAchievements: Achievement[] = [
            // Investment Achievements
            {
                id: '1',
                title: 'First Investment',
                description: 'Make your first stock purchase',
                icon: '🚀',
                reward: 100,
                unlocked: true,
                progress: 1,
                maxProgress: 1,
                category: 'investment'
            },
            {
                id: '2',
                title: 'Portfolio Builder',
                description: 'Invest in 5 different stocks',
                icon: '📊',
                reward: 250,
                unlocked: false,
                progress: 2,
                maxProgress: 5,
                category: 'investment'
            },
            {
                id: '3',
                title: 'Diversification Master',
                description: 'Invest across 3 different sectors',
                icon: '🎯',
                reward: 500,
                unlocked: false,
                progress: 1,
                maxProgress: 3,
                category: 'investment'
            },
            {
                id: '4',
                title: 'High Roller',
                description: 'Invest ₹10,000 or more in a single transaction',
                icon: '💎',
                reward: 1000,
                unlocked: false,
                progress: 0,
                maxProgress: 1,
                category: 'investment'
            },

            // Trading Achievements
            {
                id: '5',
                title: 'Day Trader',
                description: 'Complete 5 trades in a single day',
                icon: '⚡',
                reward: 300,
                unlocked: false,
                progress: 2,
                maxProgress: 5,
                category: 'trading'
            },
            {
                id: '6',
                title: 'Profit Maker',
                description: 'Achieve 10% portfolio gain',
                icon: '📈',
                reward: 750,
                unlocked: false,
                progress: 3.5,
                maxProgress: 10,
                category: 'trading'
            },
            {
                id: '7',
                title: 'Diamond Hands',
                description: 'Hold an investment for 30 days',
                icon: '💪',
                reward: 400,
                unlocked: false,
                progress: 12,
                maxProgress: 30,
                category: 'trading'
            },

            // Social Achievements
            {
                id: '8',
                title: 'Group Investor',
                description: 'Join an investment group',
                icon: '👥',
                reward: 200,
                unlocked: true,
                progress: 1,
                maxProgress: 1,
                category: 'social'
            },
            {
                id: '9',
                title: 'Community Leader',
                description: 'Create an investment group',
                icon: '👑',
                reward: 800,
                unlocked: false,
                progress: 0,
                maxProgress: 1,
                category: 'social'
            },

            // Milestone Achievements
            {
                id: '10',
                title: 'Token Collector',
                description: 'Earn 1,000 total tokens',
                icon: '🏆',
                reward: 0,
                unlocked: false,
                progress: 450,
                maxProgress: 1000,
                category: 'milestone'
            },
            {
                id: '11',
                title: 'Level Up!',
                description: 'Reach investor level 5',
                icon: '⭐',
                reward: 0,
                unlocked: false,
                progress: 1,
                maxProgress: 5,
                category: 'milestone'
            },
            {
                id: '12',
                title: 'Streak Master',
                description: 'Maintain 7-day trading streak',
                icon: '🔥',
                reward: 1000,
                unlocked: false,
                progress: 3,
                maxProgress: 7,
                category: 'milestone'
            }
        ];

        setAchievements(availableAchievements);
        setLoading(false);
    };

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'investment': return <Target className="h-4 w-4" />;
            case 'trading': return <TrendingUp className="h-4 w-4" />;
            case 'social': return <Star className="h-4 w-4" />;
            case 'milestone': return <Crown className="h-4 w-4" />;
            default: return <Trophy className="h-4 w-4" />;
        }
    };

    const getCategoryColor = (category: string) => {
        switch (category) {
            case 'investment': return 'bg-blue-100 text-blue-700';
            case 'trading': return 'bg-green-100 text-green-700';
            case 'social': return 'bg-purple-100 text-purple-700';
            case 'milestone': return 'bg-yellow-100 text-yellow-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const unlockedAchievements = achievements.filter(a => a.unlocked);
    const lockedAchievements = achievements.filter(a => !a.unlocked);

    return (
        <div className="min-h-screen bg-background">
            <Navbar />

            <div className="container mx-auto px-4 py-8">
                <div className="mb-8 p-8 rounded-2xl bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50 border border-yellow-200">
                    <h1 className="text-4xl font-bold mb-2 text-foreground">
                        🎉 Rewards & Achievements
                    </h1>
                    <p className="text-muted-foreground text-lg">
                        Earn tokens through investments and redeem amazing vouchers from top brands
                    </p>
                </div>

                {/* Daily Bonus System */}
                <div className="mb-8">
                    <DailyBonusSystem />
                </div>

                {/* Rewards Token System */}
                <div className="mb-8">
                    <RewardsTokenSystem />
                </div>

                {/* Achievements Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Unlocked Achievements */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Trophy className="h-5 w-5 text-yellow-500" />
                                Unlocked Achievements ({unlockedAchievements.length})
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {loading ? (
                                <div className="text-center py-8 text-muted-foreground">Loading achievements...</div>
                            ) : unlockedAchievements.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    No achievements unlocked yet. Start investing to earn your first achievement!
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {unlockedAchievements.map((achievement) => (
                                        <div key={achievement.id} className="flex items-center gap-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                                            <div className="text-2xl">{achievement.icon}</div>
                                            <div className="flex-1">
                                                <h4 className="font-semibold text-foreground">{achievement.title}</h4>
                                                <p className="text-sm text-muted-foreground">{achievement.description}</p>
                                                <div className="flex items-center gap-2 mt-2">
                                                    <Badge variant="secondary" className={getCategoryColor(achievement.category)}>
                                                        {getCategoryIcon(achievement.category)}
                                                        <span className="ml-1 capitalize">{achievement.category}</span>
                                                    </Badge>
                                                    {achievement.reward > 0 && (
                                                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">
                                                            +{achievement.reward} tokens
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                            <Medal className="h-6 w-6 text-yellow-500" />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Locked Achievements */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Zap className="h-5 w-5 text-blue-500" />
                                Progress Achievements ({lockedAchievements.length})
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {lockedAchievements.map((achievement) => {
                                    const progressPercent = (achievement.progress / achievement.maxProgress) * 100;
                                    return (
                                        <div key={achievement.id} className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                                            <div className="text-2xl opacity-50">{achievement.icon}</div>
                                            <div className="flex-1">
                                                <h4 className="font-semibold text-foreground">{achievement.title}</h4>
                                                <p className="text-sm text-muted-foreground">{achievement.description}</p>
                                                <div className="flex items-center gap-2 mt-2">
                                                    <Badge variant="secondary" className={getCategoryColor(achievement.category)}>
                                                        {getCategoryIcon(achievement.category)}
                                                        <span className="ml-1 capitalize">{achievement.category}</span>
                                                    </Badge>
                                                    {achievement.reward > 0 && (
                                                        <Badge variant="outline">
                                                            <Gift className="h-3 w-3 mr-1" />
                                                            {achievement.reward} tokens
                                                        </Badge>
                                                    )}
                                                </div>
                                                <div className="mt-3">
                                                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                                                        <span>Progress: {achievement.progress} / {achievement.maxProgress}</span>
                                                        <span>{Math.round(progressPercent)}%</span>
                                                    </div>
                                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                                        <div
                                                            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                                                            style={{ width: `${Math.min(progressPercent, 100)}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default Rewards;
