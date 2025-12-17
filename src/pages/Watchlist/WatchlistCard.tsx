import React from 'react';
import binIcon from '@assets/icons/bin.svg';
import linkArrowIcon from '@assets/icons/link-arrow.svg';

interface WatchlistCardProps {
    question: string;
    category: string;
    price: string;
    probability: string;
    probabilityChange?: string;
    volume: string;
    ticker?: string;
    tag?: 'Trending' | 'Open' | 'Closed';
    onViewDetails?: () => void;
    onRemove?: () => void;
}

const WatchlistCard: React.FC<WatchlistCardProps> = ({
    question,
    price,
    probability,
    probabilityChange,
    volume,
    tag,
    onViewDetails,
    onRemove
}) => {
    const isPositiveChange = probabilityChange?.startsWith('+');
    
    // const tagColors: Record<string, { bg: string; text: string }> = {
    //     'Trending': { bg: 'bg-blue-500/20', text: 'text-blue-400' },
    //     'Open': { bg: 'bg-green-500/20', text: 'text-green-400' },
    //     'Closed': { bg: 'bg-gray-500/20', text: 'text-gray-400' }
    // };

    return (
        <div 
            className="rounded-lg border transition-all duration-200 hover:border-gray-500 mb-4"
            style={{
                background: 'linear-gradient(292.88deg, rgba(11, 14, 25, 1) 0%, rgba(28, 31, 42, 1) 95.47%)',
                padding: '20px 15px',
                border: '1px solid rgba(41, 44, 53, 1)'
            }}
        >
            <div className="flex flex-col">
                {/* Badge */}
                {tag && (
                    <div className="mb-2">
                        <span 
                            className="text-xs font-medium w-fit text-white"
                            style={{
                                background: 'rgba(75, 174, 82, 1)',
                                padding: '6px 10px',
                                borderRadius: '50px'
                            }}
                        >
                            {tag}
                        </span>
                    </div>
                )}

                {/* Title and Icons Row */}
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-white text-sm font-medium flex-1">
                        {question}
                    </h3>
                    
                    {/* Right Side Icons */}
                    <div className="flex items-center gap-3 ml-4">
                        {/* Live Indicator */}
                        <div className="flex items-center gap-1">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            <span className="text-green-400 text-xs">Live</span>
                        </div>
                        
                        {/* Details Icon */}
                        <button
                            onClick={onViewDetails}
                            className="p-2 rounded-lg transition-colors cursor-pointer"
                            style={{ backgroundColor: 'rgba(0, 148, 236, 1)' }}
                            title="View Details"
                        >
                            <img src={linkArrowIcon} alt="View Details" className="w-5 h-5" />
                        </button>

                        {/* Remove Icon */}
                        <button
                            onClick={onRemove}
                            className="p-2 rounded-lg transition-colors cursor-pointer"
                            style={{ backgroundColor: 'rgba(255, 0, 0, 1)' }}
                            title="Remove from watchlist"
                        >
                            <img src={binIcon} alt="Remove" className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div className="flex-1">

                    {/* Metrics Row - First 3 parameters */}
                    <div className="grid grid-cols-3 gap-4 items-center mb-3">
                        <div className="flex items-center gap-2">
                            <p className="text-gray-400 font-normal" style={{ fontSize: '16px' }}>Current Price:</p>
                            <p className="text-white font-semibold" style={{ fontSize: '16px', fontWeight: 600 }}>{price}</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <p className="text-gray-400 font-normal" style={{ fontSize: '16px' }}>Probability Change:</p>
                            <p className={`font-semibold ${isPositiveChange ? 'text-green-400' : 'text-red-400'}`} style={{ fontSize: '16px', fontWeight: 600 }}>
                                {probabilityChange || '0%'}
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <p className="text-gray-400 font-normal" style={{ fontSize: '16px' }}>Probability:</p>
                            <p className="text-white font-semibold" style={{ fontSize: '16px', fontWeight: 600 }}>{probability}</p>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div 
                        className="w-full h-1 rounded-full mb-3"
                        style={{
                            background: isPositiveChange 
                                ? 'linear-gradient(91.26deg, #93FF9B 0.95%, #4BAE52 110.13%)'
                                : 'rgba(255, 0, 0, 1)'
                        }}
                    ></div>

                    {/* Vol at the bottom */}
                    <div className="flex items-center gap-2">
                        <p className="text-gray-400 font-normal" style={{ fontSize: '12px', fontWeight: 400 }}>Vol:</p>
                        <p className="text-white font-normal" style={{ fontSize: '12px', fontWeight: 400 }}>{volume}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WatchlistCard;

