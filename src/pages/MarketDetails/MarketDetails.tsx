import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import marketsService from '@services/markets.service';
import watchlistService from '@services/watchlist.service';
import { useAuth } from '@context/AuthContext';
import Button from '@components/reusable/Button';

interface MarketDetailsData {
  ticker: string;
  event_ticker: string;
  market_type: string;
  title: string;
  subtitle: string;
  yes_sub_title: string;
  no_sub_title: string;
  open_time: string;
  close_time: string;
  expected_expiration_time?: string;
  expiration_time: string;
  latest_expiration_time: string;
  settlement_timer_seconds: number;
  status: string;
  response_price_units: string;
  yes_bid: number;
  yes_bid_dollars: string;
  yes_ask: number;
  yes_ask_dollars: string;
  no_bid: number;
  no_bid_dollars: string;
  no_ask: number;
  no_ask_dollars: string;
  last_price: number;
  last_price_dollars: string;
  volume: number;
  volume_24h: number;
  result?: string | null;
  can_close_early: boolean;
  open_interest: number;
  notional_value: number;
  notional_value_dollars: string;
  previous_yes_bid: number;
  previous_yes_bid_dollars: string;
  previous_yes_ask: number;
  previous_yes_ask_dollars: string;
  previous_price: number;
  previous_price_dollars: string;
  liquidity: number;
  liquidity_dollars: string;
  settlement_value?: number;
  settlement_value_dollars?: string;
  expiration_value?: string;
  category: string;
  risk_limit_cents: number;
  fee_waiver_expiration_time?: string;
  early_close_condition?: string;
  tick_size: number;
  strike_type?: string;
  floor_strike?: number;
  cap_strike?: number;
  functional_strike?: string;
  custom_strike?: any;
  rules_primary?: string;
  rules_secondary?: string;
  mve_collection_ticker?: string;
  mve_selected_legs?: Array<{
    event_ticker: string;
    market_ticker: string;
    side: string;
  }>;
  primary_participant_key?: string;
  price_level_structure?: string;
  price_ranges?: Array<{
    start: string;
    end: string;
    step: string;
  }>;
}

// Simple Line Chart Component
const MarketPerformanceChart: React.FC<{ 
  currentPrice: number; 
  previousPrice: number;
  months?: number;
}> = ({ currentPrice, previousPrice, months = 6 }) => {
  const chartWidth = 800;
  const chartHeight = 300;
  const padding = { top: 40, right: 40, bottom: 40, left: 60 };
  const graphWidth = chartWidth - padding.left - padding.right;
  const graphHeight = chartHeight - padding.top - padding.bottom;

  // Generate data points (simulated historical data)
  const dataPoints = useMemo(() => {
    const points: Array<{ month: string; price: number }> = [];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const now = new Date();
    
    // Generate points from previous price to current price
    for (let i = months; i >= 0; i--) {
      const monthIndex = (now.getMonth() - i + 12) % 12;
      const monthName = monthNames[monthIndex];
      // Interpolate price between previous and current
      const progress = (months - i) / months;
      const price = previousPrice + (currentPrice - previousPrice) * progress;
      // Add some variation to make it look realistic
      const variation = (Math.random() - 0.5) * 0.02;
      points.push({
        month: monthName,
        price: Math.max(0, Math.min(1, price + variation))
      });
    }
    return points;
  }, [currentPrice, previousPrice, months]);

  const minPrice = Math.min(...dataPoints.map(p => p.price), 0);
  const maxPrice = Math.max(...dataPoints.map(p => p.price), 1);
  const priceRange = maxPrice - minPrice || 1;

  const scaleX = (index: number) => padding.left + (index / (dataPoints.length - 1)) * graphWidth;
  const scaleY = (price: number) => padding.top + graphHeight - ((price - minPrice) / priceRange) * graphHeight;

  // Create path for the line
  const pathData = dataPoints
    .map((point, index) => {
      const x = scaleX(index);
      const y = scaleY(point.price);
      return index === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
    })
    .join(' ');

  // Create area path (for fill)
  const areaPath = `${pathData} L ${scaleX(dataPoints.length - 1)} ${padding.top + graphHeight} L ${padding.left} ${padding.top + graphHeight} Z`;

  // Y-axis labels
  const yTicks = 5;
  const yLabels = Array.from({ length: yTicks }, (_, i) => {
    const value = minPrice + (priceRange / (yTicks - 1)) * i;
    return { value, y: scaleY(value) };
  });

  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold text-white mb-4">Market Performance ({months} Months)</h3>
      <div className="relative" style={{ width: '100%', maxWidth: chartWidth }}>
        <svg width="100%" height={chartHeight} viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="overflow-visible">
          {/* Grid lines */}
          {yLabels.map(({ y }) => (
            <line
              key={y}
              x1={padding.left}
              y1={y}
              x2={chartWidth - padding.right}
              y2={y}
              stroke="rgba(255, 255, 255, 0.1)"
              strokeWidth="1"
            />
          ))}

          {/* Area fill */}
          <path
            d={areaPath}
            fill="rgba(34, 197, 94, 0.2)"
            stroke="none"
          />

          {/* Line */}
          <path
            d={pathData}
            fill="none"
            stroke="#22c55e"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data points */}
          {dataPoints.map((point, index) => {
            const x = scaleX(index);
            const y = scaleY(point.price);
            return (
              <circle
                key={index}
                cx={x}
                cy={y}
                r="3"
                fill="#22c55e"
                className="hover:r-4 transition-all"
              />
            );
          })}

          {/* Y-axis labels */}
          {yLabels.map(({ value, y }) => (
            <text
              key={value}
              x={padding.left - 10}
              y={y + 4}
              textAnchor="end"
              fill="#9ca3af"
              fontSize="12"
            >
              {value.toFixed(3)}
            </text>
          ))}

          {/* X-axis labels */}
          {dataPoints.map((point, index) => {
            const x = scaleX(index);
            return (
              <text
                key={index}
                x={x}
                y={chartHeight - padding.bottom + 20}
                textAnchor="middle"
                fill="#9ca3af"
                fontSize="12"
              >
                {point.month}
              </text>
            );
          })}
        </svg>
      </div>
    </div>
  );
};

const MarketDetails: React.FC = () => {
  const { ticker } = useParams<{ ticker: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [market, setMarket] = useState<MarketDetailsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [watchlistLoading, setWatchlistLoading] = useState(false);

  useEffect(() => {
    const fetchMarketDetails = async () => {
      if (!ticker) {
        setError('Ticker is required');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const response = await marketsService.getMarketByTicker(ticker);
        
        if (response.success && response.data.market) {
          setMarket(response.data.market);
        } else {
          setError('Market not found');
        }
      } catch (err: any) {
        console.error('Error fetching market details:', err);
        setError(err.response?.data?.message || 'Failed to fetch market details');
      } finally {
        setLoading(false);
      }
    };

    fetchMarketDetails();
  }, [ticker]);

  // Check watchlist status
  useEffect(() => {
    const checkWatchlistStatus = async () => {
      if (!ticker || !isAuthenticated) {
        setIsInWatchlist(false);
        return;
      }

      try {
        const response = await watchlistService.checkWatchlistStatus(ticker);
        setIsInWatchlist(response?.data?.isInWatchlist || false);
      } catch (err) {
        console.warn('Failed to check watchlist status:', err);
        setIsInWatchlist(false);
      }
    };

    checkWatchlistStatus();
  }, [ticker, isAuthenticated]);

  const handleToggleWatchlist = async () => {
    if (!ticker || !isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      setWatchlistLoading(true);
      if (isInWatchlist) {
        await watchlistService.removeFromWatchlist(ticker);
        setIsInWatchlist(false);
      } else {
        await watchlistService.addToWatchlist(ticker);
        setIsInWatchlist(true);
      }
    } catch (err: any) {
      console.error('Error toggling watchlist:', err);
      setError(err.response?.data?.message || 'Failed to update watchlist');
      setTimeout(() => setError(null), 5000);
    } finally {
      setWatchlistLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[date.getMonth()];
    const day = date.getDate();
    const year = date.getFullYear();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    const displayMinutes = minutes.toString().padStart(2, '0');
    return `${month} ${day}, ${year} - ${displayHours}:${displayMinutes} ${ampm}`;
  };

  const formatCurrency = (value: string | number | undefined) => {
    if (value === undefined || value === null) return '$0.00';
    if (typeof value === 'string') {
      const num = parseFloat(value);
      return isNaN(num) ? '$0.00' : `$${num.toFixed(2)}`;
    }
    return `$${value.toFixed(2)}`;
  };

  const formatNumber = (value: number | undefined) => {
    if (value === undefined || value === null) return '0';
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toLocaleString();
  };

  const getLiquidityLevel = (liquidityDollars: string): string => {
    const liquidity = parseFloat(liquidityDollars || '0');
    if (liquidity >= 10000) return 'High';
    if (liquidity >= 1000) return 'Medium';
    return 'Low';
  };

  const calculateROI = (current: string, previous: string): number => {
    const currentPrice = parseFloat(current || '0');
    const previousPrice = parseFloat(previous || '0');
    if (previousPrice === 0 || isNaN(previousPrice)) {
      if (currentPrice > 0) {
        return ((currentPrice - 0.5) / 0.5) * 100;
      }
      return 0;
    }
    return ((currentPrice - previousPrice) / previousPrice) * 100;
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse"></div>
          <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
          <span className="ml-3 text-white">Loading market details...</span>
        </div>
      </div>
    );
  }

  if (error || !market) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <Button onClick={() => navigate('/markets')} size="sm">
            ← Back to Markets
          </Button>
        </div>
        <div className="p-6 bg-red-900/20 border border-red-500/30 rounded-lg">
          <p className="text-red-400 text-lg">{error || 'Market not found'}</p>
        </div>
      </div>
    );
  }

  // Direct mapping from API response
  const entryPrice = parseFloat(market.previous_price_dollars || '0');
  const currentPrice = parseFloat(market.last_price_dollars || '0');
  const probability = currentPrice > 0 ? (currentPrice * 100).toFixed(0) : '0';
  const roi = calculateROI(market.last_price_dollars, market.previous_price_dollars);
  const liquidityLevel = getLiquidityLevel(market.liquidity_dollars);

  const cardStyle = {
    background: 'linear-gradient(292.88deg, #0B0E19 0%, #1C1F2A 95.47%)',
    borderRadius: '10px',
  };

  return (
    <div className="p-6">
      {/* Back Button */}
      <div className="mb-6">
        <Button onClick={() => navigate('/markets')} size="sm">
          ← Back to Markets
        </Button>
      </div>

      {/* Header Section */}
      <div className="mb-6">
        <h1 className="text-3xl font-semibold text-white mb-4">{market.title}</h1>
        {market.subtitle && (
          <p className="text-gray-400 text-lg mb-4">{market.subtitle}</p>
        )}
        <div className="flex items-center gap-4 mb-4 flex-wrap">
          {market.category && market.category.trim() !== '' && (
            <span
              className="px-4 py-1.5 rounded-full text-sm font-medium"
              style={{
                background: 'rgba(75, 174, 82, 0.2)',
                color: 'rgba(75, 174, 82, 1)',
                border: '1px solid rgba(75, 174, 82, 0.5)',
              }}
            >
              {market.category}
            </span>
          )}
          <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-gray-800">
            <div className={`w-2 h-2 rounded-full ${
              market.status === 'active' ? 'bg-green-500' : 
              market.status === 'closed' ? 'bg-red-500' : 
              'bg-yellow-500'
            }`}></div>
            <span className="text-white text-sm font-medium capitalize">{market.status}</span>
          </div>
          <span className="px-4 py-1.5 rounded-full bg-gray-800 text-gray-300 text-sm">
            {market.market_type}
          </span>
          {isAuthenticated && (
            <button
              onClick={handleToggleWatchlist}
              disabled={watchlistLoading}
              className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title={isInWatchlist ? 'Remove from watchlist' : 'Add to watchlist'}
            >
              <svg 
                className={`w-5 h-5 transition-colors ${isInWatchlist ? 'text-yellow-400 fill-current' : 'text-gray-400'}`} 
                fill={isInWatchlist ? 'currentColor' : 'none'} 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
              <span className="text-white text-sm font-medium">
                {isInWatchlist ? 'In Watchlist' : 'Add to Watchlist'}
              </span>
            </button>
          )}
        </div>
        <p className="text-gray-400 text-sm">Last Updated: {formatDate(new Date().toISOString())}</p>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <div className="p-4 rounded-lg" style={cardStyle}>
          <p className="text-gray-400 text-xs mb-1">Entry Price</p>
          <p className="text-white font-semibold text-lg">{formatCurrency(market.previous_price_dollars)}</p>
        </div>
        <div className="p-4 rounded-lg" style={cardStyle}>
          <p className="text-gray-400 text-xs mb-1">Current Price</p>
          <p className="text-white font-semibold text-lg">{formatCurrency(market.last_price_dollars)}</p>
        </div>
        <div className="p-4 rounded-lg" style={cardStyle}>
          <p className="text-gray-400 text-xs mb-1">ROI</p>
          <p className={`font-semibold text-lg ${roi >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {roi >= 0 ? '+' : ''}{roi.toFixed(1)}%
          </p>
        </div>
        <div className="p-4 rounded-lg" style={cardStyle}>
          <p className="text-gray-400 text-xs mb-1">Volume</p>
          <p className="text-white font-semibold text-lg">{formatNumber(market.volume_24h)}</p>
        </div>
        <div className="p-4 rounded-lg" style={cardStyle}>
          <p className="text-gray-400 text-xs mb-1">Probability</p>
          <p className="text-white font-semibold text-lg">{probability}%</p>
        </div>
        <div className="p-4 rounded-lg" style={cardStyle}>
          <p className="text-gray-400 text-xs mb-1">Liquidity</p>
          <p className="text-white font-semibold text-lg">{liquidityLevel}</p>
        </div>
      </div>

      {/* Market Performance Chart */}
      <div className="p-6 rounded-lg mb-6" style={cardStyle}>
        <MarketPerformanceChart 
          currentPrice={currentPrice > 0 ? currentPrice : parseFloat(market.yes_ask_dollars || '0.5')} 
          previousPrice={entryPrice > 0 ? entryPrice : parseFloat(market.previous_yes_ask_dollars || '0.4')}
          months={6}
        />
      </div>

      {/* All Market Fields - Organized by Category */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Basic Information */}
        <div className="p-6 rounded-lg" style={cardStyle}>
          <h2 className="text-xl font-semibold text-white mb-4">Basic Information</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400 text-sm">Ticker</span>
              <span className="text-white font-medium">{market.ticker}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400 text-sm">Event Ticker</span>
              <span className="text-white font-medium">{market.event_ticker}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400 text-sm">Market Type</span>
              <span className="text-white font-medium capitalize">{market.market_type}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400 text-sm">Status</span>
              <span className="text-white font-medium capitalize">{market.status}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400 text-sm">Category</span>
              <span className="text-white font-medium">{market.category || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400 text-sm">Result</span>
              <span className="text-white font-medium capitalize">{market.result || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400 text-sm">Can Close Early</span>
              <span className="text-white font-medium">{market.can_close_early ? 'Yes' : 'No'}</span>
            </div>
            {market.early_close_condition && (
              <div className="flex justify-between">
                <span className="text-gray-400 text-sm">Early Close Condition</span>
                <span className="text-white font-medium">{market.early_close_condition}</span>
              </div>
            )}
          </div>
        </div>

        {/* Pricing Information */}
        <div className="p-6 rounded-lg" style={cardStyle}>
          <h2 className="text-xl font-semibold text-white mb-4">Pricing Information</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400 text-sm">Response Price Units</span>
              <span className="text-white font-medium">{market.response_price_units}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400 text-sm">Price Level Structure</span>
              <span className="text-white font-medium">{market.price_level_structure || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400 text-sm">Tick Size</span>
              <span className="text-white font-medium">{market.tick_size}</span>
            </div>
            {market.strike_type && (
              <div className="flex justify-between">
                <span className="text-gray-400 text-sm">Strike Type</span>
                <span className="text-white font-medium capitalize">{market.strike_type}</span>
              </div>
            )}
            {market.floor_strike !== undefined && (
              <div className="flex justify-between">
                <span className="text-gray-400 text-sm">Floor Strike</span>
                <span className="text-white font-medium">{market.floor_strike}</span>
              </div>
            )}
            {market.cap_strike !== undefined && (
              <div className="flex justify-between">
                <span className="text-gray-400 text-sm">Cap Strike</span>
                <span className="text-white font-medium">{market.cap_strike}</span>
              </div>
            )}
            {market.functional_strike && (
              <div className="flex justify-between">
                <span className="text-gray-400 text-sm">Functional Strike</span>
                <span className="text-white font-medium">{market.functional_strike}</span>
              </div>
            )}
            {market.custom_strike && (
              <div className="flex justify-between">
                <span className="text-gray-400 text-sm">Custom Strike</span>
                <span className="text-white font-medium">{JSON.stringify(market.custom_strike)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-400 text-sm">Risk Limit Cents</span>
              <span className="text-white font-medium">{formatCurrency(market.risk_limit_cents / 100)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Current Prices */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="p-6 rounded-lg" style={cardStyle}>
          <h2 className="text-xl font-semibold text-white mb-4">YES Prices</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400 text-sm">YES Sub Title</span>
              <span className="text-white font-medium">{market.yes_sub_title}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400 text-sm">YES Bid (cents)</span>
              <span className="text-white font-medium">{market.yes_bid}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400 text-sm">YES Bid (dollars)</span>
              <span className="text-white font-medium">{formatCurrency(market.yes_bid_dollars)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400 text-sm">YES Ask (cents)</span>
              <span className="text-white font-medium">{market.yes_ask}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400 text-sm">YES Ask (dollars)</span>
              <span className="text-white font-medium">{formatCurrency(market.yes_ask_dollars)}</span>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-lg" style={cardStyle}>
          <h2 className="text-xl font-semibold text-white mb-4">NO Prices</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400 text-sm">NO Sub Title</span>
              <span className="text-white font-medium">{market.no_sub_title}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400 text-sm">NO Bid (cents)</span>
              <span className="text-white font-medium">{market.no_bid}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400 text-sm">NO Bid (dollars)</span>
              <span className="text-white font-medium">{formatCurrency(market.no_bid_dollars)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400 text-sm">NO Ask (cents)</span>
              <span className="text-white font-medium">{market.no_ask}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400 text-sm">NO Ask (dollars)</span>
              <span className="text-white font-medium">{formatCurrency(market.no_ask_dollars)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Last Price & Previous Prices */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="p-6 rounded-lg" style={cardStyle}>
          <h2 className="text-xl font-semibold text-white mb-4">Last Price</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400 text-sm">Last Price (cents)</span>
              <span className="text-white font-medium">{market.last_price}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400 text-sm">Last Price (dollars)</span>
              <span className="text-white font-medium">{formatCurrency(market.last_price_dollars)}</span>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-lg" style={cardStyle}>
          <h2 className="text-xl font-semibold text-white mb-4">Previous Prices</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400 text-sm">Previous Price (cents)</span>
              <span className="text-white font-medium">{market.previous_price}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400 text-sm">Previous Price (dollars)</span>
              <span className="text-white font-medium">{formatCurrency(market.previous_price_dollars)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400 text-sm">Previous YES Bid (cents)</span>
              <span className="text-white font-medium">{market.previous_yes_bid}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400 text-sm">Previous YES Bid (dollars)</span>
              <span className="text-white font-medium">{formatCurrency(market.previous_yes_bid_dollars)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400 text-sm">Previous YES Ask (cents)</span>
              <span className="text-white font-medium">{market.previous_yes_ask}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400 text-sm">Previous YES Ask (dollars)</span>
              <span className="text-white font-medium">{formatCurrency(market.previous_yes_ask_dollars)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Trading Statistics */}
      <div className="p-6 rounded-lg mb-6" style={cardStyle}>
        <h2 className="text-xl font-semibold text-white mb-4">Trading Statistics</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-gray-400 text-sm mb-1">Volume</p>
            <p className="text-white font-semibold">{formatNumber(market.volume)}</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm mb-1">Volume (24h)</p>
            <p className="text-white font-semibold">{formatNumber(market.volume_24h)}</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm mb-1">Open Interest</p>
            <p className="text-white font-semibold">{formatNumber(market.open_interest)}</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm mb-1">Liquidity (cents)</p>
            <p className="text-white font-semibold">{formatNumber(market.liquidity)}</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm mb-1">Liquidity (dollars)</p>
            <p className="text-white font-semibold">{formatCurrency(market.liquidity_dollars)}</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm mb-1">Notional Value (cents)</p>
            <p className="text-white font-semibold">{formatNumber(market.notional_value)}</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm mb-1">Notional Value (dollars)</p>
            <p className="text-white font-semibold">{formatCurrency(market.notional_value_dollars)}</p>
          </div>
        </div>
      </div>

      {/* Timing Information */}
      <div className="p-6 rounded-lg mb-6" style={cardStyle}>
        <h2 className="text-xl font-semibold text-white mb-4">Timing Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <p className="text-gray-400 text-sm mb-1">Open Time</p>
            <p className="text-white text-sm">{formatDate(market.open_time)}</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm mb-1">Close Time</p>
            <p className="text-white text-sm">{formatDate(market.close_time)}</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm mb-1">Expiration Time</p>
            <p className="text-white text-sm">{formatDate(market.expiration_time)}</p>
          </div>
          {market.expected_expiration_time && (
            <div>
              <p className="text-gray-400 text-sm mb-1">Expected Expiration Time</p>
              <p className="text-white text-sm">{formatDate(market.expected_expiration_time)}</p>
            </div>
          )}
          <div>
            <p className="text-gray-400 text-sm mb-1">Latest Expiration Time</p>
            <p className="text-white text-sm">{formatDate(market.latest_expiration_time)}</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm mb-1">Settlement Timer (seconds)</p>
            <p className="text-white text-sm">{market.settlement_timer_seconds}</p>
          </div>
          {market.fee_waiver_expiration_time && (
            <div>
              <p className="text-gray-400 text-sm mb-1">Fee Waiver Expiration Time</p>
              <p className="text-white text-sm">{formatDate(market.fee_waiver_expiration_time)}</p>
            </div>
          )}
        </div>
      </div>

      {/* Settlement Information */}
      {(market.settlement_value !== undefined || market.expiration_value) && (
        <div className="p-6 rounded-lg mb-6" style={cardStyle}>
          <h2 className="text-xl font-semibold text-white mb-4">Settlement Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {market.settlement_value !== undefined && (
              <>
                <div>
                  <p className="text-gray-400 text-sm mb-1">Settlement Value (cents)</p>
                  <p className="text-white font-semibold">{formatNumber(market.settlement_value)}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm mb-1">Settlement Value (dollars)</p>
                  <p className="text-white font-semibold">{formatCurrency(market.settlement_value_dollars)}</p>
                </div>
              </>
            )}
            {market.expiration_value && (
              <div>
                <p className="text-gray-400 text-sm mb-1">Expiration Value</p>
                <p className="text-white font-semibold">{market.expiration_value}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Price Ranges */}
      {market.price_ranges && market.price_ranges.length > 0 && (
        <div className="p-6 rounded-lg mb-6" style={cardStyle}>
          <h2 className="text-xl font-semibold text-white mb-4">Price Ranges</h2>
          <div className="space-y-3">
            {market.price_ranges.map((range, index) => (
              <div key={index} className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">Range {index + 1}</span>
                <div className="flex gap-4">
                  <span className="text-white text-sm">Start: {range.start}</span>
                  <span className="text-white text-sm">End: {range.end}</span>
                  <span className="text-white text-sm">Step: {range.step}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Market Rules */}
      {(market.rules_primary || market.rules_secondary) && (
        <div className="p-6 rounded-lg mb-6" style={cardStyle}>
          <h2 className="text-xl font-semibold text-white mb-4">Market Rules</h2>
          <div className="space-y-4">
            {market.rules_primary && (
              <div>
                <p className="text-gray-400 text-sm mb-2">Primary Rules:</p>
                <p className="text-white text-sm leading-relaxed">{market.rules_primary}</p>
              </div>
            )}
            {market.rules_secondary && market.rules_secondary.trim() !== '' && (
              <div>
                <p className="text-gray-400 text-sm mb-2">Secondary Rules:</p>
                <p className="text-white text-sm leading-relaxed">{market.rules_secondary}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Additional Fields */}
      {(market.mve_collection_ticker || market.primary_participant_key || market.mve_selected_legs) && (
        <div className="p-6 rounded-lg mb-6" style={cardStyle}>
          <h2 className="text-xl font-semibold text-white mb-4">Additional Information</h2>
          <div className="space-y-3">
            {market.mve_collection_ticker && (
              <div className="flex justify-between">
                <span className="text-gray-400 text-sm">MVE Collection Ticker</span>
                <span className="text-white font-medium">{market.mve_collection_ticker}</span>
              </div>
            )}
            {market.primary_participant_key && (
              <div className="flex justify-between">
                <span className="text-gray-400 text-sm">Primary Participant Key</span>
                <span className="text-white font-medium">{market.primary_participant_key}</span>
              </div>
            )}
            {market.mve_selected_legs && market.mve_selected_legs.length > 0 && (
              <div>
                <p className="text-gray-400 text-sm mb-2">MVE Selected Legs</p>
                <div className="space-y-2">
                  {market.mve_selected_legs.map((leg, index) => (
                    <div key={index} className="bg-gray-800 p-3 rounded">
                      <div className="flex justify-between mb-1">
                        <span className="text-gray-400 text-xs">Event Ticker</span>
                        <span className="text-white text-xs">{leg.event_ticker}</span>
                      </div>
                      <div className="flex justify-between mb-1">
                        <span className="text-gray-400 text-xs">Market Ticker</span>
                        <span className="text-white text-xs">{leg.market_ticker}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400 text-xs">Side</span>
                        <span className="text-white text-xs">{leg.side}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MarketDetails;
