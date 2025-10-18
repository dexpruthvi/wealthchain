import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Shield, Target, AlertTriangle, Brain } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface QuickHealthProps {
    onViewDetails?: () => void;
}

const QuickHealthScore = ({ onViewDetails }: QuickHealthProps) => {
    const [healthScore, setHealthScore] = useState(0);
    const [status, setStatus] = useState("Loading...");
    const [statusColor, setStatusColor] = useState("bg-gray-500");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        calculateQuickHealth();
    }, []);

    const calculateQuickHealth = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Fetch portfolio data
            const { data: portfolio } = await supabase
                .from("user_portfolios")
                .select(`
          *,
          stocks (symbol, name, current_price, change_percent, sector)
        `)
                .eq("user_id", user.id);

            if (!portfolio || portfolio.length === 0) {
                setHealthScore(0);
                setStatus("No Investments");
                setStatusColor("bg-gray-500");
                setLoading(false);
                return;
            }

            // Quick calculation
            const uniqueStocks = portfolio.length;
            const uniqueSectors = new Set(portfolio.map(item => item.stocks?.sector || 'Unknown')).size;
            const diversificationScore = Math.min(25, (uniqueStocks * 3) + (uniqueSectors * 2));

            const avgVolatility = portfolio.reduce((sum, item) => {
                const volatility = Math.abs(Number(item.stocks?.change_percent || 0));
                return sum + volatility;
            }, 0) / portfolio.length;
            const riskScore = Math.max(0, 25 - (avgVolatility * 2));

            const totalValue = portfolio.reduce((sum, item) => sum + Number(item.current_value), 0);
            const totalInvested = portfolio.reduce((sum, item) => sum + Number(item.total_invested), 0);
            const totalReturns = totalValue - totalInvested;
            const returnPercent = totalInvested > 0 ? (totalReturns / totalInvested) * 100 : 0;
            const returnsScore = Math.min(25, Math.max(0, returnPercent + 10));

            const liquidityScore = portfolio.length > 0 ? 20 : 0;

            const totalScore = Math.round(diversificationScore + riskScore + returnsScore + liquidityScore);

            let statusText, color;
            if (totalScore >= 90) {
                statusText = "Financially Fit";
                color = "bg-green-500";
            } else if (totalScore >= 70) {
                statusText = "On Track";
                color = "bg-yellow-500";
            } else if (totalScore >= 40) {
                statusText = "Needs Balance";
                color = "bg-blue-500";
            } else {
                statusText = "High Risk";
                color = "bg-red-500";
            }

            setHealthScore(totalScore);
            setStatus(statusText);
            setStatusColor(color);
        } catch (error) {
            console.error("Error calculating health score:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="cursor-pointer hover:shadow-md transition-all" onClick={onViewDetails}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                    Investment Health
                </CardTitle>
                <Brain className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="text-2xl font-bold text-foreground">--</div>
                ) : (
                    <>
                        <div className="text-2xl font-bold text-foreground">
                            {healthScore}/100
                        </div>
                        <Badge variant="secondary" className={`${statusColor} text-white text-xs mt-1`}>
                            {status}
                        </Badge>
                    </>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                    AI-powered analysis
                </p>
            </CardContent>
        </Card>
    );
};

export default QuickHealthScore;
