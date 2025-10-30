import React, { useState, useEffect } from 'react';
import { useAuth } from '@context/AuthContext';
import Input from '@components/reusable/Input';
import Button from '@components/reusable/Button';
import KalshiConnectionService from '@services/kalshi-connection.service';
import authService from '@services/auth.service';

const Settings: React.FC = () => {
    const [kalshiCredentials, setKalshiCredentials] = useState({
        accessKeyId: '',
        privateKey: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [isSavingProfile, setIsSavingProfile] = useState(false);
    const { user, updateUser } = useAuth();
    const [isKalshiConnected, setIsKalshiConnected] = useState<boolean>(!!(user?.kalshi_access_key_id));
    const [profile, setProfile] = useState({
        email: user?.email || '',
        displayName: user?.username || ''
    });
    const [notifications, setNotifications] = useState({
        marketPriceAlerts: true,
        tradeExecution: true,
        aiInsights: false,
        portfolioUpdates: false
    });

    // On mount: fetch stored credentials, prefill, and auto-verify to set banner state
    useEffect(() => {
        const bootstrapKalshi = async () => {
            try {
                const credsRes = await KalshiConnectionService.getCredentials();
                console.log(credsRes);
                if (credsRes.status === 200) {
                    const { kalshi_access_key_id, kalshi_private_key } = credsRes.data || {};
                    // Prefill whatever we have
                    setKalshiCredentials({
                        accessKeyId: kalshi_access_key_id || '',
                        privateKey: kalshi_private_key || ''
                    });
                    if (kalshi_access_key_id && kalshi_private_key) {
                        // Auto-verify only when both are present
                        const verify = await KalshiConnectionService.verifyConnection(kalshi_access_key_id, kalshi_private_key);
                        const ok = verify?.status === 200 && (verify.data?.isConnectionSuccessful ?? true);
                        setIsKalshiConnected(!!ok);
                        if (!ok) {
                            setMessage({ type: 'error', text: 'Your Kalshi credentials are no longer valid. Please update them.' });
                        } else {
                            setMessage(null);
                        }
                    } else {
                        setIsKalshiConnected(false);
                    }
                }
            } catch (e) {
                console.error('Kalshi bootstrap error:', e);
            }
        };
        bootstrapKalshi();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage(null);

        try {
            const response = await KalshiConnectionService.verifyConnection(
                kalshiCredentials.accessKeyId,
                kalshiCredentials.privateKey
            );

            const api = response;
            const payload = api.data?.data || api.data;
            const success = (api.status === 200) && (api.data?.success !== false) && (
                payload?.isConnectionSuccessful === true || payload?.kalshi_status === 'connected' || payload?.user
            );
            if (success) {
                setMessage({ type: 'success', text: 'Kalshi account connected successfully!' });
                updateUser({
                    kalshi_access_key_id: kalshiCredentials.accessKeyId,
                    kalshi_private_key: kalshiCredentials.privateKey
                });
                setIsKalshiConnected(true);
            } else {
                setMessage({ type: 'error', text: api.data?.message || 'Failed to connect to Kalshi' });
            }
        } catch (error: any) {
            console.error('Error connecting to Kalshi:', error);
            setMessage({
                type: 'error',
                text: error.response?.data?.message || 'Failed to connect to Kalshi. Please check your credentials and try again.'
            });
        } finally {
            setIsLoading(false);
        }
    };

    const Toggle = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
        <button
            type="button"
            onClick={onChange}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${checked ? 'bg-green-500/80' : 'bg-gray-600/50'
                }`}
        >
            <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'
                    }`}
            />
        </button>
    );

    const rowStyle: React.CSSProperties = {
        background: 'rgba(5, 8, 17, 1)',
        borderRadius: 10
    };

    const handleSaveProfile = async () => {
        try {
            setIsSavingProfile(true);
            setMessage(null);
            const res = await authService.updateProfile({ username: profile.displayName, email: profile.email });
            const ok = res.data?.success || res.success;
            if (ok) {
                const updated = res.data?.data?.user || res.data?.user || res.data;
                updateUser({ email: updated?.email || profile.email, username: updated?.username || profile.displayName });
                setMessage({ type: 'success', text: 'Profile updated successfully.' });
            } else {
                setMessage({ type: 'error', text: res.data?.message || 'Failed to update profile' });
            }
        } catch (e: any) {
            setMessage({ type: 'error', text: e.response?.data?.message || 'Failed to update profile' });
        } finally {
            setIsSavingProfile(false);
        }
    };

    return (
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-white">Settings</h1>
                <p className="text-gray-400 text-sm">Manage your account and preferences.</p>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="xl:col-span-2 space-y-6">
                    <div className="border border-gray-800 rounded-2xl p-6" style={{ background: 'linear-gradient(292.88deg, #0B0E19 0%, #1C1F2A 95.47%)' }}>
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h2 className="text-lg font-semibold text-white">Kalshi Account Connection</h2>
                                <p className="text-gray-400 text-xs">Connect your Kalshi trading account.</p>
                            </div>
                            {(isKalshiConnected || user?.kalshi_access_key_id) && (
                                <div className="px-2.5 py-1 rounded-full text-xs bg-green-500/10 text-green-400 border border-green-500/30">
                                    Connected
                                </div>
                            )}
                        </div>

                        {!(isKalshiConnected || user?.kalshi_access_key_id) && (
                            <div className="mb-4 px-4 py-5" style={rowStyle}>
                                <div className="flex items-start gap-3">
                                    <svg className="w-5 h-5 mt-0.5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                    <div>
                                        <p className="text-yellow-400 font-semibold text-sm">Not Connected</p>
                                        <p className="text-gray-400 text-xs">Connect your Kalshi account to sync trades, view real-time portfolio data, and access advanced analytics.</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {message && (
                            <div className={`mb-4 p-3 rounded-lg ${message.type === 'success' ? 'bg-green-900/20 border border-green-500/30' : 'bg-red-900/20 border border-red-500/30'
                                }`}>
                                <p className={`text-xs ${message.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>{message.text}</p>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                type="text"
                                name="accessKeyId"
                                placeholder="Kalshi API Key"
                                value={kalshiCredentials.accessKeyId}
                                onChange={(e) => setKalshiCredentials(prev => ({ ...prev, accessKeyId: e.target.value }))}
                                required
                            />
                            <Input
                                type="password"
                                name="privateKey"
                                placeholder="Kalshi API Secret"
                                value={kalshiCredentials.privateKey}
                                onChange={(e) => setKalshiCredentials(prev => ({ ...prev, privateKey: e.target.value }))}
                                required
                            />
                            <div className="md:col-span-2 flex flex-col gap-3">
                                <Button
                                    className='w-full'
                                    type="submit"
                                    disabled={
                                        isKalshiConnected || !!user?.kalshi_access_key_id ||
                                        isLoading || !kalshiCredentials.accessKeyId || !kalshiCredentials.privateKey
                                    }
                                >
                                    {(isKalshiConnected || !!user?.kalshi_access_key_id)
                                        ? "Connected"
                                        : (isLoading ? 'Connecting…' : 'Connect Account')}
                                </Button>
                            </div>
                        </form>
                        {!(isKalshiConnected || user?.kalshi_access_key_id) && (
                            <p className="text-gray-500 text-xs mt-3">We never store your keys in plain text. They are encrypted at rest.</p>
                        )}
                    </div>

                    <div className="border border-gray-800 rounded-2xl p-6" style={{ background: 'linear-gradient(292.88deg, #0B0E19 0%, #1C1F2A 95.47%)' }}>
                        <h2 className="text-lg font-semibold text-white mb-4">Profile Information</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                type="email"
                                name="email"
                                placeholder="Email Address"
                                value={profile.email}
                                onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                            />
                            <Input
                                type="text"
                                name="displayName"
                                placeholder="Display Name"
                                value={profile.displayName}
                                onChange={(e) => setProfile(prev => ({ ...prev, displayName: e.target.value }))}
                            />
                        </div>
                        <div className="mt-4">
                            <Button onClick={handleSaveProfile} disabled={isSavingProfile}>
                                {isSavingProfile ? 'Saving…' : 'Save Changes'}
                            </Button>
                        </div>
                    </div>

                    <div className="border border-gray-800 rounded-2xl p-6" style={{ background: 'linear-gradient(292.88deg, #0B0E19 0%, #1C1F2A 95.47%)' }}>
                        <h2 className="text-lg font-semibold text-white mb-2">Notifications</h2>
                        <p className="text-gray-400 text-xs mb-4">Manage alert preferences.</p>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between px-4 py-3" style={rowStyle}>
                                <div>
                                    <p className="text-white text-sm">Market Price Alerts</p>
                                    <p className="text-gray-500 text-xs">Get notified when prices move significantly.</p>
                                </div>
                                <Toggle checked={notifications.marketPriceAlerts} onChange={() => setNotifications(v => ({ ...v, marketPriceAlerts: !v.marketPriceAlerts }))} />
                            </div>
                            <div className="flex items-center justify-between px-4 py-3" style={rowStyle}>
                                <div>
                                    <p className="text-white text-sm">Trade Execution</p>
                                    <p className="text-gray-500 text-xs">Notifications for completed trades.</p>
                                </div>
                                <Toggle checked={notifications.tradeExecution} onChange={() => setNotifications(v => ({ ...v, tradeExecution: !v.tradeExecution }))} />
                            </div>
                            <div className="flex items-center justify-between px-4 py-3" style={rowStyle}>
                                <div>
                                    <p className="text-white text-sm">AI Insights</p>
                                    <p className="text-gray-500 text-xs">Receive advanced market opportunities.</p>
                                </div>
                                <Toggle checked={notifications.aiInsights} onChange={() => setNotifications(v => ({ ...v, aiInsights: !v.aiInsights }))} />
                            </div>
                            <div className="flex items-center justify-between px-4 py-3" style={rowStyle}>
                                <div>
                                    <p className="text-white text-sm">Portfolio Updates</p>
                                    <p className="text-gray-500 text-xs">Daily portfolio performance summaries.</p>
                                </div>
                                <Toggle checked={notifications.portfolioUpdates} onChange={() => setNotifications(v => ({ ...v, portfolioUpdates: !v.portfolioUpdates }))} />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="border border-gray-800 rounded-2xl p-6" style={{ background: 'linear-gradient(292.88deg, #0B0E19 0%, #1C1F2A 95.47%)' }}>
                        <h3 className="text-base font-semibold text-white mb-4">Security</h3>
                        <div className="space-y-3">
                            <div className="rounded-md" style={rowStyle}>
                                <Button variant="outline" className="w-full border-0">Change Password</Button>
                            </div>
                            <div className="rounded-md" style={rowStyle}>
                                <Button variant="outline" className="w-full border-0">Enable 2FA</Button>
                            </div>
                            <div className="rounded-md" style={rowStyle}>
                                <Button variant="outline" className="w-full border-0">View Login History</Button>
                            </div>
                        </div>
                    </div>

                    <div className="border border-gray-800 rounded-2xl p-6" style={{ background: 'linear-gradient(292.88deg, #0B0E19 0%, #1C1F2A 95.47%)' }}>
                        <h3 className="text-base font-semibold text-white mb-4">Data Management</h3>
                        <div className="space-y-3">
                            <div className="rounded-md" style={rowStyle}>
                                <Button variant="outline" className="w-full border-0">Export Portfolio Data</Button>
                            </div>
                            <div className="rounded-md" style={rowStyle}>
                                <Button variant="outline" className="w-full border-0">Download Trade History</Button>
                            </div>
                            <div className="rounded-md" style={{ ...rowStyle, background: 'rgba(255, 0, 0, 0.1)' }}>
                                <Button variant="outline" className="w-full border-0 text-red-400">Delete Account</Button>
                            </div>
                        </div>
                    </div>

                    <div className="border border-gray-800 rounded-2xl p-6" style={{ background: 'linear-gradient(292.88deg, #0B0E19 0%, #1C1F2A 95.47%)' }}>
                        <h3 className="text-base font-semibold text-white mb-3">Account Status</h3>
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-gray-400 text-xs">Plan</span>
                            <span className="text-white text-sm">Pro</span>
                        </div>
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-gray-400 text-xs">Member Since</span>
                            <span className="text-white text-sm">Jan 2024</span>
                        </div>
                        <div className="mb-2 flex items-center justify-between">
                            <span className="text-gray-400 text-xs">API Requests</span>
                            <span className="text-white text-xs">1,234 / 10,000</span>
                        </div>
                        <div className="h-2 rounded bg-gray-800 overflow-hidden">
                            <div className="h-2 bg-green-500/80" style={{ width: '12%' }} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
