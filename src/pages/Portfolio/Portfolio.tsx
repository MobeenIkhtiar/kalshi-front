import React, { useEffect, useState } from 'react';
import { useAuth } from '@context/AuthContext';
import KalshiConnectionService from '@services/kalshi-connection.service';
import ordersService from '@services/orders.service';
import type { KalshiOrder } from '@utils/kalshiInterfaces';
import marketsService from '@services/markets.service';

const cardStyle: React.CSSProperties = {
    background: 'linear-gradient(292.88deg, #0B0E19 0%, #1C1F2A 95.47%)',
    border: '1px solid rgba(41, 44, 53, 1)',
    borderRadius: 12
};

interface OrderWithMarketName extends KalshiOrder {
    marketName?: string;
    category?: string;
}

const Portfolio: React.FC = () => {
    const { user } = useAuth();
    const [balanceCents, setBalanceCents] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [recentOrders, setRecentOrders] = useState<OrderWithMarketName[]>([]);
    const [tradesLoading, setTradesLoading] = useState(false);
    const [tradesError, setTradesError] = useState<string | null>(null);

    // Template order based on order structure - shown when no real orders available
    const templateOrder: OrderWithMarketName = {
        order_id: 'template-order-001',
        user_id: 'user-123',
        ticker: 'PRES-2024',
        side: 'yes',
        action: 'buy',
        type: 'limit',
        status: 'executed',
        yes_price: 4550,
        no_price: 5450,
        yes_price_dollars: '0.4550',
        no_price_dollars: '0.5450',
        fill_count: 100,
        remaining_count: 0,
        initial_count: 100,
        taker_fees: 50,
        maker_fees: 25,
        taker_fill_cost: 45500,
        maker_fill_cost: 0,
        taker_fill_cost_dollars: '455.00',
        maker_fill_cost_dollars: '0.00',
        taker_fees_dollars: '0.50',
        maker_fees_dollars: '0.25',
        expiration_time: new Date().toISOString(),
        created_time: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
        last_update_time: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
        marketName: '2024 Presidential Election Odds',
        category: 'Politics'
    };

    // Enrich orders with market name and category
    const enrichOrderWithMarketData = async (order: KalshiOrder): Promise<OrderWithMarketName> => {
        const enrichedOrder: OrderWithMarketName = { ...order };
        
        try {
            const marketData = await marketsService.getMarketByTicker(order.ticker);
            if (marketData?.data?.title) {
                enrichedOrder.marketName = marketData.data.title;
            }
            if (marketData?.data?.category) {
                enrichedOrder.category = marketData.data.category;
            }
        } catch (err) {
            console.warn(`Could not fetch market details for ${order.ticker}:`, err);
            enrichedOrder.marketName = order.ticker;
            enrichedOrder.category = 'General';
        }
        
        return enrichedOrder;
    };

    // Fetch recent orders
    useEffect(() => {
        const fetchRecentOrders = async () => {
            if (!user?.kalshi_access_key_id) {
                setRecentOrders([]);
                return;
            }

            try {
                setTradesLoading(true);
                setTradesError(null);

                // Fetch orders (can filter by status if needed)
                const response = await ordersService.getOrders({
                    limit: 50
                });

                // Handle different response structures
                // The API returns { orders: [], cursor: null }
                const orders: KalshiOrder[] = response?.orders || response?.data?.orders || response?.data?.data?.orders || [];
                
                // Enrich orders with market data
                const enrichedOrders = await Promise.all(
                    orders.map(order => enrichOrderWithMarketData(order))
                );

                // Sort by last_update_time (most recent first)
                const sortedOrders = enrichedOrders
                    .sort((a, b) => {
                        const timeA = new Date(a.last_update_time).getTime();
                        const timeB = new Date(b.last_update_time).getTime();
                        return timeB - timeA;
                    })
                    .slice(0, 50); // Limit to 50 most recent

                setRecentOrders(sortedOrders);
            } catch (e: any) {
                console.error('Error fetching recent orders:', e);
                setTradesError(e.response?.data?.message || 'Failed to fetch recent orders');
                setRecentOrders([]);
            } finally {
                setTradesLoading(false);
            }
        };

        fetchRecentOrders();
    }, [user?.kalshi_access_key_id]);

    useEffect(() => {
        const fetchBalance = async () => {
            if (!user?.kalshi_access_key_id) {
                setBalanceCents(null);
                return;
            }
            try {
                setIsLoading(true);
                setError(null);
                const res = await KalshiConnectionService.getBalance();
                // Expecting cents in response; fallbacks provided
                const data = res.data?.data || res.data;
                const cents = data?.balance ?? data?.portfolio_value_cents ?? data?.portfolio_value ?? null;
                if (typeof cents === 'number') {
                    setBalanceCents(cents);
                } else {
                    setError('Unable to parse balance');
                }
            } catch (e: any) {
                setError(e.response?.data?.message || 'Failed to fetch balance');
            } finally {
                setIsLoading(false);
            }
        };
        fetchBalance();
    }, [user?.kalshi_access_key_id]);
    return (
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-3xl font-semibold tracking-wider text-white">My Portfolio</h1>
                <p className="text-gray-400">Analyze your connected account's performance and exposure metrics.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                {/* Total Balance */}
                <div style={cardStyle} className="p-4">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-gray-400 text-xs">Total Balance</p>
                            <p className="text-white text-2xl font-semibold mt-2">
                                {isLoading ? 'Loading…' : (
                                    user?.kalshi_access_key_id
                                        ? (balanceCents !== null ? `$${(balanceCents / 100).toLocaleString(undefined, { maximumFractionDigits: 2 })}` : (error ? '—' : '—'))
                                        : 'Not Connected'
                                )}
                            </p>
                        </div>
                        <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: '#1E9BFF1A', border: '1px solid #1E9BFF33' }}>
                            <span className="text-[#1E9BFF] text-lg">$</span>
                        </div>
                    </div>
                    <div className="mt-4 pt-3 border-t border-[#2A2E39]">
                        {user?.kalshi_access_key_id ? (
                            <p className="text-gray-500 text-xs">Account Valuation</p>
                        ) : (
                            <p className="text-gray-500 text-xs">Connect your Kalshi account in Settings to view balance.</p>
                        )}
                        {error && user?.kalshi_access_key_id && (
                            <p className="text-red-400 text-xs mt-1">{error}</p>
                        )}
                    </div>
                </div>

                {/* ROI */}
                <div style={cardStyle} className="p-4">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-gray-400 text-xs">ROI</p>
                            <p className="text-white text-2xl font-semibold mt-2">12.5%</p>
                        </div>
                        <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: '#FF8A3D1A', border: '1px solid #FF8A3D33' }}>
                            <span className="text-[#FF8A3D] text-lg">%</span>
                        </div>
                    </div>
                    <div className="mt-4 pt-3 border-t border-[#2A2E39]">
                        <p className="text-gray-500 text-xs">Return On Investment</p>
                    </div>
                </div>

                {/* Active Trades */}
                <div style={cardStyle} className="p-4">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-gray-400 text-xs">Active Trades</p>
                            <p className="text-white text-2xl font-semibold mt-2">17</p>
                        </div>
                        <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: '#22C55E1A', border: '1px solid #22C55E33' }}>
                            <span className="text-[#22C55E] text-lg">↗</span>
                        </div>
                    </div>
                    <div className="mt-4 pt-3 border-t border-[#2A2E39]">
                        <p className="text-gray-500 text-xs">Return On Investment</p>
                    </div>
                </div>

                {/* Risk Level */}
                <div style={cardStyle} className="p-4">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-gray-400 text-xs">Risk Level</p>
                            <p className="text-white text-2xl font-semibold mt-2">Moderate</p>
                        </div>
                        <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: '#F59E0B1A', border: '1px solid #F59E0B33' }}>
                            <span className="text-[#F59E0B] text-lg">⚠</span>
                        </div>
                    </div>
                    <div className="mt-4 pt-3 border-t border-[#2A2E39]">
                        <p className="text-gray-500 text-xs">Calculated Exposure</p>
                    </div>
                </div>
            </div>

            {/* Recent Trades Section */}
            <div className="mt-6">
                <div style={cardStyle} className="p-6">
                    <h2 className="text-xl font-semibold text-white mb-4">Recent Trades</h2>
                    {tradesLoading ? (
                        <div className="text-center py-8">
                            <p className="text-gray-400">Loading recent trades...</p>
                        </div>
                    ) : tradesError ? (
                        <div className="text-center py-8">
                            <p className="text-red-400">{tradesError}</p>
                            {!user?.kalshi_access_key_id && (
                                <p className="text-gray-400 text-sm mt-2">Connect your Kalshi account in Settings to view trades.</p>
                            )}
                        </div>
                    ) : recentOrders.length === 0 ? (
                        <div className="overflow-x-auto">
                            <div className="mb-4 p-3 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
                                <p className="text-yellow-400 text-sm">
                                    {!user?.kalshi_access_key_id 
                                        ? 'Connect your Kalshi account in Settings to view your orders.'
                                        : 'No recent orders found. Showing example order below.'}
                                </p>
                            </div>
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-[#2A2E39]">
                                        <th className="text-left py-3 px-4 text-gray-400 text-sm font-medium">Ticker</th>
                                        <th className="text-left py-3 px-4 text-gray-400 text-sm font-medium">Market</th>
                                        <th className="text-left py-3 px-4 text-gray-400 text-sm font-medium">Side</th>
                                        <th className="text-left py-3 px-4 text-gray-400 text-sm font-medium">Action</th>
                                        <th className="text-left py-3 px-4 text-gray-400 text-sm font-medium">Status</th>
                                        <th className="text-left py-3 px-4 text-gray-400 text-sm font-medium">Price</th>
                                        <th className="text-left py-3 px-4 text-gray-400 text-sm font-medium">Fill Count</th>
                                        <th className="text-left py-3 px-4 text-gray-400 text-sm font-medium">Fill Cost</th>
                                        <th className="text-left py-3 px-4 text-gray-400 text-sm font-medium">Fees</th>
                                        <th className="text-left py-3 px-4 text-gray-400 text-sm font-medium">Created</th>
                                        <th className="text-left py-3 px-4 text-gray-400 text-sm font-medium">Updated</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(() => {
                                        const price = templateOrder.side === 'yes' 
                                            ? templateOrder.yes_price_dollars 
                                            : templateOrder.no_price_dollars;
                                        const totalFillCost = (
                                            parseFloat(templateOrder.taker_fill_cost_dollars || '0') + 
                                            parseFloat(templateOrder.maker_fill_cost_dollars || '0')
                                        ).toFixed(2);
                                        const totalFees = (
                                            parseFloat(templateOrder.taker_fees_dollars || '0') + 
                                            parseFloat(templateOrder.maker_fees_dollars || '0')
                                        ).toFixed(2);
                                        const createdDate = new Date(templateOrder.created_time).toLocaleDateString();
                                        const updatedDate = new Date(templateOrder.last_update_time).toLocaleDateString();

                                        return (
                                            <tr className="border-b border-[#2A2E39] opacity-60">
                                                <td className="py-3 px-4 text-white text-sm font-mono">{templateOrder.ticker}</td>
                                                <td className="py-3 px-4">
                                                    <div>
                                                        <div className="text-white text-sm">{templateOrder.marketName || templateOrder.ticker}</div>
                                                        {templateOrder.category && (
                                                            <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium text-white mt-1" style={{ background: '#1E9BFF33', border: '1px solid #1E9BFF66' }}>
                                                                {templateOrder.category}
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium text-white ${
                                                        templateOrder.side === 'yes' 
                                                            ? 'bg-[#22C55E33] border border-[#22C55E66]' 
                                                            : 'bg-[#EF444433] border border-[#EF444466]'
                                                    }`}>
                                                        {templateOrder.side.toUpperCase()}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium text-white ${
                                                        templateOrder.action === 'buy' 
                                                            ? 'bg-[#22C55E33] border border-[#22C55E66]' 
                                                            : 'bg-[#F59E0B33] border border-[#F59E0B66]'
                                                    }`}>
                                                        {templateOrder.action.toUpperCase()}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium text-white ${
                                                        templateOrder.status === 'executed' 
                                                            ? 'bg-[#22C55E33] border border-[#22C55E66]' 
                                                            : templateOrder.status === 'resting'
                                                            ? 'bg-[#3B82F633] border border-[#3B82F666]'
                                                            : 'bg-[#6B728033] border border-[#6B728066]'
                                                    }`}>
                                                        {templateOrder.status}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4 text-white text-sm">${price}</td>
                                                <td className="py-3 px-4 text-white text-sm">{templateOrder.fill_count} / {templateOrder.initial_count}</td>
                                                <td className="py-3 px-4 text-white text-sm">${totalFillCost}</td>
                                                <td className="py-3 px-4 text-red-400 text-sm">${totalFees}</td>
                                                <td className="py-3 px-4 text-gray-400 text-sm">{createdDate}</td>
                                                <td className="py-3 px-4 text-gray-400 text-sm">{updatedDate}</td>
                                            </tr>
                                        );
                                    })()}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-[#2A2E39]">
                                        <th className="text-left py-3 px-4 text-gray-400 text-sm font-medium">Ticker</th>
                                        <th className="text-left py-3 px-4 text-gray-400 text-sm font-medium">Market</th>
                                        <th className="text-left py-3 px-4 text-gray-400 text-sm font-medium">Side</th>
                                        <th className="text-left py-3 px-4 text-gray-400 text-sm font-medium">Action</th>
                                        <th className="text-left py-3 px-4 text-gray-400 text-sm font-medium">Status</th>
                                        <th className="text-left py-3 px-4 text-gray-400 text-sm font-medium">Price</th>
                                        <th className="text-left py-3 px-4 text-gray-400 text-sm font-medium">Fill Count</th>
                                        <th className="text-left py-3 px-4 text-gray-400 text-sm font-medium">Fill Cost</th>
                                        <th className="text-left py-3 px-4 text-gray-400 text-sm font-medium">Fees</th>
                                        <th className="text-left py-3 px-4 text-gray-400 text-sm font-medium">Created</th>
                                        <th className="text-left py-3 px-4 text-gray-400 text-sm font-medium">Updated</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentOrders.map((order, index) => {
                                        const price = order.side === 'yes' 
                                            ? order.yes_price_dollars 
                                            : order.no_price_dollars;
                                        const totalFillCost = (
                                            parseFloat(order.taker_fill_cost_dollars || '0') + 
                                            parseFloat(order.maker_fill_cost_dollars || '0')
                                        ).toFixed(2);
                                        const totalFees = (
                                            parseFloat(order.taker_fees_dollars || '0') + 
                                            parseFloat(order.maker_fees_dollars || '0')
                                        ).toFixed(2);
                                        const createdDate = new Date(order.created_time).toLocaleDateString();
                                        const updatedDate = new Date(order.last_update_time).toLocaleDateString();

                                        return (
                                            <tr key={order.order_id || index} className="border-b border-[#2A2E39] last:border-b-0">
                                                <td className="py-3 px-4 text-white text-sm font-mono">{order.ticker}</td>
                                                <td className="py-3 px-4">
                                                    <div>
                                                        <div className="text-white text-sm">{order.marketName || order.ticker}</div>
                                                        {order.category && (
                                                            <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium text-white mt-1" style={{ background: '#1E9BFF33', border: '1px solid #1E9BFF66' }}>
                                                                {order.category}
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium text-white ${
                                                        order.side === 'yes' 
                                                            ? 'bg-[#22C55E33] border border-[#22C55E66]' 
                                                            : 'bg-[#EF444433] border border-[#EF444466]'
                                                    }`}>
                                                        {order.side.toUpperCase()}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium text-white ${
                                                        order.action === 'buy' 
                                                            ? 'bg-[#22C55E33] border border-[#22C55E66]' 
                                                            : 'bg-[#F59E0B33] border border-[#F59E0B66]'
                                                    }`}>
                                                        {order.action.toUpperCase()}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium text-white ${
                                                        order.status === 'executed' 
                                                            ? 'bg-[#22C55E33] border border-[#22C55E66]' 
                                                            : order.status === 'resting'
                                                            ? 'bg-[#3B82F633] border border-[#3B82F666]'
                                                            : 'bg-[#6B728033] border border-[#6B728066]'
                                                    }`}>
                                                        {order.status}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4 text-white text-sm">${price}</td>
                                                <td className="py-3 px-4 text-white text-sm">{order.fill_count} / {order.initial_count}</td>
                                                <td className="py-3 px-4 text-white text-sm">${totalFillCost}</td>
                                                <td className="py-3 px-4 text-red-400 text-sm">${totalFees}</td>
                                                <td className="py-3 px-4 text-gray-400 text-sm">{createdDate}</td>
                                                <td className="py-3 px-4 text-gray-400 text-sm">{updatedDate}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Portfolio;
