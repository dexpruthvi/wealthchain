import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import InvestmentHealthScore from "@/components/InvestmentHealthScore";
import AIInvestmentPlanner from "@/components/AIInvestmentPlanner";
import ProfitLossTracker from "@/components/ProfitLossTracker";
import RecentTransactions from "@/components/RecentTransactions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";
import { toast } from "sonner";
import { priceService } from "@/services/realTimePriceService";

interface PortfolioItem {
  id: string;
  quantity: number;
  average_price: number;
  current_value: number;
  total_invested: number;
  stocks: {
    symbol: string;
    name: string;
    current_price: number;
  };
}

const Portfolio = () => {
  const navigate = useNavigate();
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalValue, setTotalValue] = useState(0);
  const [totalInvested, setTotalInvested] = useState(0);
  const [healthScore, setHealthScore] = useState(0);

  useEffect(() => {
    checkAuth();
    fetchPortfolio();

    // Start real-time price updates
    priceService.start();

    // Subscribe to price updates
    const unsubscribe = priceService.subscribe(() => {
      fetchPortfolio(); // Refresh portfolio when prices update
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
    }
  };

  const fetchPortfolio = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("user_portfolios")
        .select(`
          *,
          stocks (symbol, name, current_price)
        `)
        .eq("user_id", user.id);

      if (error) throw error;

      setPortfolio(data || []);

      const totalVal = data?.reduce((sum, item) => sum + Number(item.current_value), 0) || 0;
      const totalInv = data?.reduce((sum, item) => sum + Number(item.total_invested), 0) || 0;
      setTotalValue(totalVal);
      setTotalInvested(totalInv);
    } catch (error) {
      toast.error("Failed to load portfolio");
    } finally {
      setLoading(false);
    }
  };

  const profitLoss = totalValue - totalInvested;
  const profitLossPercent = totalInvested > 0 ? (profitLoss / totalInvested) * 100 : 0;

  const handleHealthScoreUpdate = (score: number) => {
    setHealthScore(score);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-foreground">My Portfolio</h1>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground">Total Value</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">
                ${totalValue.toFixed(2)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground">Total Invested</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">
                ${totalInvested.toFixed(2)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground">Profit/Loss</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold ${profitLoss >= 0 ? 'text-success' : 'text-destructive'}`}>
                {profitLoss >= 0 ? '+' : ''}${profitLoss.toFixed(2)}
              </div>
              <div className={`text-sm flex items-center gap-1 ${profitLoss >= 0 ? 'text-success' : 'text-destructive'}`}>
                {profitLoss >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                {profitLoss >= 0 ? '+' : ''}{profitLossPercent.toFixed(2)}%
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Profit/Loss Analysis */}
        <div className="mb-8">
          <ProfitLossTracker
            portfolio={portfolio}
            totalValue={totalValue}
            totalInvested={totalInvested}
            onRefresh={fetchPortfolio}
          />
        </div>

        {/* AI-Powered Investment Health & Planning */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <InvestmentHealthScore
            portfolio={portfolio}
            totalValue={totalValue}
            totalInvested={totalInvested}
            onScoreUpdate={handleHealthScoreUpdate}
          />
          <AIInvestmentPlanner
            portfolio={portfolio}
            totalValue={totalValue}
            healthScore={healthScore}
          />
        </div>

        {/* Holdings and Recent Transactions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Holdings</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8 text-muted-foreground">Loading...</div>
                ) : portfolio.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No investments yet. Start investing to build your portfolio!
                  </div>
                ) : (
                  <div className="space-y-4">
                    {portfolio.map((item) => {
                      const itemProfitLoss = Number(item.current_value) - Number(item.total_invested);
                      const itemProfitPercent = Number(item.total_invested) > 0
                        ? (itemProfitLoss / Number(item.total_invested)) * 100
                        : 0;

                      return (
                        <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex-1">
                            <div className="font-semibold text-foreground">{item.stocks.symbol}</div>
                            <div className="text-sm text-muted-foreground">{item.stocks.name}</div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-foreground">
                              {item.quantity} shares @ ${Number(item.average_price).toFixed(2)}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Current: ${Number(item.stocks.current_price).toFixed(2)}
                            </div>
                          </div>
                          <div className="text-right ml-6">
                            <div className="font-semibold text-foreground">
                              ${Number(item.current_value).toFixed(2)}
                            </div>
                            <div className={`text-sm flex items-center gap-1 justify-end ${itemProfitLoss >= 0 ? 'text-success' : 'text-destructive'}`}>
                              {itemProfitLoss >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                              {itemProfitLoss >= 0 ? '+' : ''}${itemProfitLoss.toFixed(2)} ({itemProfitPercent.toFixed(2)}%)
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div>
            <RecentTransactions />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Portfolio;
