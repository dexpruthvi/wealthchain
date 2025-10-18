import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TrendingUp, TrendingDown, ShoppingCart, DollarSign, Activity } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { priceService } from "@/services/realTimePriceService";
import { transactionLogger } from "@/services/transactionLogger";

interface StockCardProps {
  id: string;
  symbol: string;
  name: string;
  price: number;
  changePercent: number;
  onClick?: () => void;
  onTransactionComplete?: () => void;
}

const StockCard = ({ id, symbol, name, price, changePercent, onClick, onTransactionComplete }: StockCardProps) => {
  const [currentPrice, setCurrentPrice] = useState(price);
  const [currentChange, setCurrentChange] = useState(changePercent);
  const [priceHistory, setPriceHistory] = useState<number[]>([price]);
  const isPositive = currentChange >= 0;
  const [showActions, setShowActions] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [sellAnimation, setSellAnimation] = useState<{ show: boolean; quantity: number }>({ show: false, quantity: 0 });
  const [buyAnimation, setBuyAnimation] = useState<{ show: boolean; quantity: number }>({ show: false, quantity: 0 });

  // Subscribe to real-time price updates
  useEffect(() => {
    const unsubscribe = priceService.subscribe((updates) => {
      const stockUpdate = updates.find(update => update.stockId === id);
      if (stockUpdate) {
        setCurrentPrice(stockUpdate.newPrice);
        setCurrentChange(stockUpdate.changePercent);
        setPriceHistory(prev => [...prev.slice(-19), stockUpdate.newPrice]); // Keep last 20 prices
      }
    });

    // Start the price service
    priceService.start();

    return () => {
      unsubscribe();
    };
  }, [id]);

  // Update props when they change
  useEffect(() => {
    setCurrentPrice(price);
    setCurrentChange(changePercent);
  }, [price, changePercent]);

  const handleBuyStock = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please login to buy stocks");
        return;
      }

      const totalCost = currentPrice * quantity;

      // Check if user already has this stock
      const { data: existingPortfolio } = await supabase
        .from("user_portfolios")
        .select("*")
        .eq("user_id", user.id)
        .eq("stock_id", id)
        .single();

      if (existingPortfolio) {
        // Update existing portfolio
        const newQuantity = existingPortfolio.quantity + quantity;
        const newTotalInvested = Number(existingPortfolio.total_invested) + totalCost;
        const newAveragePrice = newTotalInvested / newQuantity;
        const newCurrentValue = newQuantity * currentPrice;

        const { error } = await supabase
          .from("user_portfolios")
          .update({
            quantity: newQuantity,
            average_price: newAveragePrice,
            total_invested: newTotalInvested,
            current_value: newCurrentValue,
            updated_at: new Date().toISOString()
          })
          .eq("id", existingPortfolio.id);

        if (error) throw error;
      } else {
        // Create new portfolio entry
        const { error } = await supabase
          .from("user_portfolios")
          .insert({
            user_id: user.id,
            stock_id: id,
            quantity: quantity,
            average_price: currentPrice,
            total_invested: totalCost,
            current_value: totalCost
          });

        if (error) throw error;
      }

      // Show buy animation
      setBuyAnimation({ show: true, quantity });
      setTimeout(() => setBuyAnimation({ show: false, quantity: 0 }), 2000);

      // Log transaction
      transactionLogger.addTransaction({
        stockSymbol: symbol,
        stockName: name,
        type: 'buy',
        quantity,
        price: currentPrice,
        totalAmount: totalCost
      });

      toast.success(`Successfully bought ${quantity} shares of ${symbol} for $${totalCost.toFixed(2)}`);
      setQuantity(1);
      setShowActions(false);
      onTransactionComplete?.();
    } catch (error) {
      console.error("Error buying stock:", error);
      toast.error("Failed to buy stock");
    } finally {
      setLoading(false);
    }
  };

  const handleSellStock = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please login to sell stocks");
        return;
      }

      // Check current holdings
      const { data: portfolio } = await supabase
        .from("user_portfolios")
        .select("*")
        .eq("user_id", user.id)
        .eq("stock_id", id)
        .single();

      if (!portfolio || portfolio.quantity < quantity) {
        toast.error(`You don't have enough ${symbol} shares to sell`);
        return;
      }

      const saleValue = currentPrice * quantity;
      const newQuantity = portfolio.quantity - quantity;

      if (newQuantity === 0) {
        // Remove portfolio entry if no shares left
        const { error } = await supabase
          .from("user_portfolios")
          .delete()
          .eq("id", portfolio.id);

        if (error) throw error;
      } else {
        // Update portfolio - reduce total_invested proportionally
        const sellRatio = quantity / portfolio.quantity;
        const amountToReduceFromInvested = Number(portfolio.total_invested) * sellRatio;
        const newTotalInvested = Number(portfolio.total_invested) - amountToReduceFromInvested;
        const newCurrentValue = newQuantity * currentPrice;

        const { error } = await supabase
          .from("user_portfolios")
          .update({
            quantity: newQuantity,
            total_invested: Math.max(0, newTotalInvested),
            current_value: newCurrentValue,
            updated_at: new Date().toISOString()
          })
          .eq("id", portfolio.id);

        if (error) throw error;
      }

      // Show sell animation
      setSellAnimation({ show: true, quantity });
      setTimeout(() => setSellAnimation({ show: false, quantity: 0 }), 2000);

      // Log transaction
      transactionLogger.addTransaction({
        stockSymbol: symbol,
        stockName: name,
        type: 'sell',
        quantity,
        price: currentPrice,
        totalAmount: saleValue
      });

      toast.success(`Successfully sold ${quantity} shares of ${symbol} for $${saleValue.toFixed(2)}`);
      setQuantity(1);
      setShowActions(false);
      onTransactionComplete?.();
    } catch (error) {
      console.error("Error selling stock:", error);
      toast.error("Failed to sell stock");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card
      className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105 relative"
      onClick={onClick}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => !loading && setShowActions(false)}
    >
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="font-bold text-lg text-foreground">{symbol}</h3>
            <p className="text-sm text-muted-foreground">{name}</p>
          </div>
          <div className={cn(
            "flex items-center gap-1 px-2 py-1 rounded-md transition-colors",
            isPositive ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
          )}>
            {isPositive ? (
              <TrendingUp className="w-4 h-4" />
            ) : (
              <TrendingDown className="w-4 h-4" />
            )}
            <span className="text-sm font-semibold">
              {isPositive ? "+" : ""}{currentChange.toFixed(2)}%
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-4 relative">
          <div className={cn(
            "text-2xl font-bold transition-colors duration-300",
            currentPrice > priceHistory[priceHistory.length - 2] ? "text-green-600" :
              currentPrice < priceHistory[priceHistory.length - 2] ? "text-red-600" : "text-foreground"
          )}>
            ${currentPrice.toFixed(2)}
          </div>
          <Activity className={cn(
            "w-4 h-4 transition-colors",
            currentPrice > priceHistory[priceHistory.length - 2] ? "text-green-600" :
              currentPrice < priceHistory[priceHistory.length - 2] ? "text-red-600" : "text-muted-foreground"
          )} />

          {/* Transaction Animation Indicators */}
          {sellAnimation.show && (
            <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full animate-bounce shadow-lg z-10">
              -{sellAnimation.quantity}
            </div>
          )}
          {buyAnimation.show && (
            <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full animate-bounce shadow-lg z-10">
              +{buyAnimation.quantity}
            </div>
          )}
        </div>

        {/* Mini price chart visualization */}
        <div className="flex items-end h-6 gap-0.5 mb-4 opacity-60">
          {priceHistory.slice(-10).map((price, index) => {
            const height = priceHistory.length > 1 ?
              ((price - Math.min(...priceHistory.slice(-10))) /
                (Math.max(...priceHistory.slice(-10)) - Math.min(...priceHistory.slice(-10))) * 20) + 4 : 12;
            return (
              <div
                key={index}
                className={cn(
                  "w-1 rounded-t transition-all",
                  price > (priceHistory[index - 1] || price) ? "bg-green-400" :
                    price < (priceHistory[index - 1] || price) ? "bg-red-400" : "bg-gray-400"
                )}
                style={{ height: `${height}px` }}
              />
            );
          })}
        </div>

        {/* Buy/Sell Actions */}
        {showActions && (
          <div className="border-t pt-4 space-y-3" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-20 h-8 text-center"
                disabled={loading}
              />
              <span className="text-sm text-muted-foreground">shares</span>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleBuyStock}
                disabled={loading}
                className="flex-1 bg-success hover:bg-success/90"
              >
                <ShoppingCart className="w-3 h-3 mr-1" />
                Buy ${(price * quantity).toFixed(2)}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleSellStock}
                disabled={loading}
                className="flex-1 border-destructive text-destructive hover:bg-destructive hover:text-white"
              >
                <DollarSign className="w-3 h-3 mr-1" />
                Sell
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StockCard;
