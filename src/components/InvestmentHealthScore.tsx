import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Shield, Target, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface HealthScoreProps {
    portfolio: any[];
    totalValue: number;
    totalInvested: number;
    onScoreUpdate?: (score: number) => void;
}

interface HealthMetrics {
    score: number;
    status: string;
    color: string;
    icon: any;
    diversification: number;
    riskExposure: number;
    returns: number;
    liquidity: number;
}

const InvestmentHealthScore = ({ portfolio, totalValue, totalInvested, onScoreUpdate }: HealthScoreProps) => {
    const [healthMetrics, setHealthMetrics] = useState<HealthMetrics>({
        score: 0,
        status: "Calculating...",
        color: "bg-gray-500",
        icon: Target,
        diversification: 0,
        riskExposure: 0,
        returns: 0,
        liquidity: 0
    });

    useEffect(() => {
        calculateHealthScore();
    }, [portfolio, totalValue, totalInvested]);

    const calculateHealthScore = () => {
        if (portfolio.length === 0) {
            setHealthMetrics({
                score: 0,
                status: "No Investments",
                color: "bg-gray-500",
                icon: AlertTriangle,
                diversification: 0,
                riskExposure: 0,
                returns: 0,
                liquidity: 0
            });
            return;
        }

        // 1. Diversification Score (0-25 points)
        const uniqueStocks = portfolio.length;
        const sectors = portfolio.map(item => item.stocks?.sector || 'Unknown');
        const uniqueSectors = new Set(sectors).size;
        const diversificationScore = Math.min(25, (uniqueStocks * 2) + (uniqueSectors * 3));

        // 2. Risk Exposure Score (0-25 points)
        // Lower volatility = higher score
        const avgVolatility = portfolio.reduce((sum, item) => {
            const volatility = Math.abs(Number(item.stocks?.change_percent || 0));
            return sum + volatility;
        }, 0) / portfolio.length;
        const riskScore = Math.max(0, 25 - (avgVolatility * 2));

        // 3. Returns Score (0-25 points)
        const totalReturns = totalValue - totalInvested;
        const returnPercent = totalInvested > 0 ? (totalReturns / totalInvested) * 100 : 0;
        const returnsScore = Math.min(25, Math.max(0, returnPercent + 10));

        // 4. Liquidity Score (0-25 points)
        // Assume all stocks are liquid for now (can be enhanced)
        const liquidityScore = portfolio.length > 0 ? 20 : 0;

        const totalScore = Math.round(diversificationScore + riskScore + returnsScore + liquidityScore);

        let status, color, icon;
        if (totalScore >= 90) {
            status = "Financially Fit";
            color = "bg-green-500";
            icon = TrendingUp;
        } else if (totalScore >= 70) {
            status = "On Track";
            color = "bg-yellow-500";
            icon = Target;
        } else if (totalScore >= 40) {
            status = "Needs Balance";
            color = "bg-blue-500";
            icon = Shield;
        } else {
            status = "High Risk";
            color = "bg-red-500";
            icon = AlertTriangle;
        }

        setHealthMetrics({
            score: totalScore,
            status,
            color,
            icon,
            diversification: Math.round(diversificationScore),
            riskExposure: Math.round(riskScore),
            returns: Math.round(returnsScore),
            liquidity: Math.round(liquidityScore)
        });

        // Pass score back to parent component
        onScoreUpdate?.(totalScore);
    };

    const IconComponent = healthMetrics.icon;

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <IconComponent className="h-5 w-5" />
                    Investment Health Score
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Main Score Display */}
                <div className="text-center space-y-2">
                    <div className="relative w-32 h-32 mx-auto">
                        <svg className="w-full h-full" viewBox="0 0 100 100">
                            <circle
                                cx="50"
                                cy="50"
                                r="40"
                                stroke="currentColor"
                                strokeWidth="8"
                                fill="transparent"
                                className="text-gray-200"
                            />
                            <circle
                                cx="50"
                                cy="50"
                                r="40"
                                stroke="currentColor"
                                strokeWidth="8"
                                fill="transparent"
                                strokeDasharray={`${2.51 * healthMetrics.score} 251`}
                                className={healthMetrics.color.replace('bg-', 'text-')}
                                strokeLinecap="round"
                                transform="rotate(-90 50 50)"
                            />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-center">
                                <div className="text-2xl font-bold">{healthMetrics.score}</div>
                                <div className="text-xs text-muted-foreground">/ 100</div>
                            </div>
                        </div>
                    </div>
                    <Badge variant="secondary" className={`${healthMetrics.color} text-white`}>
                        {healthMetrics.status}
                    </Badge>
                </div>

                {/* Breakdown Metrics */}
                <div className="space-y-3">
                    <div className="flex justify-between items-center">
                        <span className="text-sm">Diversification</span>
                        <div className="flex items-center gap-2">
                            <Progress value={(healthMetrics.diversification / 25) * 100} className="w-16" />
                            <span className="text-sm font-medium">{healthMetrics.diversification}/25</span>
                        </div>
                    </div>

                    <div className="flex justify-between items-center">
                        <span className="text-sm">Risk Management</span>
                        <div className="flex items-center gap-2">
                            <Progress value={(healthMetrics.riskExposure / 25) * 100} className="w-16" />
                            <span className="text-sm font-medium">{healthMetrics.riskExposure}/25</span>
                        </div>
                    </div>

                    <div className="flex justify-between items-center">
                        <span className="text-sm">Returns Performance</span>
                        <div className="flex items-center gap-2">
                            <Progress value={(healthMetrics.returns / 25) * 100} className="w-16" />
                            <span className="text-sm font-medium">{healthMetrics.returns}/25</span>
                        </div>
                    </div>

                    <div className="flex justify-between items-center">
                        <span className="text-sm">Liquidity</span>
                        <div className="flex items-center gap-2">
                            <Progress value={(healthMetrics.liquidity / 25) * 100} className="w-16" />
                            <span className="text-sm font-medium">{healthMetrics.liquidity}/25</span>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default InvestmentHealthScore;
