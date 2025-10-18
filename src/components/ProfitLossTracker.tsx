import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, DollarSign, Activity, Target } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Transaction {
    id: string;
    stock_symbol: string;
    transaction_type: 'buy' | 'sell';
    quantity: number;
    price: number;
    total_amount: number;
    profit_loss?: number;
    created_at: string;
}

interface ProfitLossBreakdown {
    realizedPL: number;
    unrealizedPL: number;
    totalPL: number;
    dayChange: number;
    bestPerformer: { symbol: string; gain: number } | null;
    worstPerformer: { symbol: string; loss: number } | null;
}

interface ProfitLossTrackerProps {
    portfolio: any[];
    totalValue: number;
    totalInvested: number;
    onRefresh?: () => void;
}

const ProfitLossTracker = ({ portfolio, totalValue, totalInvested, onRefresh }: ProfitLossTrackerProps) => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [breakdown, setBreakdown] = useState<ProfitLossBreakdown>({
        realizedPL: 0,
        unrealizedPL: 0,
        totalPL: 0,
        dayChange: 0,
        bestPerformer: null,
        worstPerformer: null
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        calculateProfitLossBreakdown();
    }, [portfolio, totalValue, totalInvested]);

    const calculateProfitLossBreakdown = () => {
        if (!portfolio || portfolio.length === 0) {
            setLoading(false);
            return;
        }

        let bestGain = { symbol: "", gain: -Infinity };
        let worstLoss = { symbol: "", loss: Infinity };
        let totalDayChange = 0;

        portfolio.forEach(item => {
            const currentValue = Number(item.current_value);
            const invested = Number(item.total_invested);
            const gain = currentValue - invested;
            const gainPercent = invested > 0 ? (gain / invested) * 100 : 0;

            // Track best and worst performers
            if (gainPercent > bestGain.gain) {
                bestGain = { symbol: item.stocks?.symbol || "", gain: gainPercent };
            }
            if (gainPercent < worstLoss.loss) {
                worstLoss = { symbol: item.stocks?.symbol || "", loss: gainPercent };
            }

            // Calculate day change (simplified - using change_percent from stocks)
            const stockChangePercent = Number(item.stocks?.change_percent || 0);
            totalDayChange += (currentValue * stockChangePercent) / 100;
        });

        const unrealizedPL = totalValue - totalInvested;

        setBreakdown({
            realizedPL: 0, // Will be calculated from actual sell transactions
            unrealizedPL,
            totalPL: unrealizedPL, // + realized when implemented
            dayChange: totalDayChange,
            bestPerformer: bestGain.gain > -Infinity ? { symbol: bestGain.symbol, gain: bestGain.gain } : null,
            worstPerformer: worstLoss.loss < Infinity ? { symbol: worstLoss.symbol, loss: worstLoss.loss } : null
        });

        setLoading(false);
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2
        }).format(amount);
    };

    const formatPercent = (percent: number) => {
        return `${percent >= 0 ? '+' : ''}${percent.toFixed(2)}%`;
    };

    return (
        <div className="space-y-6">
            {/* Main P&L Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total P&L</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${breakdown.totalPL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {formatCurrency(breakdown.totalPL)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {formatPercent(totalInvested > 0 ? (breakdown.totalPL / totalInvested) * 100 : 0)}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Day Change</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${breakdown.dayChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {formatCurrency(breakdown.dayChange)}
                        </div>
                        <div className="flex items-center text-xs">
                            {breakdown.dayChange >= 0 ? (
                                <TrendingUp className="w-3 h-3 mr-1 text-green-600" />
                            ) : (
                                <TrendingDown className="w-3 h-3 mr-1 text-red-600" />
                            )}
                            <span className={breakdown.dayChange >= 0 ? 'text-green-600' : 'text-red-600'}>
                                Today
                            </span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Best Performer</CardTitle>
                        <TrendingUp className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        {breakdown.bestPerformer ? (
                            <>
                                <div className="text-xl font-bold text-foreground">
                                    {breakdown.bestPerformer.symbol}
                                </div>
                                <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                                    +{breakdown.bestPerformer.gain.toFixed(2)}%
                                </Badge>
                            </>
                        ) : (
                            <div className="text-sm text-muted-foreground">No data</div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Worst Performer</CardTitle>
                        <TrendingDown className="h-4 w-4 text-red-600" />
                    </CardHeader>
                    <CardContent>
                        {breakdown.worstPerformer ? (
                            <>
                                <div className="text-xl font-bold text-foreground">
                                    {breakdown.worstPerformer.symbol}
                                </div>
                                <Badge variant="secondary" className="bg-red-100 text-red-800 text-xs">
                                    {breakdown.worstPerformer.loss.toFixed(2)}%
                                </Badge>
                            </>
                        ) : (
                            <div className="text-sm text-muted-foreground">No data</div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Detailed Breakdown */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Target className="h-5 w-5" />
                        Profit & Loss Breakdown
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                                <span className="text-sm font-medium">Unrealized P&L</span>
                                <span className={`font-bold ${breakdown.unrealizedPL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {formatCurrency(breakdown.unrealizedPL)}
                                </span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                                <span className="text-sm font-medium">Realized P&L</span>
                                <span className={`font-bold ${breakdown.realizedPL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {formatCurrency(breakdown.realizedPL)}
                                </span>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="p-3 bg-primary/5 rounded-lg">
                                <div className="text-sm text-muted-foreground mb-1">Portfolio Value</div>
                                <div className="text-xl font-bold text-foreground">
                                    {formatCurrency(totalValue)}
                                </div>
                            </div>
                            <div className="p-3 bg-muted rounded-lg">
                                <div className="text-sm text-muted-foreground mb-1">Total Invested</div>
                                <div className="text-xl font-bold text-foreground">
                                    {formatCurrency(totalInvested)}
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default ProfitLossTracker;
