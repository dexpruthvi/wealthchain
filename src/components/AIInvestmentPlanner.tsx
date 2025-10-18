import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Brain, TrendingUp, Shield, Zap, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface PlannerProps {
    portfolio: any[];
    totalValue: number;
    healthScore: number;
}

interface RiskProfile {
    type: 'Conservative' | 'Moderate' | 'Aggressive';
    allocation: {
        stocks: number;
        mutualFunds: number;
        gold: number;
        bonds: number;
        crypto: number;
    };
}

interface AIRecommendation {
    title: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
    action: string;
    impact: string;
}

const AIInvestmentPlanner = ({ portfolio, totalValue, healthScore }: PlannerProps) => {
    const [riskProfile, setRiskProfile] = useState<RiskProfile>({
        type: 'Moderate',
        allocation: { stocks: 40, mutualFunds: 35, gold: 15, bonds: 5, crypto: 5 }
    });
    const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
    const [currentAllocation, setCurrentAllocation] = useState({
        stocks: 0,
        mutualFunds: 0,
        gold: 0,
        bonds: 0,
        crypto: 0
    });

    useEffect(() => {
        determineRiskProfile();
        calculateCurrentAllocation();
        generateRecommendations();
    }, [portfolio, totalValue, healthScore]);

    const determineRiskProfile = () => {
        // AI logic to determine risk profile based on portfolio behavior
        const portfolioSize = portfolio.length;
        const totalReturns = totalValue > 0 ? ((totalValue - getTotalInvested()) / getTotalInvested()) * 100 : 0;

        let profileType: 'Conservative' | 'Moderate' | 'Aggressive' = 'Moderate';

        if (healthScore < 50 || totalReturns < -10) {
            profileType = 'Conservative';
        } else if (healthScore > 80 && totalReturns > 15) {
            profileType = 'Aggressive';
        }

        const profiles = {
            Conservative: { stocks: 20, mutualFunds: 40, gold: 30, bonds: 10, crypto: 0 },
            Moderate: { stocks: 40, mutualFunds: 35, gold: 15, bonds: 5, crypto: 5 },
            Aggressive: { stocks: 60, mutualFunds: 25, gold: 5, bonds: 0, crypto: 10 }
        };

        setRiskProfile({
            type: profileType,
            allocation: profiles[profileType]
        });
    };

    const getTotalInvested = () => {
        return portfolio.reduce((sum, item) => sum + Number(item.total_invested || 0), 0);
    };

    const calculateCurrentAllocation = () => {
        if (portfolio.length === 0) {
            setCurrentAllocation({ stocks: 0, mutualFunds: 0, gold: 0, bonds: 0, crypto: 0 });
            return;
        }

        // For now, assume all holdings are stocks (can be enhanced with asset type detection)
        const stocksPercent = 100; // All current investments are treated as stocks

        setCurrentAllocation({
            stocks: stocksPercent,
            mutualFunds: 0,
            gold: 0,
            bonds: 0,
            crypto: 0
        });
    };

    const generateRecommendations = () => {
        const recs: AIRecommendation[] = [];
        const ideal = riskProfile.allocation;
        const current = currentAllocation;

        // Check stock allocation
        const stockDiff = current.stocks - ideal.stocks;
        if (Math.abs(stockDiff) > 10) {
            recs.push({
                title: stockDiff > 0 ? "Reduce Stock Exposure" : "Increase Stock Allocation",
                description: stockDiff > 0
                    ? `You're overexposed to stocks by ${stockDiff.toFixed(1)}%. Consider diversifying into other assets.`
                    : `You're underexposed to stocks by ${Math.abs(stockDiff).toFixed(1)}%. Consider increasing equity allocation.`,
                priority: Math.abs(stockDiff) > 20 ? 'high' : 'medium',
                action: stockDiff > 0 ? "Diversify Portfolio" : "Add Stocks",
                impact: `Improve health score by ${Math.min(15, Math.abs(stockDiff) / 2)} points`
            });
        }

        // Diversification recommendation
        if (portfolio.length < 5) {
            recs.push({
                title: "Improve Diversification",
                description: `Add ${5 - portfolio.length} more investments across different sectors to reduce risk.`,
                priority: 'high',
                action: "Add More Stocks",
                impact: "Reduce portfolio volatility by 20-30%"
            });
        }

        // Asset class diversification
        if (current.mutualFunds === 0 && ideal.mutualFunds > 0) {
            recs.push({
                title: "Add Mutual Funds",
                description: `Consider allocating ${ideal.mutualFunds}% to mutual funds for professional management and instant diversification.`,
                priority: 'medium',
                action: "Explore Mutual Funds",
                impact: "Stable long-term growth potential"
            });
        }

        // Gold allocation
        if (current.gold === 0 && ideal.gold > 0) {
            recs.push({
                title: "Consider Gold Investment",
                description: `Add ${ideal.gold}% gold allocation as a hedge against inflation and market volatility.`,
                priority: 'low',
                action: "Add Gold",
                impact: "Portfolio stability during market downturns"
            });
        }

        // Health score based recommendations
        if (healthScore < 50) {
            recs.unshift({
                title: "Critical: Portfolio Rebalancing Needed",
                description: "Your portfolio shows high risk. Immediate action required to improve financial health.",
                priority: 'high',
                action: "Urgent Rebalancing",
                impact: "Potentially improve score by 30-40 points"
            });
        }

        setRecommendations(recs.slice(0, 4)); // Show top 4 recommendations
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high': return 'bg-red-500';
            case 'medium': return 'bg-yellow-500';
            case 'low': return 'bg-green-500';
            default: return 'bg-gray-500';
        }
    };

    const getPriorityIcon = (priority: string) => {
        switch (priority) {
            case 'high': return AlertCircle;
            case 'medium': return TrendingUp;
            case 'low': return Shield;
            default: return Brain;
        }
    };

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5 text-blue-500" />
                    AI Investment Planner
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Risk Profile */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <h4 className="font-semibold">Your Risk Profile</h4>
                        <Badge variant="outline" className="flex items-center gap-1">
                            {riskProfile.type === 'Conservative' && <Shield className="w-3 h-3" />}
                            {riskProfile.type === 'Moderate' && <TrendingUp className="w-3 h-3" />}
                            {riskProfile.type === 'Aggressive' && <Zap className="w-3 h-3" />}
                            {riskProfile.type}
                        </Badge>
                    </div>

                    {/* Ideal vs Current Allocation */}
                    <div className="space-y-2">
                        <div className="text-sm font-medium">Recommended Allocation</div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="flex justify-between">
                                <span>Stocks:</span>
                                <span className="font-medium">{riskProfile.allocation.stocks}%</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Mutual Funds:</span>
                                <span className="font-medium">{riskProfile.allocation.mutualFunds}%</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Gold:</span>
                                <span className="font-medium">{riskProfile.allocation.gold}%</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Bonds:</span>
                                <span className="font-medium">{riskProfile.allocation.bonds}%</span>
                            </div>
                            {riskProfile.allocation.crypto > 0 && (
                                <div className="flex justify-between">
                                    <span>Crypto:</span>
                                    <span className="font-medium">{riskProfile.allocation.crypto}%</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="space-y-3">
                    <h4 className="font-semibold">AI Recommendations</h4>
                    {recommendations.length === 0 ? (
                        <div className="text-center py-4 text-muted-foreground">
                            <Brain className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            <p>Great! Your portfolio is well-balanced.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {recommendations.map((rec, index) => {
                                const IconComponent = getPriorityIcon(rec.priority);
                                return (
                                    <div key={index} className="border rounded-lg p-3 space-y-2">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center gap-2">
                                                <IconComponent className="w-4 h-4" />
                                                <span className="font-medium text-sm">{rec.title}</span>
                                            </div>
                                            <Badge
                                                variant="secondary"
                                                className={`${getPriorityColor(rec.priority)} text-white text-xs`}
                                            >
                                                {rec.priority}
                                            </Badge>
                                        </div>
                                        <p className="text-sm text-muted-foreground">{rec.description}</p>
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-blue-600 font-medium">{rec.action}</span>
                                            <span className="text-green-600">{rec.impact}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Quick Actions */}
                <div className="pt-4 border-t">
                    <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => toast.info("Feature coming soon! This will open detailed investment suggestions.")}
                    >
                        <Brain className="w-4 h-4 mr-2" />
                        Get Detailed AI Analysis
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};

export default AIInvestmentPlanner;
