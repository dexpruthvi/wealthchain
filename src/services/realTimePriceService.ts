import { supabase } from "@/integrations/supabase/client";

interface PriceUpdate {
    stockId: string;
    symbol: string;
    newPrice: number;
    changePercent: number;
}

class RealTimePriceService {
    private updateInterval: NodeJS.Timeout | null = null;
    private callbacks: ((updates: PriceUpdate[]) => void)[] = [];
    private isRunning = false;

    // Simulate realistic price movements
    private generatePriceMovement(currentPrice: number): { newPrice: number; changePercent: number } {
        // More realistic price movements (smaller fluctuations)
        const volatility = 0.002; // 0.2% base volatility
        const randomFactor = (Math.random() - 0.5) * 2; // -1 to 1
        const extraVolatility = Math.random() > 0.9 ? 3 : 1; // Occasional larger moves

        const change = currentPrice * volatility * randomFactor * extraVolatility;
        const newPrice = Math.max(0.01, currentPrice + change);
        const changePercent = ((newPrice - currentPrice) / currentPrice) * 100;

        return { newPrice: Number(newPrice.toFixed(2)), changePercent: Number(changePercent.toFixed(2)) };
    }

    start() {
        if (this.isRunning) return;

        this.isRunning = true;
        this.updateInterval = setInterval(async () => {
            try {
                await this.updateStockPrices();
            } catch (error) {
                console.error("Error updating stock prices:", error);
            }
        }, 3000); // Update every 3 seconds for realistic feel
    }

    stop() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
        this.isRunning = false;
    }

    subscribe(callback: (updates: PriceUpdate[]) => void) {
        this.callbacks.push(callback);
        return () => {
            this.callbacks = this.callbacks.filter(cb => cb !== callback);
        };
    }

    private async updateStockPrices() {
        try {
            // Fetch all stocks
            const { data: stocks, error } = await supabase
                .from("stocks")
                .select("id, symbol, current_price, change_percent");

            if (error) throw error;
            if (!stocks || stocks.length === 0) return;

            const updates: PriceUpdate[] = [];

            // Update each stock with new price
            for (const stock of stocks) {
                const { newPrice, changePercent } = this.generatePriceMovement(stock.current_price);

                // Update in database
                const { error: updateError } = await supabase
                    .from("stocks")
                    .update({
                        current_price: newPrice,
                        change_percent: changePercent,
                        updated_at: new Date().toISOString()
                    })
                    .eq("id", stock.id);

                if (!updateError) {
                    updates.push({
                        stockId: stock.id,
                        symbol: stock.symbol,
                        newPrice,
                        changePercent
                    });
                }
            }

            // Notify all subscribers
            this.callbacks.forEach(callback => callback(updates));

            // Update user portfolios with new current values
            await this.updatePortfolioValues(updates);

        } catch (error) {
            console.error("Error in updateStockPrices:", error);
        }
    }

    private async updatePortfolioValues(updates: PriceUpdate[]) {
        try {
            for (const update of updates) {
                // Update all portfolios holding this stock
                const { data: portfolios } = await supabase
                    .from("user_portfolios")
                    .select("id, quantity")
                    .eq("stock_id", update.stockId);

                if (portfolios && portfolios.length > 0) {
                    for (const portfolio of portfolios) {
                        const newCurrentValue = portfolio.quantity * update.newPrice;

                        await supabase
                            .from("user_portfolios")
                            .update({
                                current_value: newCurrentValue,
                                updated_at: new Date().toISOString()
                            })
                            .eq("id", portfolio.id);
                    }
                }
            }
        } catch (error) {
            console.error("Error updating portfolio values:", error);
        }
    }
}

export const priceService = new RealTimePriceService();
