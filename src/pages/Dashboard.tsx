import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import StockCard from "@/components/StockCard";
import QuickHealthScore from "@/components/QuickHealthScore";
import StockMarketNews from "@/components/StockMarketNews";
import RewardsTokenSystem from "@/components/RewardsTokenSystem";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, Wallet, Users, ArrowUpRight, Activity, Building2, Zap, Gift } from "lucide-react";
import { toast } from "sonner";
import { priceService } from "@/services/realTimePriceService";

interface Stock {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  change_percent: number;
  sector: string;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);
  const [portfolioValue, setPortfolioValue] = useState(0);
  const [groupCount, setGroupCount] = useState(0);

  useEffect(() => {
    checkAuth();
    fetchStocks();
    fetchUserStats();

    // Start real-time price updates
    priceService.start();

    // Subscribe to price updates
    const unsubscribe = priceService.subscribe(() => {
      fetchStocks(); // Refresh stocks when prices update
      fetchUserStats(); // Refresh user stats
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

  const fetchStocks = async () => {
    try {
      const { data, error } = await supabase
        .from("stocks")
        .select("*")
        .order("change_percent", { ascending: false })
        .limit(8);

      if (error) throw error;
      setStocks(data || []);
    } catch (error) {
      toast.error("Failed to load stocks");
    } finally {
      setLoading(false);
    }
  };

  const fetchUserStats = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Fetch portfolio value
    const { data: portfolio } = await supabase
      .from("user_portfolios")
      .select("current_value")
      .eq("user_id", user.id);

    if (portfolio) {
      const total = portfolio.reduce((sum, item) => sum + (Number(item.current_value) || 0), 0);
      setPortfolioValue(total);
    }

    // Fetch group count
    const { data: groups } = await supabase
      .from("group_members")
      .select("id")
      .eq("user_id", user.id);

    setGroupCount(groups?.length || 0);
  };

  // Refresh stats when user makes transactions
  const refreshStats = () => {
    fetchUserStats();
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="mb-8 p-8 rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-success/10 border border-primary/20">
          <h1 className="text-4xl font-bold mb-2 text-foreground">
            Welcome to InvestHub
          </h1>
          <p className="text-muted-foreground text-lg">
            Your smart investment companion for individual and group investments
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Portfolio Value
              </CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                ${portfolioValue.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">
                Total investments
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Investment Groups
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {groupCount}
              </div>
              <p className="text-xs text-muted-foreground">
                Active memberships
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Live Market
              </CardTitle>
              <Activity className="h-4 w-4 text-success animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">
                LIVE
              </div>
              <p className="text-xs text-muted-foreground">
                Real-time updates
              </p>
            </CardContent>
          </Card>

          <QuickHealthScore onViewDetails={() => navigate("/portfolio")} />
        </div>

        {/* Trending Stocks */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-foreground">Trending Stocks</h2>
            <button
              className="text-primary hover:underline flex items-center gap-1"
              onClick={() => navigate("/stocks")}
            >
              View All <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>

          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading stocks...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {stocks.map((stock) => (
                <StockCard
                  key={stock.id}
                  id={stock.id}
                  symbol={stock.symbol}
                  name={stock.name}
                  price={Number(stock.current_price)}
                  changePercent={Number(stock.change_percent)}
                  onClick={() => navigate(`/stocks/${stock.id}`)}
                  onTransactionComplete={refreshStats}
                />
              ))}
            </div>
          )}
        </div>

        {/* Market News and Rewards Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <StockMarketNews />
          <div>
            <RewardsTokenSystem />
          </div>
        </div>

        {/* Quick Access Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-blue-200 bg-blue-50 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate("/large-deals")}>
            <CardContent className="p-6 text-center">
              <Building2 className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-blue-800 mb-2">NSE Large Deals</h3>
              <p className="text-sm text-blue-700">
                Track institutional block deals and bulk transactions in real-time
              </p>
              <Button variant="outline" className="mt-4 text-blue-600 border-blue-300">
                View Large Deals →
              </Button>
            </CardContent>
          </Card>

          <Card className="border-purple-200 bg-purple-50 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate("/powersip")}>
            <CardContent className="p-6 text-center">
              <Zap className="w-12 h-12 text-purple-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-purple-800 mb-2">PowerSIP Journey</h3>
              <p className="text-sm text-purple-700">
                Gamified SIP investments with NFT rewards and level progression
              </p>
              <Button variant="outline" className="mt-4 text-purple-600 border-purple-300">
                Start Journey →
              </Button>
            </CardContent>
          </Card>

          <Card className="border-yellow-200 bg-yellow-50 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate("/rewards")}>
            <CardContent className="p-6 text-center">
              <Gift className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-yellow-800 mb-2">Rewards & Tokens</h3>
              <p className="text-sm text-yellow-700">
                Earn tokens through investments and redeem premium vouchers
              </p>
              <Button variant="outline" className="mt-4 text-yellow-600 border-yellow-300">
                Earn Rewards →
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
