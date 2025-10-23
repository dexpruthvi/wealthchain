import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, TrendingDown, Filter, RefreshCw, Building2, Clock } from "lucide-react";
import { nseLargeDealsService, LargeDealData } from "@/services/nseLargeDealsService";
import Navbar from "@/components/Navbar";
import { formatDistanceToNow } from "date-fns";

const LargeDeals = () => {
    const [deals, setDeals] = useState<LargeDealData[]>([]);
    const [filteredDeals, setFilteredDeals] = useState<LargeDealData[]>([]);
    const [selectedSector, setSelectedSector] = useState<string>("all");
    const [selectedType, setSelectedType] = useState<string>("all");
    const [marketSummary, setMarketSummary] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Initial load
        loadDeals();

        // Subscribe to real-time updates
        const unsubscribe = nseLargeDealsService.subscribe(() => {
            loadDeals();
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [deals, selectedSector, selectedType]);

    const loadDeals = () => {
        const latestDeals = nseLargeDealsService.getLargeDeals();
        const summary = nseLargeDealsService.getMarketSummary();

        setDeals(latestDeals);
        setMarketSummary(summary);
        setIsLoading(false);
    };

    const applyFilters = () => {
        let filtered = deals;

        if (selectedSector !== "all") {
            filtered = filtered.filter(deal => deal.sector === selectedSector);
        }

        if (selectedType !== "all") {
            filtered = filtered.filter(deal => deal.dealType === selectedType);
        }

        setFilteredDeals(filtered);
    };

    const formatCurrency = (amount: number) => {
        if (amount >= 10000000) {
            return `₹${(amount / 10000000).toFixed(2)}Cr`;
        } else if (amount >= 100000) {
            return `₹${(amount / 100000).toFixed(2)}L`;
        } else {
            return `₹${amount.toFixed(2)}`;
        }
    };

    const formatQuantity = (quantity: number) => {
        if (quantity >= 10000000) {
            return `${(quantity / 10000000).toFixed(2)}Cr`;
        } else if (quantity >= 100000) {
            return `${(quantity / 100000).toFixed(2)}L`;
        } else {
            return quantity.toLocaleString();
        }
    };

    const refreshData = () => {
        setIsLoading(true);
        setTimeout(() => {
            loadDeals();
        }, 500);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background">
                <Navbar />
                <div className="container mx-auto px-4 py-8">
                    <div className="flex items-center justify-center h-64">
                        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <Navbar />

            <div className="container mx-auto px-4 py-8 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">NSE Large Deals</h1>
                        <p className="text-muted-foreground mt-1">
                            Real-time tracking of institutional block and bulk deals
                        </p>
                    </div>
                    <Button onClick={refreshData} variant="outline" size="sm">
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Refresh
                    </Button>
                </div>

                {/* Market Summary */}
                {marketSummary && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Total Deals</p>
                                        <p className="text-2xl font-bold">{marketSummary.totalDeals}</p>
                                    </div>
                                    <Building2 className="w-8 h-8 text-primary" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Total Volume</p>
                                        <p className="text-2xl font-bold">{formatCurrency(marketSummary.totalVolume)}</p>
                                    </div>
                                    <TrendingUp className="w-8 h-8 text-success" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Buy Deals</p>
                                        <p className="text-2xl font-bold text-success">{marketSummary.buyDeals}</p>
                                    </div>
                                    <TrendingUp className="w-8 h-8 text-success" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Sell Deals</p>
                                        <p className="text-2xl font-bold text-destructive">{marketSummary.sellDeals}</p>
                                    </div>
                                    <TrendingDown className="w-8 h-8 text-destructive" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Filters */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Filter className="w-5 h-5" />
                            Filters
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex gap-4">
                            <Select value={selectedSector} onValueChange={setSelectedSector}>
                                <SelectTrigger className="w-48">
                                    <SelectValue placeholder="Select Sector" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Sectors</SelectItem>
                                    <SelectItem value="IT">Information Technology</SelectItem>
                                    <SelectItem value="Banking">Banking</SelectItem>
                                    <SelectItem value="Energy">Energy</SelectItem>
                                    <SelectItem value="FMCG">FMCG</SelectItem>
                                    <SelectItem value="Auto">Automobile</SelectItem>
                                    <SelectItem value="Pharma">Pharmaceuticals</SelectItem>
                                    <SelectItem value="Construction">Construction</SelectItem>
                                    <SelectItem value="Power">Power</SelectItem>
                                </SelectContent>
                            </Select>

                            <Select value={selectedType} onValueChange={setSelectedType}>
                                <SelectTrigger className="w-48">
                                    <SelectValue placeholder="Select Deal Type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Types</SelectItem>
                                    <SelectItem value="Buy">Buy Deals</SelectItem>
                                    <SelectItem value="Sell">Sell Deals</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                {/* Deals Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Large Deals ({filteredDeals.length})</CardTitle>
                        <CardDescription>
                            Institutional block and bulk deals on NSE
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {filteredDeals.map((deal) => (
                                <div
                                    key={deal.id}
                                    className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                                >
                                    <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-center">
                                        {/* Company Info */}
                                        <div className="md:col-span-2">
                                            <div className="flex items-center gap-3">
                                                <div>
                                                    <h3 className="font-semibold text-lg">{deal.symbol}</h3>
                                                    <p className="text-sm text-muted-foreground line-clamp-1">
                                                        {deal.companyName}
                                                    </p>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <Badge variant="outline" className="text-xs">
                                                            {deal.sector}
                                                        </Badge>
                                                        <Badge
                                                            variant={deal.dealCategory === 'Block Deal' ? 'default' : 'secondary'}
                                                            className="text-xs"
                                                        >
                                                            {deal.dealCategory}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Deal Type */}
                                        <div className="text-center">
                                            <Badge
                                                variant={deal.dealType === 'Buy' ? 'default' : 'destructive'}
                                                className="font-semibold"
                                            >
                                                {deal.dealType}
                                            </Badge>
                                        </div>

                                        {/* Price & Quantity */}
                                        <div>
                                            <p className="font-semibold">₹{deal.price.toFixed(2)}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {formatQuantity(deal.quantity)} shares
                                            </p>
                                            <div className="flex items-center gap-1 mt-1">
                                                {deal.percentChange >= 0 ? (
                                                    <TrendingUp className="w-3 h-3 text-success" />
                                                ) : (
                                                    <TrendingDown className="w-3 h-3 text-destructive" />
                                                )}
                                                <span className={`text-xs ${deal.percentChange >= 0 ? 'text-success' : 'text-destructive'
                                                    }`}>
                                                    {deal.percentChange >= 0 ? '+' : ''}{deal.percentChange.toFixed(2)}%
                                                </span>
                                            </div>
                                        </div>

                                        {/* Total Value */}
                                        <div>
                                            <p className="font-bold text-lg">{formatCurrency(deal.totalValue)}</p>
                                            <p className="text-sm text-muted-foreground">Total Value</p>
                                        </div>

                                        {/* Client & Time */}
                                        <div>
                                            <p className="text-sm font-medium line-clamp-2">{deal.clientName}</p>
                                            <div className="flex items-center gap-1 mt-1">
                                                <Clock className="w-3 h-3 text-muted-foreground" />
                                                <span className="text-xs text-muted-foreground">
                                                    {formatDistanceToNow(new Date(deal.timestamp), { addSuffix: true })}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {filteredDeals.length === 0 && (
                                <div className="text-center py-8">
                                    <p className="text-muted-foreground">No deals found matching your filters</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default LargeDeals;
