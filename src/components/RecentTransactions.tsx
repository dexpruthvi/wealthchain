import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Clock, ArrowUpCircle, ArrowDownCircle } from "lucide-react";
import { transactionLogger, Transaction } from "@/services/transactionLogger";

const RecentTransactions = () => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);

    useEffect(() => {
        // Load initial transactions
        setTransactions(transactionLogger.getRecentTransactions(8));

        // Subscribe to new transactions
        const unsubscribe = transactionLogger.subscribe(() => {
            setTransactions(transactionLogger.getRecentTransactions(8));
        });

        return unsubscribe;
    }, []);

    const formatTime = (timestamp: string) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });
    };

    const formatDate = (timestamp: string) => {
        const date = new Date(timestamp);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (date.toDateString() === today.toDateString()) {
            return "Today";
        } else if (date.toDateString() === yesterday.toDateString()) {
            return "Yesterday";
        } else {
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        }
    };

    if (transactions.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Clock className="h-5 w-5" />
                        Recent Transactions
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8 text-muted-foreground">
                        No transactions yet. Start trading to see your activity here!
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Recent Transactions
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {transactions.map((transaction) => (
                        <div
                            key={transaction.id}
                            className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-full ${transaction.type === 'buy'
                                        ? 'bg-green-100 text-green-600'
                                        : 'bg-red-100 text-red-600'
                                    }`}>
                                    {transaction.type === 'buy' ? (
                                        <ArrowUpCircle className="h-4 w-4" />
                                    ) : (
                                        <ArrowDownCircle className="h-4 w-4" />
                                    )}
                                </div>

                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold text-foreground">
                                            {transaction.stockSymbol}
                                        </span>
                                        <Badge
                                            variant="secondary"
                                            className={`text-xs ${transaction.type === 'buy'
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-red-100 text-red-700'
                                                }`}
                                        >
                                            {transaction.type === 'buy' ? '+' : '-'}{transaction.quantity}
                                        </Badge>
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        {transaction.stockName}
                                    </div>
                                </div>
                            </div>

                            <div className="text-right">
                                <div className="font-semibold text-foreground">
                                    ${transaction.totalAmount.toFixed(2)}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    {formatDate(transaction.timestamp)} {formatTime(transaction.timestamp)}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    @ ${transaction.price.toFixed(2)}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};

export default RecentTransactions;
