import React, { useState, useEffect } from 'react';
import Input from '@components/reusable/Input';
import MarketCard from '@components/pageComponents/markets/MarketCard';
import marketsService from '@services/markets.service';

const Markets: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [marketData, setMarketData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [pagination, setPagination] = useState({
        cursor: '',
        hasNext: false,
        hasPrev: false
    });
    const [currentPage, setCurrentPage] = useState(1);
    const [cursors, setCursors] = useState<string[]>([]); // Store cursors for navigation

    // Fallback data in case API fails
    const fallbackData = [
        {
            question: "Will the U.S. inflation exceed 3% in 2025?",
            category: "Economics",
            price: "$0.52",
            roi: "+8.2%",
            volume: "12.4K",
            probability: "61%",
            sentiment: "Bullish" as const
        },
        {
            question: "Will Bitcoin reach $100,000 by end of 2024?",
            category: "Crypto",
            price: "$0.45",
            roi: "+12.5%",
            volume: "8.9K",
            probability: "45%",
            sentiment: "Bearish" as const
        },
        {
            question: "Will Tesla stock exceed $300 in Q1 2024?",
            category: "Stocks",
            price: "$0.38",
            roi: "+5.7%",
            volume: "15.2K",
            probability: "38%",
            sentiment: "Bearish" as const
        },
        {
            question: "Will the Fed cut rates by 0.5% in 2024?",
            category: "Economics",
            price: "$0.67",
            roi: "+15.3%",
            volume: "22.1K",
            probability: "67%",
            sentiment: "Bullish" as const
        },
        {
            question: "Will AI stocks outperform S&P 500 in 2024?",
            category: "Technology",
            price: "$0.29",
            roi: "-3.2%",
            volume: "6.7K",
            probability: "29%",
            sentiment: "Bearish" as const
        },
        {
            question: "Will gold price exceed $2,500 per ounce?",
            category: "Commodities",
            price: "$0.41",
            roi: "+7.8%",
            volume: "9.3K",
            probability: "41%",
            sentiment: "Bullish" as const
        }
    ];

    // Fetch live markets data
    const fetchMarkets = async (cursor?: string, isNext: boolean = true) => {
        try {
            setLoading(true);
            setError(null);

            const response = await marketsService.getLiveMarkets({
                limit: 12,
                cursor: cursor
            });

            if (response.success && response.data.markets && response.data.markets.length > 0) {
                console.log(`Fetched ${response.data.markets.length} live markets from backend`);
                // Backend already returns data in the correct format, no transformation needed
                setMarketData(response.data.markets);

                // Update pagination state
                const newCursor = response.data.cursor;
                setPagination({
                    cursor: newCursor,
                    hasNext: !!newCursor,
                    hasPrev: currentPage > 1
                });

                // Update cursors array for navigation
                if (isNext && newCursor) {
                    setCursors(prev => [...prev, newCursor]);
                }
            } else {
                console.log("No markets found in backend response, using fallback data");
                setMarketData(fallbackData);
            }
        } catch (error) {
            console.error("Error fetching markets:", error);
            setError("Failed to fetch live markets. Using sample data.");
            setMarketData(fallbackData);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMarkets();
    }, []);

    // Pagination handlers
    const handleNextPage = () => {
        if (pagination.cursor) {
            setCurrentPage(prev => prev + 1);
            fetchMarkets(pagination.cursor, true);
        }
    };

    const handlePrevPage = () => {
        if (currentPage > 1) {
            const prevCursor = cursors[currentPage - 3]; // Get cursor from 2 pages back
            setCurrentPage(prev => prev - 1);
            setCursors(prev => prev.slice(0, -1)); // Remove last cursor
            fetchMarkets(prevCursor, false);
        }
    };

    return (
        <div className="p-6">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-semibold tracking-wider text-white mb-2">Explore Markets</h1>
                <p className="text-gray-400 text-lg">
                    Browse Live Prediction Markets, Filter By Category, And Track Performance Metrics.
                </p>
            </div>

            {/* Search and Filters */}
            <div className="mb-8">
                <div
                    className="flex flex-col lg:flex-row gap-4 mb-6 p-4"
                    style={{
                        background: 'linear-gradient(292.88deg, #0B0E19 0%, #1C1F2A 95.47%)',
                        // borderStyle: 'solid',
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
                        <select className="px-4 py-2 pr-8 bg-transparent border border-[rgba(255,255,255,0.2)] rounded-lg text-[#666666] focus:outline-none focus:ring-0 focus:border-[rgba(255,255,255,0.3)]">
                            <option className='bg-[#050811]'>All Categories</option>
                            <option className='bg-[#050811]'>Economics</option>
                            <option className='bg-[#050811]'>Crypto</option>
                            <option className='bg-[#050811]'>Stocks</option>
                            <option className='bg-[#050811]'>Technology</option>
                            <option className='bg-[#050811]'>Commodities</option>
                        </select>
                        <select className="px-4 py-2 pr-8 bg-transparent border border-[rgba(255,255,255,0.2)] rounded-lg text-[#666666] focus:outline-none focus:ring-0 focus:border-[rgba(255,255,255,0.3)]">
                            <option className='bg-[#050811]'>ROI</option>
                            <option className='bg-[#050811]'>High ROI</option>
                            <option className='bg-[#050811]'>Low ROI</option>
                        </select>
                        <select className="px-4 py-2 pr-8 bg-transparent border border-[rgba(255,255,255,0.2)] rounded-lg text-[#666666] focus:outline-none focus:ring-0 focus:border-[rgba(255,255,255,0.3)]">
                            <option className='bg-[#050811]'>All Sentiment</option>
                            <option className='bg-[#050811]'>Bullish</option>
                            <option className='bg-[#050811]'>Bearish</option>
                        </select>
                        <select className="px-4 py-2 pr-8 bg-transparent border border-[rgba(255,255,255,0.2)] rounded-lg text-[#666666] focus:outline-none focus:ring-0 focus:border-[rgba(255,255,255,0.3)]">
                            <option className='bg-[#050811]'>Last 30 days</option>
                            <option className='bg-[#050811]'>Last 7 days</option>
                            <option className='bg-[#050811]'>Last 90 days</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Error Message */}
            {
                error && (
                    <div className="mb-6 p-4 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
                        <p className="text-yellow-400 text-sm">{error}</p>
                    </div>
                )
            }

            {/* Loading State */}
            {
                loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="flex items-center space-x-2">
                            <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse"></div>
                            <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                            <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                            <span className="ml-3 text-white">Loading live markets...</span>
                        </div>
                    </div>
                ) : (
                    /* Market Cards Grid */
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {marketData.map((market, index) => (
                            <MarketCard
                                key={index}
                                question={market.market_name}
                                category={market.category}
                                price={market.price}
                                roi={market.roi}
                                volume={market.volume}
                                probability={market.probability}
                                sentiment={market.sentiment}
                                onViewDetails={() => console.log('View details for:', market.market_name)}
                                onToggleFavorite={() => console.log('Toggle favorite for:', market.market_name)}
                                isFavorite={false}
                            />
                        ))}
                    </div>
                )
            }

            {/* Pagination Controls */}
            {
                !loading && marketData.length > 0 && (
                    <div className="mt-8 flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={handlePrevPage}
                                disabled={!pagination.hasPrev}
                                className={`flex items-center px-4 py-2 rounded-lg transition-all duration-200 ${pagination.hasPrev
                                    ? 'bg-gray-700 hover:bg-gray-600 text-white'
                                    : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                                    }`}
                            >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                                Previous
                            </button>

                            <span className="text-gray-400 font-medium">
                                Page {currentPage}
                            </span>

                            <button
                                onClick={handleNextPage}
                                disabled={!pagination.hasNext}
                                className={`flex items-center px-4 py-2 rounded-lg transition-all duration-200 ${pagination.hasNext
                                    ? 'bg-gray-700 hover:bg-gray-600 text-white'
                                    : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                                    }`}
                            >
                                Next
                                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        </div>

                        <div className="text-sm text-gray-400">
                            Showing {marketData.length} markets
                        </div>
                    </div>
                )
            }
        </div >
    );
};

export default Markets;
