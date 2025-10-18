import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Newspaper, ExternalLink, TrendingUp, Clock, Eye, RefreshCw } from "lucide-react";

interface NewsItem {
    id: string;
    title: string;
    summary: string;
    source: string;
    publishedAt: string;
    url: string;
    category: 'market' | 'stock' | 'crypto' | 'economy';
    sentiment: 'positive' | 'negative' | 'neutral';
    readTime: number;
}

const StockMarketNews = () => {
    const [news, setNews] = useState<NewsItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState<string>('all');

    useEffect(() => {
        generateFreshNews();

        // Refresh news every 10 minutes
        const interval = setInterval(generateFreshNews, 10 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    const generateFreshNews = () => {
        setLoading(true);

        // Simulated fresh stock market news
        const freshNews: NewsItem[] = [
            {
                id: '1',
                title: 'Tech Stocks Rally as AI Innovation Drives Market Optimism',
                summary: 'Major technology companies see significant gains following breakthrough AI announcements, with investors showing renewed confidence in the sector.',
                source: 'Market Watch',
                publishedAt: new Date(Date.now() - Math.random() * 2 * 60 * 60 * 1000).toISOString(),
                url: '#',
                category: 'stock',
                sentiment: 'positive',
                readTime: 3
            },
            {
                id: '2',
                title: 'Federal Reserve Signals Potential Interest Rate Adjustments',
                summary: 'The Federal Reserve hints at upcoming monetary policy changes, impacting bond yields and equity markets across sectors.',
                source: 'Financial Times',
                publishedAt: new Date(Date.now() - Math.random() * 4 * 60 * 60 * 1000).toISOString(),
                url: '#',
                category: 'economy',
                sentiment: 'neutral',
                readTime: 5
            },
            {
                id: '3',
                title: 'Renewable Energy Stocks Surge on New Government Incentives',
                summary: 'Clean energy companies experience massive growth following announcement of expanded federal tax credits and subsidies.',
                source: 'Bloomberg',
                publishedAt: new Date(Date.now() - Math.random() * 6 * 60 * 60 * 1000).toISOString(),
                url: '#',
                category: 'market',
                sentiment: 'positive',
                readTime: 4
            },
            {
                id: '4',
                title: 'Cryptocurrency Market Shows Mixed Signals Amid Regulatory Updates',
                summary: 'Digital assets face volatility as new regulatory frameworks emerge, creating uncertainty for crypto-related investments.',
                source: 'CoinDesk',
                publishedAt: new Date(Date.now() - Math.random() * 8 * 60 * 60 * 1000).toISOString(),
                url: '#',
                category: 'crypto',
                sentiment: 'negative',
                readTime: 4
            },
            {
                id: '5',
                title: 'Healthcare Sector Outperforms Amid Breakthrough Drug Approvals',
                summary: 'Pharmaceutical companies lead market gains following FDA approvals for innovative treatments, boosting investor confidence.',
                source: 'Reuters',
                publishedAt: new Date(Date.now() - Math.random() * 12 * 60 * 60 * 1000).toISOString(),
                url: '#',
                category: 'stock',
                sentiment: 'positive',
                readTime: 3
            },
            {
                id: '6',
                title: 'Global Supply Chain Disruptions Impact Manufacturing Stocks',
                summary: 'International shipping delays and raw material shortages create headwinds for manufacturing and logistics companies.',
                source: 'Wall Street Journal',
                publishedAt: new Date(Date.now() - Math.random() * 18 * 60 * 60 * 1000).toISOString(),
                url: '#',
                category: 'market',
                sentiment: 'negative',
                readTime: 6
            }
        ];

        // Randomize news order and add some time variety
        const shuffledNews = freshNews
            .sort(() => Math.random() - 0.5)
            .map(item => ({
                ...item,
                publishedAt: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString()
            }));

        setNews(shuffledNews);
        setLoading(false);
    };

    const filteredNews = selectedCategory === 'all'
        ? news
        : news.filter(item => item.category === selectedCategory);

    const getTimeAgo = (publishedAt: string) => {
        const minutes = Math.floor((Date.now() - new Date(publishedAt).getTime()) / (1000 * 60));
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        const days = Math.floor(hours / 24);
        return `${days}d ago`;
    };

    const getSentimentColor = (sentiment: string) => {
        switch (sentiment) {
            case 'positive': return 'bg-green-100 text-green-700';
            case 'negative': return 'bg-red-100 text-red-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const getCategoryColor = (category: string) => {
        switch (category) {
            case 'stock': return 'bg-blue-100 text-blue-700';
            case 'market': return 'bg-purple-100 text-purple-700';
            case 'crypto': return 'bg-orange-100 text-orange-700';
            case 'economy': return 'bg-indigo-100 text-indigo-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const categories = [
        { id: 'all', name: 'All News' },
        { id: 'market', name: 'Market' },
        { id: 'stock', name: 'Stocks' },
        { id: 'economy', name: 'Economy' },
        { id: 'crypto', name: 'Crypto' }
    ];

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <Newspaper className="h-5 w-5" />
                        Fresh Market News
                    </CardTitle>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={generateFreshNews}
                        disabled={loading}
                    >
                        <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                </div>

                {/* Category Filter */}
                <div className="flex gap-2 mt-4 flex-wrap">
                    {categories.map(category => (
                        <Button
                            key={category.id}
                            variant={selectedCategory === category.id ? "default" : "outline"}
                            size="sm"
                            onClick={() => setSelectedCategory(category.id)}
                            className="text-xs"
                        >
                            {category.name}
                        </Button>
                    ))}
                </div>
            </CardHeader>

            <CardContent>
                {loading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="animate-pulse">
                                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                <div className="h-3 bg-gray-200 rounded w-full mb-1"></div>
                                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                        {filteredNews.map((item) => (
                            <div key={item.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors cursor-pointer group">
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex gap-2">
                                        <Badge variant="secondary" className={`text-xs ${getCategoryColor(item.category)}`}>
                                            {item.category.toUpperCase()}
                                        </Badge>
                                        <Badge variant="secondary" className={`text-xs ${getSentimentColor(item.sentiment)}`}>
                                            {item.sentiment === 'positive' ? '📈' : item.sentiment === 'negative' ? '📉' : '📊'}
                                        </Badge>
                                    </div>
                                    <ExternalLink className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>

                                <h4 className="font-semibold text-sm mb-2 text-foreground group-hover:text-primary transition-colors">
                                    {item.title}
                                </h4>

                                <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                                    {item.summary}
                                </p>

                                <div className="flex items-center justify-between text-xs text-muted-foreground">
                                    <div className="flex items-center gap-3">
                                        <span className="font-medium">{item.source}</span>
                                        <div className="flex items-center gap-1">
                                            <Clock className="h-3 w-3" />
                                            {getTimeAgo(item.publishedAt)}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Eye className="h-3 w-3" />
                                            {item.readTime}m read
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default StockMarketNews;
