import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@context/AuthContext';
import Input from '@components/reusable/Input';
import WatchlistCard from './WatchlistCard';
import watchlistService from '@services/watchlist.service';
import { transformKalshiMarket } from '@utils/kalshiInterfaces';

const cardStyle: React.CSSProperties = {
    background: 'linear-gradient(292.88deg, #0B0E19 0%, #1C1F2A 95.47%)',
    border: '1px solid rgba(41, 44, 53, 1)',
    borderRadius: 12
};

interface WatchlistItem {
    ticker: string;
    market: any;
    addedAt?: string;
    error?: string;
}

interface TransformedWatchlistItem {
    ticker: string;
    question: string;
    category: string;
    price: string;
    roi: string;
    volume: string;
    probability: string;
    probabilityChange?: string;
    sentiment: 'Bullish' | 'Bearish';
    addedAt?: string;
    market?: any;
    tag?: 'Trending' | 'Open' | 'Closed';
}

const Watchlist: React.FC = () => {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('All Categories');
    const [sortBy, setSortBy] = useState<string>('Change');
    const [watchlist, setWatchlist] = useState<TransformedWatchlistItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!isAuthenticated) {
            setLoading(false);
            return;
        }

        fetchWatchlist();
    }, [isAuthenticated]);

    const fetchWatchlist = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await watchlistService.getWatchlist();
            const items: WatchlistItem[] = response?.data?.watchlist || response?.watchlist || [];

            // Transform market data for display
            const transformedItems: TransformedWatchlistItem[] = items
                .filter(item => item.market && !item.error)
                .map(item => {
                    const transformed = transformKalshiMarket(item.market);
                    // Calculate probability change (mock data for now - you can replace with real data)
                    const probabilityChange = transformed.roi ? (transformed.roi.startsWith('+') ? transformed.roi : `+${transformed.roi}`) : '+0%';
                    // Determine tag based on market status
                    const tag: 'Trending' | 'Open' | 'Closed' = 'Open'; // You can add logic to determine this
                    
                    return {
                        ...transformed,
                        ticker: item.ticker,
                        addedAt: item.addedAt,
                        market: item.market, // Keep original market data
                        probabilityChange,
                        tag
                    } as TransformedWatchlistItem;
                });

            setWatchlist(transformedItems);
        } catch (err: any) {
            console.error('Error fetching watchlist:', err);
            setError(err.response?.data?.message || 'Failed to fetch watchlist');
        } finally {
            setLoading(false);
        }
    };

    const handleToggleWatchlist = async (ticker: string, isInWatchlist: boolean) => {
        try {
            if (isInWatchlist) {
                await watchlistService.removeFromWatchlist(ticker);
                setWatchlist(prev => prev.filter(item => item.ticker !== ticker));
            } else {
                await watchlistService.addToWatchlist(ticker);
                // Refresh watchlist to get the new item
                fetchWatchlist();
            }
        } catch (err: any) {
            console.error('Error toggling watchlist:', err);
            setError(err.response?.data?.message || 'Failed to update watchlist');
            setTimeout(() => setError(null), 5000);
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="p-6">
                <div style={cardStyle} className="p-8 text-center">
                    <h2 className="text-2xl font-semibold text-white mb-4">Sign In Required</h2>
                    <p className="text-gray-400 mb-6">Please sign in to view your watchlist.</p>
                    <button
                        onClick={() => navigate('/login')}
                        className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                    >
                        Sign In
                    </button>
                </div>
            </div>
        );
    }

    // Filter and sort watchlist
    const filteredWatchlist = useMemo(() => {
        let filtered = watchlist.filter(item => {
            // Category filter
            if (selectedCategory !== 'All Categories') {
                if (item.category?.toLowerCase() !== selectedCategory.toLowerCase()) {
                    return false;
                }
            }

            // Search term filter
            if (!searchTerm.trim()) return true;
            const searchLower = searchTerm.toLowerCase();
            return (
                item.question?.toLowerCase().includes(searchLower) ||
                item.category?.toLowerCase().includes(searchLower) ||
                item.ticker?.toLowerCase().includes(searchLower)
            );
        });

        // Sort based on selected option
        if (sortBy === 'Change') {
            filtered.sort((a, b) => {
                const aChange = parseFloat(a.probabilityChange?.replace(/[+%]/g, '') || '0');
                const bChange = parseFloat(b.probabilityChange?.replace(/[+%]/g, '') || '0');
                return bChange - aChange;
            });
        } else if (sortBy === 'Probability') {
            filtered.sort((a, b) => {
                const aProb = parseFloat(a.probability?.replace('%', '') || '0');
                const bProb = parseFloat(b.probability?.replace('%', '') || '0');
                return bProb - aProb;
            });
        } else if (sortBy === 'Volume') {
            filtered.sort((a, b) => {
                const aVol = parseFloat(a.volume?.replace(/[KkMm]/g, '') || '0');
                const bVol = parseFloat(b.volume?.replace(/[KkMm]/g, '') || '0');
                return bVol - aVol;
            });
        }

        return filtered;
    }, [watchlist, selectedCategory, searchTerm, sortBy]);

    // Calculate stats for sidebar
    const stats = useMemo(() => {
        const totalWatched = watchlist.length;
        const avgProbability = watchlist.length > 0
            ? (watchlist.reduce((sum, item) => {
                const prob = parseFloat(item.probability?.replace('%', '') || '0');
                return sum + prob;
            }, 0) / watchlist.length).toFixed(0)
            : '0';
        const totalVolume = watchlist.reduce((sum, item) => {
            const vol = parseFloat(item.volume?.replace(/[KkMm$]/g, '') || '0');
            const multiplier = item.volume?.toLowerCase().includes('m') ? 1000000 : (item.volume?.toLowerCase().includes('k') ? 1000 : 1);
            return sum + (vol * multiplier);
        }, 0);
        const formattedVolume = totalVolume >= 1000000 
            ? `$${(totalVolume / 1000000).toFixed(1)}M`
            : totalVolume >= 1000
            ? `$${(totalVolume / 1000).toFixed(1)}K`
            : `$${totalVolume.toFixed(0)}`;

        return { totalWatched, avgProbability, totalVolume: formattedVolume };
    }, [watchlist]);

    // Get top gaining market
    const topGainingMarket = useMemo(() => {
        if (filteredWatchlist.length === 0) return null;
        return filteredWatchlist.reduce((top, item) => {
            const topChange = parseFloat(top.probabilityChange?.replace(/[+%]/g, '') || '0');
            const itemChange = parseFloat(item.probabilityChange?.replace(/[+%]/g, '') || '0');
            return itemChange > topChange ? item : top;
        });
    }, [filteredWatchlist]);

    // Get high volatility markets (probability change > 3%)
    const highVolatilityMarkets = useMemo(() => {
        return filteredWatchlist
            .filter(item => {
                const change = Math.abs(parseFloat(item.probabilityChange?.replace(/[+%-]/g, '') || '0'));
                return change > 3;
            })
            .slice(0, 2);
    }, [filteredWatchlist]);

    // Get high confidence markets (probability > 70%)
    const highConfidenceMarkets = useMemo(() => {
        return filteredWatchlist
            .filter(item => {
                const prob = parseFloat(item.probability?.replace('%', '') || '0');
                return prob > 70;
            })
            .slice(0, 2);
    }, [filteredWatchlist]);

    return (
        <div className="p-6">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-3xl font-semibold tracking-wider text-white mb-2">My Watchlist</h1>
                <p className="text-gray-400 text-lg">
                    Track Your Favorite Prediction Markets
                </p>
            </div>

            {/* Search Bar - Full Width */}
            <div className="mb-8">
                <div
                    className="flex flex-col lg:flex-row gap-4 p-4"
                    style={{
                        background: 'linear-gradient(292.88deg, #0B0E19 0%, #1C1F2A 95.47%)',
                        borderRadius: '10px',
                        borderImageSource: 'linear-gradient(114.47deg, rgba(52, 55, 66, 0.85) 77.94%, #050811 100.75%)',
                    }}
                >
                    <div className="flex-1">
                        <Input
                            placeholder="Search For Markets"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            inputClassName="bg-transparent border border-[rgba(255,255,255,0.2)] placeholder-[#666666] focus:ring-0 focus:border-[rgba(255,255,255,0.3)]"
                            icon={
                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            }
                        />
                    </div>
                    <div className="flex flex-wrap gap-3">
                        <select 
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="px-4 py-2 pr-8 bg-transparent border border-[rgba(255,255,255,0.2)] rounded-lg text-[#666666] focus:outline-none focus:ring-0 focus:border-[rgba(255,255,255,0.3)]"
                        >
                            <option className='bg-[#050811]'>All Categories</option>
                            <option className='bg-[#050811]'>Economics</option>
                            <option className='bg-[#050811]'>Crypto</option>
                            <option className='bg-[#050811]'>Stocks</option>
                            <option className='bg-[#050811]'>Technology</option>
                            <option className='bg-[#050811]'>Commodities</option>
                        </select>
                    </div>
                </div>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
                    <p className="text-red-400 text-sm">{error}</p>
                </div>
            )}

            {/* Two Column Layout: Main Content + Sidebar */}
            <div className="flex gap-6">
                {/* Main Content */}
                <div className="flex-[0.7]">

                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="flex items-center space-x-2">
                                <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse"></div>
                                <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                                <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                                <span className="ml-3 text-white">Loading watchlist...</span>
                            </div>
                        </div>
                    ) : watchlist.length === 0 ? (
                        <div style={cardStyle} className="p-12 text-center">
                            <svg
                                className="w-16 h-16 text-gray-400 mx-auto mb-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                            </svg>
                            <h2 className="text-xl font-semibold text-white mb-2">Your watchlist is empty</h2>
                            <p className="text-gray-400 mb-6">Start adding markets to your watchlist to track them here.</p>
                            <button
                                onClick={() => navigate('/markets')}
                                className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                            >
                                Explore Markets
                            </button>
                        </div>
                    ) : filteredWatchlist.length === 0 ? (
                        <div style={cardStyle} className="p-12 text-center">
                            <svg
                                className="w-16 h-16 text-gray-400 mx-auto mb-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <h2 className="text-xl font-semibold text-white mb-2">No markets found</h2>
                            <p className="text-gray-400 mb-6">Try adjusting your search terms.</p>
                        </div>
                    ) : (
                        <div
                            style={{
                                background: 'linear-gradient(292.88deg, #0B0E19 0%, #1C1F2A 95.47%)',
                                padding: '25px',
                                borderRadius: '15px'
                            }}
                        >
                            <div className="space-y-0">
                                {filteredWatchlist.map((item, index) => {
                                    const ticker = item.ticker;

                                    return (
                                        <WatchlistCard
                                            key={ticker || index}
                                            question={item.question || 'Unknown Market'}
                                            category={item.category || 'General'}
                                            price={item.price || '$0.00'}
                                            probability={item.probability || '0%'}
                                            probabilityChange={item.probabilityChange}
                                            volume={item.volume || '0'}
                                            tag={item.tag}
                                            ticker={ticker}
                                            onViewDetails={() => {
                                                if (ticker) {
                                                    navigate(`/markets/${ticker}`);
                                                }
                                            }}
                                            onRemove={() => {
                                                if (ticker) {
                                                    handleToggleWatchlist(ticker, true);
                                                }
                                            }}
                                        />
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar */}
                <div className="flex-[0.3] space-y-6">
                    {/* AI Watch Insights */}
                    <div style={cardStyle} className="p-6">
                        <div className="mb-4">
                            <h2 className="text-xl font-semibold text-white mb-1">AI Watch Insights</h2>
                            <p className="text-gray-400 text-sm">Powered by AI Analytics</p>
                        </div>

                        {/* Top Gaining Market */}
                        {topGainingMarket && (
                            <div className="mb-6">
                                <h3 className="text-sm text-gray-400 mb-2">Top Gaining Market</h3>
                                <div className="p-3 rounded-lg bg-gray-800/50">
                                    <p className="text-white text-sm mb-1">{topGainingMarket.question}</p>
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-400 text-xs">{topGainingMarket.category}</span>
                                        <span className="text-green-400 text-sm font-semibold">
                                            {topGainingMarket.probabilityChange}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* High Volatility Alerts */}
                        {highVolatilityMarkets.length > 0 && (
                            <div className="mb-6">
                                <h3 className="text-sm text-gray-400 mb-2">High Volatility Alerts</h3>
                                <div className="space-y-2">
                                    {highVolatilityMarkets.map((item, idx) => (
                                        <div key={idx} className="p-3 rounded-lg bg-gray-800/50">
                                            <p className="text-white text-sm mb-1">{item.question}</p>
                                            <div className="flex items-center justify-between">
                                                <span className="text-gray-400 text-xs">{item.category}</span>
                                                <span className="text-red-400 text-sm font-semibold">
                                                    {Math.abs(parseFloat(item.probabilityChange?.replace(/[+%-]/g, '') || '0')).toFixed(1)}%
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* High Confidence Markets */}
                        {highConfidenceMarkets.length > 0 && (
                            <div>
                                <h3 className="text-sm text-gray-400 mb-2">High Confidence Markets</h3>
                                <div className="space-y-2">
                                    {highConfidenceMarkets.map((item, idx) => (
                                        <div key={idx} className="p-3 rounded-lg bg-gray-800/50">
                                            <p className="text-white text-sm mb-1">{item.question}</p>
                                            <div className="flex items-center justify-between">
                                                <span className="text-gray-400 text-xs">{item.category}</span>
                                                <span className="text-green-400 text-sm font-semibold">
                                                    {item.probability}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Quick Stats */}
                    <div style={cardStyle} className="p-6">
                        <h2 className="text-xl font-semibold text-white mb-4">Quick Stats</h2>
                        <div className="space-y-4">
                            <div>
                                <p className="text-gray-400 text-sm mb-1">Total Watched</p>
                                <p className="text-white text-2xl font-semibold">{stats.totalWatched}</p>
                            </div>
                            <div>
                                <p className="text-gray-400 text-sm mb-1">Avg. Probability</p>
                                <p className="text-white text-2xl font-semibold">{stats.avgProbability}%</p>
                            </div>
                            <div>
                                <p className="text-gray-400 text-sm mb-1">Total Volume</p>
                                <p className="text-white text-2xl font-semibold">{stats.totalVolume}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Watchlist;
