// Transaction history storage for local display
export interface Transaction {
    id: string;
    stockSymbol: string;
    stockName: string;
    type: 'buy' | 'sell';
    quantity: number;
    price: number;
    totalAmount: number;
    timestamp: string;
}

class TransactionLogger {
    private transactions: Transaction[] = [];
    private listeners: (() => void)[] = [];

    addTransaction(transaction: Omit<Transaction, 'id' | 'timestamp'>) {
        const newTransaction: Transaction = {
            ...transaction,
            id: Date.now().toString(),
            timestamp: new Date().toISOString()
        };

        this.transactions.unshift(newTransaction);

        // Keep only last 50 transactions
        if (this.transactions.length > 50) {
            this.transactions = this.transactions.slice(0, 50);
        }

        // Notify listeners
        this.listeners.forEach(listener => listener());
    }

    getRecentTransactions(limit: number = 10): Transaction[] {
        return this.transactions.slice(0, limit);
    }

    subscribe(callback: () => void): () => void {
        this.listeners.push(callback);
        return () => {
            this.listeners = this.listeners.filter(l => l !== callback);
        };
    }

    clear() {
        this.transactions = [];
        this.listeners.forEach(listener => listener());
    }
}

export const transactionLogger = new TransactionLogger();
