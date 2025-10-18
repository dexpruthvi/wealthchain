import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
    Gift,
    Coins,
    Star,
    ShoppingBag,
    Zap,
    Crown,
    Trophy,
    Sparkles,
    Target,
    Flame
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { transactionLogger } from "@/services/transactionLogger";

interface UserTokens {
    totalTokens: number;
    todayTokens: number;
    level: number;
    streak: number;
    achievements: string[];
}

interface Voucher {
    id: string;
    brand: string;
    title: string;
    description: string;
    tokenCost: number;
    originalValue: number;
    discountPercent: number;
    category: string;
    logo: string;
    color: string;
    availability: number;
    expiryDays: number;
}

const RewardsTokenSystem = () => {
    const [userTokens, setUserTokens] = useState<UserTokens>({
        totalTokens: 0,
        todayTokens: 0,
        level: 1,
        streak: 0,
        achievements: []
    });
    const [vouchers, setVouchers] = useState<Voucher[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('all');

    useEffect(() => {
        loadUserTokens();
        loadVouchers();

        // Subscribe to new transactions to award tokens
        const unsubscribe = transactionLogger.subscribe(() => {
            calculateTokensFromRecentTransactions();
        });

        return unsubscribe;
    }, []);

    const loadUserTokens = async () => {
        // Simulate loading user tokens from localStorage or backend
        const savedTokens = localStorage.getItem('investHub_tokens');
        if (savedTokens) {
            setUserTokens(JSON.parse(savedTokens));
        }
    };

    const calculateTokensFromRecentTransactions = () => {
        const recentTransactions = transactionLogger.getRecentTransactions(10);
        let newTokens = 0;

        recentTransactions.forEach(transaction => {
            // Award tokens based on investment amount: 1 rupee = 0.001 tokens
            const tokensEarned = Math.floor(transaction.totalAmount * 0.001);
            newTokens += tokensEarned;
        }); if (newTokens > 0) {
            updateUserTokens(newTokens);
            toast.success(`Earned ${newTokens} tokens from your investments! 🎉`);
        }
    };

    const updateUserTokens = (tokensToAdd: number) => {
        setUserTokens(prev => {
            const updated = {
                ...prev,
                totalTokens: prev.totalTokens + tokensToAdd,
                todayTokens: prev.todayTokens + tokensToAdd,
                level: Math.floor((prev.totalTokens + tokensToAdd) / 10000) + 1,
                streak: prev.streak + (tokensToAdd > 0 ? 1 : 0)
            };

            // Save to localStorage
            localStorage.setItem('investHub_tokens', JSON.stringify(updated));
            return updated;
        });
    };

    const loadVouchers = () => {
        const availableVouchers: Voucher[] = [
            // Shopping Apps
            {
                id: '1',
                brand: 'Amazon',
                title: '₹500 Amazon Gift Card',
                description: 'Shop from millions of products across categories',
                tokenCost: 100,
                originalValue: 500,
                discountPercent: 0,
                category: 'shopping',
                logo: '🛒',
                color: 'bg-orange-500',
                availability: 50,
                expiryDays: 365
            },
            {
                id: '2',
                brand: 'Flipkart',
                title: '₹1000 Flipkart Voucher',
                description: 'Electronics, fashion, home & more',
                tokenCost: 200,
                originalValue: 1000,
                discountPercent: 0,
                category: 'shopping',
                logo: '🛍️',
                color: 'bg-blue-500',
                availability: 30,
                expiryDays: 180
            },
            {
                id: '3',
                brand: 'Myntra',
                title: '₹750 Fashion Voucher',
                description: 'Latest fashion trends and styles',
                tokenCost: 150,
                originalValue: 750,
                discountPercent: 0,
                category: 'fashion',
                logo: '👕',
                color: 'bg-pink-500',
                availability: 25,
                expiryDays: 90
            },
            // Sports Brands
            {
                id: '4',
                brand: 'Nike',
                title: '₹2000 Nike Store Credit',
                description: 'Premium sports gear and footwear',
                tokenCost: 400,
                originalValue: 2000,
                discountPercent: 0,
                category: 'sports',
                logo: '👟',
                color: 'bg-black',
                availability: 15,
                expiryDays: 120
            },
            {
                id: '5',
                brand: 'Adidas',
                title: '₹1500 Adidas Voucher',
                description: 'Sportwear and lifestyle products',
                tokenCost: 300,
                originalValue: 1500,
                discountPercent: 0,
                category: 'sports',
                logo: '⚽',
                color: 'bg-gray-800',
                availability: 20,
                expiryDays: 90
            },
            {
                id: '6',
                brand: 'Puma',
                title: '₹1200 Puma Gift Card',
                description: 'Athletic wear and accessories',
                tokenCost: 240,
                originalValue: 1200,
                discountPercent: 0,
                category: 'sports',
                logo: '🐆',
                color: 'bg-red-600',
                availability: 18,
                expiryDays: 60
            },
            // Food & Entertainment
            {
                id: '7',
                brand: 'Zomato',
                title: '₹800 Food Delivery Credit',
                description: 'Order from your favorite restaurants',
                tokenCost: 160,
                originalValue: 800,
                discountPercent: 0,
                category: 'food',
                logo: '🍕',
                color: 'bg-red-500',
                availability: 40,
                expiryDays: 30
            },
            {
                id: '8',
                brand: 'Netflix',
                title: '3 Months Premium Subscription',
                description: 'Unlimited movies and TV shows',
                tokenCost: 350,
                originalValue: 2400,
                discountPercent: 0,
                category: 'entertainment',
                logo: '🎬',
                color: 'bg-red-600',
                availability: 10,
                expiryDays: 365
            },
            // Premium Vouchers
            {
                id: '9',
                brand: 'Apple',
                title: '₹5000 Apple Store Gift Card',
                description: 'Latest Apple products and accessories',
                tokenCost: 1000,
                originalValue: 5000,
                discountPercent: 0,
                category: 'electronics',
                logo: '🍎',
                color: 'bg-gray-900',
                availability: 5,
                expiryDays: 365
            },
            {
                id: '10',
                brand: 'BookMyShow',
                title: '₹600 Movie & Events Voucher',
                description: 'Movies, concerts, and events',
                tokenCost: 1200,
                originalValue: 600,
                discountPercent: 0,
                category: 'entertainment',
                logo: '🎭',
                color: 'bg-purple-600',
                availability: 35,
                expiryDays: 90
            }
        ];

        setVouchers(availableVouchers);
        setLoading(false);
    };

    const redeemVoucher = (voucher: Voucher) => {
        if (userTokens.totalTokens < voucher.tokenCost) {
            toast.error(`You need ${voucher.tokenCost - userTokens.totalTokens} more tokens to redeem this voucher!`);
            return;
        }

        // Deduct tokens
        setUserTokens(prev => {
            const updated = {
                ...prev,
                totalTokens: prev.totalTokens - voucher.tokenCost
            };
            localStorage.setItem('investHub_tokens', JSON.stringify(updated));
            return updated;
        });

        // Update voucher availability
        setVouchers(prev => prev.map(v =>
            v.id === voucher.id
                ? { ...v, availability: v.availability - 1 }
                : v
        ));

        toast.success(`Successfully redeemed ${voucher.title}! Check your email for details. ✨`);
    };

    const categories = [
        { id: 'all', name: 'All', icon: Gift },
        { id: 'shopping', name: 'Shopping', icon: ShoppingBag },
        { id: 'fashion', name: 'Fashion', icon: Sparkles },
        { id: 'sports', name: 'Sports', icon: Target },
        { id: 'food', name: 'Food', icon: Gift },
        { id: 'entertainment', name: 'Entertainment', icon: Star },
        { id: 'electronics', name: 'Electronics', icon: Zap }
    ];

    const filteredVouchers = selectedCategory === 'all'
        ? vouchers
        : vouchers.filter(v => v.category === selectedCategory);

    const nextLevelTokens = userTokens.level * 10000;
    const currentLevelProgress = (userTokens.totalTokens % 10000) / 100;

    return (
        <div className="space-y-6">
            {/* Token Overview */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Coins className="h-5 w-5 text-yellow-500" />
                        InvestHub Rewards
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="text-center p-4 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg border">
                            <Coins className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                            <div className="text-2xl font-bold text-foreground">{userTokens.totalTokens.toLocaleString()}</div>
                            <div className="text-sm text-muted-foreground">Total Tokens</div>
                        </div>

                        <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border">
                            <Crown className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                            <div className="text-2xl font-bold text-foreground">Level {userTokens.level}</div>
                            <div className="text-sm text-muted-foreground">Investor Level</div>
                        </div>

                        <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border">
                            <Flame className="h-8 w-8 text-green-500 mx-auto mb-2" />
                            <div className="text-2xl font-bold text-foreground">{userTokens.streak}</div>
                            <div className="text-sm text-muted-foreground">Day Streak</div>
                        </div>

                        <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border">
                            <Sparkles className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                            <div className="text-2xl font-bold text-foreground">+{userTokens.todayTokens}</div>
                            <div className="text-sm text-muted-foreground">Today's Tokens</div>
                        </div>
                    </div>

                    {/* Level Progress */}
                    <div className="mt-6">
                        <div className="flex justify-between text-sm text-muted-foreground mb-2">
                            <span>Level {userTokens.level} Progress</span>
                            <span>{(userTokens.totalTokens % 10000).toLocaleString()} / {(10000).toLocaleString()} tokens</span>
                        </div>
                        <Progress value={currentLevelProgress} className="h-2" />
                    </div>

                    {/* How to Earn Tokens */}
                    <div className="mt-4 p-4 bg-muted rounded-lg">
                        <h4 className="font-semibold mb-2 flex items-center gap-2">
                            <Trophy className="h-4 w-4 text-yellow-500" />
                            How to Earn Tokens
                        </h4>
                        <div className="text-sm text-muted-foreground space-y-1">
                            <div>💰 Invest ₹1 = 0.001 tokens</div>
                            <div>🎯 Daily trading = bonus tokens</div>
                            <div>🔥 Maintain streak = multiplier rewards</div>
                            <div>📈 Portfolio growth = achievement tokens</div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Voucher Categories */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Gift className="h-5 w-5" />
                        Redeem Vouchers
                    </CardTitle>

                    {/* Category Filter */}
                    <div className="flex gap-2 mt-4 flex-wrap">
                        {categories.map(category => {
                            const IconComponent = category.icon;
                            return (
                                <Button
                                    key={category.id}
                                    variant={selectedCategory === category.id ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setSelectedCategory(category.id)}
                                    className="text-xs"
                                >
                                    <IconComponent className="h-3 w-3 mr-1" />
                                    {category.name}
                                </Button>
                            );
                        })}
                    </div>
                </CardHeader>

                <CardContent>
                    {loading ? (
                        <div className="text-center py-8 text-muted-foreground">Loading vouchers...</div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredVouchers.map((voucher) => (
                                <Card key={voucher.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                                    <CardContent className="p-4">
                                        <div className={`w-full h-20 ${voucher.color} rounded-lg mb-4 flex items-center justify-center text-4xl`}>
                                            {voucher.logo}
                                        </div>

                                        <div className="space-y-3">
                                            <div>
                                                <h4 className="font-semibold text-sm">{voucher.title}</h4>
                                                <p className="text-xs text-muted-foreground">{voucher.description}</p>
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <Coins className="h-4 w-4 text-yellow-500" />
                                                    <span className="font-bold text-sm">{voucher.tokenCost.toLocaleString()}</span>
                                                </div>
                                                <Badge variant="secondary" className="text-xs">
                                                    ₹{voucher.originalValue} value
                                                </Badge>
                                            </div>

                                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                                                <span>{voucher.availability} left</span>
                                                <span>Expires in {voucher.expiryDays} days</span>
                                            </div>

                                            <Button
                                                size="sm"
                                                className="w-full"
                                                onClick={() => redeemVoucher(voucher)}
                                                disabled={userTokens.totalTokens < voucher.tokenCost || voucher.availability === 0}
                                            >
                                                {userTokens.totalTokens < voucher.tokenCost
                                                    ? `Need ${voucher.tokenCost - userTokens.totalTokens} more`
                                                    : voucher.availability === 0
                                                        ? 'Sold Out'
                                                        : 'Redeem Now'
                                                }
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default RewardsTokenSystem;
