import React, { useEffect, useState } from 'react';
import { useAuth } from '@context/AuthContext';
import KalshiConnectionService from '@services/kalshi-connection.service';

const cardStyle: React.CSSProperties = {
    background: 'linear-gradient(292.88deg, #0B0E19 0%, #1C1F2A 95.47%)',
    border: '1px solid rgba(41, 44, 53, 1)',
    borderRadius: 12
};

const Portfolio: React.FC = () => {
    const { user } = useAuth();
    const [balanceCents, setBalanceCents] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

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
        </div>
    );
};

export default Portfolio;
